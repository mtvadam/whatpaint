import type { RGB, SamplePoint, WhiteBalanceMode } from '@/types';

/**
 * Sample a 5x5 grid of pixels around a point with outlier rejection
 */
export function sampleColorGrid(
  imageData: ImageData,
  x: number,
  y: number,
  radius: number = 6
): RGB {
  const samples: RGB[] = [];

  // Sample 5x5 grid
  for (let dy = -2; dy <= 2; dy++) {
    for (let dx = -2; dx <= 2; dx++) {
      const px = Math.floor(x + dx * (radius / 2));
      const py = Math.floor(y + dy * (radius / 2));

      // Bounds checking
      if (px >= 0 && px < imageData.width && py >= 0 && py < imageData.height) {
        const index = (py * imageData.width + px) * 4;
        const r = imageData.data[index];
        const g = imageData.data[index + 1];
        const b = imageData.data[index + 2];
        samples.push([r, g, b]);
      }
    }
  }

  if (samples.length === 0) {
    return [0, 0, 0];
  }

  // Calculate median for each channel
  const rValues = samples.map(s => s[0]).sort((a, b) => a - b);
  const gValues = samples.map(s => s[1]).sort((a, b) => a - b);
  const bValues = samples.map(s => s[2]).sort((a, b) => a - b);

  const medianR = rValues[Math.floor(rValues.length / 2)];
  const medianG = gValues[Math.floor(gValues.length / 2)];
  const medianB = bValues[Math.floor(bValues.length / 2)];

  // Reject outliers: discard samples where any channel deviates >30 from median
  const threshold = 30;
  const filteredSamples = samples.filter(([r, g, b]) => {
    return Math.abs(r - medianR) <= threshold &&
           Math.abs(g - medianG) <= threshold &&
           Math.abs(b - medianB) <= threshold;
  });

  // If all samples were rejected, use the median
  if (filteredSamples.length === 0) {
    return [medianR, medianG, medianB];
  }

  // Average the remaining samples
  const sum = filteredSamples.reduce(
    (acc, [r, g, b]) => [acc[0] + r, acc[1] + g, acc[2] + b],
    [0, 0, 0] as RGB
  );

  return [
    Math.round(sum[0] / filteredSamples.length),
    Math.round(sum[1] / filteredSamples.length),
    Math.round(sum[2] / filteredSamples.length),
  ];
}

/**
 * Apply white balance correction to RGB values
 */
export function applyWhiteBalance(rgb: RGB, mode: WhiteBalanceMode): RGB {
  const [r, g, b] = rgb;

  switch (mode) {
    case 'daylight': // Cool - reduce warmth
      return [
        Math.min(255, Math.round(r * 0.95)),
        Math.min(255, Math.round(g * 1.0)),
        Math.min(255, Math.round(b * 1.08)),
      ];

    case 'tungsten': // Warm - reduce coolness
      return [
        Math.min(255, Math.round(r * 1.1)),
        Math.min(255, Math.round(g * 1.0)),
        Math.min(255, Math.round(b * 0.85)),
      ];

    case 'fluorescent': // Slightly green tint correction
      return [
        Math.min(255, Math.round(r * 1.02)),
        Math.min(255, Math.round(g * 0.98)),
        Math.min(255, Math.round(b * 1.0)),
      ];

    case 'none':
    default:
      return rgb;
  }
}

/**
 * Capture image data from a video element or canvas
 */
export function captureImageData(
  source: HTMLVideoElement | HTMLCanvasElement
): ImageData | null {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) return null;

  if (source instanceof HTMLVideoElement) {
    canvas.width = source.videoWidth;
    canvas.height = source.videoHeight;
    ctx.drawImage(source, 0, 0);
  } else {
    canvas.width = source.width;
    canvas.height = source.height;
    ctx.drawImage(source, 0, 0);
  }

  return ctx.getImageData(0, 0, canvas.width, canvas.height);
}

/**
 * Draw sample point markers on a canvas
 */
export function drawSampleMarkers(
  ctx: CanvasRenderingContext2D,
  points: SamplePoint[],
  activeIndex?: number
) {
  points.forEach((point, index) => {
    const isActive = index === activeIndex;
    const radius = isActive ? 12 : 8;

    // Outer ring
    ctx.strokeStyle = isActive ? '#E8754A' : '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(point.x, point.y, radius, 0, 2 * Math.PI);
    ctx.stroke();

    // Inner dot
    ctx.fillStyle = `rgb(${point.rgb[0]}, ${point.rgb[1]}, ${point.rgb[2]})`;
    ctx.beginPath();
    ctx.arc(point.x, point.y, 4, 0, 2 * Math.PI);
    ctx.fill();

    // White outline on inner dot
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.stroke();
  });
}
