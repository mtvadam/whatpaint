'use client';

import { useEffect, useRef, useState } from 'react';

export function DemoSection4() {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [deltaE, setDeltaE] = useState(12.0);

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

  // Animate deltaE countdown
  useEffect(() => {
    if (isVisible && deltaE > 1.1) {
      const timer = setTimeout(() => {
        setDeltaE(prev => {
          const next = prev - 0.3;
          return next < 1.1 ? 1.1 : parseFloat(next.toFixed(1));
        });
      }, 60);
      return () => clearTimeout(timer);
    }
  }, [isVisible, deltaE]);

  return (
    <section
      ref={sectionRef}
      className="min-h-screen flex items-center justify-center px-4 py-20 bg-card/20"
    >
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Color space visualization */}
          <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
            <div className="relative w-full max-w-md mx-auto">
              {/* Glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-purple-500/5 to-blue-500/10 rounded-3xl blur-3xl" />

              {/* The visualization */}
              <div className="relative bg-card border border-border rounded-2xl p-8 overflow-hidden">
                <svg viewBox="0 0 360 360" className="w-full">
                  {/* Grid background */}
                  <defs>
                    <pattern id="gridPattern" width="30" height="30" patternUnits="userSpaceOnUse">
                      <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
                    </pattern>
                    <radialGradient id="colorGrad" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#E8754A" stopOpacity="0.15" />
                      <stop offset="40%" stopColor="#8B5CF6" stopOpacity="0.08" />
                      <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.03" />
                    </radialGradient>
                  </defs>

                  <rect width="360" height="360" fill="url(#gridPattern)" />

                  {/* Color space circle */}
                  <circle cx="180" cy="180" r="140" fill="url(#colorGrad)" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                  <circle cx="180" cy="180" r="100" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" strokeDasharray="4 6" />
                  <circle cx="180" cy="180" r="60" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" strokeDasharray="4 6" />

                  {/* Axis labels */}
                  <text x="180" y="30" fill="rgba(255,255,255,0.15)" fontSize="10" textAnchor="middle" fontFamily="monospace">+b*</text>
                  <text x="180" y="345" fill="rgba(255,255,255,0.15)" fontSize="10" textAnchor="middle" fontFamily="monospace">-b*</text>
                  <text x="340" y="185" fill="rgba(255,255,255,0.15)" fontSize="10" textAnchor="end" fontFamily="monospace">+a*</text>
                  <text x="20" y="185" fill="rgba(255,255,255,0.15)" fontSize="10" textAnchor="start" fontFamily="monospace">-a*</text>

                  {/* Connection line */}
                  <line
                    x1="165"
                    y1="195"
                    x2={isVisible ? '220' : '165'}
                    y2={isVisible ? '155' : '195'}
                    stroke="#E8754A"
                    strokeWidth="1.5"
                    strokeDasharray="5 5"
                    opacity="0.5"
                    className="transition-all duration-[2000ms] ease-out"
                    style={{ transitionDelay: '500ms' }}
                  />

                  {/* Input color dot (your color) */}
                  <g className={`transition-all duration-700 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
                    <circle cx="165" cy="195" r="20" fill="#D4C8B8" stroke="#fff" strokeWidth="2.5" opacity="0.9" />
                    <circle cx="165" cy="195" r="22" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
                    <text x="165" y="232" fill="rgba(255,255,255,0.5)" fontSize="10" textAnchor="middle" fontFamily="monospace">Your Color</text>
                  </g>

                  {/* Match color dot - animates to position */}
                  <g className="transition-all duration-[2000ms] ease-out" style={{ transitionDelay: '500ms' }}>
                    <circle
                      cx={isVisible ? '220' : '165'}
                      cy={isVisible ? '155' : '195'}
                      r="20"
                      fill="#D4C7B7"
                      stroke="#E8754A"
                      strokeWidth="2.5"
                      className="transition-all duration-[2000ms] ease-out"
                      style={{ transitionDelay: '500ms' }}
                    />
                    <text
                      x={isVisible ? '220' : '165'}
                      y={isVisible ? '130' : '195'}
                      fill="#E8754A"
                      fontSize="10"
                      textAnchor="middle"
                      fontWeight="600"
                      fontFamily="monospace"
                      className="transition-all duration-[2000ms] ease-out"
                      style={{ transitionDelay: '500ms' }}
                    >
                      Accessible Beige
                    </text>
                  </g>

                  {/* ΔE label */}
                  <g
                    className={`transition-all duration-700 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
                    style={{ transitionDelay: '1200ms' }}
                  >
                    <rect x="170" y="162" width="56" height="28" rx="6" fill="#E8754A" />
                    <text x="198" y="181" fill="#fff" fontSize="12" fontWeight="700" textAnchor="middle" fontFamily="monospace">
                      ΔE {deltaE.toFixed(1)}
                    </text>
                  </g>
                </svg>
              </div>
            </div>
          </div>

          {/* Right: Text */}
          <div className={`transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'}`}>
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6 leading-tight">
              The science behind{' '}
              <span className="text-accent">the match</span>
            </h2>
            <p className="text-lg text-gray-400 leading-relaxed mb-8">
              Not just RGB comparison. WhatPaint uses{' '}
              <span className="text-white font-semibold">CIEDE2000</span> — the
              same perceptual color distance algorithm used by paint laboratories
              and color scientists worldwide.
            </p>

            {/* ΔE scale */}
            <div className="bg-card border border-border rounded-xl p-5 mb-6">
              <div className="text-sm font-medium text-gray-400 mb-4">ΔE Interpretation Scale</div>
              <div className="space-y-3">
                {[
                  { range: '0 – 1.0', label: 'Imperceptible', desc: 'Exact match', color: 'bg-green-500' },
                  { range: '1.0 – 2.0', label: 'Slight', desc: 'Acceptable match', color: 'bg-green-400' },
                  { range: '2.0 – 3.5', label: 'Noticeable', desc: 'Side by side only', color: 'bg-amber-500' },
                  { range: '3.5 – 5.0', label: 'Significant', desc: 'Clearly different', color: 'bg-orange-500' },
                  { range: '5.0+', label: 'Wrong color', desc: 'Not a match', color: 'bg-red-500' },
                ].map((item) => (
                  <div key={item.range} className="flex items-center gap-3">
                    <div className={`w-2.5 h-2.5 rounded-full ${item.color} flex-shrink-0`} />
                    <div className="font-mono text-xs text-gray-500 w-16 flex-shrink-0">{item.range}</div>
                    <div className="text-sm text-white font-medium">{item.label}</div>
                    <div className="text-xs text-gray-600 hidden sm:block">— {item.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-sm text-gray-600 leading-relaxed">
              Unlike simple RGB euclidean distance, CIEDE2000 accounts for how
              the human eye perceives lightness, chroma, and hue differently
              across the color spectrum.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
