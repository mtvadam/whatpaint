'use client';

import { useEffect, useRef, useState } from 'react';

export function DemoSection1() {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

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
      className="min-h-screen flex items-center justify-center px-4 py-20 relative bg-card/20"
    >
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Laptop mockup with camera feed */}
          <div className={`relative transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
            {/* Laptop frame */}
            <div className="relative mx-auto max-w-lg">
              {/* Screen bezel */}
              <div className="bg-[#1C1C1E] rounded-t-xl pt-3 px-3 pb-0 border border-[#2A2A2E] border-b-0">
                {/* Camera dot */}
                <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-[#2A2A2E] border border-[#3A3A3E]">
                  <div className="w-1 h-1 rounded-full bg-[#4A4A4E] m-auto mt-[1px]" />
                </div>

                {/* Screen content */}
                <div className="relative bg-background rounded-t-lg overflow-hidden aspect-[16/10]">
                  {/* Simulated wall - warm beige surface */}
                  <div className="absolute inset-0" style={{ backgroundColor: '#D4C8B8' }}>
                    {/* Subtle wall texture */}
                    <div
                      className="absolute inset-0 opacity-[0.06]"
                      style={{
                        backgroundImage: `
                          radial-gradient(circle, rgba(0,0,0,0.15) 0.5px, transparent 0.5px)
                        `,
                        backgroundSize: '8px 8px',
                      }}
                    />
                    {/* Shadow from ceiling */}
                    <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-black/8 to-transparent" />
                    {/* Slight color variation on wall */}
                    <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/5" />
                  </div>

                  {/* Top bar overlay */}
                  <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 py-2 bg-gradient-to-b from-black/40 to-transparent">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-500" />
                      <span className="text-white text-xs font-medium">Live Camera</span>
                    </div>
                    <div className="text-white text-[10px] font-mono bg-black/30 px-2 py-0.5 rounded">
                      1920x1080 • 30fps
                    </div>
                  </div>

                  {/* Crosshair - animated in */}
                  <div
                    className={`absolute transition-all duration-1000 ${
                      isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
                    }`}
                    style={{
                      left: '58%',
                      top: '48%',
                      transform: 'translate(-50%, -50%)',
                      transitionDelay: '600ms',
                    }}
                  >
                    {/* Crosshair lines */}
                    <div className="relative w-16 h-16">
                      <div className="absolute top-1/2 left-0 right-0 h-[1.5px] bg-white/80 -translate-y-1/2" />
                      <div className="absolute left-1/2 top-0 bottom-0 w-[1.5px] bg-white/80 -translate-x-1/2" />
                      <div className="absolute inset-1 border-2 border-white/60 rounded-full" />
                    </div>
                  </div>

                  {/* Sampling ring - pops in after crosshair */}
                  <div
                    className={`absolute transition-all duration-700 ${
                      isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
                    }`}
                    style={{
                      left: '58%',
                      top: '48%',
                      transform: 'translate(-50%, -50%)',
                      transitionDelay: '1200ms',
                    }}
                  >
                    <div className="w-24 h-24 border-[3px] border-accent rounded-full animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]" />
                    <div className="absolute inset-0 w-24 h-24 border-[3px] border-accent rounded-full" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-accent rounded-full shadow-lg shadow-accent/50" />
                  </div>

                  {/* Color swatch popup */}
                  <div
                    className={`absolute transition-all duration-700 ${
                      isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-90'
                    }`}
                    style={{
                      left: '58%',
                      top: '18%',
                      transform: 'translateX(-50%)',
                      transitionDelay: '1800ms',
                    }}
                  >
                    <div className="bg-[#141418]/95 backdrop-blur-xl border border-accent/40 rounded-xl px-4 py-3 shadow-2xl shadow-black/50">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-lg border-2 border-white/20 shadow-inner"
                          style={{ backgroundColor: '#D4C8B8' }}
                        />
                        <div>
                          <div className="font-mono text-sm text-accent font-bold">#D4C8B8</div>
                          <div className="text-[11px] text-gray-400">RGB 212, 200, 184</div>
                        </div>
                      </div>
                      {/* Arrow pointing down */}
                      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-[#141418]/95 border-r border-b border-accent/40 rotate-45" />
                    </div>
                  </div>

                  {/* Bottom toolbar */}
                  <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center gap-3 px-4 py-3 bg-gradient-to-t from-black/50 to-transparent">
                    <div className="bg-accent/90 text-white text-xs font-medium px-4 py-1.5 rounded-lg">
                      Freeze Frame
                    </div>
                    <div className="bg-white/10 text-white/60 text-xs font-medium px-4 py-1.5 rounded-lg border border-white/10">
                      Resume
                    </div>
                  </div>
                </div>
              </div>

              {/* Laptop base/keyboard area */}
              <div className="bg-gradient-to-b from-[#2A2A2E] to-[#1C1C1E] h-3 rounded-b-lg mx-4 border border-t-0 border-[#2A2A2E]" />
              <div className="bg-[#1C1C1E] h-1 rounded-b-xl mx-16 border border-t-0 border-[#2A2A2E]" />
            </div>
          </div>

          {/* Right: Text */}
          <div className={`transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'}`}>
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6 leading-tight">
              Point. Click.{' '}
              <span className="text-accent">Match.</span>
            </h2>
            <p className="text-lg text-gray-400 leading-relaxed mb-8">
              Your camera sees what your eyes can't — the exact color values
              hidden in every wall. We sample a 25-point grid around your click
              and reject outliers to give you laboratory-accurate color data.
            </p>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                </div>
                <div>
                  <div className="text-white font-medium text-sm">25-point grid sampling</div>
                  <div className="text-gray-500 text-xs">5x5 grid around each click point for maximum accuracy</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <div className="text-white font-medium text-sm">Outlier rejection</div>
                  <div className="text-gray-500 text-xs">Automatically filters noise and shadows for clean results</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707" />
                  </svg>
                </div>
                <div>
                  <div className="text-white font-medium text-sm">White balance correction</div>
                  <div className="text-gray-500 text-xs">Daylight, tungsten, and fluorescent presets</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
