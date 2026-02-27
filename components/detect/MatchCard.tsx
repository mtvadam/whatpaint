import type { ColorMatch } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { rgbToHex } from '@/lib/color-science';

type MatchCardProps = {
  match: ColorMatch;
  index: number;
  onClick: () => void;
};

export function MatchCard({ match, index, onClick }: MatchCardProps) {
  const { color, deltaE, confidence } = match;
  const hex = rgbToHex(color.rgb);

  const getConfidenceBadge = () => {
    if (confidence >= 85) return 'success';
    if (confidence >= 60) return 'warning';
    return 'error';
  };

  return (
    <button
      onClick={onClick}
      className="group w-full text-left bg-card hover:bg-[#1A1A1E] border border-border hover:border-accent/50 rounded-xl p-4 transition-all duration-200"
      style={{
        animationDelay: `${index * 50}ms`,
        animation: 'slideIn 0.3s ease-out forwards',
      }}
    >
      <div className="flex items-start gap-4">
        {/* Color swatch */}
        <div className="flex-shrink-0">
          <div
            className="w-16 h-16 rounded-lg border-2 border-border group-hover:border-accent transition-colors shadow-lg"
            style={{ backgroundColor: hex }}
          />
        </div>

        {/* Color info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-semibold text-white text-lg truncate">
              {color.name}
            </h3>
            <Badge variant={getConfidenceBadge()}>
              {Math.round(confidence)}%
            </Badge>
          </div>

          <div className="space-y-1 text-sm">
            <div className="flex items-center gap-2 text-gray-400">
              <span className="font-medium">{color.brand}</span>
              <span className="text-gray-600">•</span>
              <span className="font-mono text-accent">{color.code}</span>
            </div>

            <div className="flex items-center gap-3 text-gray-500">
              <span>LRV: <span className="font-mono text-gray-400">{color.lrv}</span></span>
              <span>ΔE: <span className="font-mono text-gray-400">{deltaE.toFixed(2)}</span></span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs px-2 py-0.5 rounded bg-background text-gray-400 border border-border">
                {color.family}
              </span>
              {color.undertone && (
                <span className="text-xs px-2 py-0.5 rounded bg-background text-gray-400 border border-border">
                  {color.undertone}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Arrow indicator */}
        <div className="flex-shrink-0 text-gray-600 group-hover:text-accent transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>

      {/* Buy link placeholder */}
      <div className="mt-3 pt-3 border-t border-border">
        <div className="text-sm text-accent hover:text-[#D66D3A] transition-colors flex items-center gap-1">
          <span>Buy at {color.store}</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </div>
      </div>
    </button>
  );
}
