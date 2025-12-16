"use client";

// Humaaans-style vector illustrations
// Minimalist, modern, customizable colors
// All 4 main illustrations: half-body floating with consistent shadow

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
      {/* Shadow */}
      <ellipse cx="100" cy="188" rx="35" ry="8" fill="#000" opacity="0.08" />
      
      {/* Body - floating torso */}
      <ellipse cx="100" cy="145" rx="30" ry="38" fill={primaryColor} />
      
      {/* Head */}
      <circle cx="100" cy="75" r="28" fill={skinTone} />
      
      {/* Hair - wavy */}
      <path d="M72 68 Q70 48 100 42 Q130 48 128 68 L128 75 Q120 70 100 70 Q80 70 72 75 Z" fill="#2D2016" />
      
      {/* Ears */}
      <ellipse cx="72" cy="75" rx="4" ry="6" fill={skinTone} />
      <ellipse cx="128" cy="75" rx="4" ry="6" fill={skinTone} />
      
      {/* Face */}
      <ellipse cx="88" cy="72" rx="3" ry="2.5" fill="#333" />
      <ellipse cx="112" cy="72" rx="3" ry="2.5" fill="#333" />
      <path d="M94 90 Q100 94 106 90" stroke="#333" strokeWidth="2" fill="none" strokeLinecap="round" />
      
      {/* Left arm holding notebook */}
      <path d="M70 130 Q45 135 38 155" stroke={skinTone} strokeWidth="12" strokeLinecap="round" />
      <circle cx="36" cy="158" r="8" fill={skinTone} />
      
      {/* Right arm writing */}
      <path d="M130 130 Q155 140 162 160" stroke={skinTone} strokeWidth="12" strokeLinecap="round" />
      <circle cx="164" cy="163" r="8" fill={skinTone} />
      
      {/* Floating notebook */}
      <g transform="rotate(-8 55 160)">
        <rect x="20" y="140" width="50" height="60" rx="3" fill="white" />
        <rect x="20" y="140" width="50" height="60" rx="3" stroke={secondaryColor} strokeWidth="2" fill="none" />
        <circle cx="25" cy="150" r="2" fill={secondaryColor} />
        <circle cx="25" cy="162" r="2" fill={secondaryColor} />
        <circle cx="25" cy="174" r="2" fill={secondaryColor} />
        <line x1="32" y1="152" x2="62" y2="152" stroke={primaryColor} strokeWidth="2" opacity="0.4" />
        <line x1="32" y1="162" x2="58" y2="162" stroke={primaryColor} strokeWidth="2" opacity="0.4" />
        <line x1="32" y1="172" x2="60" y2="172" stroke={primaryColor} strokeWidth="2" opacity="0.4" />
      </g>
      
      {/* Pen */}
      <rect x="160" y="152" width="4" height="22" rx="1" fill={primaryColor} transform="rotate(30 162 163)" />
      
      {/* Sparkles */}
      <circle cx="170" cy="100" r="3" fill={primaryColor} opacity="0.5" />
      <circle cx="30" cy="110" r="2.5" fill={secondaryColor} opacity="0.4" />
    </svg>
  );
}

