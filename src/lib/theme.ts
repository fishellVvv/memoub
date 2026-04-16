import { themePresets } from "../themes";
import type { ThemeBase, ThemeOverrides, ThemeTokens } from "../themes/types";

export type { ThemeBase, ThemeOverrides, ThemeTokens } from "../themes/types";

export const THEME_STORAGE_KEY = "memoub.theme";
export const CUSTOM_THEME_STORAGE_KEY = "memoub.theme.custom";

export type ThemeId = keyof typeof themePresets;

export type ThemePreference =
  | {
      kind: "system";
    }
  | {
      kind: "preset";
      themeId: ThemeId;
    }
  | {
      kind: "custom";
      baseThemeId: ThemeId;
      overrides: ThemeOverrides;
    };

export type ThemeOption =
  | {
      kind: "system";
      id: "system";
      label: string;
    }
  | {
      kind: "preset";
      id: ThemeId;
      label: string;
      previewPreference: ThemePreference;
    }
  | {
      kind: "custom";
      id: "custom";
      label: string;
      previewPreference: ThemePreference;
    };

type RgbColor = {
  r: number;
  g: number;
  b: number;
};

export const DEFAULT_THEME_PREFERENCE: ThemePreference = {
  kind: "system"
};

export const DEFAULT_CUSTOM_THEME_PREFERENCE: Extract<ThemePreference, { kind: "custom" }> = {
  kind: "custom",
  baseThemeId: "paper",
  overrides: {}
};

function clampChannel(value: number): number {
  return Math.max(0, Math.min(255, Math.round(value)));
}

function normalizeHex(color: string): string {
  const sanitized = color.replace("#", "").trim();

  if (sanitized.length === 3) {
    return sanitized
      .split("")
      .map((part) => `${part}${part}`)
      .join("");
  }

  return sanitized;
}

function hexToRgb(color: string): RgbColor {
  const normalized = normalizeHex(color);

  return {
    r: Number.parseInt(normalized.slice(0, 2), 16),
    g: Number.parseInt(normalized.slice(2, 4), 16),
    b: Number.parseInt(normalized.slice(4, 6), 16)
  };
}

