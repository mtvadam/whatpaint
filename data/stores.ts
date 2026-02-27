import type { PaintStore } from '@/types';
import { paintColors } from './paint-colors';

// Calculate color count for each store
const getColorCount = (storeName: string): number => {
  return paintColors.filter(color => color.store === storeName).length;
};

export const paintStores: PaintStore[] = [
  {
    id: 'home-depot',
    name: 'Home Depot',
    brands: ['Behr', 'Glidden', 'Rust-Oleum'],
    logo: '🏠',
    colorCount: getColorCount('Home Depot'),
    website: 'https://www.homedepot.com',
    storeLocator: 'https://www.homedepot.com/l/',
    accentColor: '#F96302'
  },
  {
    id: 'lowes',
    name: "Lowe's",
    brands: ['Sherwin-Williams', 'Valspar', 'HGTV Home'],
    logo: '🔵',
    colorCount: getColorCount('Lowes'),
    website: 'https://www.lowes.com',
    storeLocator: 'https://www.lowes.com/store',
    accentColor: '#004990'
  },
  {
    id: 'sherwin-williams',
    name: 'Sherwin-Williams',
    brands: ['Sherwin-Williams'],
    logo: '🎨',
    colorCount: getColorCount('Sherwin-Williams'),
    website: 'https://www.sherwin-williams.com',
    storeLocator: 'https://www.sherwin-williams.com/store-locator',
    accentColor: '#0060A9'
  },
  {
    id: 'benjamin-moore',
    name: 'Benjamin Moore',
    brands: ['Benjamin Moore'],
    logo: '🖌️',
    colorCount: getColorCount('Benjamin Moore'),
    website: 'https://www.benjaminmoore.com',
    storeLocator: 'https://www.benjaminmoore.com/en-us/store-locator',
    accentColor: '#E31C23'
  },
  {
    id: 'ace-hardware',
    name: 'Ace Hardware',
    brands: ['Clark+Kensington', 'Royal'],
    logo: '🔨',
    colorCount: getColorCount('Ace Hardware'),
    website: 'https://www.acehardware.com',
    storeLocator: 'https://www.acehardware.com/store-directory',
    accentColor: '#CE0E2D'
  },
  {
    id: 'walmart',
    name: 'Walmart',
    brands: ['ColorPlace', 'Glidden Essentials'],
    logo: '⭐',
    colorCount: getColorCount('Walmart'),
    website: 'https://www.walmart.com',
    storeLocator: 'https://www.walmart.com/store/finder',
    accentColor: '#0071CE'
  },
  {
    id: 'menards',
    name: 'Menards',
    brands: ['Dutch Boy', 'Pittsburgh Paints'],
    logo: '🏗️',
    colorCount: getColorCount('Menards'),
    website: 'https://www.menards.com',
    storeLocator: 'https://www.menards.com/store-locator',
    accentColor: '#FFD100'
  },
];
