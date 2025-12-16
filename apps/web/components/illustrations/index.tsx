"use client";

// Humaaans-style vector illustrations
// Minimalist, modern, customizable colors

type IllustrationProps = {
  className?: string;
  primaryColor?: string;
  secondaryColor?: string;
  skinTone?: string;
};

// Person writing/taking notes - half body floating
export function WritingPerson({ 
  className = "w-48 h-48",
  primaryColor = "var(--color-primary)",
  secondaryColor = "var(--color-secondary)",
  skinTone = "#FFDBAC"
}: IllustrationProps) {
  return (
    <svg viewBox="0 0 200 200" className={className} fill="none">
      {/* Body - floating torso */}
      <ellipse cx="100" cy="145" rx="30" ry="38" fill={primaryColor} />
      
      {/* Collar/neckline */}
      <path d="M85 115 Q100 125 115 115" stroke={primaryColor} strokeWidth="6" fill="none" opacity="0.6" />
      
      {/* Head */}
      <circle cx="100" cy="75" r="28" fill={skinTone} />
      
      {/* Hair - messy/modern */}
      <path d="M72 65 Q70 45 88 38 Q100 32 112 38 Q130 45 128 65" fill="#2D2016" />
      <path d="M72 65 Q78 55 92 60 Q98 50 108 58 Q118 52 122 60 Q128 55 128 65" fill="#2D2016" />
      <ellipse cx="75" cy="70" rx="5" ry="7" fill="#2D2016" />
      <ellipse cx="125" cy="70" rx="5" ry="7" fill="#2D2016" />
      
      {/* Ears */}
      <ellipse cx="72" cy="75" rx="4" ry="6" fill={skinTone} />
      <ellipse cx="128" cy="75" rx="4" ry="6" fill={skinTone} />
      
      {/* Face - focused expression */}
      <ellipse cx="90" cy="72" rx="3" ry="2.5" fill="#333" />
      <ellipse cx="110" cy="72" rx="3" ry="2.5" fill="#333" />
      {/* Eyebrows - focused */}
      <path d="M84 65 L93 67" stroke="#2D2016" strokeWidth="2" strokeLinecap="round" />
      <path d="M107 67 L116 65" stroke="#2D2016" strokeWidth="2" strokeLinecap="round" />
      {/* Slight smile */}
      <path d="M94 88 Q100 92 106 88" stroke="#333" strokeWidth="2" fill="none" strokeLinecap="round" />
      
      {/* Left arm holding notebook */}
      <path d="M70 130 Q45 135 38 155" stroke={skinTone} strokeWidth="12" strokeLinecap="round" />
      {/* Hand */}
      <circle cx="36" cy="158" r="8" fill={skinTone} />
      
      {/* Right arm writing */}
      <path d="M130 130 Q155 140 162 160" stroke={skinTone} strokeWidth="12" strokeLinecap="round" />
      {/* Hand */}
      <circle cx="164" cy="163" r="8" fill={skinTone} />
      
      {/* Floating notebook */}
      <g transform="rotate(-8 55 160)">
        <rect x="20" y="140" width="50" height="60" rx="3" fill="white" />
        <rect x="20" y="140" width="50" height="60" rx="3" stroke={secondaryColor} strokeWidth="2" fill="none" />
        {/* Spiral binding */}
        <circle cx="25" cy="150" r="2" fill={secondaryColor} />
        <circle cx="25" cy="162" r="2" fill={secondaryColor} />
        <circle cx="25" cy="174" r="2" fill={secondaryColor} />
        <circle cx="25" cy="186" r="2" fill={secondaryColor} />
        {/* Lines */}
        <line x1="32" y1="152" x2="62" y2="152" stroke={primaryColor} strokeWidth="2" opacity="0.4" />
        <line x1="32" y1="162" x2="58" y2="162" stroke={primaryColor} strokeWidth="2" opacity="0.4" />
        <line x1="32" y1="172" x2="60" y2="172" stroke={primaryColor} strokeWidth="2" opacity="0.4" />
      </g>
      
      {/* Pen */}
      <rect x="160" y="152" width="4" height="22" rx="1" fill={primaryColor} transform="rotate(30 162 163)" />
      <polygon points="161,176 163,176 162,182" fill="#333" transform="rotate(30 162 179)" />
      
      {/* Sparkles - creativity */}
      <g fill={primaryColor}>
        <circle cx="170" cy="100" r="3" opacity="0.6" />
        <circle cx="178" cy="120" r="2" opacity="0.4" />
        <circle cx="30" cy="110" r="2.5" opacity="0.5" />
      </g>
      
      {/* Floating elements */}
      <g fill={secondaryColor} opacity="0.3">
        <rect x="165" y="75" width="8" height="8" rx="1" transform="rotate(15 169 79)" />
        <circle cx="25" cy="85" r="4" />
      </g>
    </svg>
  );
}

