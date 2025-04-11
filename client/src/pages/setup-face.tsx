import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { WebcamCapture } from "@/components/webcam-capture";
import { Camera, Loader2 } from "lucide-react";

export default function SetupFace() {
  const { setupFaceMutation } = useAuth();
  const [, setLocation] = useLocation();
  
  const handleCapture = (faceImage: string | null) => {
    if (faceImage) {
      setupFaceMutation.mutate({ faceImage }, {
        onSuccess: () => setLocation("/")
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Setup Face Authentication
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Position your face in the center of the frame and ensure good lighting
            for the best results.
          </p>
          
          <WebcamCapture onCapture={handleCapture} />
          
          {setupFaceMutation.isPending && (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Setting up face authentication...
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
