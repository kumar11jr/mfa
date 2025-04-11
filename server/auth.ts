import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser, loginSchema } from "@shared/schema";
import speakeasy from "speakeasy";
import QRCode from "qrcode";
import { compareFaceImages } from "./face-compare";
import rateLimit from "express-rate-limit";
import { spawnSync } from 'child_process';

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50 // limit each IP to 20 requests per windowMs
});

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "default-secret-key-123",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user || !(await comparePasswords(password, user.password))) {
          return done(null, false, { message: "Invalid credentials" });
        }
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  app.post("/api/register", authLimiter, async (req, res, next) => {
    try {
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).send("Username already exists");
      }

      const user = await storage.createUser({
        ...req.body,
        password: await hashPassword(req.body.password),
      });

      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json(user);
      });
    } catch (err) {
      next(err);
    }
  });

  app.post("/api/login", authLimiter, async (req, res, next) => {
    try {
      const loginData = loginSchema.parse(req.body);
      const user = await storage.getUserByUsername(loginData.username);
  
      if (!user || !(await comparePasswords(loginData.password, user.password))) {
        return res.status(401).send("Invalid credentials");
      }
  
      // ✅ Check 2FA if enabled
      if (user.twoFactorEnabled) {
        if (!loginData.token) {
          return res.status(403).send("2FA token required");
        }
  
        const verified = speakeasy.totp.verify({
          secret: user.twoFactorSecret!,
          encoding: 'base32',
          token: loginData.token
        });
  
        if (!verified) {
          return res.status(401).send("Invalid 2FA token");
        }
      }
  
      if (user.faceEnabled) {
        if (!loginData.faceImage) {
          return res.status(403).send("Face verification required");
        }
  
        console.log("🔁 Starting face verification with DeepFace...");
  
        const facePayload = JSON.stringify({
          stored: user.faceData,
          input: loginData.faceImage
        });
  
        const pyResult = spawnSync('python', ['server/face_compare_base64.py'], {
          input: facePayload,
          encoding: 'utf-8'
        });
  
        console.log("✅ Python script finished.");
        console.log("stdout:", pyResult.stdout?.toString());
        console.log("stderr:", pyResult.stderr?.toString());
        console.log("error:", pyResult.error);
  
        const output = pyResult.stdout.toString().trim();
        const error = pyResult.stderr.toString();

        if (output !== "True") {
          console.error("Face verification failed:", error || output);
          return res.status(401).send("Face verification failed");
        }
      }
  
      req.login(user, (err) => {
        if (err) return next(err);
        res.json(user);
      });
    } catch (err) {
      next(err);
    }
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    res.json(req.user);
  });

  app.post("/api/2fa/setup", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const secret = speakeasy.generateSecret({
      name: `MFA App (${req.user!.username})`
    });

    await storage.updateUser(req.user!.id, {
      tempSecret: secret.base32
    });

    const qrCode = await QRCode.toDataURL(secret.otpauth_url!);
    res.json({ qrCode, secret: secret.base32 });
  });

  app.post("/api/2fa/verify", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const { token } = req.body;
    const user = await storage.getUser(req.user!.id);
    
    if (!user?.tempSecret) {
      return res.status(400).send("No pending 2FA setup");
    }

    const verified = speakeasy.totp.verify({
      secret: user.tempSecret,
      encoding: 'base32',
      token
    });

    if (verified) {
      await storage.updateUser(user.id, {
        twoFactorSecret: user.tempSecret,
        twoFactorEnabled: true,
        tempSecret: null
      });
      res.json({ success: true });
    } else {
      res.status(401).send("Invalid verification code");
    }
  });

  app.post("/api/face/setup", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const { faceImage } = req.body;
    if (!faceImage) {
      return res.status(400).send("Face image required");
    }

    await storage.updateUser(req.user!.id, {
      faceData: faceImage,
      faceEnabled: true
    });

    res.json({ success: true });
  });
}
