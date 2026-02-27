export type RGB = [number, number, number];
export type LAB = [number, number, number];
export type HSL = [number, number, number];

export type PaintColor = {
  name: string;
  code: string;
  brand: string;
  store: string;
  hex: string;
  rgb: RGB;
  lrv: number;
  family: string;
  undertone?: string;
  coordinating?: string[];
};

export type ColorMatch = {
  color: PaintColor;
  deltaE: number;
  confidence: number;
};

export type PaintStore = {
  id: string;
  name: string;
  brands: string[];
  logo: string;
  colorCount: number;
  website: string;
  storeLocator: string;
  accentColor: string;
};

export type WhiteBalanceMode = 'none' | 'daylight' | 'tungsten' | 'fluorescent';

export type SegmentationMode = 'off' | 'loading' | 'active' | 'error';

export type SamplePoint = {
  x: number;
  y: number;
  rgb: RGB;
  timestamp: number;
};

export type DetectedColor = {
  rgb: RGB;
  lab: LAB;
  hex: string;
  hsl: HSL;
};
