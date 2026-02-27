'use client';

import { useEffect, useRef, useState } from 'react';
import { colorDatabase, totalColorCount } from '@/data/color-database';
import { Badge } from '@/components/ui/Badge';

export function DemoSection2() {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  // Get real matches for demo (warm beige-ish colors close to #D4C8B8)
  const demoNames = ['Accessible Beige', 'Touch of Sand', 'Studio Clay', 'Moth Gray', 'Lace'];
  const demoConfs = [{ confidence: 94, deltaE: 1.1 }, { confidence: 91, deltaE: 1.7 }, { confidence: 86, deltaE: 2.6 }, { confidence: 82, deltaE: 3.2 }, { confidence: 78, deltaE: 4.0 }];
  const demoMatches = demoNames
    .map((name, i) => {
      const color = colorDatabase.find(c => c.name === name);
      return color ? { color, ...demoConfs[i] } : null;
    })
    .filter(Boolean) as { color: typeof colorDatabase[0]; confidence: number; deltaE: number }[];

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
      className="min-h-screen flex items-center justify-center px-4 py-20"
    >
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Text */}
          <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'}`}>
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6 leading-tight">
              Matched in{' '}
              <span className="text-accent">milliseconds</span>
            </h2>
            <p className="text-lg text-gray-400 leading-relaxed mb-8">
              We compare against {totalColorCount.toLocaleString()}+ colors from every major paint brand using
              laboratory-grade color science. Each match is ranked by perceptual
              difference — not just RGB distance.
            </p>

            <div className="space-y-4 mb-8">
              <div className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-accent font-mono font-bold text-sm">ΔE</span>
                  </div>
                  <div>
                    <div className="text-white font-medium text-sm">CIEDE2000 color distance</div>
                    <div className="text-gray-500 text-xs">How humans actually perceive color difference</div>
                  </div>
                </div>
              </div>

              <div className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-accent font-bold text-lg">%</span>
                  </div>
                  <div>
                    <div className="text-white font-medium text-sm">Confidence scoring</div>
                    <div className="text-gray-500 text-xs">Instant confidence percentage for every match</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Animated match cards */}
          <div className={`transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'}`}>
            {/* Detected color header */}
            <div
              className={`mb-5 transition-all duration-700 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}
              style={{ transitionDelay: '300ms' }}
            >
              <div className="bg-card border border-border rounded-xl p-4 inline-flex items-center gap-4">
                <div
                  className="w-14 h-14 rounded-xl border-2 border-border shadow-lg"
                  style={{ backgroundColor: '#D4C8B8' }}
                />
                <div>
                  <div className="text-xs text-gray-500 mb-0.5">Detected Color</div>
                  <div className="font-mono text-accent font-bold">#D4C8B8</div>
                  <div className="text-xs text-gray-500">Warm Beige</div>
                </div>
              </div>
            </div>

            {/* Match cards */}
            <div className="space-y-2.5">
              {demoMatches.map((match, index) => (
                <div
                  key={match.color.name}
                  className={`transition-all duration-700 ${
                    isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-16'
                  }`}
                  style={{
                    transitionDelay: `${600 + index * 150}ms`,
                  }}
                >
                  <div className="bg-card border border-border rounded-xl p-4 relative overflow-hidden hover:border-accent/30 transition-colors">
                    {/* Best match badge */}
                    {index === 0 && (
                      <div
                        className={`absolute top-3 right-3 transition-all duration-500 ${
                          isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
                        }`}
                        style={{ transitionDelay: '1800ms' }}
                      >
                        <Badge variant="success">Best Match</Badge>
                      </div>
                    )}

                    <div className="flex items-center gap-4">
                      {/* Swatch */}
                      <div
                        className="w-12 h-12 rounded-lg border-2 border-border flex-shrink-0 shadow-inner"
                        style={{
                          backgroundColor: `rgb(${match.color.rgb[0]}, ${match.color.rgb[1]}, ${match.color.rgb[2]})`,
                        }}
                      />

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-white text-sm truncate">{match.color.name}</h3>
                          <span className="text-xs font-mono text-accent">{match.color.code}</span>
                        </div>
                        <div className="text-xs text-gray-500 mb-2">
                          {match.color.brand} • {match.color.stores.join(', ')} • ΔE {match.deltaE.toFixed(1)}
                        </div>

                        {/* Confidence bar */}
                        <div className="h-1.5 bg-background rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-1000 ease-out ${
                              match.confidence >= 90
                                ? 'bg-green-500'
                                : match.confidence >= 80
                                ? 'bg-amber-500'
                                : 'bg-orange-500'
                            }`}
                            style={{
                              width: isVisible ? `${match.confidence}%` : '0%',
                              transitionDelay: `${900 + index * 150}ms`,
                            }}
                          />
                        </div>
                      </div>

                      {/* Confidence number */}
                      <div className="text-right flex-shrink-0">
                        <span
                          className={`text-lg font-bold font-mono ${
                            match.confidence >= 90
                              ? 'text-green-400'
                              : match.confidence >= 80
                              ? 'text-amber-400'
                              : 'text-orange-400'
                          }`}
                        >
                          {match.confidence}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
