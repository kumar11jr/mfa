import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Camera, RefreshCcw, AlertCircle, Check, X } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { motion, AnimatePresence } from "framer-motion";

interface WebcamCaptureProps {
  onCapture: (image: string | null) => void;
}

export function WebcamCapture({ onCapture }: WebcamCaptureProps) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startCamera = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setPreviewImage(null);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user",
        },
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError(
        "Could not access camera. Please ensure camera permissions are granted."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      setPreviewImage(null);
      onCapture(null);
    }
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0);

        try {
          const imageData = canvas.toDataURL("image/jpeg", 0.8);
          setPreviewImage(imageData);
          if (stream) {
            stream.getTracks().forEach((track) => track.stop());
            setStream(null);
            if (videoRef.current) {
              videoRef.current.srcObject = null;
            }
          }
        } catch (err) {
          console.error("Error capturing image:", err);
          setError("Failed to capture image. Please try again.");
        }
      }
    }
  };

  const handleImageClick = () => {
    if (previewImage) {
      // One-tap retake: clicking the preview image starts the camera again
      setPreviewImage(null);
      startCamera();
    }
  };

  const confirmImage = () => {
    if (previewImage) {
      onCapture(previewImage);
      setPreviewImage(null);
    }
  };

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  const fadeAnimation = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.3 },
  };

  return (
    <div className="space-y-4">
      <AnimatePresence>
        {error && (
          <motion.div {...fadeAnimation}>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative aspect-video bg-muted rounded-lg overflow-hidden shadow-lg">
        <AnimatePresence mode="wait">
          {previewImage ? (
            <motion.div
              key="preview"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="relative h-full"
            >
              <img
                src={previewImage}
                alt="Captured face"
                className="w-full h-full object-cover cursor-pointer"
                onClick={handleImageClick}
              />
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute bottom-4 left-0 right-0 flex justify-center gap-2"
              >
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={confirmImage}
                  className="bg-green-500 hover:bg-green-600 text-white transition-colors"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Use Photo
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleImageClick}
                  className="bg-red-500 hover:bg-red-600 text-white transition-colors"
                >
                  <X className="h-4 w-4 mr-2" />
                  Retake
                </Button>
              </motion.div>
            </motion.div>
          ) : stream ? (
            <motion.div
              key="camera"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="relative h-full"
            >
              <video
                ref={(el) => {
                  if (el) {
                    videoRef.current = el;
                    el.srcObject = stream;
                    el.play().catch((err) =>
                      console.error("Error playing video:", err)
                    );
                  }
                }}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute bottom-4 left-0 right-0 flex justify-center gap-2"
              >
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={captureImage}
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Capture
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={stopCamera}
                >
                  <RefreshCcw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="start"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <Button
                type="button"
                variant="secondary"
                onClick={startCamera}
                disabled={isLoading}
                className="transition-all duration-300 hover:scale-105"
              >
                {isLoading ? (
                  <>
                    <RefreshCcw className="h-4 w-4 mr-2 animate-spin" />
                    Accessing Camera...
                  </>
                ) : (
                  <>
                    <Camera className="h-4 w-4 mr-2" />
                    Start Camera
                  </>
                )}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Hidden canvas for image capture */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
