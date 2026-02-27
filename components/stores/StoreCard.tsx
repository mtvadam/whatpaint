import type { PaintStore } from '@/types';

type StoreCardProps = {
  store: PaintStore;
  selected: boolean;
  onToggle: () => void;
};

export function StoreCard({ store, selected, onToggle }: StoreCardProps) {
  return (
    <button
      onClick={onToggle}
      className={`relative p-6 rounded-xl border-2 transition-all duration-200 text-left w-full ${
        selected
          ? 'border-accent bg-accent/5'
          : 'border-border bg-card hover:border-accent/50'
      }`}
    >
      {/* Accent bar */}
      <div
        className="absolute top-0 left-0 right-0 h-1 rounded-t-xl"
        style={{ backgroundColor: store.accentColor }}
      />

      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className="text-4xl">{store.logo}</div>
          <div>
            <h3 className="text-lg font-semibold text-white">{store.name}</h3>
            <p className="text-sm text-gray-400 mt-1">
              {store.brands.join(', ')}
            </p>
          </div>
        </div>

        {/* Checkbox */}
        <div
          className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
            selected
              ? 'bg-accent border-accent'
              : 'border-gray-600'
          }`}
        >
          {selected && (
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
      </div>

      {/* Color count */}
      <div className="mt-4 text-sm text-gray-500">
        <span className="font-mono text-accent">{store.colorCount}</span> colors available
      </div>
    </button>
  );
}
