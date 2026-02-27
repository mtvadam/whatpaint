'use client';

import { useState } from 'react';
import { getBrowserLocation, getLocationFromZipCode } from '@/lib/geolocation';
import type { LocationResult } from '@/lib/geolocation';

type LocationBarProps = {
  location: LocationResult | null;
  onLocationSet: (location: LocationResult) => void;
};

export function LocationBar({ location, onLocationSet }: LocationBarProps) {
  const [loading, setLoading] = useState(false);
  const [showInput, setShowInput] = useState(false);
  const [zipCode, setZipCode] = useState('');

  const handleGetLocation = async () => {
    setLoading(true);
    try {
      const loc = await getBrowserLocation();
      onLocationSet(loc);
      setShowInput(false);
    } catch {
      setShowInput(true);
    } finally {
      setLoading(false);
    }
  };

  const handleZipSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!zipCode.trim()) return;
    setLoading(true);
    try {
      const loc = await getLocationFromZipCode(zipCode.trim());
      onLocationSet(loc);
      setShowInput(false);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  if (location?.city) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-400">
        <svg className="w-4 h-4 text-accent" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
        </svg>
        <span>{location.city}, {location.state}</span>
      </div>
    );
  }

  if (showInput) {
    return (
      <form onSubmit={handleZipSubmit} className="flex items-center gap-2">
        <input
          type="text"
          value={zipCode}
          onChange={(e) => setZipCode(e.target.value)}
          placeholder="Zip code"
          className="w-24 px-3 py-1.5 bg-background border border-border rounded-lg text-white text-sm focus:outline-none focus:border-accent"
          maxLength={5}
        />
        <button
          type="submit"
          disabled={loading}
          className="text-accent hover:text-[#D66D3A] text-sm font-medium transition-colors"
        >
          {loading ? '...' : 'Set'}
        </button>
      </form>
    );
  }

  return (
    <button
      onClick={handleGetLocation}
      disabled={loading}
      className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-accent transition-colors"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
      {loading ? 'Getting location...' : 'Set location'}
    </button>
  );
}
