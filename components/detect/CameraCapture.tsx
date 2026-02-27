'use client';

import { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { sampleColorGrid, captureImageData, drawSampleMarkers, applyWhiteBalance } from '@/lib/sampling';
import type { RGB, SamplePoint, WhiteBalanceMode } from '@/types';
import { WhiteBalanceControl } from './WhiteBalanceControl';

type CameraCaptureProps = {
  onColorDetected: (rgb: RGB) => void;
};

export function CameraCapture({ onColorDetected }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [frozen, setFrozen] = useState(false);
  const [samplePoints, setSamplePoints] = useState<SamplePoint[]>([]);
  const [whiteBalance, setWhiteBalance] = useState<WhiteBalanceMode>('none');
  const [cameraInfo, setCameraInfo] = useState({ resolution: '', device: '', fps: 0 });
  const [error, setError] = useState('');

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          facingMode: 'user'
        },
        audio: false
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;

        videoRef.current.onloadedmetadata = () => {
          const video = videoRef.current!;
          const track = mediaStream.getVideoTracks()[0];
          const settings = track.getSettings();

          setCameraInfo({
            resolution: `${video.videoWidth}x${video.videoHeight}`,
            device: track.label || 'Unknown Camera',
            fps: settings.frameRate || 30
          });
        };
      }
      setError('');
    } catch (err) {
      setError('Unable to access camera. Please grant camera permissions.');
      console.error('Camera error:', err);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const freezeFrame = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    ctx.drawImage(videoRef.current, 0, 0);

    setFrozen(true);
  };

  const resumeLive = () => {
    setFrozen(false);
    setSamplePoints([]);
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!frozen || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let sampledRgb = sampleColorGrid(imageData, x, y);

    // Apply white balance
    sampledRgb = applyWhiteBalance(sampledRgb, whiteBalance);

    const newPoint: SamplePoint = {
      x,
      y,
      rgb: sampledRgb,
      timestamp: Date.now()
    };

    // Keep last 5 samples
    const updatedPoints = [...samplePoints, newPoint].slice(-5);
    setSamplePoints(updatedPoints);

    // Redraw canvas with markers
    const newImageData = captureImageData(videoRef.current!);
    if (newImageData) {
      ctx.putImageData(newImageData, 0, 0);
      drawSampleMarkers(ctx, updatedPoints, updatedPoints.length - 1);
    }

    // Send color to parent
    onColorDetected(sampledRgb);
  };

  return (
    <div className="space-y-4">
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        {error ? (
          <div className="aspect-video flex items-center justify-center p-8 text-center">
            <div>
              <div className="text-4xl mb-4">📷</div>
              <p className="text-red-400">{error}</p>
              <Button onClick={startCamera} className="mt-4" size="sm">
                Try Again
              </Button>
            </div>
          </div>
        ) : (
          <div className="relative aspect-video bg-black">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover ${frozen ? 'hidden' : 'block'}`}
            />
            <canvas
              ref={canvasRef}
              onClick={handleCanvasClick}
              className={`w-full h-full object-cover ${frozen ? 'block cursor-crosshair' : 'hidden'}`}
            />

            {/* Camera info overlay */}
            {!frozen && stream && (
              <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-sm px-3 py-2 rounded-lg text-xs font-mono text-gray-300">
                <div>{cameraInfo.resolution} • {cameraInfo.fps}fps</div>
                <div className="text-gray-500 truncate max-w-[200px]">{cameraInfo.device}</div>
              </div>
            )}

            {/* Frozen indicator */}
            {frozen && (
              <div className="absolute top-4 left-4 bg-accent/90 backdrop-blur-sm px-3 py-2 rounded-lg text-xs font-medium text-white">
                Click anywhere to sample color
              </div>
            )}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        {!frozen ? (
          <Button onClick={freezeFrame} disabled={!stream} className="flex-1">
            Freeze Frame
          </Button>
        ) : (
          <Button onClick={resumeLive} variant="secondary" className="flex-1">
            Resume Live
          </Button>
        )}
      </div>

      {/* White Balance */}
      {frozen && (
        <WhiteBalanceControl
          value={whiteBalance}
          onChange={setWhiteBalance}
        />
      )}

      {/* Sample points history */}
      {samplePoints.length > 0 && (
        <div className="bg-card rounded-lg border border-border p-4">
          <div className="text-sm font-medium text-gray-400 mb-2">Recent samples:</div>
          <div className="flex gap-2 flex-wrap">
            {samplePoints.map((point, index) => (
              <div
                key={point.timestamp}
                className="flex items-center gap-2 bg-background px-3 py-2 rounded-lg"
              >
                <div
                  className="w-6 h-6 rounded border border-border"
                  style={{ backgroundColor: `rgb(${point.rgb[0]}, ${point.rgb[1]}, ${point.rgb[2]})` }}
                />
                <span className="text-xs font-mono text-gray-400">
                  #{index + 1}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
