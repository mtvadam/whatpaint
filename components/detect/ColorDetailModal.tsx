import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { getDeltaEInterpretation } from '@/lib/color-science';
import type { ColorMatchResult } from '@/lib/color-science';

type ColorDetailModalProps = {
  match: ColorMatchResult;
  allMatches: ColorMatchResult[];
  isOpen: boolean;
  onClose: () => void;
};

export function ColorDetailModal({ match, allMatches, isOpen, onClose }: ColorDetailModalProps) {
  const { color, deltaE, confidence } = match;

  const similarFromOtherBrands = allMatches
    .filter(m => m.color.brand !== color.brand && m.deltaE < 8)
    .slice(0, 4);

  const getConfidenceBadge = (): 'success' | 'warning' | 'error' => {
    if (confidence >= 85) return 'success';
    if (confidence >= 60) return 'warning';
    return 'error';
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={color.name}>
      <div className="space-y-6">
        {/* Large swatch + info */}
        <div className="flex items-center gap-6">
          <div
            className="w-28 h-28 rounded-2xl border-2 border-border shadow-2xl flex-shrink-0"
            style={{ backgroundColor: color.hex }}
          />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <Badge variant={getConfidenceBadge()}>
                {Math.round(confidence)}% Match
              </Badge>
              <span className="text-xs text-gray-500">
                {getDeltaEInterpretation(deltaE)}
              </span>
            </div>
            <div className="space-y-1 text-sm">
              <div className="text-white">
                <span className="text-gray-500">Brand:</span> {color.brand}
              </div>
              {color.code && (
                <div className="text-white">
                  <span className="text-gray-500">Code:</span>{' '}
                  <span className="font-mono text-accent">{color.code}</span>
                </div>
              )}
              <div className="text-white">
                <span className="text-gray-500">Available at:</span> {color.stores.join(', ')}
              </div>
            </div>
          </div>
        </div>

        {/* Technical data */}
        <div className="grid grid-cols-2 gap-4 p-4 bg-background rounded-lg border border-border">
          <div>
            <div className="text-xs text-gray-500 mb-1">Hex</div>
            <div className="font-mono text-sm text-white">{color.hex}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">RGB</div>
            <div className="font-mono text-sm text-white">
              {color.rgb[0]}, {color.rgb[1]}, {color.rgb[2]}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">L*a*b*</div>
            <div className="font-mono text-sm text-white">
              {color.lab[0].toFixed(1)}, {color.lab[1].toFixed(1)}, {color.lab[2].toFixed(1)}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">ΔE 2000</div>
            <div className="font-mono text-sm text-white">{deltaE.toFixed(2)}</div>
          </div>
        </div>

        {/* Similar from other brands */}
        {similarFromOtherBrands.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-400 mb-3">Similar Colors from Other Brands</h4>
            <div className="space-y-2">
              {similarFromOtherBrands.map(similar => (
                <div
                  key={`${similar.color.brand}-${similar.color.name}`}
                  className="flex items-center gap-3 p-3 bg-background rounded-lg border border-border"
                >
                  <div
                    className="w-10 h-10 rounded border border-border flex-shrink-0"
                    style={{ backgroundColor: similar.color.hex }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-white truncate">{similar.color.name}</div>
                    <div className="text-xs text-gray-500">
                      {similar.color.brand} · {similar.color.stores.join(', ')}
                    </div>
                  </div>
                  <Badge variant={similar.confidence >= 85 ? 'success' : 'warning'}>
                    {Math.round(similar.confidence)}%
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
