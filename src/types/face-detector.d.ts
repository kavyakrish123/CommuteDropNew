// Type definitions for FaceDetector API (experimental browser API)

interface FaceDetectorOptions {
  fastMode?: boolean;
  maxDetections?: number;
}

interface DetectedFace {
  boundingBox: DOMRectReadOnly;
  landmarks?: Array<{
    locations: Array<{ x: number; y: number }>;
    type: string;
  }>;
}

interface FaceDetector {
  detect(image: ImageBitmapSource): Promise<DetectedFace[]>;
}

declare var FaceDetector: {
  new (options?: FaceDetectorOptions): FaceDetector;
};

interface Window {
  FaceDetector?: typeof FaceDetector;
}

