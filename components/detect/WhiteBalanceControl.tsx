import type { WhiteBalanceMode } from '@/types';

type WhiteBalanceControlProps = {
  value: WhiteBalanceMode;
  onChange: (mode: WhiteBalanceMode) => void;
};

export function WhiteBalanceControl({ value, onChange }: WhiteBalanceControlProps) {
  const modes: { value: WhiteBalanceMode; label: string; description: string }[] = [
    { value: 'none', label: 'None', description: 'No correction' },
    { value: 'daylight', label: 'Daylight', description: 'Cool/outdoor' },
    { value: 'tungsten', label: 'Tungsten', description: 'Warm/indoor' },
    { value: 'fluorescent', label: 'Fluorescent', description: 'Office lighting' },
  ];

  return (
    <div className="bg-card rounded-lg border border-border p-4">
      <div className="text-sm font-medium text-gray-400 mb-3">White Balance:</div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {modes.map(mode => (
          <button
            key={mode.value}
            onClick={() => onChange(mode.value)}
            className={`px-3 py-2 rounded-lg text-sm transition-all ${
              value === mode.value
                ? 'bg-accent text-white'
                : 'bg-background text-gray-400 hover:bg-background/50'
            }`}
          >
            <div className="font-medium">{mode.label}</div>
            <div className="text-xs opacity-70">{mode.description}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
