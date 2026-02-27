'use client';

import { useState, useMemo } from 'react';
import { LocationPrompt } from '@/components/location/LocationPrompt';
import { StoreSelector } from '@/components/stores/StoreSelector';
import { CameraCapture } from '@/components/detect/CameraCapture';
import { ImageUpload } from '@/components/detect/ImageUpload';
import { HexInput } from '@/components/detect/HexInput';
import { ColorResults } from '@/components/detect/ColorResults';
import { StepIndicator } from '@/components/ui/StepIndicator';
import { Badge } from '@/components/ui/Badge';
import { findClosestColors } from '@/lib/color-science';
import { paintColors } from '@/data/paint-colors';
import { paintStores } from '@/data/stores';
import type { LocationResult } from '@/lib/geolocation';
import type { RGB, ColorMatch } from '@/types';

type DetectionStep = 'location' | 'stores' | 'detect' | 'results';
type InputMethod = 'camera' | 'upload' | 'hex';

export default function DetectPage() {
  const [step, setStep] = useState<DetectionStep>('location');
  const [location, setLocation] = useState<LocationResult | null>(null);
  const [selectedStores, setSelectedStores] = useState<string[]>([]);
  const [inputMethod, setInputMethod] = useState<InputMethod>('camera');
  const [detectedColor, setDetectedColor] = useState<RGB | null>(null);
  const [matches, setMatches] = useState<ColorMatch[]>([]);

  // Filter paint database by selected stores
  const filteredPaintDatabase = useMemo(() => {
    if (selectedStores.length === 0) return paintColors;

    const selectedStoreNames = paintStores
      .filter(store => selectedStores.includes(store.id))
      .map(store => store.name);

    return paintColors.filter(color => selectedStoreNames.includes(color.store));
  }, [selectedStores]);

  const handleLocationSet = (loc: LocationResult) => {
    setLocation(loc);
    setStep('stores');
  };

  const handleStoresSelected = (storeIds: string[]) => {
    setSelectedStores(storeIds);
    setStep('detect');
  };

  const handleColorDetected = (rgb: RGB) => {
    setDetectedColor(rgb);
    const colorMatches = findClosestColors(rgb, filteredPaintDatabase, 8);
    setMatches(colorMatches);
    setStep('results');
  };

  const handleBackToDetect = () => {
    setStep('detect');
    setDetectedColor(null);
    setMatches([]);
  };

  const steps = [
    { label: 'Location', status: step === 'location' ? 'current' : 'completed' as const },
    { label: 'Stores', status: step === 'location' ? 'upcoming' : step === 'stores' ? 'current' : 'completed' as const },
    { label: 'Detect', status: step === 'location' || step === 'stores' ? 'upcoming' : step === 'detect' ? 'current' : 'completed' as const },
    { label: 'Results', status: step === 'results' ? 'current' : 'upcoming' as const },
  ];

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <a href="/" className="inline-flex items-center text-gray-400 hover:text-white transition-colors mb-6">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </a>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center">
              <span className="text-2xl">🎨</span>
            </div>
            <h1 className="text-3xl font-bold text-white">WhatPaint</h1>
          </div>
        </div>

        {/* Step indicator */}
        <StepIndicator steps={steps} />

        {/* Selected stores chip bar (shown after store selection) */}
        {step !== 'location' && step !== 'stores' && selectedStores.length > 0 && (
          <div className="mb-6 flex items-center gap-2 flex-wrap">
            <span className="text-sm text-gray-500">Searching:</span>
            {paintStores
              .filter(store => selectedStores.includes(store.id))
              .map(store => (
                <Badge key={store.id} className="flex items-center gap-1.5">
                  <span>{store.logo}</span>
                  <span>{store.name}</span>
                </Badge>
              ))}
            <button
              onClick={() => setStep('stores')}
              className="text-sm text-accent hover:text-[#D66D3A] transition-colors"
            >
              Change
            </button>
          </div>
        )}

        {/* Step content */}
        <div className="min-h-[600px]">
          {step === 'location' && (
            <div className="flex items-center justify-center py-12">
              <LocationPrompt onLocationSet={handleLocationSet} />
            </div>
          )}

          {step === 'stores' && (
            <div className="py-8">
              <StoreSelector onStoresSelected={handleStoresSelected} />
            </div>
          )}

          {step === 'detect' && (
            <div className="py-8">
              <div className="max-w-5xl mx-auto">
                <h2 className="text-2xl font-bold text-white mb-6 text-center">
                  Choose your input method
                </h2>

                {/* Method tabs */}
                <div className="flex gap-2 mb-8 bg-card p-1 rounded-xl border border-border">
                  <button
                    onClick={() => setInputMethod('camera')}
                    className={`flex-1 px-4 py-3 rounded-lg transition-all font-medium ${
                      inputMethod === 'camera'
                        ? 'bg-accent text-white'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-xl">📸</span>
                      <span>Live Camera</span>
                    </div>
                  </button>
                  <button
                    onClick={() => setInputMethod('upload')}
                    className={`flex-1 px-4 py-3 rounded-lg transition-all font-medium ${
                      inputMethod === 'upload'
                        ? 'bg-accent text-white'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-xl">📁</span>
                      <span>Upload Photo</span>
                    </div>
                  </button>
                  <button
                    onClick={() => setInputMethod('hex')}
                    className={`flex-1 px-4 py-3 rounded-lg transition-all font-medium ${
                      inputMethod === 'hex'
                        ? 'bg-accent text-white'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-xl">#️⃣</span>
                      <span>Manual Hex</span>
                    </div>
                  </button>
                </div>

                {/* Input method content */}
                {inputMethod === 'camera' && (
                  <CameraCapture onColorDetected={handleColorDetected} />
                )}
                {inputMethod === 'upload' && (
                  <ImageUpload onColorDetected={handleColorDetected} />
                )}
                {inputMethod === 'hex' && (
                  <HexInput onColorDetected={handleColorDetected} />
                )}
              </div>
            </div>
          )}

          {step === 'results' && detectedColor && (
            <div className="py-8">
              <div className="max-w-5xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">Your Paint Matches</h2>
                  <button
                    onClick={handleBackToDetect}
                    className="text-accent hover:text-[#D66D3A] transition-colors flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Try Another Color
                  </button>
                </div>

                <ColorResults
                  detectedRgb={detectedColor}
                  matches={matches}
                  selectedStores={selectedStores}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