// Person watching video/learning
export function WatchingPerson({
  className = "w-48 h-48",
  primaryColor = "var(--color-primary)",
  secondaryColor = "var(--color-secondary)",
  skinTone = "#E8B89D"
}: IllustrationProps) {
  return (
    <svg viewBox="0 0 200 200" className={className} fill="none">
      {/* Couch/Chair */}
      <path d="M30 150 Q30 130 50 130 L150 130 Q170 130 170 150 L170 170 L30 170 Z" fill={secondaryColor} opacity="0.3" />
      <rect x="25" y="145" width="15" height="35" rx="4" fill={secondaryColor} opacity="0.4" />
      <rect x="160" y="145" width="15" height="35" rx="4" fill={secondaryColor} opacity="0.4" />
      
      {/* Body sitting */}
      <ellipse cx="100" cy="125" rx="28" ry="25" fill={primaryColor} />
      
      {/* Legs */}
      <rect x="75" y="140" width="15" height="30" rx="4" fill={primaryColor} opacity="0.8" />
      <rect x="110" y="140" width="15" height="30" rx="4" fill={primaryColor} opacity="0.8" />
      
      {/* Head */}
      <circle cx="100" cy="75" r="24" fill={skinTone} />
      
      {/* Hair - curly */}
      <circle cx="85" cy="58" r="8" fill="#2D1B12" />
      <circle cx="100" cy="52" r="9" fill="#2D1B12" />
      <circle cx="115" cy="58" r="8" fill="#2D1B12" />
      <circle cx="80" cy="68" r="6" fill="#2D1B12" />
      <circle cx="120" cy="68" r="6" fill="#2D1B12" />
      
      {/* Face */}
      <circle cx="92" cy="72" r="2.5" fill="#333" />
      <circle cx="108" cy="72" r="2.5" fill="#333" />
      <path d="M95 85 Q100 89 105 85" stroke="#333" strokeWidth="2" fill="none" strokeLinecap="round" />
      
      {/* Arms holding tablet */}
      <path d="M72 110 Q55 115 60 130" stroke={skinTone} strokeWidth="10" strokeLinecap="round" />
      <path d="M128 110 Q145 115 140 130" stroke={skinTone} strokeWidth="10" strokeLinecap="round" />
      
      {/* Tablet/Screen */}
      <rect x="55" y="105" width="45" height="35" rx="3" fill="#1a1a1a" />
      <rect x="58" y="108" width="39" height="26" rx="2" fill="#333" />
      {/* Play button on screen */}
      <polygon points="72,118 72,128 82,123" fill="white" opacity="0.8" />
      
      {/* Coffee cup nearby */}
      <ellipse cx="155" cy="155" rx="8" ry="3" fill={primaryColor} opacity="0.3" />
      <path d="M147 155 L149 140 L161 140 L163 155" fill="white" stroke={primaryColor} strokeWidth="1.5" />
      <path d="M163 145 Q170 145 170 150 Q170 155 163 155" stroke={primaryColor} strokeWidth="1.5" fill="none" />
    </svg>
  );
}

