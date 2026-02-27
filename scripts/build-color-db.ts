/**
 * Build script: generates /data/generated-colors.json from open-source paint data
 *
 * Sources:
 *   - colornerd (npm) — 14,000+ colors from Behr, Benjamin Moore, SW, PPG, Valspar, Dutch Boy, Farrow & Ball
 *   - sherwin-williams (npm) — 1,526 SW colors (merged/deduped with colornerd)
 *
 * Zero API keys required. All data is MIT-licensed npm packages.
 */

import * as fs from 'fs';
import * as path from 'path';

// ---- color science (inline to avoid import path issues in script context) ----

function hexToRgb(hex: string): [number, number, number] {
  const cleaned = hex.replace('#', '');
  const r = parseInt(cleaned.substring(0, 2), 16);
  const g = parseInt(cleaned.substring(2, 4), 16);
  const b = parseInt(cleaned.substring(4, 6), 16);
  return [r, g, b];
}

function srgbToLinear(rgb: [number, number, number]): [number, number, number] {
  return rgb.map((c) => {
    const n = c / 255;
    return n <= 0.04045 ? n / 12.92 : Math.pow((n + 0.055) / 1.055, 2.4);
  }) as [number, number, number];
}

function linearToXyz(lr: [number, number, number]): [number, number, number] {
  const [r, g, b] = lr;
  return [
    (r * 0.4124564 + g * 0.3575761 + b * 0.1804375) * 100,
    (r * 0.2126729 + g * 0.7151522 + b * 0.0721750) * 100,
    (r * 0.0193339 + g * 0.1191920 + b * 0.9503041) * 100,
  ];
}

function xyzToLab(xyz: [number, number, number]): [number, number, number] {
  const refX = 95.047, refY = 100.0, refZ = 108.883;
  let [x, y, z] = [xyz[0] / refX, xyz[1] / refY, xyz[2] / refZ];
  const f = (t: number) => (t > 0.008856 ? Math.pow(t, 1 / 3) : 7.787 * t + 16 / 116);
  const fx = f(x), fy = f(y), fz = f(z);
  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)];
}

function rgbToLab(rgb: [number, number, number]): [number, number, number] {
  return xyzToLab(linearToXyz(srgbToLinear(rgb)));
}

// ---- types ----

type GeneratedColor = {
  name: string;
  hex: string;
  rgb: [number, number, number];
  lab: [number, number, number];
  brand: string;
  stores: string[];
  code?: string;
};

type ColornerdEntry = {
  hex: string;
  name: string;
  label?: string;
};

type SWEntry = {
  name: string;
  hex: string;
};

// ---- brand → store mapping ----

const brandStoreMap: Record<string, string[]> = {
  'Behr': ['Home Depot'],
  'Sherwin-Williams': ['Lowes', 'Sherwin-Williams'],
  'Benjamin Moore': ['Benjamin Moore'],
  'PPG': ['Home Depot', 'Menards'],
  'Valspar': ['Lowes'],
  'Dutch Boy': ['Menards'],
  'Farrow & Ball': ['Farrow & Ball'],
};

// ---- processing ----

