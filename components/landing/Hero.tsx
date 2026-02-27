'use client';

import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';

export function Hero() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="max-w-4xl mx-auto text-center">
        {/* Logo/Icon */}
        <div className="mb-8 inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-accent/10 border border-accent/20">
          <span className="text-4xl">🎨</span>
        </div>

        {/* Headline */}
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 tracking-tight">
          Find your exact
          <br />
          <span className="text-accent">paint color</span>
        </h1>

        {/* Subheadline */}
        <p className="text-xl sm:text-2xl text-gray-400 mb-12 max-w-2xl mx-auto">
          Use your camera to match any wall color to paint brands from stores near you
        </p>

        {/* CTA Button */}
        <Button
          size="lg"
          onClick={() => router.push('/detect')}
          className="text-lg px-12 py-5 shadow-lg shadow-accent/20 hover:shadow-accent/30"
        >
          Get Started
        </Button>

        {/* Features */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl mx-auto">
          <div className="text-center">
            <div className="text-3xl mb-3">📸</div>
            <h3 className="text-white font-medium mb-2">Live Camera</h3>
            <p className="text-sm text-gray-500">Point at any surface</p>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-3">🔬</div>
            <h3 className="text-white font-medium mb-2">CIEDE2000</h3>
            <p className="text-sm text-gray-500">Scientific color matching</p>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-3">🏪</div>
            <h3 className="text-white font-medium mb-2">7 Major Stores</h3>
            <p className="text-sm text-gray-500">Home Depot, Lowe's & more</p>
          </div>
        </div>
      </div>
    </div>
  );
}