// Person with lightbulb/idea
export function IdeaPerson({
  className = "w-48 h-48",
  primaryColor = "var(--color-primary)",
  secondaryColor = "var(--color-secondary)",
  skinTone = "#C68642"
}: IllustrationProps) {
  return (
    <svg viewBox="0 0 200 200" className={className} fill="none">
      {/* Body */}
      <ellipse cx="100" cy="145" rx="30" ry="35" fill={primaryColor} />
      
      {/* Head */}
      <circle cx="100" cy="85" r="28" fill={skinTone} />
      
      {/* Hair - short */}
      <path d="M72 75 Q72 55 100 50 Q128 55 128 75 Q130 65 125 80 L75 80 Q70 65 72 75" fill="#1a1a1a" />
      
      {/* Face */}
      <circle cx="90" cy="82" r="3" fill="#333" />
      <circle cx="110" cy="82" r="3" fill="#333" />
      <path d="M92 98 Q100 104 108 98" stroke="#333" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      
      {/* Arm raised */}
      <path d="M130 130 Q155 110 150 80" stroke={skinTone} strokeWidth="12" strokeLinecap="round" />
      
      {/* Hand */}
      <circle cx="150" cy="75" r="8" fill={skinTone} />
      
      {/* Lightbulb */}
      <ellipse cx="150" cy="45" rx="15" ry="18" fill={primaryColor} opacity="0.2" />
      <ellipse cx="150" cy="45" rx="12" ry="15" fill={primaryColor} opacity="0.4" />
      <path d="M145 58 L145 65 L155 65 L155 58" fill={primaryColor} />
      <rect x="144" y="65" width="12" height="4" rx="1" fill={primaryColor} opacity="0.8" />
      
      {/* Light rays */}
      <line x1="150" y1="20" x2="150" y2="12" stroke={primaryColor} strokeWidth="2" strokeLinecap="round" />
      <line x1="130" y1="35" x2="122" y2="30" stroke={primaryColor} strokeWidth="2" strokeLinecap="round" />
      <line x1="170" y1="35" x2="178" y2="30" stroke={primaryColor} strokeWidth="2" strokeLinecap="round" />
      <line x1="125" y1="50" x2="118" y2="50" stroke={primaryColor} strokeWidth="2" strokeLinecap="round" />
      <line x1="175" y1="50" x2="182" y2="50" stroke={primaryColor} strokeWidth="2" strokeLinecap="round" />
      
      {/* Other arm relaxed */}
      <path d="M70 130 Q50 140 55 160" stroke={skinTone} strokeWidth="12" strokeLinecap="round" />
      
      {/* Sparkles */}
      <circle cx="45" cy="60" r="3" fill={secondaryColor} />
      <circle cx="165" cy="90" r="2" fill={secondaryColor} />
      <circle cx="55" cy="100" r="2" fill={primaryColor} />
    </svg>
  );
}

// Person organizing/folders
export function OrganizingPerson({
  className = "w-48 h-48",
  primaryColor = "var(--color-primary)",
  secondaryColor = "var(--color-secondary)",
  skinTone = "#F5D0C5"
}: IllustrationProps) {
  return (
    <svg viewBox="0 0 200 200" className={className} fill="none">
      {/* Floating folders */}
      <g transform="translate(30, 40)">
        <rect x="0" y="0" width="35" height="28" rx="2" fill={primaryColor} opacity="0.3" />
        <rect x="0" y="0" width="15" height="6" rx="1" fill={primaryColor} opacity="0.5" />
      </g>
      <g transform="translate(140, 50)">
        <rect x="0" y="0" width="35" height="28" rx="2" fill={secondaryColor} opacity="0.3" />
        <rect x="0" y="0" width="15" height="6" rx="1" fill={secondaryColor} opacity="0.5" />
      </g>
      <g transform="translate(50, 90)">
        <rect x="0" y="0" width="35" height="28" rx="2" fill={primaryColor} opacity="0.2" />
        <rect x="0" y="0" width="15" height="6" rx="1" fill={primaryColor} opacity="0.4" />
      </g>
      
      {/* Body */}
      <ellipse cx="110" cy="150" rx="28" ry="32" fill={secondaryColor} />
      
      {/* Head */}
      <circle cx="110" cy="95" r="25" fill={skinTone} />
      
      {/* Hair - ponytail */}
      <ellipse cx="110" cy="75" rx="22" ry="12" fill="#8B4513" />
      <circle cx="135" cy="70" r="10" fill="#8B4513" />
      <circle cx="145" cy="65" r="8" fill="#8B4513" />
      
      {/* Face */}
      <circle cx="102" cy="92" r="2.5" fill="#333" />
      <circle cx="118" cy="92" r="2.5" fill="#333" />
      <path d="M105 105 Q110 109 115 105" stroke="#333" strokeWidth="2" fill="none" strokeLinecap="round" />
      
      {/* Arms organizing */}
      <path d="M82 135 Q60 120 65 95" stroke={skinTone} strokeWidth="10" strokeLinecap="round" />
      <path d="M138 135 Q160 130 155 110" stroke={skinTone} strokeWidth="10" strokeLinecap="round" />
      
      {/* Folder being held */}
      <g transform="translate(130, 100) rotate(15)">
        <rect x="0" y="0" width="40" height="32" rx="2" fill={primaryColor} opacity="0.6" />
        <rect x="0" y="0" width="18" height="7" rx="1" fill={primaryColor} opacity="0.8" />
      </g>
      
      {/* Ground shadow */}
      <ellipse cx="110" cy="185" rx="40" ry="8" fill="#000" opacity="0.1" />
    </svg>
  );
}