function rgbToHex({ r, g, b }: RgbColor): string {
  const toHex = (channel: number) => clampChannel(channel).toString(16).padStart(2, "0");

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function alpha(color: string, opacity: number): string {
  const { r, g, b } = hexToRgb(color);

  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

function clampNumber(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function formatPx(value: number): string {
  const rounded = Math.round(Math.max(0, value) * 100) / 100;
  return `${rounded}px`;
}

function mix(colorA: string, colorB: string, amount: number): string {
  const a = hexToRgb(colorA);
  const b = hexToRgb(colorB);
  const ratio = Math.max(0, Math.min(1, amount));

  return rgbToHex({
    r: a.r + (b.r - a.r) * ratio,
    g: a.g + (b.g - a.g) * ratio,
    b: a.b + (b.b - a.b) * ratio
  });
}

function relativeLuminance(color: string): number {
  const { r, g, b } = hexToRgb(color);
  const normalize = (value: number) => {
    const channel = value / 255;
    return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  };

  const red = normalize(r);
  const green = normalize(g);
  const blue = normalize(b);

  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

function readableTextOn(background: string): string {
  return relativeLuminance(background) > 0.5 ? "#101314" : "#f6faf7";
}

function buildShadow(opacity: number, blur: number, spread: number, strength: number): string {
  const safeStrength = Math.max(0, strength);
  const effectiveOpacity = clampNumber(opacity * (0.72 + safeStrength * 0.28), 0, 0.72);

  return `0 ${formatPx(blur * safeStrength)} ${formatPx(spread * safeStrength)} ${alpha("#000000", effectiveOpacity)}`;
}

function deriveThemeTokens(base: ThemeBase): ThemeTokens {
  const dark = base.colorScheme === "dark";
  const contrastLight = "#ffffff";
  const conflictSurface = mix(base.surface, base.background, dark ? 0.12 : 0.22);
  const conflictCardSurface = mix(base.editor, base.surface, dark ? 0.22 : 0.3);
  const conflictBorder = mix(base.text, base.surface, dark ? 0.3 : 0.42);
  const loadingColor = mix(base.muted, base.text, 0.45);
  const radiusSmall = Math.max(0, base.radius * 0.45);
  const radiusMedium = Math.max(0, base.radius);
  const radiusLarge = Math.max(0, base.radius * 1.55);

  return {
    "theme-font-family": base.fontFamily,
    "theme-font-size-scale": String(base.fontSizeScale),
    "theme-letter-spacing": base.letterSpacing,
    "theme-radius-small": formatPx(radiusSmall),
    "theme-radius-medium": formatPx(radiusMedium),
    "theme-radius-large": formatPx(radiusLarge),
    "app-text": base.text,
    "app-text-muted": base.muted,
    "app-text-soft": mix(base.muted, base.surface, dark ? 0.2 : 0.28),
    "app-text-placeholder": alpha(base.muted, dark ? 0.42 : 0.34),
    "app-text-disabled": alpha(base.muted, dark ? 0.66 : 0.62),
    "app-text-danger": base.danger,
    eyebrow: mix(base.accent, base.muted, 0.45),
    "surface-start": base.background,
    "surface-end": mix(base.background, base.surface, 0.18),
    "surface-glow": alpha(base.accent, dark ? 0.1 : 0.14),
    "app-screen-highlight": alpha(contrastLight, dark ? 0.03 : 0.1),
    "chrome-surface": alpha(base.surface, dark ? 0.92 : 0.82),
    "note-surface": base.editor,
    "card-surface": alpha(mix(base.surface, base.background, 0.38), dark ? 0.9 : 0.86),
    "menu-surface": alpha(base.surface, dark ? 0.98 : 0.96),
    "conflict-surface": alpha(conflictSurface, dark ? 0.96 : 0.94),
    "conflict-card-surface": alpha(conflictCardSurface, dark ? 0.94 : 0.84),
    "code-surface": alpha(base.text, 0.08),
    "ghost-surface": alpha(base.text, dark ? 0.08 : 0.06),
    "scrollbar-track": alpha(mix(base.editor, base.surface, 0.35), dark ? 0.34 : 0.18),
    "scrollbar-thumb": alpha(base.muted, dark ? 0.42 : 0.3),
    "scrollbar-thumb-hover": alpha(mix(base.text, base.accent, 0.35), dark ? 0.58 : 0.42),
    "primary-surface": base.accent,
    "primary-text": readableTextOn(base.accent),
    line: alpha(base.text, dark ? 0.14 : 0.12),
    "line-strong": alpha(base.text, dark ? 0.24 : 0.18),
    "card-border": alpha(base.text, dark ? 0.1 : 0.1),
    "ghost-border": alpha(base.text, dark ? 0.14 : 0.1),
    "conflict-border": alpha(conflictBorder, dark ? 0.28 : 0.18),
    "conflict-card-border": alpha(base.text, dark ? 0.14 : 0.08),
    overlay: alpha(dark ? "#000000" : base.text, dark ? 0.44 : 0.22),
    "card-shadow": buildShadow(dark ? 0.34 : 0.16, 28, 80, base.shadowStrength),
    "menu-shadow": buildShadow(dark ? 0.42 : 0.18, 22, 55, base.shadowStrength),
    "conflict-shadow": buildShadow(dark ? 0.36 : 0.16, 20, 60, base.shadowStrength),
    "status-neutral": alpha(base.muted, dark ? 0.32 : 0.26),
    "status-neutral-ring": alpha(base.muted, 0.1),
    "status-saved": base.success,
    "status-saved-ring": alpha(base.success, 0.18),
    "status-saving": base.accent,
    "status-saving-ring": alpha(base.accent, 0.18),
    "status-offline": base.danger,
    "status-offline-ring": alpha(base.danger, 0.18),
    "status-conflict": mix(base.accent, base.danger, 0.5),
    "status-conflict-ring": alpha(mix(base.accent, base.danger, 0.5), 0.18),
    "status-loading": loadingColor,
    "status-loading-ring": alpha(loadingColor, 0.18)
  };
}

export function isThemeId(value: string): value is ThemeId {
  return value in themePresets;
}

export function getSystemThemeId(colorScheme: "light" | "dark"): ThemeId {
  return colorScheme === "dark" ? "graphite" : "paper";
}

export function readSystemColorScheme(): "light" | "dark" {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return "light";
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function resolveThemePreference(
  preference: ThemePreference,
  systemColorScheme: "light" | "dark" = readSystemColorScheme()
): Exclude<ThemePreference, { kind: "system" }> {
  if (preference.kind === "system") {
    return {
      kind: "preset",
      themeId: getSystemThemeId(systemColorScheme)
    };
  }

  return preference;
}

export function resolveThemeBase(
  preference: ThemePreference,
  systemColorScheme: "light" | "dark" = readSystemColorScheme()
): ThemeBase {
  const resolvedPreference = resolveThemePreference(preference, systemColorScheme);

  if (resolvedPreference.kind === "preset") {
    return themePresets[resolvedPreference.themeId];
  }

  return {
    ...themePresets[resolvedPreference.baseThemeId],
    ...resolvedPreference.overrides
  };
}

export function resolveThemeTokens(
  preference: ThemePreference,
  systemColorScheme: "light" | "dark" = readSystemColorScheme()
): ThemeTokens {
  return deriveThemeTokens(resolveThemeBase(preference, systemColorScheme));
}

export function resolveThemeMode(
  preference: ThemePreference,
  systemColorScheme: "light" | "dark" = readSystemColorScheme()
): "light" | "dark" {
  return resolveThemeBase(preference, systemColorScheme).colorScheme;
}

export function applyThemeTokens(tokens: ThemeTokens, root: HTMLElement = document.documentElement): void {
  for (const [token, value] of Object.entries(tokens)) {
    root.style.setProperty(`--${token}`, value);
  }
}

function formatThemeName(themeId: ThemeId): string {
  return themeId.charAt(0).toUpperCase() + themeId.slice(1);
}

export function listPresetThemes(): ThemeOption[] {
  const presetThemes = (Object.entries(themePresets) as Array<[ThemeId, ThemeBase]>).map(([id, theme]) => ({
    kind: "preset" as const,
    id,
    label: `${formatThemeName(id)} (${theme.colorScheme})`,
    previewPreference: {
      kind: "preset" as const,
      themeId: id
    }
  }));

  return [
    {
      kind: "system",
      id: "system",
      label: "Tema de sistema"
    },
    ...presetThemes,
    {
      kind: "custom",
      id: "custom",
      label: "Custom",
      previewPreference: {
        kind: "custom",
        baseThemeId: "paper",
        overrides: {}
      }
    }
  ];
}

export function readStoredTheme(): ThemePreference | null {
  if (typeof window === "undefined") {
    return null;
  }

  const rawValue = window.localStorage.getItem(THEME_STORAGE_KEY);
  if (!rawValue) {
    return null;
  }

  try {
    const parsed = JSON.parse(rawValue) as ThemePreference;

    if (parsed.kind === "system") {
      return parsed;
    }

    if (parsed.kind === "preset" && isThemeId(parsed.themeId)) {
      return parsed;
    }

    if (parsed.kind === "custom" && isThemeId(parsed.baseThemeId) && parsed.overrides) {
      return parsed;
    }

    return null;
  } catch {
    return null;
  }
}

export function readStoredCustomTheme(): Extract<ThemePreference, { kind: "custom" }> | null {
  if (typeof window === "undefined") {
    return null;
  }

  const rawValue = window.localStorage.getItem(CUSTOM_THEME_STORAGE_KEY);
  if (!rawValue) {
    return null;
  }

  try {
    const parsed = JSON.parse(rawValue) as ThemePreference;

    if (parsed.kind === "custom" && isThemeId(parsed.baseThemeId) && parsed.overrides) {
      return parsed;
    }

    return null;
  } catch {
    return null;
  }
}

export function writeStoredTheme(preference: ThemePreference): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(preference));
}

export function writeStoredCustomTheme(preference: Extract<ThemePreference, { kind: "custom" }>): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(CUSTOM_THEME_STORAGE_KEY, JSON.stringify(preference));
}
