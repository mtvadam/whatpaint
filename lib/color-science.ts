import type { RGB, LAB, HSL, PaintColor, ColorMatch } from '@/types';

/**
 * Convert sRGB [0-255] to linear RGB [0-1]
 * Applies gamma decoding
 */
export function srgbToLinear(rgb: RGB): [number, number, number] {
  return rgb.map((channel) => {
    const normalized = channel / 255;
    return normalized <= 0.04045
      ? normalized / 12.92
      : Math.pow((normalized + 0.055) / 1.055, 2.4);
  }) as [number, number, number];
}

/**
 * Convert linear RGB to XYZ using sRGB matrix with D65 illuminant
 */
export function linearToXyz(linearRgb: [number, number, number]): [number, number, number] {
  const [r, g, b] = linearRgb;

  // sRGB to XYZ transformation matrix (D65)
  const x = r * 0.4124564 + g * 0.3575761 + b * 0.1804375;
  const y = r * 0.2126729 + g * 0.7151522 + b * 0.0721750;
  const z = r * 0.0193339 + g * 0.1191920 + b * 0.9503041;

  return [x * 100, y * 100, z * 100];
}

/**
 * Convert XYZ to CIE L*a*b*
 * Uses D65 reference white
 */
export function xyzToLab(xyz: [number, number, number]): LAB {
  // D65 reference white
  const refX = 95.047;
  const refY = 100.000;
  const refZ = 108.883;

  let [x, y, z] = xyz;
  x = x / refX;
  y = y / refY;
  z = z / refZ;

  const f = (t: number): number => {
    return t > 0.008856
      ? Math.pow(t, 1/3)
      : (7.787 * t) + (16/116);
  };

  const fx = f(x);
  const fy = f(y);
  const fz = f(z);

  const L = (116 * fy) - 16;
  const a = 500 * (fx - fy);
  const b = 200 * (fy - fz);

  return [L, a, b];
}

/**
 * Convert RGB [0-255] directly to LAB
 */
export function rgbToLab(rgb: RGB): LAB {
  const linear = srgbToLinear(rgb);
  const xyz = linearToXyz(linear);
  return xyzToLab(xyz);
}

/**
 * Calculate CIEDE2000 color difference
 * This is the gold standard for perceptual color difference
 */
export function deltaE2000(lab1: LAB, lab2: LAB): number {
  const [L1, a1, b1] = lab1;
  const [L2, a2, b2] = lab2;

  // Calculate C and h
  const C1 = Math.sqrt(a1 * a1 + b1 * b1);
  const C2 = Math.sqrt(a2 * a2 + b2 * b2);
  const C_bar = (C1 + C2) / 2;

  const G = 0.5 * (1 - Math.sqrt(Math.pow(C_bar, 7) / (Math.pow(C_bar, 7) + Math.pow(25, 7))));

  const a1_prime = a1 * (1 + G);
  const a2_prime = a2 * (1 + G);

  const C1_prime = Math.sqrt(a1_prime * a1_prime + b1 * b1);
  const C2_prime = Math.sqrt(a2_prime * a2_prime + b2 * b2);

  const h1_prime = Math.atan2(b1, a1_prime) * (180 / Math.PI);
  const h2_prime = Math.atan2(b2, a2_prime) * (180 / Math.PI);

  const h1 = h1_prime >= 0 ? h1_prime : h1_prime + 360;
  const h2 = h2_prime >= 0 ? h2_prime : h2_prime + 360;

  // Calculate delta values
  const delta_L_prime = L2 - L1;
  const delta_C_prime = C2_prime - C1_prime;

  let delta_h_prime;
  if (C1_prime * C2_prime === 0) {
    delta_h_prime = 0;
  } else if (Math.abs(h2 - h1) <= 180) {
    delta_h_prime = h2 - h1;
  } else if (h2 - h1 > 180) {
    delta_h_prime = h2 - h1 - 360;
  } else {
    delta_h_prime = h2 - h1 + 360;
  }

  const delta_H_prime = 2 * Math.sqrt(C1_prime * C2_prime) * Math.sin((delta_h_prime / 2) * (Math.PI / 180));

  // Calculate mean values
  const L_bar_prime = (L1 + L2) / 2;
  const C_bar_prime = (C1_prime + C2_prime) / 2;

  let H_bar_prime;
  if (C1_prime * C2_prime === 0) {
    H_bar_prime = h1 + h2;
  } else if (Math.abs(h1 - h2) <= 180) {
    H_bar_prime = (h1 + h2) / 2;
  } else if (h1 + h2 < 360) {
    H_bar_prime = (h1 + h2 + 360) / 2;
  } else {
    H_bar_prime = (h1 + h2 - 360) / 2;
  }

  const T = 1 - 0.17 * Math.cos((H_bar_prime - 30) * (Math.PI / 180))
    + 0.24 * Math.cos(2 * H_bar_prime * (Math.PI / 180))
    + 0.32 * Math.cos((3 * H_bar_prime + 6) * (Math.PI / 180))
    - 0.20 * Math.cos((4 * H_bar_prime - 63) * (Math.PI / 180));

  const delta_theta = 30 * Math.exp(-Math.pow((H_bar_prime - 275) / 25, 2));

  const R_C = 2 * Math.sqrt(Math.pow(C_bar_prime, 7) / (Math.pow(C_bar_prime, 7) + Math.pow(25, 7)));

  const S_L = 1 + ((0.015 * Math.pow(L_bar_prime - 50, 2)) / Math.sqrt(20 + Math.pow(L_bar_prime - 50, 2)));
  const S_C = 1 + 0.045 * C_bar_prime;
  const S_H = 1 + 0.015 * C_bar_prime * T;

  const R_T = -Math.sin(2 * delta_theta * (Math.PI / 180)) * R_C;

  // Weighting factors (standard kL, kC, kH = 1)
  const kL = 1;
  const kC = 1;
  const kH = 1;

  const deltaE = Math.sqrt(
    Math.pow(delta_L_prime / (kL * S_L), 2) +
    Math.pow(delta_C_prime / (kC * S_C), 2) +
    Math.pow(delta_H_prime / (kH * S_H), 2) +
    R_T * (delta_C_prime / (kC * S_C)) * (delta_H_prime / (kH * S_H))
  );

  return deltaE;
}

