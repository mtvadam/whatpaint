'use client';

import { useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { sampleColorGrid, applyWhiteBalance } from '@/lib/sampling';
import type { RGB, SamplePoint, WhiteBalanceMode } from '@/types';
import { WhiteBalanceControl } from './WhiteBalanceControl';

type ImageUploadProps = {
  onColorDetected: (rgb: RGB) => void;
};

export function ImageUpload({ onColorDetected }: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [samplePoints, setSamplePoints] = useState<SamplePoint[]>([]);
  const [whiteBalance, setWhiteBalance] = useState<WhiteBalanceMode>('none');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        if (!canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        setImageLoaded(true);
        setSamplePoints([]);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!imageLoaded || !canvasRef.current) return;

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

    const updatedPoints = [...samplePoints, newPoint].slice(-5);
    setSamplePoints(updatedPoints);

    // Redraw with markers
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext('2d');
    if (tempCtx) {
      tempCtx.putImageData(imageData, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(tempCanvas, 0, 0);

      // Draw markers
      updatedPoints.forEach((point, index) => {
        const isActive = index === updatedPoints.length - 1;
        const radius = isActive ? 12 : 8;

        ctx.strokeStyle = isActive ? '#E8754A' : '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(point.x, point.y, radius, 0, 2 * Math.PI);
        ctx.stroke();

        ctx.fillStyle = `rgb(${point.rgb[0]}, ${point.rgb[1]}, ${point.rgb[2]})`;
        ctx.beginPath();
        ctx.arc(point.x, point.y, 4, 0, 2 * Math.PI);
        ctx.fill();

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.stroke();
      });
    }

    onColorDetected(sampledRgb);
  };

  const handleClearImage = () => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    }
    setImageLoaded(false);
    setSamplePoints([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        {!imageLoaded ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="aspect-video flex flex-col items-center justify-center p-8 cursor-pointer hover:bg-card/50 transition-colors border-2 border-dashed border-border"
          >
            <div className="text-5xl mb-4">📁</div>
            <p className="text-gray-400 text-center mb-2">
              Click to upload or drag and drop
            </p>
            <p className="text-sm text-gray-600">PNG, JPG up to 10MB</p>
          </div>
        ) : (
          <div className="relative aspect-video bg-black">
            <canvas
              ref={canvasRef}
              onClick={handleCanvasClick}
              className="w-full h-full object-contain cursor-crosshair"
            />
            {samplePoints.length === 0 && (
              <div className="absolute top-4 left-4 bg-accent/90 backdrop-blur-sm px-3 py-2 rounded-lg text-xs font-medium text-white">
                Click anywhere to sample color
              </div>
            )}
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {imageLoaded && (
        <>
          <Button onClick={handleClearImage} variant="secondary" className="w-full">
            Clear Image
          </Button>

          <WhiteBalanceControl value={whiteBalance} onChange={setWhiteBalance} />

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
        </>
      )}
    </div>
  );
}
