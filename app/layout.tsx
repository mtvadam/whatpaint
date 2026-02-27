import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'WhatPaint - Find Your Exact Paint Color',
  description: 'Use your camera to match any wall color to paint brands from stores near you. Powered by CIEDE2000 color science.',
  keywords: 'paint color, color matching, paint finder, CIEDE2000, Behr, Sherwin-Williams, Benjamin Moore',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