function processColornerdFile(filePath: string, brand: string): GeneratedColor[] {
  const raw: ColornerdEntry[] = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  const seen = new Set<string>();
  const colors: GeneratedColor[] = [];

  for (const entry of raw) {
    // Deduplicate by name within brand
    const key = entry.name.toLowerCase().trim();
    if (seen.has(key)) continue;
    seen.add(key);

    // Parse hex — handle both "#RRGGBB" and "rgb(R, G, B)" formats
    let hex: string;
    let rgb: [number, number, number];
    const rawHex = entry.hex.trim();

    const rgbMatch = rawHex.match(/^rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i);
    if (rgbMatch) {
      rgb = [parseInt(rgbMatch[1]), parseInt(rgbMatch[2]), parseInt(rgbMatch[3])];
      hex = '#' + rgb.map(v => v.toString(16).padStart(2, '0')).join('').toUpperCase();
    } else {
      hex = rawHex.startsWith('#') ? rawHex : `#${rawHex}`;
      if (!/^#[0-9A-Fa-f]{6}$/.test(hex)) continue;
      rgb = hexToRgb(hex);
    }
    const lab = rgbToLab(rgb);

    colors.push({
      name: entry.name.trim(),
      hex: hex.toUpperCase(),
      rgb,
      lab: [
        parseFloat(lab[0].toFixed(2)),
        parseFloat(lab[1].toFixed(2)),
        parseFloat(lab[2].toFixed(2)),
      ],
      brand,
      stores: brandStoreMap[brand] || [brand],
      code: entry.label || undefined,
    });
  }

  return colors;
}

function processSWPackage(): GeneratedColor[] {
  const filePath = path.join(process.cwd(), 'node_modules', 'sherwin-williams', 'data', 'colors.json');
  const raw: SWEntry[] = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  const colors: GeneratedColor[] = [];
  const seen = new Set<string>();

  for (const entry of raw) {
    const key = entry.name.toLowerCase().trim();
    if (seen.has(key)) continue;
    seen.add(key);

    const hex = entry.hex.startsWith('#') ? entry.hex : `#${entry.hex}`;
    if (!/^#[0-9A-Fa-f]{6}$/.test(hex)) continue;

    const rgb = hexToRgb(hex);
    const lab = rgbToLab(rgb);

    colors.push({
      name: entry.name.trim(),
      hex: hex.toUpperCase(),
      rgb,
      lab: [
        parseFloat(lab[0].toFixed(2)),
        parseFloat(lab[1].toFixed(2)),
        parseFloat(lab[2].toFixed(2)),
      ],
      brand: 'Sherwin-Williams',
      stores: ['Lowes', 'Sherwin-Williams'],
    });
  }

  return colors;
}

// ---- main ----

function main() {
  console.log('Building paint color database...\n');

  const colornerdDir = path.join(process.cwd(), 'node_modules', 'colornerd', 'json');

  const allColors: GeneratedColor[] = [];

  // Process each colornerd brand
  const brands: [string, string][] = [
    ['behr.json', 'Behr'],
    ['benjamin-moore.json', 'Benjamin Moore'],
    ['sherwin-williams.json', 'Sherwin-Williams'],
    ['ppg.json', 'PPG'],
    ['valspar.json', 'Valspar'],
    ['dutch.json', 'Dutch Boy'],
    ['farrow-ball.json', 'Farrow & Ball'],
  ];

  for (const [file, brand] of brands) {
    const filePath = path.join(colornerdDir, file);
    const colors = processColornerdFile(filePath, brand);
    console.log(`  ${brand}: ${colors.length} colors`);
    allColors.push(...colors);
  }

  // Process sherwin-williams npm package
  const swColors = processSWPackage();
  console.log(`  Sherwin-Williams (npm package): ${swColors.length} colors`);

  // Merge SW data: add any colors from the npm package not already in colornerd
  const existingSWNames = new Set(
    allColors
      .filter(c => c.brand === 'Sherwin-Williams')
      .map(c => c.name.toLowerCase().trim())
  );

  let swMerged = 0;
  for (const color of swColors) {
    if (!existingSWNames.has(color.name.toLowerCase().trim())) {
      allColors.push(color);
      swMerged++;
    }
  }
  console.log(`  Merged ${swMerged} new SW colors from npm package`);

  // Final dedup across all brands by (brand + name)
  const finalMap = new Map<string, GeneratedColor>();
  for (const color of allColors) {
    const key = `${color.brand}:::${color.name.toLowerCase().trim()}`;
    if (!finalMap.has(key)) {
      finalMap.set(key, color);
    }
  }

  const finalColors = Array.from(finalMap.values());

  // Write output
  const outputPath = path.join(process.cwd(), 'data', 'generated-colors.json');
  fs.writeFileSync(outputPath, JSON.stringify(finalColors, null, 0));

  console.log(`\n✅ Generated ${finalColors.length} colors → ${outputPath}`);

  // Print brand summary
  const brandCounts: Record<string, number> = {};
  for (const c of finalColors) {
    brandCounts[c.brand] = (brandCounts[c.brand] || 0) + 1;
  }
  console.log('\nBrand summary:');
  for (const [brand, count] of Object.entries(brandCounts).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${brand}: ${count}`);
  }
}

main();
