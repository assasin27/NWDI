import React, { useRef, useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { freshnessService, FreshnessResult } from '../lib/freshnessService';

interface CameraCaptureProps {
  onFreshnessResult?: (result: FreshnessResult) => void;
  orderId?: string;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({ onFreshnessResult, orderId }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<FreshnessResult | null>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' } // rear camera
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setError('');
    } catch (err) {
      setError('Camera access denied or not available');
      console.error('Error accessing camera:', err);
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
        {!stream ? (
          <Button onClick={startCamera} className="w-full">
            Start Camera
          </Button>
        ) : (
          <div className="space-y-4">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full rounded-lg border"
            />
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

        {error && (
          <div className="text-red-500 text-sm">{error}</div>
        )}

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