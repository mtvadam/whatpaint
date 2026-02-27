'use client';

import { useEffect, useRef, useState } from 'react';
import { storeCounts } from '@/data/color-database';
import { getStoreLogo } from '@/components/ui/StoreLogos';

type StoreInfo = {
  id: string;
  name: string;
  brands: string[];
  accentColor: string;
};

const storeList: StoreInfo[] = [
  { id: 'home-depot', name: 'Home Depot', brands: ['Behr', 'PPG'], accentColor: '#F96302' },
  { id: 'lowes', name: "Lowe's", brands: ['Sherwin-Williams', 'Valspar'], accentColor: '#004990' },
  { id: 'sherwin-williams', name: 'Sherwin-Williams', brands: ['Sherwin-Williams'], accentColor: '#0060A9' },
  { id: 'benjamin-moore', name: 'Benjamin Moore', brands: ['Benjamin Moore'], accentColor: '#E31C23' },
  { id: 'menards', name: 'Menards', brands: ['PPG', 'Dutch Boy'], accentColor: '#008938' },
  { id: 'farrow-ball', name: 'Farrow & Ball', brands: ['Farrow & Ball'], accentColor: '#1A1A1A' },
];

// Map store display names to the keys used in the generated database
const storeNameMap: Record<string, string> = {
  'Home Depot': 'Home Depot',
  "Lowe's": 'Lowes',
  'Sherwin-Williams': 'Sherwin-Williams',
  'Benjamin Moore': 'Benjamin Moore',
  'Menards': 'Menards',
  'Farrow & Ball': 'Farrow & Ball',
};

export function DemoSection3() {
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
      className="min-h-screen flex items-center justify-center px-4 py-20"
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className={`text-center mb-16 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Every store.{' '}
            <span className="text-accent">Every brand.</span>
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Tell us where you are and we'll show you exactly where to buy your match.
          </p>
        </div>

        {/* Store grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4 lg:gap-5 mb-12">
          {storeList.map((store, index) => {
            const dbKey = storeNameMap[store.name] || store.name;
            const colorCount = storeCounts[dbKey] || 0;

            return (
              <div
                key={store.id}
                className={`transition-all duration-700 ${
                  isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'
                }`}
                style={{
                  transitionDelay: `${200 + index * 100}ms`,
                }}
              >
                <div className="bg-card hover:bg-[#1A1A1E] border border-border rounded-xl p-5 relative overflow-hidden transition-all duration-300 hover:border-accent/40 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/30 group h-full">
                  {/* Accent bar */}
                  <div
                    className="absolute top-0 left-0 right-0 h-1 transition-all duration-300 group-hover:h-1.5"
                    style={{ backgroundColor: store.accentColor }}
                  />

                  {/* Logo */}
                  <div className="flex justify-center mb-4 transition-transform duration-300 group-hover:scale-110">
                    {getStoreLogo(store.id, 56)}
                  </div>

                  {/* Store name */}
                  <h3 className="font-bold text-white text-center mb-1.5">{store.name}</h3>

                  {/* Brands */}
                  <p className="text-xs text-gray-500 text-center mb-3 leading-relaxed">
                    {store.brands.join(', ')}
                  </p>

                  {/* Color count */}
                  <div className="text-center">
                    <span className="inline-flex items-center gap-1.5 bg-background px-3 py-1 rounded-full text-xs border border-border">
                      <span className="font-mono text-accent font-bold">{colorCount.toLocaleString()}</span>
                      <span className="text-gray-500">colors</span>
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Location prompt */}
        <div
          className={`transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
          style={{ transitionDelay: '1000ms' }}
        >
          <div className="max-w-lg mx-auto">
            <div className="bg-card border border-border rounded-2xl p-6 text-center relative overflow-hidden">
              {/* Gradient background */}
              <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent" />

              <div className="relative z-10">
                {/* Location pin */}
                <div className="inline-flex items-center justify-center w-14 h-14 bg-accent/10 border border-accent/20 rounded-full mb-4">
                  <svg className="w-7 h-7 text-accent" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                </div>

                <p className="text-gray-400 text-sm">
                  We use your location to show nearby stores so you know
                  <span className="text-white font-medium"> exactly where to buy</span> your match.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
