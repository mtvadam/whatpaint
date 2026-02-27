import { Badge } from '@/components/ui/Badge';
import type { ColorMatchResult } from '@/lib/color-science';

type MatchCardProps = {
  match: ColorMatchResult;
  index: number;
  onClick: () => void;
};

export function MatchCard({ match, index, onClick }: MatchCardProps) {
  const { color, deltaE, confidence } = match;

  const getConfidenceBadge = (): 'success' | 'warning' | 'error' => {
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
        <div
          className="w-14 h-14 rounded-lg border-2 border-border group-hover:border-accent/40 transition-colors shadow-lg flex-shrink-0"
          style={{ backgroundColor: color.hex }}
        />

        {/* Color info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <h3 className="font-semibold text-white truncate">{color.name}</h3>
            <Badge variant={getConfidenceBadge()}>
              {Math.round(confidence)}%
            </Badge>
          </div>

          <div className="space-y-1 text-sm">
            <div className="flex items-center gap-2 text-gray-400">
              <span className="font-medium">{color.brand}</span>
              {color.code && (
                <>
                  <span className="text-gray-600">·</span>
                  <span className="font-mono text-accent text-xs">{color.code}</span>
                </>
              )}
              <span className="text-gray-600">·</span>
              <span className="text-gray-500 font-mono text-xs">ΔE {deltaE.toFixed(1)}</span>
            </div>

            {/* Stores where available */}
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <svg className="w-3.5 h-3.5 text-accent flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              <span>
                Available at: {color.stores.join(', ')}
              </span>
            </div>
          </div>
        </div>

        {/* Arrow */}
        <div className="flex-shrink-0 text-gray-600 group-hover:text-accent transition-colors mt-1">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </button>
  );
}
