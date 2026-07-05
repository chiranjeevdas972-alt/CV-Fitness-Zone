import React from 'react';

export interface CVidyaLogoProps extends React.SVGProps<SVGSVGElement> {
  variant?: 'original' | 'gold' | 'dark' | 'light' | 'animated';
  showText?: boolean;
}

export function CVidyaLogo({
  variant = 'original',
  showText = true,
  width = '100%',
  height = '100%',
  ...props
}: CVidyaLogoProps) {
  // Define color schemes based on variant
  const isGold = variant === 'gold';
  const isDark = variant === 'dark';
  const isLight = variant === 'light';
  const isAnimated = variant === 'animated';

  // CSS variables or direct colors
  const gradientId = `cvidya-grad-${variant}`;
  const highlightGradId = `cvidya-highlight-${variant}`;
  const glowId = `cvidya-glow-${variant}`;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1000 750"
      width={width}
      height={height}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="C Vidya Solutions Logo"
      className={isAnimated ? "animate-pulse" : ""}
      {...props}
    >
      <title>C Vidya Solutions Logo</title>
      <desc>A highly polished, modern, pixel-perfect recreated SVG vector logo for C Vidya Solutions featuring a double right-pointing chevron and elegant geometric typography.</desc>

      <defs>
        {/* Original Blue Gradient */}
        {variant === 'original' && (
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2563EB" />
            <stop offset="40%" stopColor="#1D4ED8" />
            <stop offset="70%" stopColor="#1E40AF" />
            <stop offset="100%" stopColor="#1E3A8A" />
          </linearGradient>
        )}

        {/* Premium Gold Metallic Gradient */}
        {variant === 'gold' && (
          <linearGradient id={gradientId} x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#9A7B36" />
            <stop offset="15%" stopColor="#CBA34E" />
            <stop offset="30%" stopColor="#F7E5A9" />
            <stop offset="45%" stopColor="#D8B45F" />
            <stop offset="60%" stopColor="#9A7B36" />
            <stop offset="75%" stopColor="#F7E5A9" />
            <stop offset="90%" stopColor="#D8B45F" />
            <stop offset="100%" stopColor="#7B5F24" />
          </linearGradient>
        )}

        {/* Dark Mode Gradient */}
        {variant === 'dark' && (
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#60A5FA" />
            <stop offset="50%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#1D4ED8" />
          </linearGradient>
        )}

        {/* Light Mode Gradient */}
        {variant === 'light' && (
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1D4ED8" />
            <stop offset="50%" stopColor="#1E40AF" />
            <stop offset="100%" stopColor="#172554" />
          </linearGradient>
        )}

        {/* Animated Gradient */}
        {variant === 'animated' && (
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3B82F6">
              <animate attributeName="stop-color" values="#3B82F6;#1D4ED8;#8B5CF6;#3B82F6" dur="6s" repeatCount="indefinite" />
            </stop>
            <stop offset="50%" stopColor="#1D4ED8">
              <animate attributeName="stop-color" values="#1D4ED8;#8B5CF6;#3B82F6;#1D4ED8" dur="6s" repeatCount="indefinite" />
            </stop>
            <stop offset="100%" stopColor="#172554">
              <animate attributeName="stop-color" values="#172554;#1E40AF;#1D4ED8;#172554" dur="6s" repeatCount="indefinite" />
            </stop>
          </linearGradient>
        )}

        {/* Specular Highlight / Shine Gradient */}
        <linearGradient id={highlightGradId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity={isGold ? "0.6" : "0.4"} />
          <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.25" />
        </linearGradient>

        {/* Drop Shadow and Outer Glow Filters */}
        <filter id={glowId} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation={isGold ? "8" : "12"} result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* BACKGROUND GRAPHIC (Subtle Warm/Cold Radial Ambience, optional) */}
      <g id="AmbientGlow" opacity="0.15">
        <circle cx="500" cy="300" r="400" fill={isGold ? "url(#cvidya-grad-gold)" : "url(#cvidya-grad-original)"} filter={`url(#${glowId})`} />
      </g>

      {/* ================================================== */}
      {/* 1. MAIN VECTOR ICON - CHEVRONS & INNER WEDGES      */}
      {/* ================================================== */}
      <g id="LogoMark" filter={isGold ? `url(#${glowId})` : ""}>
        {/* Shadow Layer for Depth / Emboss effect */}
        <g id="Shadows" opacity="0.15" transform="translate(2, 6)">
          <path d="M 320,80 L 620,300 L 480,300 L 320,183 Z" fill="#000000" />
          <path d="M 320,450 L 320,350 L 510,210 L 510,310 Z" fill="#000000" />
          <path d="M 320,520 L 320,490 L 410,424 L 430,440 Z" fill="#000000" />
        </g>

        {/* Core Solid Blue / Gold Metallic Base Paths */}
        <g id="BaseShapes" fill={`url(#${gradientId})`}>
          {/* Top Main Arm Chevron */}
          <path id="TopArm" d="M 320,80 L 620,300 L 480,300 L 320,183 Z">
            {isAnimated && (
              <animateTransform
                attributeName="transform"
                type="translate"
                values="0,0; 5,-3; 0,0"
                dur="4s"
                repeatCount="indefinite"
                additive="sum"
              />
            )}
          </path>

          {/* Middle Inner Block (Parallel to Bottom Edge) */}
          <path id="MiddleBlock" d="M 320,450 L 320,350 L 510,210 L 510,310 Z">
            {isAnimated && (
              <animateTransform
                attributeName="transform"
                type="translate"
                values="0,0; -3,3; 0,0"
                dur="4s"
                repeatCount="indefinite"
                additive="sum"
              />
            )}
          </path>

          {/* Bottom Outer Tapered Wedge */}
          <path id="BottomWedge" d="M 320,520 L 320,490 L 410,424 L 430,440 Z">
            {isAnimated && (
              <animateTransform
                attributeName="transform"
                type="translate"
                values="0,0; -5,5; 0,0"
                dur="4s"
                repeatCount="indefinite"
                additive="sum"
              />
            )}
          </path>
        </g>

        {/* 3D Highlight & Reflection Overlays (Provides Specular Metallic Shine) */}
        <g id="Highlights" fill={`url(#${highlightGradId})`} style={{ mixBlendMode: 'overlay' }}>
          <path d="M 320,80 L 620,300 L 480,300 L 320,183 Z" />
          <path d="M 320,450 L 320,350 L 510,210 L 510,310 Z" />
          <path d="M 320,520 L 320,490 L 410,424 L 430,440 Z" />
        </g>
      </g>

      {/* ================================================== */}
      {/* 2. TYPOGRAPHY & BRAND TEXT - "C VIDYA SOLUTIONS"   */}
      {/* ================================================== */}
      {showText && (
        <g id="BrandTypography" fill={isGold ? "url(#cvidya-grad-gold)" : (isDark ? "#F8FAFC" : "#0A192F")}>
          {/* Main Title: "C VIDYA" */}
          <g id="CVidyaText">
            {/* C */}
            <path d="M 230,450 C 190,450 170,480 170,520 C 170,560 190,590 230,590 C 260,590 275,570 275,545 L 255,545 C 255,560 245,572 230,572 C 205,572 191,550 191,520 C 191,490 205,468 230,468 C 245,468 255,480 255,495 L 275,495 C 275,470 260,450 230,450 Z" />
            
            {/* V */}
            <path d="M 310,452 L 345,588 L 355,588 L 390,452 L 370,452 L 350,545 L 330,452 Z" />
            
            {/* I */}
            <path d="M 420,452 L 440,452 L 440,588 L 420,588 Z" />
            
            {/* D */}
            <path d="M 470,452 L 520,452 C 555,452 570,475 570,520 C 570,565 555,588 520,588 L 470,588 Z M 490,472 L 520,472 C 540,472 550,485 550,520 C 550,555 540,568 520,568 L 490,568 Z" />
            
            {/* Y */}
            <path d="M 595,452 L 635,520 L 635,588 L 655,588 L 655,520 L 695,452 L 675,452 L 645,505 L 615,452 Z" />
            
            {/* A */}
            <path d="M 710,588 L 750,452 L 760,452 L 800,588 L 778,588 L 770,555 L 740,555 L 732,588 Z M 745,535 L 765,535 L 755,490 Z" />
          </g>

          {/* Subtitle Section: "— SOLUTIONS —" */}
          <g id="SolutionsGroup" opacity="0.95" transform="translate(0, 5)">
            {/* Left Decorative Line */}
            <line x1="210" y1="645" x2="310" y2="645" stroke={isGold ? "url(#cvidya-grad-gold)" : (isDark ? "#94A3B8" : "#1E293B")} strokeWidth="4" strokeLinecap="round" />

            {/* S */}
            <path d="M 370,630 L 350,630 L 350,643 L 366,645 L 366,654 L 350,654 L 350,660 L 370,660 L 370,647 L 354,645 L 354,636 L 370,636 Z" />
            
            {/* O */}
            <path d="M 385,635 A 5,5 0 0,1 390,630 L 400,630 A 5,5 0 0,1 405,635 L 405,655 A 5,5 0 0,1 400,660 L 390,660 A 5,5 0 0,1 385,655 Z M 391,637 A 2,2 0 0,1 393,635 L 397,635 A 2,2 0 0,1 399,637 L 399,653 A 2,2 0 0,1 397,655 L 393,655 A 2,2 0 0,1 391,653 Z" />
            
            {/* L */}
            <path d="M 420,630 L 426,630 L 426,654 L 440,654 L 440,660 L 420,660 Z" />
            
            {/* U */}
            <path d="M 455,630 L 461,630 L 461,652 A 3,3 0 0,0 464,655 L 466,655 A 3,3 0 0,0 469,652 L 469,630 L 475,630 L 475,652 A 9,9 0 0,1 466,660 L 464,660 A 9,9 0 0,1 455,652 Z" />
            
            {/* T */}
            <path d="M 490,630 L 510,630 L 510,636 L 503,636 L 503,660 L 497,660 L 497,636 L 490,636 Z" />
            
            {/* I */}
            <path d="M 528,630 L 538,630 L 538,660 L 528,660 Z" />
            
            {/* O */}
            <path d="M 560,635 A 5,5 0 0,1 565,630 L 575,630 A 5,5 0 0,1 580,635 L 580,655 A 5,5 0 0,1 575,660 L 565,660 A 5,5 0 0,1 560,655 Z M 566,637 A 2,2 0 0,1 568,635 L 572,635 A 2,2 0 0,1 574,637 L 574,653 A 2,2 0 0,1 572,655 L 568,655 A 2,2 0 0,1 566,653 Z" />
            
            {/* N */}
            <path d="M 595,630 L 601,630 L 610,648 L 610,630 L 615,630 L 615,660 L 609,660 L 600,642 L 600,660 L 595,660 Z" />
            
            {/* S */}
            <path d="M 650,630 L 630,630 L 630,643 L 646,645 L 646,654 L 630,654 L 630,660 L 650,660 L 650,647 L 634,645 L 634,636 L 650,636 Z" />

            {/* Right Decorative Line */}
            <line x1="680" y1="645" x2="780" y2="645" stroke={isGold ? "url(#cvidya-grad-gold)" : (isDark ? "#94A3B8" : "#1E293B")} strokeWidth="4" strokeLinecap="round" />
          </g>
        </g>
      )}
    </svg>
  );
}