/**
 * Convert RGB to HSL
 */
export function rgbToHsl(rgb: RGB): HSL {
  const [r, g, b] = rgb.map(v => v / 255);

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const diff = max - min;

  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (diff !== 0) {
    s = l > 0.5 ? diff / (2 - max - min) : diff / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / diff + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / diff + 2) / 6;
        break;
      case b:
        h = ((r - g) / diff + 4) / 6;
        break;
    }
  }

  return [h * 360, s * 100, l * 100];
}

/**
 * Convert RGB to hex string
 */
export function rgbToHex(rgb: RGB): string {
  return '#' + rgb.map(v => {
    const hex = Math.round(v).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('').toUpperCase();
}

/**
 * Convert hex string to RGB
 */
export function hexToRgb(hex: string): RGB {
  const cleaned = hex.replace('#', '');
  const r = parseInt(cleaned.substring(0, 2), 16);
  const g = parseInt(cleaned.substring(2, 4), 16);
  const b = parseInt(cleaned.substring(4, 6), 16);
  return [r, g, b];
}

/**
 * Calculate confidence score from deltaE
 */
export function calculateConfidence(deltaE: number): number {
  return Math.max(0, Math.min(100, 100 - deltaE * 3.2));
}

/**
 * Find the closest matching colors from a database
 */
export function findClosestColors(
  inputRgb: RGB,
  database: PaintColor[],
  topN: number = 8
): ColorMatch[] {
  const inputLab = rgbToLab(inputRgb);

  const matches: ColorMatch[] = database.map(color => {
    const colorLab = rgbToLab(color.rgb);
    const deltaE = deltaE2000(inputLab, colorLab);
    const confidence = calculateConfidence(deltaE);

    return {
      color,
      deltaE,
      confidence
    };
  });

  // Sort by deltaE (ascending) and take top N
  return matches.sort((a, b) => a.deltaE - b.deltaE).slice(0, topN);
}

/**
 * Get human-readable deltaE interpretation
 */
export function getDeltaEInterpretation(deltaE: number): string {
  if (deltaE < 1.0) return 'Imperceptible (exact match)';
  if (deltaE < 2.0) return 'Slight difference (acceptable match)';
  if (deltaE < 3.5) return 'Noticeable if side by side';
  if (deltaE < 5.0) return 'Significant difference';
  return 'Wrong color';
}
