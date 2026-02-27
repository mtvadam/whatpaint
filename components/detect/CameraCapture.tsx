'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { sampleColorGrid, applyWhiteBalance } from '@/lib/sampling';
import { rgbToHex, findClosestColors } from '@/lib/color-science';
import { colorDatabase } from '@/data/color-database';
import type { RGB, WhiteBalanceMode } from '@/types';
import type { ColorMatchResult } from '@/lib/color-science';
import { WhiteBalanceControl } from './WhiteBalanceControl';

type CameraCaptureProps = {
  onColorDetected: (rgb: RGB) => void;
};

export function CameraCapture({ onColorDetected }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const samplingCanvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const lastMatchTimeRef = useRef<number>(0);
  const lastMatchedRgbRef = useRef<RGB | null>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [whiteBalance, setWhiteBalance] = useState<WhiteBalanceMode>('none');
  const [error, setError] = useState('');
  const [liveColor, setLiveColor] = useState<RGB | null>(null);
  const [liveMatches, setLiveMatches] = useState<ColorMatchResult[]>([]);
  const [isReady, setIsReady] = useState(false);

  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'environment'
        },
        audio: false
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.onloadedmetadata = () => {
          setIsReady(true);
        };
      }
      setError('');
    } catch {
      setError('Unable to access camera. Please grant camera permissions.');
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsReady(false);
  }, [stream]);

  useEffect(() => {
    startCamera();
    return () => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [startCamera]);

  // Stop stream on unmount
  useEffect(() => {
    return () => {
      stream?.getTracks().forEach(track => track.stop());
    };
  }, [stream]);

  // Main sampling + overlay loop
  useEffect(() => {
    if (!isReady || !videoRef.current) return;

    const video = videoRef.current;
    const overlay = overlayCanvasRef.current;
    const samplingCanvas = samplingCanvasRef.current;
    if (!overlay || !samplingCanvas) return;

    const samplingCtx = samplingCanvas.getContext('2d', { willReadFrequently: true });
    const overlayCtx = overlay.getContext('2d');
    if (!samplingCtx || !overlayCtx) return;

    let lastSampleTime = 0;
    const sampleInterval = 120; // ~8fps sampling
    const matchInterval = 400; // run match every 400ms

    const loop = (timestamp: number) => {
      rafRef.current = requestAnimationFrame(loop);

      if (timestamp - lastSampleTime < sampleInterval) return;
      lastSampleTime = timestamp;

      if (video.readyState < video.HAVE_CURRENT_DATA) return;

      const vw = video.videoWidth;
      const vh = video.videoHeight;
      if (!vw || !vh) return;

      // Resize canvases to match video
      if (samplingCanvas.width !== vw) samplingCanvas.width = vw;
      if (samplingCanvas.height !== vh) samplingCanvas.height = vh;

      // Draw video frame to hidden sampling canvas
      samplingCtx.drawImage(video, 0, 0, vw, vh);
      const imageData = samplingCtx.getImageData(0, 0, vw, vh);

      // Sample from center of frame
      const cx = Math.floor(vw / 2);
      const cy = Math.floor(vh / 2);
      let sampled = sampleColorGrid(imageData, cx, cy, 20);
      sampled = applyWhiteBalance(sampled, whiteBalance);

      setLiveColor(sampled);

      // Run color matching at a lower rate and only if color changed enough
      const now = Date.now();
      if (now - lastMatchTimeRef.current > matchInterval) {
        const prev = lastMatchedRgbRef.current;
        const colorChanged = !prev ||
          Math.abs(sampled[0] - prev[0]) > 5 ||
          Math.abs(sampled[1] - prev[1]) > 5 ||
          Math.abs(sampled[2] - prev[2]) > 5;

        if (colorChanged) {
          const matches = findClosestColors(sampled, colorDatabase, 3);
          setLiveMatches(matches);
          lastMatchedRgbRef.current = sampled;
          lastMatchTimeRef.current = now;
        }
      }

      // Draw targeting overlay
      drawOverlay(overlayCtx, overlay.width, overlay.height, sampled);
    };

    // Size overlay to match displayed size
    const resize = () => {
      if (!overlay) return;
      const rect = overlay.getBoundingClientRect();
      overlay.width = rect.width * window.devicePixelRatio;
      overlay.height = rect.height * window.devicePixelRatio;
    };

    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(overlay);

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafRef.current);
      resizeObserver.disconnect();
    };
  }, [isReady, whiteBalance]);

  const drawOverlay = (ctx: CanvasRenderingContext2D, w: number, h: number, color: RGB) => {
    ctx.clearRect(0, 0, w, h);
    const cx = w / 2;
    const cy = h / 2;
    const dpr = window.devicePixelRatio || 1;

    // Dim outer area slightly
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    ctx.fillRect(0, 0, w, h);
    // Clear center circle
    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(cx, cy, 50 * dpr, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Outer targeting ring
    ctx.strokeStyle = 'rgba(255,255,255,0.8)';
    ctx.lineWidth = 2 * dpr;
    ctx.beginPath();
    ctx.arc(cx, cy, 50 * dpr, 0, Math.PI * 2);
    ctx.stroke();

    // Inner targeting ring
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.lineWidth = 1.5 * dpr;
    ctx.beginPath();
    ctx.arc(cx, cy, 20 * dpr, 0, Math.PI * 2);
    ctx.stroke();

    // Crosshair lines (extending from inner to outer ring)
    ctx.strokeStyle = 'rgba(255,255,255,0.4)';
    ctx.lineWidth = 1 * dpr;
    const inner = 22 * dpr;
    const outer = 48 * dpr;
    // Top
    ctx.beginPath(); ctx.moveTo(cx, cy - inner); ctx.lineTo(cx, cy - outer); ctx.stroke();
    // Bottom
    ctx.beginPath(); ctx.moveTo(cx, cy + inner); ctx.lineTo(cx, cy + outer); ctx.stroke();
    // Left
    ctx.beginPath(); ctx.moveTo(cx - inner, cy); ctx.lineTo(cx - outer, cy); ctx.stroke();
    // Right
    ctx.beginPath(); ctx.moveTo(cx + inner, cy); ctx.lineTo(cx + outer, cy); ctx.stroke();

    // Center dot with detected color
    ctx.fillStyle = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
    ctx.beginPath();
    ctx.arc(cx, cy, 6 * dpr, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.9)';
    ctx.lineWidth = 1.5 * dpr;
    ctx.stroke();

    // Pulsing animation ring (using timestamp-based opacity)
    const pulse = (Math.sin(Date.now() / 500) + 1) / 2;
    ctx.strokeStyle = `rgba(232, 117, 74, ${0.2 + pulse * 0.4})`;
    ctx.lineWidth = 2 * dpr;
    ctx.beginPath();
    ctx.arc(cx, cy, (52 + pulse * 4) * dpr, 0, Math.PI * 2);
    ctx.stroke();
  };

  const handleCapture = () => {
    if (liveColor) {
      onColorDetected(liveColor);
    }
  };

  const hex = liveColor ? rgbToHex(liveColor) : null;
  const bestMatch = liveMatches[0] || null;

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
            {/* Video feed */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />

            {/* Hidden sampling canvas (never displayed) */}
            <canvas ref={samplingCanvasRef} className="hidden" />

            {/* Targeting overlay canvas */}
            <canvas
              ref={overlayCanvasRef}
              className="absolute inset-0 w-full h-full pointer-events-none"
            />

            {/* Live color preview - bottom left */}
            {liveColor && (
              <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-md rounded-xl border border-white/10 p-3 flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-lg border-2 border-white/20 shadow-lg flex-shrink-0"
                  style={{ backgroundColor: hex! }}
                />
                <div>
                  <div className="font-mono text-white text-sm font-bold">{hex}</div>
                  <div className="font-mono text-gray-400 text-xs">
                    {liveColor[0]}, {liveColor[1]}, {liveColor[2]}
                  </div>
                </div>
              </div>
            )}

            {/* Live match preview - bottom right */}
            {bestMatch && (
              <div className="absolute bottom-4 right-4 bg-black/70 backdrop-blur-md rounded-xl border border-white/10 p-3 max-w-[220px]">
                <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-2">Closest Match</div>
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-9 h-9 rounded-lg border border-white/20 flex-shrink-0"
                    style={{ backgroundColor: bestMatch.color.hex }}
                  />
                  <div className="min-w-0">
                    <div className="text-white text-sm font-semibold truncate">{bestMatch.color.name}</div>
                    <div className="text-gray-400 text-xs truncate">{bestMatch.color.brand}</div>
                  </div>
                  <div className={`text-xs font-bold font-mono flex-shrink-0 ${
                    bestMatch.confidence >= 85 ? 'text-green-400' :
                    bestMatch.confidence >= 60 ? 'text-amber-400' : 'text-red-400'
                  }`}>
                    {Math.round(bestMatch.confidence)}%
                  </div>
                </div>
              </div>
            )}

            {/* Scanning indicator - top */}
            {isReady && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm px-4 py-2 rounded-full flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs text-white/80 font-medium">Live Detection</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Capture button */}
      <Button
        onClick={handleCapture}
        disabled={!liveColor}
        className="w-full text-base py-5"
      >
        Capture This Color
      </Button>

      {/* White Balance */}
      <WhiteBalanceControl
        value={whiteBalance}
        onChange={setWhiteBalance}
      />

      {/* Live match cards preview */}
      {liveMatches.length > 0 && (
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="text-xs uppercase tracking-wider text-gray-500 mb-3">Live Matches</div>
          <div className="space-y-2">
            {liveMatches.map((match, i) => (
              <div
                key={`${match.color.brand}-${match.color.name}`}
                className="flex items-center gap-3"
              >
                <div className="text-xs text-gray-600 w-4 font-mono">{i + 1}</div>
                <div
                  className="w-8 h-8 rounded border border-border flex-shrink-0"
                  style={{ backgroundColor: match.color.hex }}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-white truncate">{match.color.name}</div>
                  <div className="text-xs text-gray-500">{match.color.brand} {match.color.code && `· ${match.color.code}`}</div>
                </div>
                <div className={`text-sm font-bold font-mono ${
                  match.confidence >= 85 ? 'text-green-400' :
                  match.confidence >= 60 ? 'text-amber-400' : 'text-orange-400'
                }`}>
                  {Math.round(match.confidence)}%
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
