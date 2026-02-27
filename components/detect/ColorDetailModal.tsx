import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { rgbToHex, getDeltaEInterpretation } from '@/lib/color-science';
import type { ColorMatch } from '@/types';

type ColorDetailModalProps = {
  match: ColorMatch;
  allMatches: ColorMatch[];
  isOpen: boolean;
  onClose: () => void;
};

export function ColorDetailModal({ match, allMatches, isOpen, onClose }: ColorDetailModalProps) {
  const { color, deltaE, confidence } = match;
  const hex = rgbToHex(color.rgb);

  // Find similar colors from other stores
  const similarFromOtherStores = allMatches
    .filter(m => m.color.store !== color.store && m.deltaE < 5)
    .slice(0, 3);

  // Find coordinating colors if available
  const coordinatingColors = color.coordinating
    ? allMatches
        .filter(m => color.coordinating?.includes(m.color.code))
        .slice(0, 3)
    : [];

  const getConfidenceBadge = () => {
    if (confidence >= 85) return 'success';
    if (confidence >= 60) return 'warning';
    return 'error';
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={color.name}>
      <div className="space-y-6">
        {/* Large color swatch */}
        <div className="flex items-center gap-6">
          <div
            className="w-32 h-32 rounded-2xl border-2 border-border shadow-2xl flex-shrink-0"
            style={{ backgroundColor: hex }}
          />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <Badge variant={getConfidenceBadge()}>
                {Math.round(confidence)}% Match
              </Badge>
              <span className="text-sm text-gray-500">
                {getDeltaEInterpretation(deltaE)}
              </span>
            </div>
            <div className="space-y-1 text-sm">
              <div className="text-white">
                <span className="text-gray-500">Brand:</span> {color.brand}
              </div>
              <div className="text-white">
                <span className="text-gray-500">Code:</span>{' '}
                <span className="font-mono text-accent">{color.code}</span>
              </div>
              <div className="text-white">
                <span className="text-gray-500">Store:</span> {color.store}
              </div>
            </div>
          </div>
        </div>

        {/* Technical details */}
        <div className="grid grid-cols-2 gap-4 p-4 bg-background rounded-lg border border-border">
          <div>
            <div className="text-xs text-gray-500 mb-1">Hex</div>
            <div className="font-mono text-sm text-white">{hex}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">RGB</div>
            <div className="font-mono text-sm text-white">
              {color.rgb[0]}, {color.rgb[1]}, {color.rgb[2]}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">LRV</div>
            <div className="font-mono text-sm text-white">{color.lrv}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">ΔE 2000</div>
            <div className="font-mono text-sm text-white">{deltaE.toFixed(2)}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">Family</div>
            <div className="text-sm text-white">{color.family}</div>
          </div>
          {color.undertone && (
            <div>
              <div className="text-xs text-gray-500 mb-1">Undertone</div>
              <div className="text-sm text-white capitalize">{color.undertone}</div>
            </div>
          )}
        </div>

        {/* Coordinating colors */}
        {coordinatingColors.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-400 mb-3">Coordinating Colors</h4>
            <div className="grid grid-cols-3 gap-3">
              {coordinatingColors.map(coord => (
                <div
                  key={`${coord.color.brand}-${coord.color.code}`}
                  className="bg-background rounded-lg border border-border p-3"
                >
                  <div
                    className="w-full h-16 rounded-lg border border-border mb-2"
                    style={{ backgroundColor: rgbToHex(coord.color.rgb) }}
                  />
                  <div className="text-xs text-white truncate">{coord.color.name}</div>
                  <div className="text-xs text-gray-500 font-mono">{coord.color.code}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Similar from other stores */}
        {similarFromOtherStores.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-400 mb-3">Similar Colors from Other Stores</h4>
            <div className="space-y-2">
              {similarFromOtherStores.map(similar => (
                <div
                  key={`${similar.color.brand}-${similar.color.code}`}
                  className="flex items-center gap-3 p-3 bg-background rounded-lg border border-border"
                >
                  <div
                    className="w-12 h-12 rounded border border-border flex-shrink-0"
                    style={{ backgroundColor: rgbToHex(similar.color.rgb) }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-white truncate">{similar.color.name}</div>
                    <div className="text-xs text-gray-500">
                      {similar.color.brand} • {similar.color.store}
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

        {/* Buy link */}
        <div className="pt-4 border-t border-border">
          <a
            href="#"
            className="block text-center py-3 px-6 bg-accent hover:bg-[#D66D3A] text-white rounded-lg transition-colors font-medium"
            onClick={(e) => {
              e.preventDefault();
              // Placeholder for buy link
              alert(`This would link to ${color.name} at ${color.store}`);
            }}
          >
            Buy at {color.store}
          </a>
        </div>
      </div>
    </Modal>
  );
}
