// Theme System with Creative Names
export type ThemeId = 
  // Light themes
  | "morning-mist"      // Soft warm cream
  | "ocean-breeze"      // Cool blue tones
  | "mint-garden"       // Fresh green
  | "lavender-dream"    // Soft purple
  // Dark themes
  | "midnight-ember"    // Warm dark with amber
  | "deep-ocean"        // Dark blue depths
  | "forest-night"      // Dark green
  | "cosmic-purple"     // Deep purple space
  // Auto
  | "auto";

export type ThemeMode = "light" | "dark";

export interface Theme {
  id: ThemeId;
  name: string;
  mode: ThemeMode;
  preview: string; // Gradient for preview swatch
  colors: {
    bg: string;
    bgAlt: string;
    surface: string;
    surfaceMuted: string;
    surfaceElevated: string;
    primary: string;
    primaryDark: string;
    primaryLight: string;
    secondary: string;
    secondaryLight: string;
    text: string;
    textMuted: string;
    textSubtle: string;
    border: string;
    borderStrong: string;
  };
}

export const themes: Record<Exclude<ThemeId, "auto">, Theme> = {
  // ===== LIGHT THEMES =====
  "morning-mist": {
    id: "morning-mist",
    name: "Morning Mist",
    mode: "light",
    preview: "linear-gradient(135deg, #faf9f7 0%, #f5a623 100%)",
    colors: {
      bg: "#faf9f7",
      bgAlt: "#f5f3ef",
      surface: "#ffffff",
      surfaceMuted: "#f5f3ef",
      surfaceElevated: "#ffffff",
      primary: "#f5a623",
      primaryDark: "#e09000",
      primaryLight: "#ffba08",
      secondary: "#4a7c59",
      secondaryLight: "#6b9080",
      text: "#1a1a1a",
      textMuted: "#6b6b6b",
      textSubtle: "#9a9a9a",
      border: "#e8e6e1",
      borderStrong: "#d4d2cd",
    },
  },
  "ocean-breeze": {
    id: "ocean-breeze",
    name: "Ocean Breeze",
    mode: "light",
    preview: "linear-gradient(135deg, #f0f7ff 0%, #0ea5e9 100%)",
    colors: {
      bg: "#f0f7ff",
      bgAlt: "#e0f2fe",
      surface: "#ffffff",
      surfaceMuted: "#e0f2fe",
      surfaceElevated: "#ffffff",
      primary: "#0ea5e9",
      primaryDark: "#0284c7",
      primaryLight: "#38bdf8",
      secondary: "#06b6d4",
      secondaryLight: "#22d3ee",
      text: "#0c4a6e",
      textMuted: "#475569",
      textSubtle: "#94a3b8",
      border: "#bae6fd",
      borderStrong: "#7dd3fc",
    },
  },
  "mint-garden": {
    id: "mint-garden",
    name: "Mint Garden",
    mode: "light",
    preview: "linear-gradient(135deg, #f0fdf4 0%, #10b981 100%)",
    colors: {
      bg: "#f0fdf4",
      bgAlt: "#dcfce7",
      surface: "#ffffff",
      surfaceMuted: "#dcfce7",
      surfaceElevated: "#ffffff",
      primary: "#10b981",
      primaryDark: "#059669",
      primaryLight: "#34d399",
      secondary: "#14b8a6",
      secondaryLight: "#2dd4bf",
      text: "#064e3b",
      textMuted: "#4b5563",
      textSubtle: "#9ca3af",
      border: "#a7f3d0",
      borderStrong: "#6ee7b7",
    },
  },
  "lavender-dream": {
    id: "lavender-dream",
    name: "Lavender Dream",
    mode: "light",
    preview: "linear-gradient(135deg, #faf5ff 0%, #a855f7 100%)",
    colors: {
      bg: "#faf5ff",
      bgAlt: "#f3e8ff",
      surface: "#ffffff",
      surfaceMuted: "#f3e8ff",
      surfaceElevated: "#ffffff",
      primary: "#a855f7",
      primaryDark: "#9333ea",
      primaryLight: "#c084fc",
      secondary: "#ec4899",
      secondaryLight: "#f472b6",
      text: "#4c1d95",
      textMuted: "#6b7280",
      textSubtle: "#9ca3af",
      border: "#e9d5ff",
      borderStrong: "#d8b4fe",
    },
  },

  // ===== DARK THEMES =====
  "midnight-ember": {
    id: "midnight-ember",
    name: "Midnight Ember",
    mode: "dark",
    preview: "linear-gradient(135deg, #1a1a1a 0%, #f59e0b 100%)",
    colors: {
      bg: "#1a1a1a",
      bgAlt: "#121212",
      surface: "#242424",
      surfaceMuted: "#1e1e1e",
      surfaceElevated: "#2d2d2d",
      primary: "#f59e0b",
      primaryDark: "#d97706",
      primaryLight: "#fbbf24",
      secondary: "#ef4444",
      secondaryLight: "#f87171",
      text: "#fafafa",
      textMuted: "#a0a0a0",
      textSubtle: "#6b6b6b",
      border: "#333333",
      borderStrong: "#444444",
    },
  },
  "deep-ocean": {
    id: "deep-ocean",
    name: "Deep Ocean",
    mode: "dark",
    preview: "linear-gradient(135deg, #0f172a 0%, #0ea5e9 100%)",
    colors: {
      bg: "#0f172a",
      bgAlt: "#020617",
      surface: "#1e293b",
      surfaceMuted: "#0f172a",
      surfaceElevated: "#334155",
      primary: "#0ea5e9",
      primaryDark: "#0284c7",
      primaryLight: "#38bdf8",
      secondary: "#06b6d4",
      secondaryLight: "#22d3ee",
      text: "#f1f5f9",
      textMuted: "#94a3b8",
      textSubtle: "#64748b",
      border: "#334155",
      borderStrong: "#475569",
    },
  },
  "forest-night": {
    id: "forest-night",
    name: "Forest Night",
    mode: "dark",
    preview: "linear-gradient(135deg, #14231a 0%, #22c55e 100%)",
    colors: {
      bg: "#14231a",
      bgAlt: "#0c1810",
      surface: "#1a3024",
      surfaceMuted: "#14231a",
      surfaceElevated: "#234033",
      primary: "#22c55e",
      primaryDark: "#16a34a",
      primaryLight: "#4ade80",
      secondary: "#10b981",
      secondaryLight: "#34d399",
      text: "#ecfdf5",
      textMuted: "#86efac",
      textSubtle: "#4ade80",
      border: "#234033",
      borderStrong: "#2d5240",
    },
  },
  "cosmic-purple": {
    id: "cosmic-purple",
    name: "Cosmic Purple",
    mode: "dark",
    preview: "linear-gradient(135deg, #1e1033 0%, #a855f7 100%)",
    colors: {
      bg: "#1e1033",
      bgAlt: "#130a22",
      surface: "#2a1a45",
      surfaceMuted: "#1e1033",
      surfaceElevated: "#3b2560",
      primary: "#a855f7",
      primaryDark: "#9333ea",
      primaryLight: "#c084fc",
      secondary: "#ec4899",
      secondaryLight: "#f472b6",
      text: "#faf5ff",
      textMuted: "#c4b5fd",
      textSubtle: "#8b5cf6",
      border: "#3b2560",
      borderStrong: "#4c3575",
    },
  },
};