// Empty state illustration - person looking at empty space
export function EmptyStateIllustration({
  className = "w-48 h-48",
  primaryColor = "var(--color-primary)",
  secondaryColor = "var(--color-secondary)",
  skinTone = "#FFDBAC"
}: IllustrationProps) {
  return (
    <svg viewBox="0 0 200 200" className={className} fill="none">
      {/* Empty box/container */}
      <rect x="90" y="100" width="80" height="60" rx="4" fill="none" stroke={primaryColor} strokeWidth="2" strokeDasharray="8 4" opacity="0.5" />
      
      {/* Question marks */}
      <text x="120" y="140" fontSize="24" fill={primaryColor} opacity="0.3" textAnchor="middle">?</text>
      <text x="145" y="125" fontSize="16" fill={secondaryColor} opacity="0.3">?</text>
      
      {/* Person */}
      <ellipse cx="55" cy="145" rx="22" ry="28" fill={primaryColor} />
      <circle cx="55" cy="95" r="22" fill={skinTone} />
      
      {/* Hair */}
      <path d="M33 85 Q35 65 55 62 Q75 65 77 85 Q80 75 75 90 L35 90 Q30 75 33 85" fill="#6B4423" />
      
      {/* Face - curious expression */}
      <circle cx="47" cy="92" r="2.5" fill="#333" />
      <circle cx="63" cy="92" r="2.5" fill="#333" />
      <ellipse cx="55" cy="105" rx="4" ry="3" fill="#333" opacity="0.3" />
      
      {/* Arm pointing/gesturing */}
      <path d="M77 130 Q100 115 95 105" stroke={skinTone} strokeWidth="10" strokeLinecap="round" />
      
      {/* Sparkle hints */}
      <circle cx="160" cy="90" r="3" fill={primaryColor} opacity="0.4" />
      <circle cx="175" cy="110" r="2" fill={secondaryColor} opacity="0.4" />
      <circle cx="85" cy="75" r="2" fill={primaryColor} opacity="0.4" />
    </svg>
  );
}

// Success celebration
export function SuccessIllustration({
  className = "w-48 h-48",
  primaryColor = "var(--color-primary)",
  secondaryColor = "var(--color-secondary)",
  skinTone = "#E8B89D"
}: IllustrationProps) {
  return (
    <svg viewBox="0 0 200 200" className={className} fill="none">
      {/* Confetti */}
      <rect x="30" y="40" width="8" height="8" rx="1" fill={primaryColor} opacity="0.6" transform="rotate(15 34 44)" />
      <rect x="160" y="50" width="6" height="6" rx="1" fill={secondaryColor} opacity="0.6" transform="rotate(-20 163 53)" />
      <circle cx="50" cy="70" r="4" fill={secondaryColor} opacity="0.5" />
      <circle cx="150" cy="35" r="3" fill={primaryColor} opacity="0.5" />
      <rect x="170" y="80" width="5" height="5" rx="1" fill={primaryColor} opacity="0.4" transform="rotate(30 172 82)" />
      <circle cx="25" y="100" r="3" fill={secondaryColor} opacity="0.4" />
      
      {/* Body - jumping pose */}
      <ellipse cx="100" cy="130" rx="25" ry="30" fill={primaryColor} />
      
      {/* Legs spread */}
      <path d="M85 150 Q70 170 65 180" stroke={primaryColor} strokeWidth="12" strokeLinecap="round" />
      <path d="M115 150 Q130 170 135 180" stroke={primaryColor} strokeWidth="12" strokeLinecap="round" />
      
      {/* Head */}
      <circle cx="100" cy="80" r="24" fill={skinTone} />
      
      {/* Hair */}
      <path d="M76 70 Q78 50 100 45 Q122 50 124 70 Q127 60 122 75 L78 75 Q73 60 76 70" fill="#4A3728" />
      
      {/* Happy face */}
      <path d="M90 75 Q88 72 92 75" stroke="#333" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M108 75 Q112 72 110 75" stroke="#333" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M88 90 Q100 100 112 90" stroke="#333" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      
      {/* Arms raised in celebration */}
      <path d="M75 115 Q50 90 45 60" stroke={skinTone} strokeWidth="10" strokeLinecap="round" />
      <path d="M125 115 Q150 90 155 60" stroke={skinTone} strokeWidth="10" strokeLinecap="round" />
      
      {/* Hands */}
      <circle cx="45" cy="55" r="8" fill={skinTone} />
      <circle cx="155" cy="55" r="8" fill={skinTone} />
      
      {/* Stars near hands */}
      <polygon points="35,45 37,40 39,45 44,45 40,48 42,53 37,50 32,53 34,48 30,45" fill={primaryColor} />
      <polygon points="160,40 162,35 164,40 169,40 165,43 167,48 162,45 157,48 159,43 155,40" fill={secondaryColor} />
    </svg>
  );
}

