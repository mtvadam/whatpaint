'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { getBrowserLocation, getLocationFromZipCode } from '@/lib/geolocation';
import type { LocationResult } from '@/lib/geolocation';

type LocationPromptProps = {
  onLocationSet: (location: LocationResult) => void;
};

export function LocationPrompt({ onLocationSet }: LocationPromptProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);

  const handleBrowserLocation = async () => {
    setLoading(true);
    setError('');

    try {
      const location = await getBrowserLocation();
      onLocationSet(location);
    } catch (err) {
      setError('Unable to access your location. Please enter your zip code instead.');
      setShowManualInput(true);
    } finally {
      setLoading(false);
    }
  };

  const handleZipCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!zipCode.trim()) return;

    setLoading(true);
    setError('');

    try {
      const location = await getLocationFromZipCode(zipCode.trim());
      onLocationSet(location);
    } catch (err) {
      setError('Invalid zip code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto text-center">
      <div className="mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-accent/10 border border-accent/20 mb-4">
          <span className="text-3xl">📍</span>
        </div>
        <h2 className="text-3xl font-bold text-white mb-3">Where are you?</h2>
        <p className="text-gray-400">
          We'll show you which paint stores are nearby
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      {!showManualInput ? (
        <div className="space-y-4">
          <Button
            onClick={handleBrowserLocation}
            disabled={loading}
            size="lg"
            className="w-full"
          >
            {loading ? 'Getting location...' : 'Use My Location'}
          </Button>

          <button
            onClick={() => setShowManualInput(true)}
            className="text-gray-400 hover:text-white transition-colors text-sm"
          >
            Or enter zip code manually
          </button>
        </div>
      ) : (
        <form onSubmit={handleZipCodeSubmit} className="space-y-4">
          <input
            type="text"
            value={zipCode}
            onChange={(e) => setZipCode(e.target.value)}
            placeholder="Enter zip code"
            className="w-full px-4 py-3 bg-card border border-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-accent transition-colors"
            disabled={loading}
            maxLength={10}
          />

          <Button
            type="submit"
            disabled={loading || !zipCode.trim()}
            size="lg"
            className="w-full"
          >
            {loading ? 'Finding stores...' : 'Continue'}
          </Button>

          <button
            type="button"
            onClick={() => setShowManualInput(false)}
            className="text-gray-400 hover:text-white transition-colors text-sm"
          >
            Back to location access
          </button>
        </form>
      )}
    </div>
  );
}
