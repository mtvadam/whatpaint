'use client';

import { useState, useMemo, useCallback } from 'react';
import { CameraCapture } from '@/components/detect/CameraCapture';
import { ImageUpload } from '@/components/detect/ImageUpload';
import { HexInput } from '@/components/detect/HexInput';
import { ColorResults } from '@/components/detect/ColorResults';
import { LocationBar } from '@/components/location/LocationBar';
import { findClosestColors } from '@/lib/color-science';
import { colorDatabase, allBrands, allStores, brandCounts, storeCounts, totalColorCount } from '@/data/color-database';
import type { LocationResult } from '@/lib/geolocation';
import type { RGB } from '@/types';
import type { ColorMatchResult } from '@/lib/color-science';

type InputMethod = 'camera' | 'upload' | 'hex';

export default function DetectPage() {
  const [location, setLocation] = useState<LocationResult | null>(null);
  const [inputMethod, setInputMethod] = useState<InputMethod>('camera');
  const [detectedColor, setDetectedColor] = useState<RGB | null>(null);
  const [matches, setMatches] = useState<ColorMatchResult[]>([]);
  const [filterBrand, setFilterBrand] = useState<string>('all');
  const [filterStore, setFilterStore] = useState<string>('all');

  // Filter database by selected brand/store for display count, but search all
  const filteredMatches = useMemo(() => {
    return matches.filter(m => {
      if (filterBrand !== 'all' && m.color.brand !== filterBrand) return false;
      if (filterStore !== 'all' && !m.color.stores.includes(filterStore)) return false;
      return true;
    });
  }, [matches, filterBrand, filterStore]);

  const handleColorDetected = useCallback((rgb: RGB) => {
    setDetectedColor(rgb);
    // Search entire database — no pre-filtering
    const colorMatches = findClosestColors(rgb, colorDatabase, 20);
    setMatches(colorMatches);
  }, []);

  const handleTryAnother = () => {
    setDetectedColor(null);
    setMatches([]);
  };

  // Get unique brands/stores from current matches for filter chips
  const matchBrands = useMemo(() => {
    const brands = new Set(matches.map(m => m.color.brand));
    return Array.from(brands);
  }, [matches]);

  const matchStores = useMemo(() => {
    const stores = new Set(matches.flatMap(m => m.color.stores));
    return Array.from(stores);
  }, [matches]);

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2 text-white hover:text-accent transition-colors">
            <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center">
              <span className="text-lg">🎨</span>
            </div>
            <span className="font-bold text-lg">WhatPaint</span>
          </a>

          {/* Location bar — optional, inline */}
          <LocationBar location={location} onLocationSet={setLocation} />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Color count banner */}
        <div className="mb-6 text-center">
          <p className="text-sm text-gray-500">
            Searching <span className="text-accent font-mono font-bold">{totalColorCount.toLocaleString()}</span> colors across{' '}
            <span className="text-white font-medium">{allBrands.length} brands</span> and{' '}
            <span className="text-white font-medium">{allStores.length} stores</span>
          </p>
        </div>

        {!detectedColor ? (
          /* ===== DETECTION MODE ===== */
          <div className="max-w-5xl mx-auto">
            {/* Method tabs */}
            <div className="flex gap-1 mb-6 bg-card p-1 rounded-xl border border-border">
              {([
                { key: 'camera' as InputMethod, label: 'Live Camera', icon: '📸' },
                { key: 'upload' as InputMethod, label: 'Upload Photo', icon: '📁' },
                { key: 'hex' as InputMethod, label: 'Manual Hex', icon: '#️⃣' },
              ]).map(({ key, label, icon }) => (
                <button
                  key={key}
                  onClick={() => setInputMethod(key)}
                  className={`flex-1 px-4 py-3 rounded-lg transition-all font-medium text-sm ${
                    inputMethod === key
                      ? 'bg-accent text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <span className="mr-2">{icon}</span>
                  <span className="hidden sm:inline">{label}</span>
                </button>
              ))}
            </div>

            {/* Input */}
            {inputMethod === 'camera' && <CameraCapture onColorDetected={handleColorDetected} />}
            {inputMethod === 'upload' && <ImageUpload onColorDetected={handleColorDetected} />}
            {inputMethod === 'hex' && <HexInput onColorDetected={handleColorDetected} />}
          </div>
        ) : (
          /* ===== RESULTS MODE ===== */
          <div className="max-w-5xl mx-auto">
            {/* Back button */}
            <button
              onClick={handleTryAnother}
              className="mb-6 text-accent hover:text-[#D66D3A] transition-colors flex items-center gap-2 text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Try Another Color
            </button>

            {/* Filter chips */}
            {matches.length > 0 && (
              <div className="mb-6 space-y-3">
                {/* Brand filter */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  <span className="text-xs text-gray-500 flex-shrink-0">Brand:</span>
                  <button
                    onClick={() => setFilterBrand('all')}
                    className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      filterBrand === 'all'
                        ? 'bg-accent text-white'
                        : 'bg-card text-gray-400 border border-border hover:border-accent/50'
                    }`}
                  >
                    All
                  </button>
                  {matchBrands.map(brand => (
                    <button
                      key={brand}
                      onClick={() => setFilterBrand(filterBrand === brand ? 'all' : brand)}
                      className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                        filterBrand === brand
                          ? 'bg-accent text-white'
                          : 'bg-card text-gray-400 border border-border hover:border-accent/50'
                      }`}
                    >
                      {brand}
                      <span className="ml-1 opacity-60">
                        ({brandCounts[brand]?.toLocaleString()})
                      </span>
                    </button>
                  ))}
                </div>

                {/* Store filter */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  <span className="text-xs text-gray-500 flex-shrink-0">Store:</span>
                  <button
                    onClick={() => setFilterStore('all')}
                    className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      filterStore === 'all'
                        ? 'bg-accent text-white'
                        : 'bg-card text-gray-400 border border-border hover:border-accent/50'
                    }`}
                  >
                    All Stores
                  </button>
                  {matchStores.map(store => (
                    <button
                      key={store}
                      onClick={() => setFilterStore(filterStore === store ? 'all' : store)}
                      className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                        filterStore === store
                          ? 'bg-accent text-white'
                          : 'bg-card text-gray-400 border border-border hover:border-accent/50'
                      }`}
                    >
                      {store}
                      <span className="ml-1 opacity-60">
                        ({storeCounts[store]?.toLocaleString()})
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Results */}
            <ColorResults
              detectedRgb={detectedColor}
              matches={filteredMatches}
              totalMatches={matches.length}
            />
          </div>
        )}
      </div>
    </main>
  );
}
