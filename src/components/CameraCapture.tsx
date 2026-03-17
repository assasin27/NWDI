import React, { useRef, useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { freshnessService, FreshnessResult } from '../lib/freshnessService';

interface CameraCaptureProps {
  onFreshnessResult?: (result: FreshnessResult) => void;
  orderId?: string;
  autoStart?: boolean; // New prop to auto-start camera
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({ onFreshnessResult, orderId, autoStart = false }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<FreshnessResult | null>(null);
  const [error, setError] = useState<string>('');
  const [cameraStarting, setCameraStarting] = useState(false);

  useEffect(() => {
    // Auto-start camera if requested
    if (autoStart) {
      startCamera();
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [autoStart]);

  const startCamera = async () => {
    try {
      setCameraStarting(true);
      setError('');
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' } // rear camera
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      setError('Camera access denied or not available');
      console.error('Error accessing camera:', err);
    } finally {
      setCameraStarting(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);

    const imageDataUrl = canvas.toDataURL('image/jpeg');
    analyzeImage(imageDataUrl);
  };

  const analyzeImage = async (imageDataUrl: string) => {
    setAnalyzing(true);
    setError('');

    try {
      // Create image element from data URL
      const img = new Image();
      img.src = imageDataUrl;

      await new Promise((resolve) => {
        img.onload = resolve;
      });

      const freshnessResult = await freshnessService.analyzeImage(img);
      setResult(freshnessResult);
      onFreshnessResult?.(freshnessResult);

      // TODO: Save to database with orderId
      if (orderId) {
        console.log(`Saving freshness score ${freshnessResult.score} for order ${orderId}`);
        // Implement save logic
      }
    } catch (err) {
      setError('Failed to analyze image');
      console.error('Error analyzing image:', err);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Freshness Detection</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {cameraStarting && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-600">Starting camera...</p>
          </div>
        )}

        {error && !cameraStarting && (
          <div className="text-center py-8">
            <div className="text-red-500 text-sm mb-4">{error}</div>
            <Button onClick={startCamera} variant="outline">
              Try Again
            </Button>
          </div>
        )}

        {stream && !cameraStarting && (
          <div className="space-y-4">
            <div className="relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full rounded-lg border"
              />
              <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                Live Preview
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={captureImage} disabled={analyzing} className="flex-1">
                {analyzing ? 'Analyzing...' : 'Capture & Analyze'}
              </Button>
              <Button onClick={stopCamera} variant="outline">
                Stop Camera
              </Button>
            </div>
          </div>
        )}

        <canvas ref={canvasRef} className="hidden" />

        {result && (
          <div className="space-y-2">
            <div className="text-lg font-semibold">
              Freshness: {result.status.replace('-', ' ').toUpperCase()}
            </div>
            <div>Score: {(result.score * 100).toFixed(1)}%</div>
            <div>Confidence: {(result.confidence * 100).toFixed(1)}%</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};