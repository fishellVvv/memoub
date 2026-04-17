import {
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
} from "react";
import { useMemoubApp } from "./hooks/useMemoubApp";
import { useLocale } from "./hooks/useLocale";
import { useTheme } from "./hooks/useTheme";
import { useUiScale } from "./hooks/useUiScale";
import type { DesktopPreviewSnapshot } from "./lib/desktop";
import { isTauriDesktop } from "./lib/desktop";
import { pushDesktopPreviewSnapshot } from "./lib/desktop-preview";
import type { Locale, LocaleMessages } from "./lib/i18n";
import {
  resolveThemeBase,
  resolveThemeTokens,
  type ThemeId,
  type ThemeOverrides,
  type ThemePreference,
} from "./lib/theme";
import type { SyncState } from "./lib/types";

const CUSTOM_COLOR_FIELDS = [
  { key: "background" },
  { key: "surface" },
  { key: "editor" },
  { key: "text" },
  { key: "muted" },
  { key: "accent" },
  { key: "success" },
  { key: "danger" },
] as const;

const FONT_FAMILY_OPTIONS = [
  {
    id: "sourceSerif4",
    value: '"Source Serif 4 Variable", Georgia, serif',
  },
  {
    id: "ibmPlexSerif",
    value: '"IBM Plex Serif", Georgia, serif',
  },
  {
    id: "sourceSans3",
    value: '"Source Sans 3 Variable", sans-serif',
  },
  {
    id: "ibmPlexSans",
    value: '"IBM Plex Sans Variable", sans-serif',
  },
  {
    id: "atkinsonHyperlegible",
    value: '"Atkinson Hyperlegible", sans-serif',
  },
  {
    id: "ibmPlexMono",
    value: '"IBM Plex Mono", monospace',
  },
  {
    id: "jetbrainsMono",
    value: '"JetBrains Mono Variable", monospace',
  },
] as const;

const THEME_NAME_MAP: Record<ThemeId, string> = {
  paper: "Paper",
  sea: "Sea",
  graphite: "Graphite",
  matrix: "Matrix",
};

type CustomColorKey = (typeof CUSTOM_COLOR_FIELDS)[number]["key"];
type CustomThemePreference = Extract<ThemePreference, { kind: "custom" }>;
type FontOptionId = (typeof FONT_FAMILY_OPTIONS)[number]["id"];

function formatThemeLabel(
  theme:
    | { kind: "system" }
    | { kind: "custom" }
    | { kind: "preset"; id: ThemeId; colorScheme: "light" | "dark" },
  copy: LocaleMessages,
): string {
  if (theme.kind === "system") {
    return copy.systemTheme;
  }

  if (theme.kind === "custom") {
    return copy.customTheme;
  }

  return `${THEME_NAME_MAP[theme.id]} (${theme.colorScheme === "dark" ? copy.dark : copy.light})`;
}

function normalizeHex(color: string): string {
  const sanitized = color.replace("#", "").trim();

  if (sanitized.length === 3) {
    return `#${sanitized
      .split("")
      .map((part) => `${part}${part}`)
      .join("")}`;
  }

  return `#${sanitized.slice(0, 6)}`;
}

