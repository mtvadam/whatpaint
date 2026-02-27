# WhatPaint

A full-stack paint color detection web app that uses your webcam or uploaded photos to match colors against real paint brand databases. Powered by the CIEDE2000 color difference algorithm for scientifically accurate color matching.

## Features

- 🎨 **Live Camera Detection** - Point your webcam at any surface and sample colors in real-time
- 📸 **Photo Upload** - Upload photos and click to sample colors
- #️⃣ **Manual Hex Input** - Enter hex codes directly
- 🔬 **CIEDE2000 Algorithm** - Gold standard perceptual color difference calculation
- 🏪 **7 Major Paint Stores** - Home Depot, Lowe's, Sherwin-Williams, Benjamin Moore, Ace Hardware, Walmart, Menards
- 🎯 **200+ Real Paint Colors** - Accurate hex values from actual paint brands
- 💡 **White Balance Correction** - Adjust for different lighting conditions
- 📊 **Detailed Color Data** - LRV values, RGB, LAB, HSL, ΔE scores
- 🎭 **Coordinating Colors** - See colors that pair well together

## Tech Stack

- **Next.js 14+** with App Router
- **TypeScript** throughout
- **Tailwind CSS** for styling
- **Client-side color science** - No backend needed

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## How It Works

1. **Location** - Enter your location to see nearby paint stores (UX only - all stores shown)
2. **Store Selection** - Choose which stores to search
3. **Detection** - Use camera, upload photo, or enter hex code
4. **Results** - See top 8 matches ranked by CIEDE2000 ΔE distance

## Color Science

The app implements the CIEDE2000 color difference formula from scratch:
- sRGB → Linear RGB (gamma decoding)
- Linear RGB → XYZ (D65 illuminant)
- XYZ → CIE L*a*b*
- Full CIEDE2000 ΔE calculation

Confidence scores: `confidence = max(0, min(100, 100 - ΔE * 3.2))`

### ΔE Interpretation
- **0-1.0** - Imperceptible (exact match)
- **1.0-2.0** - Slight difference (acceptable)
- **2.0-3.5** - Noticeable if side by side
- **3.5-5.0** - Significant difference
- **5.0+** - Wrong color

## Paint Brands Included

- **Behr** (Home Depot) - 40+ colors
- **Sherwin-Williams** - 35+ colors
- **Benjamin Moore** - 30+ colors
- **Valspar** (Lowe's) - 20+ colors
- **Glidden/PPG** - 20+ colors
- **Clark+Kensington** (Ace) - 15+ colors
- **Dutch Boy** (Menards) - 10+ colors
- **ColorPlace** (Walmart) - 10+ colors

## Camera Features

- 25-point grid sampling with outlier rejection
- Multiple sample points (keeps last 5)
- Resolution and FPS display
- White balance presets (Daylight, Tungsten, Fluorescent)
- Freeze frame functionality

## Project Structure

```
/app                - Next.js App Router pages
/components         - React components
  /landing          - Landing page components
  /location         - Location prompt
  /stores           - Store selection
  /detect           - Detection UI (camera, upload, hex)
  /ui               - Reusable UI components
/lib                - Core logic
  /color-science.ts - CIEDE2000 implementation
  /sampling.ts      - Image sampling & outlier rejection
  /geolocation.ts   - Location utilities
/data               - Paint color & store databases
/types              - TypeScript definitions
```

## Development Notes

- All color matching runs client-side
- Camera works in Safari (MacBook) and Chrome
- Responsive design - mobile friendly
- Dark theme optimized (#0A0A0D background)
- Accent color: #E8754A (warm orange)

## Future Enhancements

- Real store locator API integration
- Export color palettes
- Color history/favorites
- AR camera overlay
- More paint brands
- Sheen/finish selection

## License

MIT

---

Built with ❤️ using Next.js, TypeScript, and Tailwind CSS