// Person watching video/learning - half body floating
export function WatchingPerson({
  className = "w-48 h-48",
  primaryColor = "var(--color-primary)",
  secondaryColor = "var(--color-secondary)",
  skinTone = "#E8B89D"
}: IllustrationProps) {
  return (
    <svg viewBox="0 0 200 200" className={className} fill="none">
      {/* Shadow */}
      <ellipse cx="100" cy="188" rx="35" ry="8" fill="#000" opacity="0.08" />
      
      {/* Body - floating torso */}
      <ellipse cx="100" cy="145" rx="30" ry="38" fill={primaryColor} />
      
      {/* Head */}
      <circle cx="100" cy="75" r="28" fill={skinTone} />
      
      {/* Hair - curly (connected shape) */}
      <path d="M72 65 Q72 45 100 40 Q128 45 128 65 Q125 55 115 58 Q105 50 100 55 Q95 50 85 58 Q75 55 72 65 Z" fill="#2D1B12" />
      <ellipse cx="75" cy="68" rx="6" ry="8" fill="#2D1B12" />
      <ellipse cx="125" cy="68" rx="6" ry="8" fill="#2D1B12" />
      
      {/* Ears */}
      <ellipse cx="72" cy="78" rx="4" ry="6" fill={skinTone} />
      <ellipse cx="128" cy="78" rx="4" ry="6" fill={skinTone} />
      
      {/* Face */}
      <ellipse cx="88" cy="72" rx="3" ry="2.5" fill="#333" />
      <ellipse cx="112" cy="72" rx="3" ry="2.5" fill="#333" />
      <path d="M94 90 Q100 94 106 90" stroke="#333" strokeWidth="2" fill="none" strokeLinecap="round" />
      
      {/* Arms holding tablet */}
      <path d="M70 130 Q50 135 55 155" stroke={skinTone} strokeWidth="12" strokeLinecap="round" />
      <path d="M130 130 Q150 135 145 155" stroke={skinTone} strokeWidth="12" strokeLinecap="round" />
      
      {/* Tablet/Screen */}
      <rect x="60" y="135" width="50" height="38" rx="4" fill="#1a1a1a" />
      <rect x="63" y="138" width="44" height="29" rx="2" fill="#333" />
      <polygon points="80,148 80,160 92,154" fill="white" opacity="0.8" />
      
      {/* Sparkles */}
      <circle cx="165" cy="100" r="3" fill={primaryColor} opacity="0.5" />
      <circle cx="35" cy="115" r="2.5" fill={secondaryColor} opacity="0.4" />
    </svg>
  );
}

// Person with lightbulb/idea - half body floating
export function IdeaPerson({
  className = "w-48 h-48",
  primaryColor = "var(--color-primary)",
  secondaryColor = "var(--color-secondary)",
  skinTone = "#C68642"
}: IllustrationProps) {
  return (
    <svg viewBox="0 0 200 200" className={className} fill="none">
      {/* Shadow */}
      <ellipse cx="100" cy="188" rx="35" ry="8" fill="#000" opacity="0.08" />
      
      {/* Body - floating torso */}
      <ellipse cx="100" cy="145" rx="30" ry="38" fill={primaryColor} />
      
      {/* Head */}
      <circle cx="100" cy="75" r="28" fill={skinTone} />
      
      {/* Hair - short neat (single connected path) */}
      <path d="M72 70 Q70 50 100 44 Q130 50 128 70 Q128 60 120 62 Q110 55 100 58 Q90 55 80 62 Q72 60 72 70 Z" fill="#1a1a1a" />
      
      {/* Ears */}
      <ellipse cx="72" cy="78" rx="4" ry="6" fill={skinTone} />
      <ellipse cx="128" cy="78" rx="4" ry="6" fill={skinTone} />
      
      {/* Face */}
      <ellipse cx="88" cy="72" rx="3" ry="2.5" fill="#333" />
      <ellipse cx="112" cy="72" rx="3" ry="2.5" fill="#333" />
      <path d="M94 92 Q100 98 106 92" stroke="#333" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      
      {/* Left arm relaxed */}
      <path d="M70 130 Q50 145 52 165" stroke={skinTone} strokeWidth="12" strokeLinecap="round" />
      <circle cx="52" cy="168" r="8" fill={skinTone} />
      
      {/* Right arm raised */}
      <path d="M130 125 Q155 105 152 75" stroke={skinTone} strokeWidth="12" strokeLinecap="round" />
      <circle cx="152" cy="70" r="8" fill={skinTone} />
      
      {/* Lightbulb */}
      <ellipse cx="152" cy="42" rx="14" ry="17" fill={primaryColor} opacity="0.3" />
      <ellipse cx="152" cy="42" rx="10" ry="13" fill={primaryColor} opacity="0.5" />
      <rect x="147" y="55" width="10" height="6" rx="1" fill={primaryColor} />
      
      {/* Light rays */}
      <line x1="152" y1="18" x2="152" y2="10" stroke={primaryColor} strokeWidth="2" strokeLinecap="round" />
      <line x1="132" y1="32" x2="125" y2="27" stroke={primaryColor} strokeWidth="2" strokeLinecap="round" />
      <line x1="172" y1="32" x2="179" y2="27" stroke={primaryColor} strokeWidth="2" strokeLinecap="round" />
      
      {/* Sparkles */}
      <circle cx="40" cy="90" r="3" fill={secondaryColor} opacity="0.5" />
      <circle cx="175" cy="95" r="2" fill={primaryColor} opacity="0.4" />
    </svg>
  );
}

