'use client';

import { useState } from 'react';
import { rgbToHex, rgbToLab, rgbToHsl } from '@/lib/color-science';
import type { RGB, ColorMatch, PaintColor } from '@/types';
import { MatchCard } from './MatchCard';
import { ColorDetailModal } from './ColorDetailModal';

type ColorResultsProps = {
  detectedRgb: RGB;
  matches: ColorMatch[];
  selectedStores: string[];
};

export function ColorResults({ detectedRgb, matches, selectedStores }: ColorResultsProps) {
  const [selectedMatch, setSelectedMatch] = useState<ColorMatch | null>(null);
  const [filterBrand, setFilterBrand] = useState<string>('all');
  const [filterStore, setFilterStore] = useState<string>('all');

  const lab = rgbToLab(detectedRgb);
  const hsl = rgbToHsl(detectedRgb);
  const hex = rgbToHex(detectedRgb);

  // Get unique brands and stores from matches
  const uniqueBrands = Array.from(new Set(matches.map(m => m.color.brand)));
  const uniqueStores = Array.from(new Set(matches.map(m => m.color.store)));

  // Filter matches
  const filteredMatches = matches.filter(match => {
    if (filterBrand !== 'all' && match.color.brand !== filterBrand) return false;
    if (filterStore !== 'all' && match.color.store !== filterStore) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Detected color info */}
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-start gap-6">
          {/* Large swatch */}
          <div
            className="w-24 h-24 rounded-xl border-2 border-border shadow-xl flex-shrink-0"
            style={{ backgroundColor: hex }}
          />

          {/* Color data */}
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white mb-3">Detected Color</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-gray-500 mb-1">Hex</div>
                <div className="font-mono text-white">{hex}</div>
              </div>
              <div>
                <div className="text-gray-500 mb-1">RGB</div>
                <div className="font-mono text-white">
                  {detectedRgb[0]}, {detectedRgb[1]}, {detectedRgb[2]}
                </div>
              </div>
              <div>
                <div className="text-gray-500 mb-1">L*a*b*</div>
                <div className="font-mono text-white">
                  {lab[0].toFixed(1)}, {lab[1].toFixed(1)}, {lab[2].toFixed(1)}
                </div>
              </div>
              <div>
                <div className="text-gray-500 mb-1">HSL</div>
                <div className="font-mono text-white">
                  {Math.round(hsl[0])}°, {Math.round(hsl[1])}%, {Math.round(hsl[2])}%
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      {matches.length > 0 && (
        <div className="flex flex-wrap gap-3">
          <div>
            <label className="block text-sm text-gray-500 mb-1">Filter by Brand:</label>
            <select
              value={filterBrand}
              onChange={(e) => setFilterBrand(e.target.value)}
              className="px-4 py-2 bg-card border border-border rounded-lg text-white text-sm focus:outline-none focus:border-accent transition-colors"
            >
              <option value="all">All Brands</option>
              {uniqueBrands.map(brand => (
                <option key={brand} value={brand}>{brand}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-500 mb-1">Filter by Store:</label>
            <select
              value={filterStore}
              onChange={(e) => setFilterStore(e.target.value)}
              className="px-4 py-2 bg-card border border-border rounded-lg text-white text-sm focus:outline-none focus:border-accent transition-colors"
            >
              <option value="all">All Stores</option>
              {uniqueStores.map(store => (
                <option key={store} value={store}>{store}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Matches */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-white">
            {filteredMatches.length > 0 ? 'Top Matches' : 'No matches found'}
          </h3>
          {filteredMatches.length > 0 && (
            <span className="text-sm text-gray-500">
              Showing {filteredMatches.length} of {matches.length}
            </span>
          )}
        </div>

        <div className="space-y-3">
          {filteredMatches.map((match, index) => (
            <MatchCard
              key={`${match.color.brand}-${match.color.code}`}
              match={match}
              index={index}
              onClick={() => setSelectedMatch(match)}
            />
          ))}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedMatch && (
        <ColorDetailModal
          match={selectedMatch}
          allMatches={matches}
          isOpen={true}
          onClose={() => setSelectedMatch(null)}
        />
      )}

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
