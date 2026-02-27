'use client';

import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { colorDatabase, totalColorCount, allStores } from '@/data/color-database';

export function FinalCTA() {
  const router = useRouter();
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  // Pick a range of beautiful real paint colors for the swatches
  const swatchNames = ['Planetarium', 'Alabaster', 'Evergreen Fog', 'Caliente', 'Agreeable Gray', 'Accessible Beige', 'Urbane Bronze'];
  const swatchColors = swatchNames
    .map(name => colorDatabase.find(c => c.name === name))
    .filter(Boolean);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
        }
      },
      { threshold: 0.25 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, [isVisible]);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[80vh] flex items-center justify-center px-4 py-20 overflow-hidden"
    >
      {/* Dark gradient with spotlight */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-[#0D0D10] to-[#050507]" />
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 60% 50% at center 40%, rgba(232,117,74,0.08) 0%, transparent 100%)',
        }}
      />

      <div className="relative max-w-4xl mx-auto text-center z-10">
        {/* Floating paint swatches */}
        <div className="mb-14 flex justify-center gap-3 sm:gap-4">
          {swatchColors.map((color, i) => (
            <div
              key={color!.name}
              className="transition-all duration-700"
              style={{
                transitionDelay: `${i * 80}ms`,
                opacity: isVisible ? 1 : 0,
                transform: isVisible
                  ? 'translateY(0) rotate(0deg)'
                  : `translateY(${30 + i * 5}px) rotate(${-15 + i * 5}deg)`,
              }}
            >
              <div className="relative group">
                <div
                  className="w-12 h-16 sm:w-14 sm:h-20 rounded-lg border border-white/10 shadow-xl transition-transform duration-500 hover:scale-110 hover:-translate-y-1"
                  style={{
                    backgroundColor: color!.hex,
                  }}
                />
                {/* Tooltip on hover */}
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  <span className="text-[10px] text-gray-500 font-mono">{color!.name}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Headline */}
        <h2
          className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight transition-all duration-1000"
          style={{
            transitionDelay: '400ms',
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
          }}
        >
          Your wall is one photo away<br />
          from a <span className="text-accent">perfect match</span>
        </h2>

        {/* Subtitle */}
        <p
          className="text-gray-500 text-lg mb-10 max-w-lg mx-auto transition-all duration-1000"
          style={{
            transitionDelay: '600ms',
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(15px)',
          }}
        >
          No accounts. No downloads. Just open your browser and point.
        </p>

        {/* CTA */}
        <div
          className="mb-6 transition-all duration-1000"
          style={{
            transitionDelay: '800ms',
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(15px)',
          }}
        >
          <Button
            size="lg"
            onClick={() => router.push('/detect')}
            className="text-xl px-14 py-6 shadow-2xl shadow-accent/30 hover:shadow-accent/50 transition-all hover:scale-[1.03]"
          >
            Get Started
          </Button>
        </div>

        <p
          className="text-gray-600 text-sm transition-all duration-1000"
          style={{
            transitionDelay: '1000ms',
            opacity: isVisible ? 1 : 0,
          }}
        >
          Free. No signup. Works in your browser.
        </p>

        {/* Stats */}
        <div
          className="mt-20 grid grid-cols-3 gap-8 max-w-md mx-auto transition-all duration-1000"
          style={{
            transitionDelay: '1200ms',
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(15px)',
          }}
        >
          <div>
            <div className="text-2xl sm:text-3xl font-bold text-white mb-1">{totalColorCount.toLocaleString()}+</div>
            <div className="text-xs text-gray-600">Paint Colors</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-bold text-white mb-1">{allStores.length}</div>
            <div className="text-xs text-gray-600">Major Stores</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-bold text-white mb-1">&lt;1s</div>
            <div className="text-xs text-gray-600">Match Time</div>
          </div>
        </div>
      </div>
    </section>
  );
}
