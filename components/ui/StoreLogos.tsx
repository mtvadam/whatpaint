import React from 'react';

type LogoProps = {
  size?: number;
  className?: string;
};

export function HomeDepotLogo({ size = 48, className = '' }: LogoProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" className={className}>
      <rect x="2" y="2" width="44" height="44" rx="4" fill="#F96302" />
      <text
        x="24"
        y="18"
        fill="#FFFFFF"
        fontSize="7"
        fontWeight="900"
        textAnchor="middle"
        fontFamily="Arial, sans-serif"
        letterSpacing="0.5"
      >
        THE HOME
      </text>
      <text
        x="24"
        y="33"
        fill="#FFFFFF"
        fontSize="11"
        fontWeight="900"
        textAnchor="middle"
        fontFamily="Arial, sans-serif"
        letterSpacing="1"
      >
        DEPOT
      </text>
    </svg>
  );
}

export function LowesLogo({ size = 48, className = '' }: LogoProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" className={className}>
      {/* House shape */}
      <path d="M4 22 L24 4 L44 22 L44 44 L4 44 Z" fill="#004792" rx="2" />
      <text
        x="24"
        y="36"
        fill="#FFFFFF"
        fontSize="11"
        fontWeight="700"
        textAnchor="middle"
        fontFamily="Arial, sans-serif"
      >
        Lowe's
      </text>
    </svg>
  );
}

export function SherwinWilliamsLogo({ size = 48, className = '' }: LogoProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" className={className}>
      {/* Globe */}
      <circle cx="24" cy="26" r="16" fill="#FFFFFF" stroke="#0067B1" strokeWidth="1.5" />
      {/* Continent shapes simplified */}
      <ellipse cx="20" cy="22" rx="6" ry="8" fill="#0067B1" opacity="0.6" />
      <ellipse cx="30" cy="28" rx="4" ry="6" fill="#0067B1" opacity="0.6" />
      {/* Paint drip covering top */}
      <path d="M8 18 Q12 8 24 6 Q36 4 42 14 L42 20 Q38 26 32 22 Q26 18 20 22 Q14 26 8 22 Z" fill="#EF4135" />
      {/* Paint can */}
      <rect x="32" y="2" width="10" height="8" rx="1" fill="#EF4135" />
      <rect x="34" y="0" width="6" height="3" rx="1" fill="#C5302A" />
    </svg>
  );
}

export function BenjaminMooreLogo({ size = 48, className = '' }: LogoProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" className={className}>
      {/* Red triangle */}
      <polygon points="24,4 44,40 4,40" fill="#CD163F" />
      {/* White M */}
      <text
        x="24"
        y="36"
        fill="#FFFFFF"
        fontSize="18"
        fontWeight="900"
        textAnchor="middle"
        fontFamily="serif"
      >
        M
      </text>
    </svg>
  );
}

export function AceHardwareLogo({ size = 48, className = '' }: LogoProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" className={className}>
      <rect x="2" y="8" width="44" height="32" rx="4" fill="#E82D34" />
      <text
        x="24"
        y="30"
        fill="#FFFFFF"
        fontSize="16"
        fontWeight="900"
        textAnchor="middle"
        fontFamily="Arial, sans-serif"
        letterSpacing="2"
      >
        ACE
      </text>
    </svg>
  );
}

export function WalmartLogo({ size = 48, className = '' }: LogoProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" className={className}>
      {/* Spark / sunburst - 6 petals */}
      {[0, 60, 120, 180, 240, 300].map((angle) => (
        <ellipse
          key={angle}
          cx="24"
          cy="12"
          rx="3"
          ry="10"
          fill="#FFC220"
          transform={`rotate(${angle} 24 24)`}
        />
      ))}
      {/* Center circle */}
      <circle cx="24" cy="24" r="4" fill="#FFC220" />
    </svg>
  );
}

export function MenardsLogo({ size = 48, className = '' }: LogoProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" className={className}>
      {/* House/pentagon shape */}
      <path d="M4 22 L24 6 L44 22 L44 42 L4 42 Z" fill="#008938" />
      <text
        x="24"
        y="36"
        fill="#FFFFFF"
        fontSize="8"
        fontWeight="900"
        textAnchor="middle"
        fontFamily="Arial, sans-serif"
        letterSpacing="1"
      >
        MENARDS
      </text>
      {/* Color stripes below */}
      <rect x="4" y="42" width="40" height="2" fill="#000000" />
      <rect x="4" y="44" width="40" height="2" fill="#FFD200" />
      <rect x="4" y="46" width="40" height="2" fill="#E32227" />
    </svg>
  );
}

export function FarrowBallLogo({ size = 48, className = '' }: LogoProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" className={className}>
      <rect x="2" y="2" width="44" height="44" rx="4" fill="#1A1A1A" />
      <text
        x="24"
        y="20"
        fill="#C8B68E"
        fontSize="8"
        fontWeight="700"
        textAnchor="middle"
        fontFamily="Georgia, serif"
        letterSpacing="1"
      >
        FARROW
      </text>
      <text
        x="24"
        y="28"
        fill="#C8B68E"
        fontSize="5"
        textAnchor="middle"
        fontFamily="Georgia, serif"
      >
        &amp;
      </text>
      <text
        x="24"
        y="38"
        fill="#C8B68E"
        fontSize="8"
        fontWeight="700"
        textAnchor="middle"
        fontFamily="Georgia, serif"
        letterSpacing="1"
      >
        BALL
      </text>
    </svg>
  );
}

export function getStoreLogo(storeId: string, size?: number) {
  const props = { size: size || 48 };
  switch (storeId) {
    case 'home-depot': return <HomeDepotLogo {...props} />;
    case 'lowes': return <LowesLogo {...props} />;
    case 'sherwin-williams': return <SherwinWilliamsLogo {...props} />;
    case 'benjamin-moore': return <BenjaminMooreLogo {...props} />;
    case 'ace-hardware': return <AceHardwareLogo {...props} />;
    case 'walmart': return <WalmartLogo {...props} />;
    case 'menards': return <MenardsLogo {...props} />;
    case 'farrow-ball': return <FarrowBallLogo {...props} />;
    default: return null;
  }
}