function formatDate(
  value: string | null,
  locale: Locale,
  copy: LocaleMessages,
): string {
  if (!value) {
    return copy.noSyncYet;
  }

  return new Intl.DateTimeFormat(locale === "es" ? "es-ES" : "en-US", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatFooterDate(value: string | null, copy?: LocaleMessages): string {
  if (!value) {
    return copy?.noSyncYet ?? "Aun sin sincronizar";
  }

  const date = new Date(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${year}-${month}-${day} | ${hours}:${minutes}:${seconds}`;
}

function previewContent(content: string): string {
  const trimmed = content.trim();
  if (!trimmed) {
    return "";
  }

  return trimmed.length > 140 ? `${trimmed.slice(0, 140)}...` : trimmed;
}

function normalizeFooterMessage(
  status: SyncState["status"],
  message: string | null,
  hasPendingChanges: boolean,
  copy: LocaleMessages,
): string {
  switch (status) {
    case "loading":
      return copy.footerPreparing;
    case "saving":
      return copy.footerSaving;
    case "offline":
      return copy.footerOffline;
    case "error":
      return copy.footerError;
    case "conflict":
      return copy.footerConflict;
    case "idle":
      return hasPendingChanges ? copy.footerPending : copy.footerReady;
    case "saved":
      if (!message) {
        return copy.footerSynced;
      }

      if (
        message.includes("La version remota era mas reciente.") ||
        message.includes("Nota remota cargada.") ||
        message.includes("Actualizado desde otra sesion.")
      ) {
        return copy.footerUpdated;
      }

      if (message.includes("Preparado para sincronizar.")) {
        return copy.footerReady;
      }

      return copy.footerSynced;
    default:
      return copy.footerReady;
  }
}

function App() {
  const { locale, setLocale, messages: copy } = useLocale();
  const {
    presetThemes,
    activeThemeId,
    customThemeActive,
    systemThemeActive,
    setSystemTheme,
    setPresetTheme,
    setCustomTheme,
    customThemePreference,
    resolvedThemeTokens,
  } = useTheme();
  const { uiScale, setUiScale } = useUiScale();

  const {
    authState,
    syncState,
    noteContent,
    setNoteContent,
    signIn,
    signOut,
    retrySync,
    keepLocalConflictVersion,
    useRemoteConflictVersion,
    userEmail,
    isConfigured,
  } = useMemoubApp();
  const [menuOpen, setMenuOpen] = useState(false);
  const [themeSelectorOpen, setThemeSelectorOpen] = useState(false);
  const [localeSelectorOpen, setLocaleSelectorOpen] = useState(false);
  const [customThemeEditorOpen, setCustomThemeEditorOpen] = useState(false);

  const statusMeta = useMemo(() => {
    switch (syncState.status) {
      case "loading":
        return { label: copy.loadingLabel };
      case "saving":
        return { label: copy.savingLabel };
      case "saved":
        return { label: copy.savedLabel };
      case "offline":
        return { label: copy.offlineLabel };
      case "error":
        return { label: copy.errorLabel };
      case "conflict":
        return { label: copy.conflictLabel };
      default:
        return { label: copy.readyLabel };
    }
  }, [copy, syncState.status]);

  const footerDetail = normalizeFooterMessage(
    syncState.status,
    syncState.message,
    syncState.hasPendingChanges,
    copy,
  );
  const customThemeBase = useMemo(
    () => resolveThemeBase(customThemePreference),
    [customThemePreference],
  );
  const customPreviewTokens = useMemo(
    () => resolveThemeTokens(customThemePreference),
    [customThemePreference],
  );

  useEffect(() => {
    document.title = noteContent.trim()
      ? `${noteContent.trim().slice(0, 24)} - memoub`
      : "memoub";
  }, [noteContent]);

  useEffect(() => {
    if (authState !== "authenticated") {
      setMenuOpen(false);
      setThemeSelectorOpen(false);
      setLocaleSelectorOpen(false);
      setCustomThemeEditorOpen(false);
    }
  }, [authState]);

  useEffect(() => {
    if (!isTauriDesktop()) {
      return;
    }

    const hasPreviewContent = isConfigured && authState === "authenticated";
    const nextSnapshot: DesktopPreviewSnapshot = {
      message: hasPreviewContent ? noteContent.trim() || copy.noText : "",
      footerLine: hasPreviewContent
        ? `${formatFooterDate(syncState.lastSyncedAt, copy)} | ${footerDetail}`
        : "",
      status: hasPreviewContent ? syncState.status : "idle",
      theme: {
        background: resolvedThemeTokens["note-surface"],
        text: resolvedThemeTokens["app-text"],
        mutedText: resolvedThemeTokens["app-text-muted"],
        fontFamily: resolvedThemeTokens["theme-font-family"],
        uiScale,
      },
    };

    void pushDesktopPreviewSnapshot(nextSnapshot);
  }, [
    authState,
    copy.noText,
    copy.noSyncYet,
    footerDetail,
    isConfigured,
    noteContent,
    resolvedThemeTokens,
    syncState.lastSyncedAt,
    syncState.status,
    uiScale,
  ]);

  const applyCustomPreference = (
    overrides: ThemeOverrides,
    baseThemeId: ThemeId = customThemePreference.baseThemeId,
  ) => {
    setCustomTheme(overrides, baseThemeId);
  };

  const openCustomThemeEditor = () => {
    applyCustomPreference(
      customThemePreference.overrides,
      customThemePreference.baseThemeId,
    );
    setThemeSelectorOpen(false);
    setCustomThemeEditorOpen(true);
  };

  const updateCustomColor = (key: CustomColorKey, value: string) => {
    applyCustomPreference({
      ...customThemePreference.overrides,
      [key]: normalizeHex(value),
    });
  };

  const updateCustomFontFamily = (value: string) => {
    applyCustomPreference({
      ...customThemePreference.overrides,
      fontFamily: value,
    });
  };

  const resetCustomTheme = () => {
    setCustomTheme({}, "paper");
  };

  const saveCustomTheme = () => {
    applyCustomPreference(
      customThemePreference.overrides,
      customThemePreference.baseThemeId,
    );
    setCustomThemeEditorOpen(false);
  };

  const customPreviewStyle = {
    "--theme-preview-shell": customThemeBase.background,
    "--theme-preview-font-family": customPreviewTokens["theme-font-family"],
    "--theme-preview-text": customPreviewTokens["app-text"],
    "--theme-preview-bg": customPreviewTokens["note-surface"],
    "--theme-preview-chrome": customPreviewTokens["chrome-surface"],
    "--theme-preview-line": customPreviewTokens.line,
    "--theme-preview-accent": customThemeBase.accent,
    "--theme-preview-danger": customThemeBase.danger,
  } as CSSProperties;
  const systemLightPreviewBase = useMemo(
    () => resolveThemeBase({ kind: "preset", themeId: "paper" }),
    [],
  );
  const systemDarkPreviewBase = useMemo(
    () => resolveThemeBase({ kind: "preset", themeId: "graphite" }),
    [],
  );
  const systemLightPreviewTokens = useMemo(
    () => resolveThemeTokens({ kind: "preset", themeId: "paper" }),
    [],
  );
  const systemDarkPreviewTokens = useMemo(
    () => resolveThemeTokens({ kind: "preset", themeId: "graphite" }),
    [],
  );
  const systemPreviewStyle = {
    "--theme-preview-shell-left": systemLightPreviewBase.background,
    "--theme-preview-chrome-left": systemLightPreviewTokens["chrome-surface"],
    "--theme-preview-chrome-right": systemDarkPreviewTokens["chrome-surface"],
    "--theme-preview-bg-left": systemLightPreviewTokens["note-surface"],
    "--theme-preview-bg-right": systemDarkPreviewTokens["note-surface"],
    "--theme-preview-text-left": systemLightPreviewTokens["app-text"],
    "--theme-preview-text-right": systemDarkPreviewTokens["app-text"],
    "--theme-preview-font-family-left": systemLightPreviewBase.fontFamily,
    "--theme-preview-font-family-right": systemDarkPreviewBase.fontFamily,
  } as CSSProperties;

  if (!isConfigured) {
    return (
      <main className="shell">
        <section className="card hero-card">
          <p className="eyebrow">{copy.configEyebrow}</p>
          <h1>{copy.configTitle}</h1>
          <p className="lead">
            {copy.configLeadBefore}
            <code>VITE_SUPABASE_URL</code> y <code>VITE_SUPABASE_ANON_KEY</code>
            {copy.configLeadAfter}
          </p>
          <p className="helper">{copy.configHelper}</p>
        </section>
      </main>
    );
  }

  if (authState !== "authenticated") {
    return (
      <main className="shell">
        <section className="card hero-card">
          <p className="eyebrow">{copy.authEyebrow}</p>
          <h1>{copy.authTitle}</h1>
          <p className="lead">{copy.authLead}</p>
          <button className="primary-button" onClick={() => void signIn()}>
            {copy.signInWithGoogle}
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="app-screen">
      <header className="mobile-header">
        <p className="brand-label">memoub</p>
        <button
          className="menu-button"
          type="button"
          aria-label={copy.openMenu}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((current) => !current)}
        >
          <span />
          <span />
          <span />
        </button>
      </header>

      {menuOpen ||
      themeSelectorOpen ||
      localeSelectorOpen ||
      customThemeEditorOpen ? (
        <button
          className="menu-backdrop"
          aria-label={copy.closePanels}
          onClick={() => {
            setMenuOpen(false);
            setThemeSelectorOpen(false);
            setLocaleSelectorOpen(false);
            setCustomThemeEditorOpen(false);
          }}
        />
      ) : null}

      <aside className={`menu-sheet ${menuOpen ? "menu-sheet-open" : ""}`}>
        <div className="menu-group">
          <div className="menu-account">
            <span className="menu-item-detail">
              {userEmail || copy.noEmail}
            </span>
          </div>
        </div>
        <div className="menu-group">
          <button
            className="menu-item-button menu-item-button-split"
            type="button"
            onClick={() => {
              setMenuOpen(false);
              setThemeSelectorOpen(true);
            }}
          >
            <span>{copy.changeTheme}</span>
          </button>
          <button
            className="menu-item-button"
            type="button"
            onClick={() => {
              setMenuOpen(false);
              setLocaleSelectorOpen(true);
            }}
          >
            {copy.changeLanguage}
          </button>
        </div>
        <div className="menu-group">
          <button
            className="menu-item-button"
            type="button"
            onClick={() => {
              setMenuOpen(false);
              void retrySync();
            }}
          >
            {copy.forceSync}
          </button>
          <button
            className="menu-item-button menu-item-button-danger"
            type="button"
            onClick={() => {
              setMenuOpen(false);
              void signOut();
            }}
          >
            {copy.signOut}
          </button>
        </div>
      </aside>

      {themeSelectorOpen ? (
        <section
          className="theme-modal"
          role="dialog"
          aria-modal="true"
          aria-label={copy.themeSelectorLabel}
        >
          <div
            className="theme-selector"
            role="list"
            aria-label={copy.themeSelectorLabel}
          >
            {presetThemes.map((theme) => {
              const isActive =
                theme.kind === "system"
                  ? systemThemeActive
                  : theme.kind === "custom"
                    ? customThemeActive
                    : !customThemeActive &&
                      !systemThemeActive &&
                      theme.id === activeThemeId;
              const previewBase =
                theme.kind === "custom"
                  ? customThemeBase
                  : theme.kind === "preset"
                    ? resolveThemeBase(theme.previewPreference)
                    : null;
              const previewTokens =
                theme.kind === "custom"
                  ? customPreviewTokens
                  : theme.kind === "preset"
                    ? resolveThemeTokens(theme.previewPreference)
                    : null;
              const previewStyle = {
                ...(theme.kind === "system"
                  ? systemPreviewStyle
                  : {
                      "--theme-preview-font-family":
                        previewTokens?.["theme-font-family"],
                      "--theme-preview-text": previewTokens?.["app-text"],
                      "--theme-preview-bg": previewTokens?.["note-surface"],
                      "--theme-preview-chrome":
                        previewTokens?.["chrome-surface"],
                      "--theme-preview-line": previewTokens?.line,
                    }),
                ...(theme.kind === "custom"
                  ? {
                      "--theme-preview-shell": customThemeBase.background,
                      "--theme-preview-accent": customThemeBase.accent,
                      "--theme-preview-danger": customThemeBase.danger,
                    }
                  : theme.kind === "preset" && previewBase
                    ? {
                        "--theme-preview-shell": previewBase.background,
                        "--theme-preview-accent": previewBase.accent,
                        "--theme-preview-danger": previewBase.danger,
                      }
                    : {}),
              } as CSSProperties;

              return (
                <div
                  key={theme.id}
                  className={`theme-option ${isActive ? "theme-option-active" : ""}`}
                >
                  <button
                    className="theme-option-main"
                    type="button"
                    onClick={() => {
                      if (theme.kind === "system") {
                        setSystemTheme();
                      } else if (theme.kind === "custom") {
                        applyCustomPreference(
                          customThemePreference.overrides,
                          customThemePreference.baseThemeId,
                        );
                      } else {
                        setPresetTheme(theme.id);
                      }
                      setThemeSelectorOpen(false);
                    }}
                  >
                    <span className="theme-option-copy">
                      <span className="theme-option-label">
                        {theme.kind === "system"
                          ? formatThemeLabel({ kind: "system" }, copy)
                          : theme.kind === "custom"
                            ? formatThemeLabel({ kind: "custom" }, copy)
                            : formatThemeLabel(
                                {
                                  kind: "preset",
                                  id: theme.id,
                                  colorScheme:
                                    previewBase?.colorScheme ?? "light",
                                },
                                copy,
                              )}
                      </span>
                      {isActive ? (
                        <span className="theme-option-mark">{copy.active}</span>
                      ) : null}
                    </span>
                  </button>
                  <button
                    className={`theme-option-preview-button ${theme.kind === "custom" ? "theme-option-preview-button-custom" : ""}`}
                    type="button"
                    onClick={() => {
                      if (theme.kind === "system") {
                        setSystemTheme();
                        setThemeSelectorOpen(false);
                        return;
                      }

                      if (theme.kind === "custom") {
                        openCustomThemeEditor();
                        return;
                      }

                      setPresetTheme(theme.id);
                      setThemeSelectorOpen(false);
                    }}
                  >
                    {theme.kind === "system" ? (
                      <span
                        className="theme-option-preview theme-option-preview-system"
                        style={previewStyle}
                        aria-hidden="true"
                      >
                        <span className="theme-option-preview-system-base">
                          <span className="theme-option-preview-top" />
                          <span className="theme-option-preview-note">
                            nota
                          </span>
                        </span>
                        <span className="theme-option-preview-system-overlay">
                          <span className="theme-option-preview-top" />
                          <span className="theme-option-preview-note">
                            nota
                          </span>
                        </span>
                      </span>
                    ) : (
                      <span
                        className="theme-option-preview"
                        style={previewStyle}
                        aria-hidden="true"
                      >
                        <span className="theme-option-preview-top" />
                        {theme.kind === "custom" ? (
                          <span
                            className="theme-option-preview-gear"
                            aria-hidden="true"
                          >
                            <svg viewBox="0 0 24 24" fill="none">
                              <path d="M5 7.5H19" />
                              <path d="M5 12H19" />
                              <path d="M5 16.5H19" />
                              <circle
                                cx="9"
                                cy="7.5"
                                r="2.2"
                                fill="currentColor"
                                stroke="none"
                              />
                              <circle
                                cx="15"
                                cy="12"
                                r="2.2"
                                fill="currentColor"
                                stroke="none"
                              />
                              <circle
                                cx="11"
                                cy="16.5"
                                r="2.2"
                                fill="currentColor"
                                stroke="none"
                              />
                            </svg>
                          </span>
                        ) : null}
                        <span className="theme-option-preview-note">nota</span>
                      </span>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
          <div className="theme-selector-controls">
            <label className="theme-scale-control">
              <span className="theme-scale-label">{copy.textSize}</span>
              <span className="theme-scale-value">
                {Math.round(uiScale * 100)}%
              </span>
              <input
                className="theme-scale-slider"
                type="range"
                min="0.7"
                max="1.1"
                step="0.02"
                value={uiScale}
                onChange={(event) => setUiScale(Number(event.target.value))}
              />
            </label>
          </div>
        </section>
      ) : null}

      {localeSelectorOpen ? (
        <section
          className="theme-modal"
          role="dialog"
          aria-modal="true"
          aria-label={copy.languageSelectorLabel}
        >
          <div
            className="theme-selector"
            role="list"
            aria-label={copy.languageSelectorLabel}
          >
            {(
              [
                { id: "es", label: "Español", code: "ES" },
                { id: "en", label: "English", code: "EN" },
              ] as const
            ).map((option) => {
              const isActive = locale === option.id;

              return (
                <div
                  key={option.id}
                  className={`theme-option ${isActive ? "theme-option-active" : ""}`}
                >
                  <button
                    className="theme-option-main"
                    type="button"
                    onClick={() => {
                      setLocale(option.id);
                      setLocaleSelectorOpen(false);
                    }}
                  >
                    <span className="theme-option-copy">
                      <span className="theme-option-label">{option.label}</span>
                      {isActive ? (
                        <span className="theme-option-mark">{copy.active}</span>
                      ) : null}
                    </span>
                  </button>
                  <button
                    className="theme-option-preview-button"
                    type="button"
                    onClick={() => {
                      setLocale(option.id);
                      setLocaleSelectorOpen(false);
                    }}
                  >
                    <span className="theme-option-preview" aria-hidden="true">
                      <span className="theme-option-preview-top" />
                      <span className="theme-option-preview-note">
                        {option.code}
                      </span>
                    </span>
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      ) : null}

      {customThemeEditorOpen ? (
        <section
          className="custom-theme-modal"
          role="dialog"
          aria-modal="true"
          aria-label={`${copy.customTheme} editor`}
        >
          <div className="custom-theme-sheet">
            <div className="custom-theme-preview" style={customPreviewStyle}>
              <div className="custom-theme-preview-shell">
                <div className="custom-theme-preview-header">
                  <span className="custom-theme-preview-brand">memoub</span>
                  <span
                    className="custom-theme-preview-controls"
                    aria-hidden="true"
                  >
                    <span />
                    <span />
                    <span />
                  </span>
                </div>
                <div className="custom-theme-preview-body">
                  <p className="custom-theme-preview-note">{copy.customNote}</p>
                  <p className="custom-theme-preview-copy">
                    {copy.customPreviewCopy}
                  </p>
                </div>
                <div className="custom-theme-preview-footer">
                  <span className="custom-theme-preview-dot" />
                  <span className="custom-theme-preview-status">
                    2026-04-15 | 21:14:59 | {copy.footerSynced}
                  </span>
                  <span
                    className="custom-theme-preview-status-samples"
                    aria-hidden="true"
                  >
                    <span className="custom-theme-preview-dot custom-theme-preview-dot-saving" />
                    <span className="custom-theme-preview-dot custom-theme-preview-dot-danger" />
                  </span>
                </div>
              </div>
            </div>

            <div className="custom-theme-controls">
              <div className="custom-theme-toolbar">
                <button
                  className="custom-theme-save"
                  type="button"
                  onClick={saveCustomTheme}
                >
                  {copy.saveChanges}
                </button>

                <button
                  className="custom-theme-reset"
                  type="button"
                  onClick={resetCustomTheme}
                >
                  {copy.resetCustom}
                </button>

                <label className="custom-theme-font">
                  <span className="custom-theme-control-label">
                    {copy.fontFamily}
                  </span>
                  <select
                    value={customThemeBase.fontFamily}
                    onChange={(event) =>
                      updateCustomFontFamily(event.target.value)
                    }
                  >
                    {FONT_FAMILY_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {copy.fontOptions[option.id as FontOptionId]}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="custom-theme-color-list">
                {CUSTOM_COLOR_FIELDS.map((field) => {
                  const value = customThemeBase[field.key];

                  return (
                    <label key={field.key} className="custom-theme-color-row">
                      <span className="custom-theme-control-label">
                        {copy.colorLabels[field.key]}
                      </span>
                      <span className="custom-theme-color-inputs">
                        <input
                          className="custom-theme-color-picker"
                          type="color"
                          value={value}
                          onChange={(event) =>
                            updateCustomColor(field.key, event.target.value)
                          }
                        />
                      </span>
                      <span className="custom-theme-color-value">{value}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      ) : null}

      <label className="sr-only" htmlFor="note-editor">
        {copy.synchronizedNoteLabel}
      </label>
      <textarea
        id="note-editor"
        className="note-surface"
        value={noteContent}
        onChange={(event) => void setNoteContent(event.target.value)}
        placeholder={copy.notePlaceholder}
        disabled={Boolean(syncState.conflict)}
        spellCheck
      />

      {syncState.conflict ? (
        <section className="conflict-sheet">
          <div className="conflict-sheet-copy">
            <p className="eyebrow">{copy.conflictEyebrow}</p>
            <h2>{copy.conflictTitle}</h2>
            <p>{copy.conflictBody}</p>
          </div>
          <div className="conflict-grid">
            <article className="conflict-card">
              <p className="conflict-title">{copy.localVersion}</p>
              <p className="conflict-time">
                {formatDate(
                  syncState.conflict.localNote.updatedAt,
                  locale,
                  copy,
                )}
              </p>
              <p className="conflict-preview">
                {previewContent(syncState.conflict.localNote.content) ||
                  copy.noText}
              </p>
              <button
                className="primary-button"
                onClick={() => void keepLocalConflictVersion()}
              >
                {copy.keepLocalVersion}
              </button>
            </article>
            <article className="conflict-card">
              <p className="conflict-title">{copy.remoteVersion}</p>
              <p className="conflict-time">
                {formatDate(
                  syncState.conflict.remoteNote.updatedAt,
                  locale,
                  copy,
                )}
              </p>
              <p className="conflict-preview">
                {previewContent(syncState.conflict.remoteNote.content) ||
                  copy.noText}
              </p>
              <button
                className="ghost-button"
                onClick={() => void useRemoteConflictVersion()}
              >
                {copy.useRemoteVersion}
              </button>
            </article>
          </div>
        </section>
      ) : null}

      <footer className={`mobile-footer footer-${syncState.status}`}>
        <div className="footer-status-block">
          <span
            className={`status-orb status-orb-${syncState.status}`}
            title={statusMeta.label}
            aria-label={statusMeta.label}
          />
          <div className="footer-copy">
            <div className="footer-inline">
              <span className="footer-secondary">
                {formatFooterDate(syncState.lastSyncedAt, copy)}
              </span>
              <span className="footer-tertiary">{footerDetail}</span>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}

export default App;
