'use client';

import { useState } from 'react';
import { rgbToHex, rgbToLab, rgbToHsl } from '@/lib/color-science';
import type { RGB } from '@/types';
import type { ColorMatchResult } from '@/lib/color-science';
import { MatchCard } from './MatchCard';
import { ColorDetailModal } from './ColorDetailModal';

type ColorResultsProps = {
  detectedRgb: RGB;
  matches: ColorMatchResult[];
  totalMatches: number;
};

export function ColorResults({ detectedRgb, matches, totalMatches }: ColorResultsProps) {
  const [selectedMatch, setSelectedMatch] = useState<ColorMatchResult | null>(null);

  const lab = rgbToLab(detectedRgb);
  const hsl = rgbToHsl(detectedRgb);
  const hex = rgbToHex(detectedRgb);

  return (
    <div className="space-y-6">
      {/* Detected color info */}
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-start gap-6">
          <div
            className="w-24 h-24 rounded-xl border-2 border-border shadow-xl flex-shrink-0"
            style={{ backgroundColor: hex }}
          />
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
                  {Math.round(hsl[0])}, {Math.round(hsl[1])}%, {Math.round(hsl[2])}%
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Match list */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-white">
            {matches.length > 0 ? 'Top Matches' : 'No matches found'}
          </h3>
          {matches.length > 0 && (
            <span className="text-sm text-gray-500">
              Showing {matches.length} of {totalMatches}
            </span>
          )}
        </div>

        <div className="space-y-3">
          {matches.map((match, index) => (
            <MatchCard
              key={`${match.color.brand}-${match.color.name}`}
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
    </div>
  );
}
