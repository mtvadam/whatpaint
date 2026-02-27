import type { RGB } from '@/types';

export const CATEGORY_LABELS: Record<number, string> = {
  0: 'background',
  1: 'aeroplane', 2: 'bicycle', 3: 'bird', 4: 'boat', 5: 'bottle',
  6: 'bus', 7: 'car', 8: 'cat', 9: 'chair', 10: 'cow',
  11: 'dining table', 12: 'dog', 13: 'horse', 14: 'motorbike', 15: 'person',
  16: 'potted plant', 17: 'sheep', 18: 'sofa', 19: 'train', 20: 'tv/monitor',
};

export type SegmentRegion = {
  categoryId: number;
  label: string;
  pixelCount: number;
  boundingBox: { x: number; y: number; w: number; h: number };
  contourPixels: Array<{ x: number; y: number }>;
  centroid: { x: number; y: number };
};

/**
 * Extract regions from a category mask in a single pass.
 * Finds all distinct categories, their bounding boxes, centroids,
 * pixel counts, and contour pixels (boundary detection).
 */
export function extractRegions(
  categoryMask: Uint8Array,
  width: number,
  height: number,
  minPixelCount: number = 500
): SegmentRegion[] {
  const regionData = new Map<number, {
    pixelCount: number;
    minX: number; minY: number; maxX: number; maxY: number;
    sumX: number; sumY: number;
    contourPixels: Array<{ x: number; y: number }>;
  }>();

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      const cat = categoryMask[idx];

      if (!regionData.has(cat)) {
        regionData.set(cat, {
          pixelCount: 0,
          minX: x, minY: y, maxX: x, maxY: y,
          sumX: 0, sumY: 0,
          contourPixels: [],
        });
      }

      const data = regionData.get(cat)!;
      data.pixelCount++;
      data.sumX += x;
      data.sumY += y;
      if (x < data.minX) data.minX = x;
      if (x > data.maxX) data.maxX = x;
      if (y < data.minY) data.minY = y;
      if (y > data.maxY) data.maxY = y;

      // Check if this pixel is on a boundary (4-connected neighbor check)
      const isBoundary =
        x === 0 || x === width - 1 || y === 0 || y === height - 1 ||
        categoryMask[idx - 1] !== cat ||
        categoryMask[idx + 1] !== cat ||
        categoryMask[idx - width] !== cat ||
        categoryMask[idx + width] !== cat;

      if (isBoundary) {
        // Subsample contour pixels: only keep every 2nd one to reduce count
        if ((x + y) % 2 === 0) {
          data.contourPixels.push({ x, y });
        }
      }
    }
  }

  const regions: SegmentRegion[] = [];
  for (const [catId, data] of regionData) {
    if (data.pixelCount < minPixelCount) continue;

    regions.push({
      categoryId: catId,
      label: CATEGORY_LABELS[catId] || `region ${catId}`,
      pixelCount: data.pixelCount,
      boundingBox: {
        x: data.minX,
        y: data.minY,
        w: data.maxX - data.minX,
        h: data.maxY - data.minY,
      },
      contourPixels: data.contourPixels,
      centroid: {
        x: Math.round(data.sumX / data.pixelCount),
        y: Math.round(data.sumY / data.pixelCount),
      },
    });
  }

  // Sort by pixel count descending (largest regions first)
  return regions.sort((a, b) => b.pixelCount - a.pixelCount);
}

/**
 * Get the category ID at a specific point in the mask.
 * Uses 5x5 majority vote for boundary robustness.
 */
export function getCategoryAtPoint(
  categoryMask: Uint8Array,
  width: number,
  height: number,
  x: number,
  y: number
): number {
  const counts = new Map<number, number>();

  for (let dy = -2; dy <= 2; dy++) {
    for (let dx = -2; dx <= 2; dx++) {
      const px = Math.min(Math.max(0, x + dx), width - 1);
      const py = Math.min(Math.max(0, y + dy), height - 1);
      const cat = categoryMask[py * width + px];
      counts.set(cat, (counts.get(cat) || 0) + 1);
    }
  }

  let bestCat = 0;
  let bestCount = 0;
  for (const [cat, count] of counts) {
    if (count > bestCount) {
      bestCount = count;
      bestCat = cat;
    }
  }

  return bestCat;
}

/**
 * Sample the average color of all pixels belonging to a specific category.
 * Maps mask coordinates to image coordinates (handles resolution differences).
 * Uses stratified subsampling and outlier rejection.
 */
export function sampleRegionColor(
  imageData: ImageData,
  categoryMask: Uint8Array,
  maskWidth: number,
  maskHeight: number,
  categoryId: number,
  maxSamples: number = 500
): RGB {
  const imgW = imageData.width;
  const imgH = imageData.height;
  const scaleX = imgW / maskWidth;
  const scaleY = imgH / maskHeight;

  // First pass: count pixels belonging to this category
  let totalPixels = 0;
  for (let i = 0; i < categoryMask.length; i++) {
    if (categoryMask[i] === categoryId) totalPixels++;
  }

  if (totalPixels === 0) return [0, 0, 0];

  // Calculate stride for subsampling
  const stride = Math.max(1, Math.floor(Math.sqrt(totalPixels / maxSamples)));

  // Collect samples
  const samples: RGB[] = [];
  for (let my = 0; my < maskHeight; my += stride) {
    for (let mx = 0; mx < maskWidth; mx += stride) {
      if (categoryMask[my * maskWidth + mx] !== categoryId) continue;

      // Map mask coords to image coords
      const ix = Math.min(Math.floor(mx * scaleX), imgW - 1);
      const iy = Math.min(Math.floor(my * scaleY), imgH - 1);
      const idx = (iy * imgW + ix) * 4;

      samples.push([
        imageData.data[idx],
        imageData.data[idx + 1],
        imageData.data[idx + 2],
      ]);

      if (samples.length >= maxSamples) break;
    }
    if (samples.length >= maxSamples) break;
  }

  if (samples.length === 0) return [0, 0, 0];

  // Outlier rejection via median filtering (same approach as sampleColorGrid)
  const rValues = samples.map(s => s[0]).sort((a, b) => a - b);
  const gValues = samples.map(s => s[1]).sort((a, b) => a - b);
  const bValues = samples.map(s => s[2]).sort((a, b) => a - b);

  const medianR = rValues[Math.floor(rValues.length / 2)];
  const medianG = gValues[Math.floor(gValues.length / 2)];
  const medianB = bValues[Math.floor(bValues.length / 2)];

  const threshold = 30;
  const filtered = samples.filter(([r, g, b]) =>
    Math.abs(r - medianR) <= threshold &&
    Math.abs(g - medianG) <= threshold &&
    Math.abs(b - medianB) <= threshold
  );

  if (filtered.length === 0) return [medianR, medianG, medianB];

  const sum = filtered.reduce(
    (acc, [r, g, b]) => [acc[0] + r, acc[1] + g, acc[2] + b],
    [0, 0, 0] as RGB
  );

  return [
    Math.round(sum[0] / filtered.length),
    Math.round(sum[1] / filtered.length),
    Math.round(sum[2] / filtered.length),
  ];
}
