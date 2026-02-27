import type { RGB, LAB, HSL } from '@/types';
import type { GeneratedColor } from '@/data/color-database';

/**
 * Convert sRGB [0-255] to linear RGB [0-1]
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
  const x = r * 0.4124564 + g * 0.3575761 + b * 0.1804375;
  const y = r * 0.2126729 + g * 0.7151522 + b * 0.0721750;
  const z = r * 0.0193339 + g * 0.1191920 + b * 0.9503041;
  return [x * 100, y * 100, z * 100];
}

/**
 * Convert XYZ to CIE L*a*b*
 */
export function xyzToLab(xyz: [number, number, number]): LAB {
  const refX = 95.047, refY = 100.000, refZ = 108.883;
  let [x, y, z] = xyz;
  x = x / refX;
  y = y / refY;
  z = z / refZ;

  const f = (t: number): number => {
    return t > 0.008856
      ? Math.pow(t, 1 / 3)
      : (7.787 * t) + (16 / 116);
  };

  const fx = f(x);
  const fy = f(y);
  const fz = f(z);

  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)];
}

/**
 * Convert RGB [0-255] directly to LAB
 */
export function rgbToLab(rgb: RGB): LAB {
  return xyzToLab(linearToXyz(srgbToLinear(rgb)));
}

/**
 * CIEDE2000 color difference — gold standard for perceptual color distance
 */
export function deltaE2000(lab1: LAB, lab2: LAB): number {
  const [L1, a1, b1] = lab1;
  const [L2, a2, b2] = lab2;

  const C1 = Math.sqrt(a1 * a1 + b1 * b1);
  const C2 = Math.sqrt(a2 * a2 + b2 * b2);
  const C_bar = (C1 + C2) / 2;

  const G = 0.5 * (1 - Math.sqrt(Math.pow(C_bar, 7) / (Math.pow(C_bar, 7) + Math.pow(25, 7))));

  const a1p = a1 * (1 + G);
  const a2p = a2 * (1 + G);

  const C1p = Math.sqrt(a1p * a1p + b1 * b1);
  const C2p = Math.sqrt(a2p * a2p + b2 * b2);

  const h1t = Math.atan2(b1, a1p) * (180 / Math.PI);
  const h2t = Math.atan2(b2, a2p) * (180 / Math.PI);
  const h1 = h1t >= 0 ? h1t : h1t + 360;
  const h2 = h2t >= 0 ? h2t : h2t + 360;

  const dLp = L2 - L1;
  const dCp = C2p - C1p;

  let dhp;
  if (C1p * C2p === 0) dhp = 0;
  else if (Math.abs(h2 - h1) <= 180) dhp = h2 - h1;
  else if (h2 - h1 > 180) dhp = h2 - h1 - 360;
  else dhp = h2 - h1 + 360;

  const dHp = 2 * Math.sqrt(C1p * C2p) * Math.sin((dhp / 2) * (Math.PI / 180));

  const Lbp = (L1 + L2) / 2;
  const Cbp = (C1p + C2p) / 2;

  let Hbp;
  if (C1p * C2p === 0) Hbp = h1 + h2;
  else if (Math.abs(h1 - h2) <= 180) Hbp = (h1 + h2) / 2;
  else if (h1 + h2 < 360) Hbp = (h1 + h2 + 360) / 2;
  else Hbp = (h1 + h2 - 360) / 2;

  const T = 1
    - 0.17 * Math.cos((Hbp - 30) * (Math.PI / 180))
    + 0.24 * Math.cos(2 * Hbp * (Math.PI / 180))
    + 0.32 * Math.cos((3 * Hbp + 6) * (Math.PI / 180))
    - 0.20 * Math.cos((4 * Hbp - 63) * (Math.PI / 180));

  const dt = 30 * Math.exp(-Math.pow((Hbp - 275) / 25, 2));
  const RC = 2 * Math.sqrt(Math.pow(Cbp, 7) / (Math.pow(Cbp, 7) + Math.pow(25, 7)));
  const SL = 1 + (0.015 * Math.pow(Lbp - 50, 2)) / Math.sqrt(20 + Math.pow(Lbp - 50, 2));
  const SC = 1 + 0.045 * Cbp;
  const SH = 1 + 0.015 * Cbp * T;
  const RT = -Math.sin(2 * dt * (Math.PI / 180)) * RC;

  return Math.sqrt(
    Math.pow(dLp / SL, 2) +
    Math.pow(dCp / SC, 2) +
    Math.pow(dHp / SH, 2) +
    RT * (dCp / SC) * (dHp / SH)
  );
}

export function rgbToHsl(rgb: RGB): HSL {
  const [r, g, b] = rgb.map(v => v / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const diff = max - min;
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (diff !== 0) {
    s = l > 0.5 ? diff / (2 - max - min) : diff / (max + min);
    switch (max) {
      case r: h = ((g - b) / diff + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / diff + 2) / 6; break;
      case b: h = ((r - g) / diff + 4) / 6; break;
    }
  }
  return [h * 360, s * 100, l * 100];
}

export function rgbToHex(rgb: RGB): string {
  return '#' + rgb.map(v => Math.round(v).toString(16).padStart(2, '0')).join('').toUpperCase();
}

export function hexToRgb(hex: string): RGB {
  const c = hex.replace('#', '');
  return [parseInt(c.substring(0, 2), 16), parseInt(c.substring(2, 4), 16), parseInt(c.substring(4, 6), 16)];
}

export function calculateConfidence(deltaE: number): number {
  return Math.max(0, Math.min(100, 100 - deltaE * 3.2));
}

export type ColorMatchResult = {
  color: GeneratedColor;
  deltaE: number;
  confidence: number;
};

/**
 * Find closest colors — uses pre-computed LAB values from generated data for speed
 */
export function findClosestColors(
  inputRgb: RGB,
  database: GeneratedColor[],
  topN: number = 8
): ColorMatchResult[] {
  const inputLab = rgbToLab(inputRgb);

  const matches: ColorMatchResult[] = database.map(color => {
    // Use pre-computed LAB values — no conversion needed per color
    const dE = deltaE2000(inputLab, color.lab as LAB);
    return {
      color,
      deltaE: dE,
      confidence: calculateConfidence(dE),
    };
  });

  return matches.sort((a, b) => a.deltaE - b.deltaE).slice(0, topN);
}

export function getDeltaEInterpretation(deltaE: number): string {
  if (deltaE < 1.0) return 'Imperceptible (exact match)';
  if (deltaE < 2.0) return 'Slight difference (acceptable match)';
  if (deltaE < 3.5) return 'Noticeable if side by side';
  if (deltaE < 5.0) return 'Significant difference';
  return 'Wrong color';
}
