import type { SegmentRegion } from './segmentation';
import type { RGB } from '@/types';

const SEGMENT_COLORS: Record<number, string> = {
  0: 'rgba(255, 255, 255, 0.4)',     // background
  5: 'rgba(100, 200, 255, 0.6)',     // bottle
  9: 'rgba(255, 180, 100, 0.6)',     // chair
  11: 'rgba(180, 130, 255, 0.6)',    // dining table
  15: 'rgba(100, 255, 150, 0.6)',    // person
  16: 'rgba(150, 255, 200, 0.6)',    // potted plant
  18: 'rgba(255, 150, 180, 0.6)',    // sofa
  20: 'rgba(100, 180, 255, 0.6)',    // tv/monitor
};

function getSegmentColor(categoryId: number): string {
  return SEGMENT_COLORS[categoryId] || 'rgba(200, 200, 200, 0.5)';
}

/**
 * Draw segment outlines on the overlay canvas.
 * Selected region gets a thick accent outline; others get subtle outlines.
 */
export function drawSegmentOutlines(
  ctx: CanvasRenderingContext2D,
  regions: SegmentRegion[],
  selectedCategoryId: number | null,
  maskWidth: number,
  maskHeight: number,
  canvasWidth: number,
  canvasHeight: number
): void {
  const scaleX = canvasWidth / maskWidth;
  const scaleY = canvasHeight / maskHeight;
  const dpr = window.devicePixelRatio || 1;

  for (const region of regions) {
    const isSelected = region.categoryId === selectedCategoryId;
    const contour = region.contourPixels;

    if (contour.length === 0) continue;

    if (isSelected) {
      // Bright accent outline for selected region
      ctx.fillStyle = 'rgba(232, 117, 74, 0.8)';
      const dotSize = 1.8 * dpr;
      for (const p of contour) {
        const cx = p.x * scaleX;
        const cy = p.y * scaleY;
        ctx.fillRect(cx - dotSize / 2, cy - dotSize / 2, dotSize, dotSize);
      }
    } else {
      // Subtle outline for non-selected regions
      const color = getSegmentColor(region.categoryId);
      ctx.fillStyle = color;
      const dotSize = 1.2 * dpr;
      for (const p of contour) {
        const cx = p.x * scaleX;
        const cy = p.y * scaleY;
        ctx.fillRect(cx - dotSize / 2, cy - dotSize / 2, dotSize, dotSize);
      }
    }
  }
}

/**
 * Draw a dim overlay everywhere except the selected region.
 * Uses the mask to determine which pixels belong to the selected category.
 */
export function drawSelectedRegionHighlight(
  ctx: CanvasRenderingContext2D,
  categoryMask: Uint8Array,
  selectedCategoryId: number,
  maskWidth: number,
  maskHeight: number,
  canvasWidth: number,
  canvasHeight: number
): void {
  // Draw a semi-transparent overlay over the entire canvas
  ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // Punch out the selected region using a temporary canvas approach:
  // Draw small rects in destination-out mode for the selected region pixels
  const scaleX = canvasWidth / maskWidth;
  const scaleY = canvasHeight / maskHeight;

  ctx.save();
  ctx.globalCompositeOperation = 'destination-out';
  ctx.fillStyle = 'rgba(0, 0, 0, 1)';

  // Draw blocks for the selected region (use stride for performance)
  const blockW = Math.ceil(scaleX);
  const blockH = Math.ceil(scaleY);

  for (let my = 0; my < maskHeight; my++) {
    for (let mx = 0; mx < maskWidth; mx++) {
      if (categoryMask[my * maskWidth + mx] === selectedCategoryId) {
        ctx.fillRect(mx * scaleX, my * scaleY, blockW, blockH);
      }
    }
  }

  ctx.restore();
}

/**
 * Draw a label at the centroid of a region.
 */
export function drawRegionLabel(
  ctx: CanvasRenderingContext2D,
  region: SegmentRegion,
  scaleX: number,
  scaleY: number,
  isSelected: boolean
): void {
  // Only show labels for non-background regions
  if (region.categoryId === 0) return;

  const cx = region.centroid.x * scaleX;
  const cy = region.centroid.y * scaleY;
  const dpr = window.devicePixelRatio || 1;

  const label = region.label;
  const fontSize = (isSelected ? 11 : 9) * dpr;

  ctx.font = `${isSelected ? 'bold ' : ''}${fontSize}px -apple-system, system-ui, sans-serif`;
  const metrics = ctx.measureText(label);
  const padX = 6 * dpr;
  const padY = 4 * dpr;
  const bgW = metrics.width + padX * 2;
  const bgH = fontSize + padY * 2;

  // Background pill
  ctx.fillStyle = isSelected ? 'rgba(232, 117, 74, 0.85)' : 'rgba(0, 0, 0, 0.6)';
  const radius = 4 * dpr;
  ctx.beginPath();
  ctx.roundRect(cx - bgW / 2, cy - bgH / 2, bgW, bgH, radius);
  ctx.fill();

  // Text
  ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, cx, cy);
}

/**
 * Draw the full AI detection overlay.
 * Combines region highlight, contour outlines, labels, and color indicator.
 */
export function drawAiOverlay(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  color: RGB,
  regions: SegmentRegion[],
  categoryMask: Uint8Array,
  maskWidth: number,
  maskHeight: number,
  selectedCategoryId: number | null
): void {
  ctx.clearRect(0, 0, w, h);

  const scaleX = w / maskWidth;
  const scaleY = h / maskHeight;
  const dpr = window.devicePixelRatio || 1;

  // Dim non-selected areas
  if (selectedCategoryId !== null) {
    drawSelectedRegionHighlight(
      ctx, categoryMask, selectedCategoryId,
      maskWidth, maskHeight, w, h
    );
  }

  // Draw contour outlines for all regions
  drawSegmentOutlines(
    ctx, regions, selectedCategoryId,
    maskWidth, maskHeight, w, h
  );

  // Draw labels on non-background regions
  for (const region of regions) {
    drawRegionLabel(ctx, region, scaleX, scaleY, region.categoryId === selectedCategoryId);
  }

  // Draw color indicator at the centroid of the selected region
  if (selectedCategoryId !== null) {
    const selectedRegion = regions.find(r => r.categoryId === selectedCategoryId);
    if (selectedRegion) {
      const cx = selectedRegion.centroid.x * scaleX;
      const cy = selectedRegion.centroid.y * scaleY;

      // Color dot
      ctx.fillStyle = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
      ctx.beginPath();
      ctx.arc(cx, cy, 8 * dpr, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.lineWidth = 2 * dpr;
      ctx.stroke();

      // Pulsing ring
      const pulse = (Math.sin(Date.now() / 500) + 1) / 2;
      ctx.strokeStyle = `rgba(232, 117, 74, ${0.2 + pulse * 0.4})`;
      ctx.lineWidth = 2 * dpr;
      ctx.beginPath();
      ctx.arc(cx, cy, (12 + pulse * 4) * dpr, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
}
