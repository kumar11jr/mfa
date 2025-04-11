import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WebcamCapture } from "@/components/webcam-capture";
import { Shield, UserCircle, Lock, Key, CircleDot } from "lucide-react";
import { motion } from "framer-motion";

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const { user, loginMutation, registerMutation } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");
  const [faceImage, setFaceImage] = useState<string | null>(null);

  if (user) {
    setLocation("/");
    return null;
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({ username, password, token, faceImage: faceImage || undefined });
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    registerMutation.mutate({ username, password });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background/95 to-background/90 p-4">
      <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              SecureAuth Pro
            </h1>
            <p className="text-xl text-muted-foreground">
              Advanced authentication with multiple security layers
            </p>
          </div>

          <div className="grid gap-6">
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="flex items-start gap-4 p-4 rounded-lg border bg-card/50 backdrop-blur-sm transition-colors hover:bg-card/60"
            >
              <Shield className="h-10 w-10 text-primary shrink-0" />
              <div>
                <h3 className="font-semibold text-lg">Two-Factor Authentication</h3>
                <p className="text-sm text-muted-foreground">
                  Add an extra layer of security with time-based verification codes
                </p>
              </div>
            </motion.div>

            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="flex items-start gap-4 p-4 rounded-lg border bg-card/50 backdrop-blur-sm transition-colors hover:bg-card/60"
            >
              <UserCircle className="h-10 w-10 text-primary shrink-0" />
              <div>
                <h3 className="font-semibold text-lg">Face Recognition</h3>
                <p className="text-sm text-muted-foreground">
                  Use your face as a secure biometric authentication method
                </p>
              </div>
            </motion.div>

            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="flex items-start gap-4 p-4 rounded-lg border bg-card/50 backdrop-blur-sm transition-colors hover:bg-card/60"
            >
              <Lock className="h-10 w-10 text-primary shrink-0" />
              <div>
                <h3 className="font-semibold text-lg">Enterprise-Grade Security</h3>
                <p className="text-sm text-muted-foreground">
                  Built with modern security standards and best practices
                </p>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Auth Forms */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="shadow-xl border-primary/10">
            <CardHeader>
              <CardTitle className="text-2xl">Welcome Back</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="login" className="space-y-6">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="register">Register</TabsTrigger>
                </TabsList>

                <TabsContent value="login">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-username">Username</Label>
                      <div className="relative">
                        <UserCircle className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                        <Input
                          id="login-username"
                          className="pl-10"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="login-password">Password</Label>
                      <div className="relative">
                        <Key className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                        <Input
                          id="login-password"
                          type="password"
                          className="pl-10"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="token">2FA Token (if enabled)</Label>
                      <div className="relative">
                        <CircleDot className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                        <Input
                          id="token"
                          className="pl-10"
                          value={token}
                          onChange={(e) => setToken(e.target.value)}
                          placeholder="Enter 6-digit code"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Face Authentication (if enabled)</Label>
                      <WebcamCapture onCapture={setFaceImage} />
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-primary hover:bg-primary/90"
                      size="lg"
                      disabled={loginMutation.isPending}
                    >
                      {loginMutation.isPending ? "Signing in..." : "Sign In"}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="register">
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="register-username">Username</Label>
                      <div className="relative">
                        <UserCircle className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                        <Input
                          id="register-username"
                          className="pl-10"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-password">Password</Label>
                      <div className="relative">
                        <Key className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                        <Input
                          id="register-password"
                          type="password"
                          className="pl-10"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-primary hover:bg-primary/90"
                      size="lg"
                      disabled={registerMutation.isPending}
                    >
                      {registerMutation.isPending ? "Creating Account..." : "Create Account"}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}