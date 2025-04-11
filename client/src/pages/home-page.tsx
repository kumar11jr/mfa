import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { ShieldCheck, Camera, LogOut, CheckCircle2, XCircle, Settings } from "lucide-react";
import { motion } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5
    }
  }
};

export default function HomePage() {
  const { user, logoutMutation } = useAuth();
  const [, setLocation] = useLocation();
  console.log(user)
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background/90">
      <motion.div 
        className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div 
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 sm:mb-12"
          variants={itemVariants}
        >
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Welcome back, {user?.username}!
            </h1>
            <p className="text-lg text-muted-foreground mt-2">
              Manage your authentication methods and security settings
            </p>
          </div>
          <Button
            variant="outline"
            size="lg"
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
            className="gap-2 hover:bg-destructive hover:text-destructive-foreground transition-colors"
          >
            <LogOut className="h-5 w-5" />
            Sign Out
          </Button>
        </motion.div>

        {/* Security Overview */}
        <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
          <motion.div variants={itemVariants}>
            <Card className="relative overflow-hidden transition-all hover:shadow-lg border-primary/10">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <ShieldCheck className="h-8 w-8 text-primary" />
                  <div>
                    <CardTitle className="text-2xl">Two-Factor Authentication</CardTitle>
                    <CardDescription>Time-based one-time passwords (TOTP)</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-2 text-sm">
                  {user?.twoFactorEnabled ? (
                    <>
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                      <span className="text-green-500 font-medium">Enabled</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-5 w-5 text-red-500" />
                      <span className="text-red-500 font-medium">Not Enabled</span>
                    </>
                  )}
                </div>

                <p className="text-muted-foreground">
                  {user?.twoFactorEnabled
                    ? "Your account is protected with two-factor authentication."
                    : "Add an extra layer of security to your account with 2FA."}
                </p>

                <Button
                  onClick={() => setLocation("/setup-2fa")}
                  disabled={user?.twoFactorEnabled}
                  className="gap-2 w-full sm:w-auto"
                  variant={user?.twoFactorEnabled ? "secondary" : "default"}
                >
                  <Settings className="h-4 w-4" />
                  {user?.twoFactorEnabled ? "Already Configured" : "Configure 2FA"}
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="relative overflow-hidden transition-all hover:shadow-lg border-primary/10">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Camera className="h-8 w-8 text-primary" />
                  <div>
                    <CardTitle className="text-2xl">Face Authentication</CardTitle>
                    <CardDescription>Biometric security layer</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-2 text-sm">
                  {user?.faceEnabled ? (
                    <>
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                      <span className="text-green-500 font-medium">Enabled</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-5 w-5 text-red-500" />
                      <span className="text-red-500 font-medium">Not Enabled</span>
                    </>
                  )}
                </div>

                <p className="text-muted-foreground">
                  {user?.faceEnabled
                    ? "Your account is protected with face authentication."
                    : "Set up face recognition for an additional security layer."}
                </p>

                <Button
                  onClick={() => setLocation("/setup-face")}
                  disabled={user?.faceEnabled}
                  className="gap-2 w-full sm:w-auto"
                  variant={user?.faceEnabled ? "secondary" : "default"}
                >
                  <Settings className="h-4 w-4" />
                  {user?.faceEnabled ? "Already Configured" : "Configure Face Auth"}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}