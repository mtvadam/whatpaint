import generatedColors from './generated-colors.json';

export type GeneratedColor = {
  name: string;
  hex: string;
  rgb: [number, number, number];
  lab: [number, number, number];
  brand: string;
  stores: string[];
  code?: string;
};

export const colorDatabase: GeneratedColor[] = generatedColors as GeneratedColor[];

// Precomputed brand counts
const brandCountMap = new Map<string, number>();
const storeCountMap = new Map<string, number>();

for (const c of colorDatabase) {
  brandCountMap.set(c.brand, (brandCountMap.get(c.brand) || 0) + 1);
  for (const s of c.stores) {
    storeCountMap.set(s, (storeCountMap.get(s) || 0) + 1);
  }
}

export const brandCounts = Object.fromEntries(brandCountMap);
export const storeCounts = Object.fromEntries(storeCountMap);
export const totalColorCount = colorDatabase.length;

// Unique brand and store lists
export const allBrands = Array.from(brandCountMap.keys()).sort();
export const allStores = Array.from(storeCountMap.keys()).sort();
