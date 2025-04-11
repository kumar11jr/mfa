import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";

export default function Setup2FA() {
  const { setup2FAMutation, verify2FAMutation } = useAuth();
  const [token, setToken] = useState("");
  const [, setLocation] = useLocation();

  const handleSetup = async () => {
    setup2FAMutation.mutate();
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    verify2FAMutation.mutate({ token }, {
      onSuccess: () => setLocation("/")
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Setup Two-Factor Authentication</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!setup2FAMutation.data ? (
            <Button
              onClick={handleSetup}
              disabled={setup2FAMutation.isPending}
              className="w-full"
            >
              {setup2FAMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating QR Code...
                </>
              ) : (
                "Generate QR Code"
              )}
            </Button>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-center">
                <img
                  src={setup2FAMutation.data.qrCode}
                  alt="2FA QR Code"
                  className="w-48 h-48"
                />
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground text-center">
                  Scan this QR code with your authenticator app
                </p>
                <p className="text-xs text-muted-foreground text-center">
                  Secret key: {setup2FAMutation.data.secret}
                </p>
              </div>
              <form onSubmit={handleVerify} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="token">Verification Code</Label>
                  <Input
                    id="token"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder="Enter 6-digit code"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={verify2FAMutation.isPending}
                >
                  {verify2FAMutation.isPending ? "Verifying..." : "Verify"}
                </Button>
              </form>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