export const lightThemes = Object.values(themes).filter(t => t.mode === "light");
export const darkThemes = Object.values(themes).filter(t => t.mode === "dark");

export function getTheme(id: ThemeId, systemMode: ThemeMode = "light"): Theme {
  if (id === "auto") {
    return systemMode === "dark" ? themes["midnight-ember"] : themes["morning-mist"];
  }
  return themes[id];
}

export function applyTheme(theme: Theme) {
  const root = document.documentElement;
  const { colors } = theme;

  root.style.setProperty("--color-bg", colors.bg);
  root.style.setProperty("--color-bg-alt", colors.bgAlt);
  root.style.setProperty("--color-surface", colors.surface);
  root.style.setProperty("--color-surface-muted", colors.surfaceMuted);
  root.style.setProperty("--color-surface-elevated", colors.surfaceElevated);
  root.style.setProperty("--color-primary", colors.primary);
  root.style.setProperty("--color-primary-dark", colors.primaryDark);
  root.style.setProperty("--color-primary-light", colors.primaryLight);
  root.style.setProperty("--color-secondary", colors.secondary);
  root.style.setProperty("--color-secondary-light", colors.secondaryLight);
  root.style.setProperty("--color-text", colors.text);
  root.style.setProperty("--color-text-muted", colors.textMuted);
  root.style.setProperty("--color-text-subtle", colors.textSubtle);
  root.style.setProperty("--color-border", colors.border);
  root.style.setProperty("--color-border-strong", colors.borderStrong);

  // Set color scheme for browser UI
  root.style.colorScheme = theme.mode;
  
  // Add/remove dark class
  if (theme.mode === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
}