// Person organizing/folders - half body floating
export function OrganizingPerson({
  className = "w-48 h-48",
  primaryColor = "var(--color-primary)",
  secondaryColor = "var(--color-secondary)",
  skinTone = "#F5D0C5"
}: IllustrationProps) {
  return (
    <svg viewBox="0 0 200 200" className={className} fill="none">
      {/* Shadow */}
      <ellipse cx="100" cy="188" rx="35" ry="8" fill="#000" opacity="0.08" />
      
      {/* Floating folders */}
      <g>
        <rect x="30" y="50" width="32" height="25" rx="2" fill={primaryColor} opacity="0.25" />
        <rect x="30" y="50" width="14" height="5" rx="1" fill={primaryColor} opacity="0.4" />
      </g>
      <g>
        <rect x="145" y="60" width="32" height="25" rx="2" fill={secondaryColor} opacity="0.25" />
        <rect x="145" y="60" width="14" height="5" rx="1" fill={secondaryColor} opacity="0.4" />
      </g>
      
      {/* Body - floating torso */}
      <ellipse cx="100" cy="145" rx="30" ry="38" fill={secondaryColor} />
      
      {/* Head */}
      <circle cx="100" cy="75" r="28" fill={skinTone} />
      
      {/* Hair - ponytail (connected) */}
      <path d="M72 68 Q70 48 100 42 Q130 48 128 68 L128 72 Q115 65 100 68 Q85 65 72 72 Z" fill="#8B4513" />
      <ellipse cx="130" cy="60" rx="12" ry="8" fill="#8B4513" />
      <ellipse cx="142" cy="55" rx="8" ry="6" fill="#8B4513" />
      
      {/* Ears */}
      <ellipse cx="72" cy="78" rx="4" ry="6" fill={skinTone} />
      <ellipse cx="128" cy="78" rx="4" ry="6" fill={skinTone} />
      
      {/* Face */}
      <ellipse cx="88" cy="72" rx="3" ry="2.5" fill="#333" />
      <ellipse cx="112" cy="72" rx="3" ry="2.5" fill="#333" />
      <path d="M94 90 Q100 94 106 90" stroke="#333" strokeWidth="2" fill="none" strokeLinecap="round" />
      
      {/* Left arm */}
      <path d="M70 130 Q50 120 48 95" stroke={skinTone} strokeWidth="12" strokeLinecap="round" />
      <circle cx="48" cy="90" r="8" fill={skinTone} />
      
      {/* Right arm holding folder */}
      <path d="M130 130 Q155 125 160 105" stroke={skinTone} strokeWidth="12" strokeLinecap="round" />
      <circle cx="162" cy="100" r="8" fill={skinTone} />
      
      {/* Folder being held */}
      <g transform="rotate(10 165 115)">
        <rect x="145" y="95" width="38" height="30" rx="2" fill={primaryColor} opacity="0.5" />
        <rect x="145" y="95" width="16" height="6" rx="1" fill={primaryColor} opacity="0.7" />
      </g>
      
      {/* Sparkles */}
      <circle cx="55" cy="100" r="2.5" fill={primaryColor} opacity="0.4" />
      <circle cx="170" cy="140" r="2" fill={secondaryColor} opacity="0.4" />
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
      {/* Shadow */}
      <ellipse cx="55" cy="180" rx="30" ry="6" fill="#000" opacity="0.08" />
      
      {/* Empty box/container */}
      <rect x="90" y="100" width="80" height="60" rx="4" fill="none" stroke={primaryColor} strokeWidth="2" strokeDasharray="8 4" opacity="0.5" />
      
      {/* Question marks */}
      <text x="120" y="140" fontSize="24" fill={primaryColor} opacity="0.3" textAnchor="middle">?</text>
      <text x="145" y="125" fontSize="16" fill={secondaryColor} opacity="0.3">?</text>
      
      {/* Body */}
      <ellipse cx="55" cy="145" rx="22" ry="28" fill={primaryColor} />
      
      {/* Head */}
      <circle cx="55" cy="95" r="22" fill={skinTone} />
      
      {/* Hair */}
      <path d="M33 88 Q32 70 55 65 Q78 70 77 88 Q77 80 70 82 Q60 75 55 78 Q50 75 40 82 Q33 80 33 88 Z" fill="#6B4423" />
      
      {/* Face - curious expression */}
      <ellipse cx="47" cy="92" rx="2.5" ry="2" fill="#333" />
      <ellipse cx="63" cy="92" rx="2.5" ry="2" fill="#333" />
      <ellipse cx="55" cy="104" rx="3" ry="2" fill="#333" opacity="0.3" />
      
      {/* Arm pointing/gesturing */}
      <path d="M77 130 Q100 115 95 105" stroke={skinTone} strokeWidth="10" strokeLinecap="round" />
      <circle cx="95" cy="102" r="6" fill={skinTone} />
      
      {/* Sparkle hints */}
      <circle cx="160" cy="90" r="3" fill={primaryColor} opacity="0.4" />
      <circle cx="175" cy="110" r="2" fill={secondaryColor} opacity="0.4" />
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
      {/* Shadow */}
      <ellipse cx="100" cy="188" rx="35" ry="8" fill="#000" opacity="0.08" />
      
      {/* Confetti */}
      <rect x="30" y="40" width="8" height="8" rx="1" fill={primaryColor} opacity="0.6" transform="rotate(15 34 44)" />
      <rect x="160" y="50" width="6" height="6" rx="1" fill={secondaryColor} opacity="0.6" transform="rotate(-20 163 53)" />
      <circle cx="50" cy="70" r="4" fill={secondaryColor} opacity="0.5" />
      <circle cx="150" cy="35" r="3" fill={primaryColor} opacity="0.5" />
      
      {/* Body */}
      <ellipse cx="100" cy="145" rx="28" ry="35" fill={primaryColor} />
      
      {/* Head */}
      <circle cx="100" cy="80" r="26" fill={skinTone} />
      
      {/* Hair */}
      <path d="M74 72 Q72 52 100 46 Q128 52 126 72 Q126 62 115 65 Q105 58 100 62 Q95 58 85 65 Q74 62 74 72 Z" fill="#4A3728" />
      
      {/* Happy face - eyes closed */}
      <path d="M86 76 Q90 72 94 76" stroke="#333" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M106 76 Q110 72 114 76" stroke="#333" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M88 92 Q100 102 112 92" stroke="#333" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      
      {/* Arms raised */}
      <path d="M72 125 Q48 95 45 65" stroke={skinTone} strokeWidth="12" strokeLinecap="round" />
      <path d="M128 125 Q152 95 155 65" stroke={skinTone} strokeWidth="12" strokeLinecap="round" />
      
      {/* Hands */}
      <circle cx="45" cy="60" r="8" fill={skinTone} />
      <circle cx="155" cy="60" r="8" fill={skinTone} />
      
      {/* Stars */}
      <polygon points="35,48 37,42 39,48 45,48 40,52 42,58 37,54 32,58 34,52 29,48" fill={primaryColor} />
      <polygon points="162,45 164,39 166,45 172,45 167,49 169,55 164,51 159,55 161,49 156,45" fill={secondaryColor} />
    </svg>
  );
}
