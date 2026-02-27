'use client';

import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { totalColorCount, allStores } from '@/data/color-database';

export function NewHero() {
  const router = useRouter();
  const [patchFixed, setPatchFixed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setPatchFixed(true), 3000);
    const resetTimer = setInterval(() => {
      setPatchFixed(false);
      setTimeout(() => setPatchFixed(true), 3000);
    }, 7000);
    return () => {
      clearTimeout(timer);
      clearInterval(resetTimer);
    };
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden">
      {/* Background gradient + texture */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0D0D10] via-background to-[#0F0F13]" />
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative max-w-6xl mx-auto z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Text */}
          <div className="text-center lg:text-left order-2 lg:order-1">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight leading-[1.1]">
              That patch on your wall doesn't have to stay{' '}
              <span className="text-accent">the wrong shade</span>
            </h1>

            <p className="text-lg sm:text-xl text-gray-400 mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Point your camera at any wall and we'll tell you the exact paint
              color and where to buy it. No more guessing at the hardware store.
            </p>

            <div className="flex flex-col sm:flex-row items-center lg:items-start gap-4 mb-12">
              <Button
                size="lg"
                onClick={() => router.push('/detect')}
                className="text-lg px-10 py-5 shadow-2xl shadow-accent/20 hover:shadow-accent/40 transition-all hover:scale-[1.03]"
              >
                Find My Paint Color
              </Button>
              <span className="text-sm text-gray-600">
                Free. No signup needed.
              </span>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span>{totalColorCount.toLocaleString()}+ paint colors</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <span>{allStores.length} major stores</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-accent" />
                <span>Lab-grade accuracy</span>
              </div>
            </div>
          </div>

          {/* Right: Wall illustration */}
          <div className="order-1 lg:order-2 flex justify-center">
            <div className="relative">
              {/* The wall - realistic with depth */}
              <div className="relative w-[380px] h-[280px] sm:w-[440px] sm:h-[320px] rounded-xl overflow-hidden shadow-2xl border border-white/5">
                {/* Wall base color */}
                <div className="absolute inset-0" style={{ backgroundColor: '#C8BFB2' }} />

                {/* Wall texture using repeating subtle patterns */}
                <div
                  className="absolute inset-0 opacity-[0.08]"
                  style={{
                    backgroundImage: `
                      radial-gradient(circle at 20% 30%, rgba(0,0,0,0.1) 0%, transparent 2%),
                      radial-gradient(circle at 60% 70%, rgba(0,0,0,0.08) 0%, transparent 1.5%),
                      radial-gradient(circle at 80% 20%, rgba(0,0,0,0.06) 0%, transparent 2%)
                    `,
                    backgroundSize: '30px 30px, 20px 20px, 25px 25px',
                  }}
                />

                {/* Shadow at top from ceiling */}
                <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-black/10 to-transparent" />

                {/* Picture hanging nail/hole */}
                <div className="absolute top-[30%] left-[42%] w-2 h-2 rounded-full bg-[#A09487] shadow-inner" />

                {/* THE WRONG SHADE PATCH - clearly visible */}
                <div
                  className="absolute rounded-sm transition-all duration-[2000ms] ease-in-out"
                  style={{
                    top: '35%',
                    left: '28%',
                    width: '44%',
                    height: '40%',
                    backgroundColor: patchFixed ? '#C8BFB2' : '#D5CFC5',
                    boxShadow: patchFixed
                      ? 'none'
                      : 'inset 0 0 0 1px rgba(0,0,0,0.04)',
                  }}
                >
                  {/* Subtle roller texture on patch */}
                  {!patchFixed && (
                    <div
                      className="absolute inset-0 opacity-[0.04]"
                      style={{
                        backgroundImage:
                          'repeating-linear-gradient(90deg, transparent, transparent 1px, rgba(255,255,255,0.3) 1px, rgba(255,255,255,0.3) 2px)',
                      }}
                    />
                  )}
                </div>

                {/* Scuff mark near patch */}
                <div
                  className="absolute"
                  style={{
                    top: '60%',
                    left: '55%',
                    width: '20px',
                    height: '12px',
                    background: 'rgba(0,0,0,0.08)',
                    borderRadius: '50%',
                    transform: 'rotate(-15deg)',
                  }}
                />

                {/* Baseboard at bottom */}
                <div className="absolute bottom-0 left-0 right-0 h-6 bg-[#F5F2EE] border-t border-[#E0DDD8]" />
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#E8E5E0]" />
              </div>

              {/* Floating labels */}
              <div
                className={`absolute -right-4 sm:-right-12 top-[45%] transition-all duration-700 ${
                  patchFixed
                    ? 'opacity-0 translate-x-2'
                    : 'opacity-100 translate-x-0'
                }`}
              >
                <div className="bg-red-500/15 backdrop-blur-md border border-red-500/30 rounded-lg px-4 py-2.5 shadow-xl">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-sm text-red-400 font-medium whitespace-nowrap">
                      Wrong shade
                    </span>
                  </div>
                </div>
              </div>

              <div
                className={`absolute -right-4 sm:-right-12 top-[45%] transition-all duration-700 ${
                  patchFixed
                    ? 'opacity-100 translate-x-0'
                    : 'opacity-0 -translate-x-2'
                }`}
              >
                <div className="bg-green-500/15 backdrop-blur-md border border-green-500/30 rounded-lg px-4 py-2.5 shadow-xl">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm text-green-400 font-medium whitespace-nowrap">
                      Perfect match
                    </span>
                  </div>
                </div>
              </div>

              {/* Arrow pointing to patch */}
              <div
                className={`absolute left-[45%] -bottom-6 transition-all duration-500 ${
                  patchFixed ? 'opacity-0' : 'opacity-60'
                }`}
              >
                <svg width="30" height="40" viewBox="0 0 30 40" className="text-gray-500">
                  <path d="M15 0 L15 30 M8 24 L15 32 L22 24" fill="none" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              </div>

              {/* Subtle glow behind wall */}
              <div className="absolute -inset-8 bg-gradient-to-b from-accent/5 via-transparent to-transparent rounded-3xl -z-10 blur-2xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="flex flex-col items-center gap-2 text-gray-600">
          <span className="text-xs uppercase tracking-widest">How it works</span>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </div>
    </section>
  );
}
