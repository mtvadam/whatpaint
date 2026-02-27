'use client';

import { useEffect, useState } from 'react';

export function ScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const updateProgress = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrolled = window.scrollY;
      const progress = (scrolled / scrollHeight) * 100;
      setProgress(Math.min(progress, 100));
    };

    window.addEventListener('scroll', updateProgress);
    updateProgress();

    return () => window.removeEventListener('scroll', updateProgress);
  }, []);

  return (
    <div className="fixed left-0 top-0 bottom-0 w-1 bg-border z-50 hidden lg:block">
      <div
        className="w-full bg-accent transition-all duration-100"
        style={{ height: `${progress}%` }}
      />
    </div>
  );
}
