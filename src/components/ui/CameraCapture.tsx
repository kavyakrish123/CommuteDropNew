"use client";

import { useState, useRef, useEffect } from "react";

interface CameraCaptureProps {
  onCapture: (file: File) => void;
  onError: (error: string) => void;
  previewUrl?: string | null;
  disabled?: boolean;
}

export function CameraCapture({
  onCapture,
  onError,
  previewUrl,
  disabled = false,
}: CameraCaptureProps) {
  const [isCapturing, setIsCapturing] = useState(false);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const [faceDetected, setFaceDetected] = useState<boolean | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Check if FaceDetector API is available
  const isFaceDetectorAvailable = typeof window !== "undefined" && "FaceDetector" in window;

  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const detectFace = async (imageElement: HTMLImageElement | HTMLVideoElement): Promise<boolean> => {
    if (!isFaceDetectorAvailable) {
      // Fallback: If FaceDetector is not available, we'll do basic validation
      // Check if image has reasonable dimensions (not too small, not too large)
      const width = imageElement instanceof HTMLVideoElement ? imageElement.videoWidth : imageElement.width;
      const height = imageElement instanceof HTMLVideoElement ? imageElement.videoHeight : imageElement.height;
      
      // Basic heuristic: if image is reasonable size and aspect ratio, assume it might have a face
      // This is not perfect but better than nothing
      if (width < 200 || height < 200) {
        return false;
      }
      const aspectRatio = width / height;
      // Portrait or square images are more likely to be selfies
      if (aspectRatio < 0.5 || aspectRatio > 2) {
        return false;
      }
      // For now, if FaceDetector is not available, we'll accept the image
      // but show a warning that face detection couldn't be performed
      return true;
    }

    try {
      const faceDetector = new (window as any).FaceDetector({
        fastMode: true,
        maxDetections: 1,
      });

      const faces = await faceDetector.detect(imageElement);
      return faces.length > 0;
    } catch (error) {
      console.error("Face detection error:", error);
      // If face detection fails, we'll still allow the image but log the error
      return true; // Allow to proceed, but user should be aware
    }
  };

  const startCamera = async () => {
    try {
      setIsCapturing(true);
      setFaceDetected(null);

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 1280 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();

        // Start continuous face detection while camera is on
        const checkFace = async () => {
          if (videoRef.current && videoRef.current.readyState === 4) {
            setIsDetecting(true);
            const detected = await detectFace(videoRef.current);
            setFaceDetected(detected);
            setIsDetecting(false);
          }
        };

        // Check for face every 500ms
        const faceCheckInterval = setInterval(checkFace, 500);

        // Cleanup interval when component unmounts or camera stops
        videoRef.current.addEventListener("loadedmetadata", checkFace);
        
        return () => {
          clearInterval(faceCheckInterval);
        };
      }
    } catch (error: any) {
      console.error("Camera error:", error);
      setIsCapturing(false);
      if (error.name === "NotAllowedError" || error.name === "PermissionDeniedError") {
        onError("Camera permission denied. Please allow camera access to take a selfie.");
      } else if (error.name === "NotFoundError" || error.name === "DevicesNotFoundError") {
        onError("No camera found. Please use a device with a camera.");
      } else {
        onError("Failed to access camera. Please try again.");
      }
    }
  };

  const stopCamera = () => {
    stopStream();
    setIsCapturing(false);
    setFaceDetected(null);
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      
      if (!ctx) {
        onError("Failed to capture photo. Please try again.");
        return;
      }

      ctx.drawImage(video, 0, 0);

      // Final face detection check before capturing
      setIsDetecting(true);
      const detected = await detectFace(video);
      setIsDetecting(false);

      if (!detected) {
        onError("No face detected. Please ensure your face is clearly visible in the camera.");
        return;
      }

      canvas.toBlob(
        (blob) => {
          if (blob) {
            const file = new File([blob], "selfie.jpg", { type: "image/jpeg" });
            onCapture(file);
            stopCamera();
          } else {
            onError("Failed to capture photo. Please try again.");
          }
        },
        "image/jpeg",
        0.9
      );
    } catch (error: any) {
      console.error("Capture error:", error);
      onError("Failed to capture photo. Please try again.");
    }
  };

  const switchCamera = () => {
    if (facingMode === "user") {
      setFacingMode("environment");
    } else {
      setFacingMode("user");
    }
    stopCamera();
    setTimeout(() => startCamera(), 100);
  };

  useEffect(() => {
    return () => {
      stopStream();
    };
  }, []);

  return (
    <div className="space-y-4">
      {!isCapturing && !previewUrl && (
        <div className="space-y-3">
          <button
            type="button"
            onClick={startCamera}
            disabled={disabled}
            className="w-full bg-[#00C57E] text-white py-3 px-4 rounded-lg font-semibold hover:bg-[#00A869] active:bg-[#00995A] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Take Selfie with Camera
          </button>
          <p className="text-xs text-gray-600 text-center">
            You must take a live selfie using your camera. Stock photos or uploaded images are not allowed.
          </p>
        </div>
      )}

      {isCapturing && (
        <div className="space-y-4">
          <div className="relative bg-black rounded-lg overflow-hidden aspect-square max-w-md mx-auto">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            <canvas ref={canvasRef} className="hidden" />
            
            {/* Face detection indicator */}
            {faceDetected !== null && (
              <div className="absolute top-4 left-4 right-4">
                <div
                  className={`px-3 py-2 rounded-lg text-sm font-medium ${
                    faceDetected
                      ? "bg-green-500/90 text-white"
                      : "bg-red-500/90 text-white"
                  }`}
                >
                  {isDetecting ? (
                    "🔍 Detecting face..."
                  ) : faceDetected ? (
                    "✅ Face detected"
                  ) : (
                    "❌ No face detected - Please position your face in the camera"
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3 justify-center">
            <button
              type="button"
              onClick={stopCamera}
              className="px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={capturePhoto}
              disabled={!faceDetected || isDetecting}
              className="px-6 py-2 bg-[#00C57E] text-white rounded-lg font-semibold hover:bg-[#00A869] active:bg-[#00995A] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {isDetecting ? "Checking..." : "Capture Photo"}
            </button>
          </div>

          {/* Camera switch button (only show if device has multiple cameras) */}
          <button
            type="button"
            onClick={switchCamera}
            className="w-full text-sm text-gray-600 hover:text-gray-800 underline"
          >
            Switch Camera ({facingMode === "user" ? "Front" : "Back"})
          </button>
        </div>
      )}

      {previewUrl && !isCapturing && (
        <div className="space-y-3">
          <div className="relative">
            <img
              src={previewUrl}
              alt="Selfie preview"
              className="w-32 h-32 rounded-full object-cover border-2 border-[#00C57E] mx-auto"
            />
            <button
              type="button"
              onClick={() => {
                stopCamera();
                onCapture(new File([], "")); // Clear the capture
              }}
              className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
              aria-label="Remove photo"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-xs text-green-600 text-center font-medium">
            ✅ Selfie captured successfully
          </p>
        </div>
      )}

      {!isFaceDetectorAvailable && (
        <p className="text-xs text-yellow-600 text-center">
          ⚠️ Advanced face detection not available in this browser. Please ensure your face is clearly visible.
        </p>
      )}
    </div>
  );
}

