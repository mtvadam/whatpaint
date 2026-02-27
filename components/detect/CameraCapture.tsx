'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { sampleColorGrid, applyWhiteBalance } from '@/lib/sampling';
import { rgbToHex, findClosestColors } from '@/lib/color-science';
import { colorDatabase } from '@/data/color-database';
import { useImageSegmenter } from '@/hooks/useImageSegmenter';
import { extractRegions, getCategoryAtPoint, sampleRegionColor } from '@/lib/segmentation';
import { drawAiOverlay } from '@/lib/contour-drawing';
import type { SegmentRegion } from '@/lib/segmentation';
import type { SegmentationResult } from '@/hooks/useImageSegmenter';
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

  // Segmentation refs (accessed inside rAF loop to avoid stale closures)
  const lastSegmentationRef = useRef<SegmentationResult | null>(null);
  const lastSegmentTimeRef = useRef<number>(0);
  const regionsRef = useRef<SegmentRegion[]>([]);
  const selectedCategoryIdRef = useRef<number | null>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [whiteBalance, setWhiteBalance] = useState<WhiteBalanceMode>('none');
  const [error, setError] = useState('');
  const [liveColor, setLiveColor] = useState<RGB | null>(null);
  const [liveMatches, setLiveMatches] = useState<ColorMatchResult[]>([]);
  const [isReady, setIsReady] = useState(false);
  const [aiEnabled, setAiEnabled] = useState(true);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

  const { isLoading: aiLoading, isReady: aiReady, initSegmenter, segmentFrame } = useImageSegmenter();

  // Sync selectedCategoryId state to ref for rAF loop access
  useEffect(() => {
    selectedCategoryIdRef.current = selectedCategoryId;
  }, [selectedCategoryId]);

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

  // Initialize AI model when camera is ready
  useEffect(() => {
    if (isReady && aiEnabled) {
      initSegmenter();
    }
  }, [isReady, aiEnabled, initSegmenter]);

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
    const segmentInterval = 200; // ~5fps segmentation
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

      // === SEGMENTATION (throttled to ~5fps) ===
      let currentMask = lastSegmentationRef.current;
      if (aiReady && aiEnabled && timestamp - lastSegmentTimeRef.current > segmentInterval) {
        const newMask = segmentFrame(video, timestamp);
        if (newMask) {
          currentMask = newMask;
          lastSegmentationRef.current = newMask;
          lastSegmentTimeRef.current = timestamp;

          // Extract regions from new mask
          const regions = extractRegions(
            newMask.categoryMask,
            newMask.width,
            newMask.height
          );
          regionsRef.current = regions;

          // Auto-select: if no region is selected, pick the one at center
          if (selectedCategoryIdRef.current === null && regions.length > 0) {
            const centerCat = getCategoryAtPoint(
              newMask.categoryMask,
              newMask.width,
              newMask.height,
              Math.floor(newMask.width / 2),
              Math.floor(newMask.height / 2)
            );
            setSelectedCategoryId(centerCat);
          }
        }
      }

      // === COLOR SAMPLING ===
      let sampled: RGB;
      const selCat = selectedCategoryIdRef.current;
      if (currentMask && selCat !== null && aiEnabled) {
        // AI mode: sample from the selected region
        sampled = sampleRegionColor(
          imageData,
          currentMask.categoryMask,
          currentMask.width,
          currentMask.height,
          selCat
        );
        // Fallback if region returned black (no pixels found)
        if (sampled[0] === 0 && sampled[1] === 0 && sampled[2] === 0) {
          const cx = Math.floor(vw / 2);
          const cy = Math.floor(vh / 2);
          sampled = sampleColorGrid(imageData, cx, cy, 20);
        }
      } else {
        // Fallback: existing center-point sampling
        const cx = Math.floor(vw / 2);
        const cy = Math.floor(vh / 2);
        sampled = sampleColorGrid(imageData, cx, cy, 20);
      }
      sampled = applyWhiteBalance(sampled, whiteBalance);

      setLiveColor(sampled);

      // === COLOR MATCHING (throttled) ===
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

      // === DRAW OVERLAY ===
      if (currentMask && regionsRef.current.length > 0 && aiEnabled) {
        drawAiOverlay(
          overlayCtx, overlay.width, overlay.height, sampled,
          regionsRef.current, currentMask.categoryMask,
          currentMask.width, currentMask.height,
          selectedCategoryIdRef.current
        );
      } else {
        drawOverlay(overlayCtx, overlay.width, overlay.height, sampled);
      }
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
  }, [isReady, whiteBalance, aiReady, aiEnabled, segmentFrame]);

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

  // Tap-to-select handler
  const handleOverlayTap = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const mask = lastSegmentationRef.current;
    if (!mask || !aiEnabled) return;

    const canvas = overlayCanvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const tapX = Math.floor(
      ((e.clientX - rect.left) / rect.width) * mask.width
    );
    const tapY = Math.floor(
      ((e.clientY - rect.top) / rect.height) * mask.height
    );

    const categoryId = getCategoryAtPoint(
      mask.categoryMask,
      mask.width,
      mask.height,
      tapX,
      tapY
    );

    setSelectedCategoryId(categoryId);
  }, [aiEnabled]);

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

            {/* Targeting overlay canvas - supports tap when AI is active */}
            <canvas
              ref={overlayCanvasRef}
              className={`absolute inset-0 w-full h-full ${aiReady && aiEnabled ? '' : 'pointer-events-none'}`}
              style={aiReady && aiEnabled ? { touchAction: 'none' } : undefined}
              onClick={handleOverlayTap}
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
                <div className={`w-2 h-2 rounded-full ${
                  aiReady && aiEnabled ? 'bg-blue-500' :
                  aiLoading && aiEnabled ? 'bg-amber-500' :
                  'bg-green-500'
                } animate-pulse`} />
                <span className="text-xs text-white/80 font-medium">
                  {aiLoading && aiEnabled ? 'Loading AI...' :
                   aiReady && aiEnabled ? 'AI Detection' :
                   'Live Detection'}
                </span>
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

      {/* AI Surface Detection toggle */}
      <div className="bg-card rounded-xl border border-border p-4 flex items-center justify-between">
        <div>
          <div className="text-sm font-medium text-white">AI Surface Detection</div>
          <div className="text-xs text-gray-500">
            {aiReady && aiEnabled ? 'Tap regions to select' :
             aiLoading && aiEnabled ? 'Loading model...' :
             'Disabled'}
          </div>
        </div>
        <button
          onClick={() => {
            setAiEnabled(!aiEnabled);
            if (aiEnabled) {
              // Turning off - reset segmentation state
              lastSegmentationRef.current = null;
              regionsRef.current = [];
              setSelectedCategoryId(null);
            }
          }}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            aiEnabled
              ? 'bg-accent text-white'
              : 'bg-background text-gray-400 border border-border'
          }`}
        >
          {aiEnabled ? 'On' : 'Off'}
        </button>
      </div>

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
