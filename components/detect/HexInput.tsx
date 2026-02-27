'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { hexToRgb } from '@/lib/color-science';
import type { RGB } from '@/types';

type HexInputProps = {
  onColorDetected: (rgb: RGB) => void;
};

export function HexInput({ onColorDetected }: HexInputProps) {
  const [hexValue, setHexValue] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleaned = hexValue.trim().replace(/^#/, '');

    if (!/^[0-9A-Fa-f]{6}$/.test(cleaned)) {
      setError('Please enter a valid 6-digit hex code');
      return;
    }

    try {
      const rgb = hexToRgb(`#${cleaned}`);
      onColorDetected(rgb);
    } catch (err) {
      setError('Invalid hex color code');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;

    // Auto-add # if not present
    if (value && !value.startsWith('#')) {
      value = '#' + value;
    }

    // Remove invalid characters
    value = value.replace(/[^#0-9A-Fa-f]/g, '');

    // Limit to 7 characters (#RRGGBB)
    if (value.length > 7) {
      value = value.slice(0, 7);
    }

    setHexValue(value);
    setError('');
  };

  const currentColor = hexValue.length === 7 ? hexValue : '#141418';

  return (
    <div className="space-y-4">
      <div className="bg-card rounded-xl border border-border p-8">
        <div className="max-w-md mx-auto space-y-6">
          {/* Color preview */}
          <div className="flex items-center justify-center">
            <div
              className="w-32 h-32 rounded-2xl border-2 border-border shadow-lg transition-colors duration-300"
              style={{ backgroundColor: currentColor }}
            />
          </div>

          {/* Input form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="hex-input" className="block text-sm font-medium text-gray-400 mb-2">
                Enter Hex Code
              </label>
              <input
                id="hex-input"
                type="text"
                value={hexValue}
                onChange={handleInputChange}
                placeholder="#RRGGBB"
                className="w-full px-4 py-3 bg-background border border-border rounded-lg text-white font-mono text-lg text-center placeholder-gray-600 focus:outline-none focus:border-accent transition-colors"
              />
              {error && (
                <p className="mt-2 text-sm text-red-400">{error}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={hexValue.length !== 7}
              className="w-full"
              size="lg"
            >
              Find Matches
            </Button>
          </form>

          {/* Quick examples */}
          <div>
            <div className="text-sm font-medium text-gray-400 mb-2">Quick examples:</div>
            <div className="grid grid-cols-3 gap-2">
              {['#FFFFFF', '#808080', '#000000', '#FF0000', '#00FF00', '#0000FF'].map(hex => (
                <button
                  key={hex}
                  onClick={() => {
                    setHexValue(hex);
                    setError('');
                  }}
                  className="flex items-center gap-2 p-2 rounded-lg bg-background hover:bg-background/50 transition-colors"
                >
                  <div
                    className="w-6 h-6 rounded border border-border"
                    style={{ backgroundColor: hex }}
                  />
                  <span className="text-xs font-mono text-gray-400">{hex}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
