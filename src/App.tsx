import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { useMemoubApp } from "./hooks/useMemoubApp";
import { useTheme } from "./hooks/useTheme";
import { resolveThemeBase, resolveThemeTokens, type ThemeId, type ThemeOverrides, type ThemePreference } from "./lib/theme";
import type { SyncState } from "./lib/types";

const CUSTOM_COLOR_FIELDS = [
  { key: "background", label: "Background" },
  { key: "surface", label: "Surface" },
  { key: "editor", label: "Editor" },
  { key: "text", label: "Text" },
  { key: "muted", label: "Muted" },
  { key: "accent", label: "Accent" },
  { key: "success", label: "Success" },
  { key: "danger", label: "Danger" }
] as const;

const FONT_FAMILY_OPTIONS = [
  {
    label: "Paper serif",
    value: "\"Iowan Old Style\", \"Palatino Linotype\", \"Book Antiqua\", Georgia, serif"
  },
  {
    label: "System sans",
    value: "\"Segoe UI\", \"Helvetica Neue\", sans-serif"
  },
  {
    label: "Sea sans",
    value: "\"Trebuchet MS\", \"Segoe UI\", \"Helvetica Neue\", sans-serif"
  },
  {
    label: "Mono",
    value: "\"IBM Plex Mono\", Consolas, \"Courier New\", monospace"
  }
] as const;

type CustomColorKey = (typeof CUSTOM_COLOR_FIELDS)[number]["key"];
type CustomThemePreference = Extract<ThemePreference, { kind: "custom" }>;

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

function formatDate(value: string | null): string {
  if (!value) {
    return "Aun sin sincronizar";
  }

  return new Intl.DateTimeFormat("es-ES", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(new Date(value));
}

function formatFooterDate(value: string | null): string {
  if (!value) {
    return "---- -- -- | --:--:-- |";
  }

  const date = new Date(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${year}-${month}-${day} | ${hours}:${minutes}:${seconds} |`;
}

function previewContent(content: string): string {
  const trimmed = content.trim();
  if (!trimmed) {
    return "(sin texto)";
  }

  return trimmed.length > 140 ? `${trimmed.slice(0, 140)}...` : trimmed;
}

function normalizeFooterMessage(status: SyncState["status"], message: string | null, hasPendingChanges: boolean): string {
  switch (status) {
    case "loading":
      return "preparando...";
    case "saving":
      return "guardando...";
    case "offline":
      return "sin conexion";
    case "error":
      return "error";
    case "conflict":
      return "conflicto";
    case "idle":
      return hasPendingChanges ? "pendiente" : "listo";
    case "saved":
      if (!message) {
        return "sincronizado";
      }

      if (
        message.includes("La version remota era mas reciente.") ||
        message.includes("Nota remota cargada.") ||
        message.includes("Actualizado desde otra sesion.")
      ) {
        return "actualizado";
      }

      if (message.includes("Preparado para sincronizar.")) {
        return "listo";
      }

      return "sincronizado";
    default:
      return "listo";
  }
}

function App() {
  const { presetThemes, activeThemeId, customThemeActive, systemThemeActive, setSystemTheme, setPresetTheme, setCustomTheme, themePreference, customThemePreference } =
    useTheme();

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
    isConfigured
  } = useMemoubApp();
  const [menuOpen, setMenuOpen] = useState(false);
  const [themeSelectorOpen, setThemeSelectorOpen] = useState(false);
  const [customThemeEditorOpen, setCustomThemeEditorOpen] = useState(false);

  const statusMeta = useMemo(() => {
    switch (syncState.status) {
      case "loading":
        return { label: "Cargando", detail: "Preparando tu nota" };
      case "saving":
        return { label: "Guardando", detail: "Subiendo cambios" };
      case "saved":
        return { label: "Guardado", detail: "sincronizado" };
      case "offline":
        return { label: "Sin conexion", detail: "Guardado en local" };
      case "error":
        return { label: "Error", detail: "Revisa la conexion" };
      case "conflict":
        return { label: "Conflicto", detail: "Hace falta elegir version" };
      default:
        return { label: "Listo", detail: "Sin cambios pendientes" };
    }
  }, [syncState.status]);

  const footerDetail = normalizeFooterMessage(syncState.status, syncState.message, syncState.hasPendingChanges);
  const customThemeBase = useMemo(() => resolveThemeBase(customThemePreference), [customThemePreference]);
  const customPreviewTokens = useMemo(() => resolveThemeTokens(customThemePreference), [customThemePreference]);

  useEffect(() => {
    document.title = noteContent.trim() ? `${noteContent.trim().slice(0, 24)} - memoub` : "memoub";
  }, [noteContent]);

  useEffect(() => {
    if (authState !== "authenticated") {
      setMenuOpen(false);
      setThemeSelectorOpen(false);
      setCustomThemeEditorOpen(false);
    }
  }, [authState]);

  const applyCustomPreference = (overrides: ThemeOverrides, baseThemeId: ThemeId = customThemePreference.baseThemeId) => {
    setCustomTheme(overrides, baseThemeId);
  };

  const openCustomThemeEditor = () => {
    applyCustomPreference(customThemePreference.overrides, customThemePreference.baseThemeId);
    setThemeSelectorOpen(false);
    setCustomThemeEditorOpen(true);
  };

  const updateCustomColor = (key: CustomColorKey, value: string) => {
    applyCustomPreference({
      ...customThemePreference.overrides,
      [key]: normalizeHex(value)
    });
  };

  const updateCustomFontFamily = (value: string) => {
    applyCustomPreference({
      ...customThemePreference.overrides,
      fontFamily: value
    });
  };

  const resetCustomTheme = () => {
    setCustomTheme({}, "paper");
  };

  const customPreviewStyle = {
    "--theme-preview-shell": customThemeBase.background,
    "--theme-preview-font-family": customPreviewTokens["theme-font-family"],
    "--theme-preview-text": customPreviewTokens["app-text"],
    "--theme-preview-bg": customPreviewTokens["note-surface"],
    "--theme-preview-chrome": customPreviewTokens["chrome-surface"],
    "--theme-preview-line": customPreviewTokens.line,
    "--theme-preview-accent": customThemeBase.accent,
    "--theme-preview-danger": customThemeBase.danger
  } as CSSProperties;
  const systemLightPreviewBase = useMemo(() => resolveThemeBase({ kind: "preset", themeId: "paper" }), []);
  const systemDarkPreviewBase = useMemo(() => resolveThemeBase({ kind: "preset", themeId: "graphite" }), []);
  const systemLightPreviewTokens = useMemo(() => resolveThemeTokens({ kind: "preset", themeId: "paper" }), []);
  const systemDarkPreviewTokens = useMemo(() => resolveThemeTokens({ kind: "preset", themeId: "graphite" }), []);
  const systemPreviewStyle = {
    "--theme-preview-shell-left": systemLightPreviewBase.background,
    "--theme-preview-chrome-left": systemLightPreviewTokens["chrome-surface"],
    "--theme-preview-chrome-right": systemDarkPreviewTokens["chrome-surface"],
    "--theme-preview-bg-left": systemLightPreviewTokens["note-surface"],
    "--theme-preview-bg-right": systemDarkPreviewTokens["note-surface"],
    "--theme-preview-text-left": systemLightPreviewTokens["app-text"],
    "--theme-preview-text-right": systemDarkPreviewTokens["app-text"],
    "--theme-preview-font-family-left": systemLightPreviewBase.fontFamily,
    "--theme-preview-font-family-right": systemDarkPreviewBase.fontFamily
  } as CSSProperties;

  if (!isConfigured) {
    return (
      <main className="shell">
        <section className="card hero-card">
          <p className="eyebrow">Configuracion pendiente</p>
          <h1>memoub necesita tu proyecto de Supabase</h1>
          <p className="lead">
            Define <code>VITE_SUPABASE_URL</code> y <code>VITE_SUPABASE_ANON_KEY</code> en un archivo{" "}
            <code>.env</code> para activar el login y la sincronizacion.
          </p>
          <p className="helper">
            La app ya incluye cache local y la logica de sync. Solo falta conectar tu proyecto real.
          </p>
        </section>
      </main>
    );
  }

  if (authState !== "authenticated") {
    return (
      <main className="shell">
        <section className="card hero-card">
          <p className="eyebrow">Una nota, dos dispositivos</p>
          <h1>Escribe en el movil y sigue en Windows sin pensar en nada mas.</h1>
          <p className="lead">
            memoub mantiene una unica nota sincronizada mediante Supabase, con cache local para seguir trabajando
            incluso si la conexion falla un rato.
          </p>
          <button className="primary-button" onClick={() => void signIn()}>
            Entrar con Google
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
          aria-label="Abrir menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((current) => !current)}
        >
          <span />
          <span />
          <span />
        </button>
      </header>

      {menuOpen || themeSelectorOpen || customThemeEditorOpen ? (
        <button
          className="menu-backdrop"
          aria-label="Cerrar paneles"
          onClick={() => {
            setMenuOpen(false);
            setThemeSelectorOpen(false);
            setCustomThemeEditorOpen(false);
          }}
        />
      ) : null}

      <aside className={`menu-sheet ${menuOpen ? "menu-sheet-open" : ""}`}>
        <div className="menu-group">
          <div className="menu-account">
            <span className="menu-item-detail">{userEmail}</span>
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
            <span>Cambiar tema</span>
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
            Forzar sincronizacion
          </button>
          <button
            className="menu-item-button menu-item-button-danger"
            type="button"
            onClick={() => {
              setMenuOpen(false);
              void signOut();
            }}
          >
            Cerrar sesion
          </button>
        </div>
      </aside>

      {themeSelectorOpen ? (
        <section className="theme-modal" role="dialog" aria-modal="true" aria-label="Selector de temas">
          <div className="theme-selector" role="list" aria-label="Selector de temas">
            {presetThemes.map((theme) => {
              const isActive =
                theme.kind === "system"
                  ? systemThemeActive
                  : theme.kind === "custom"
                    ? customThemeActive
                    : !customThemeActive && !systemThemeActive && theme.id === activeThemeId;
              const previewBase = theme.kind === "custom" ? customThemeBase : theme.kind === "preset" ? resolveThemeBase(theme.previewPreference) : null;
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
                      "--theme-preview-font-family": previewTokens?.["theme-font-family"],
                      "--theme-preview-text": previewTokens?.["app-text"],
                      "--theme-preview-bg": previewTokens?.["note-surface"],
                      "--theme-preview-chrome": previewTokens?.["chrome-surface"],
                      "--theme-preview-line": previewTokens?.line
                    }),
                ...(theme.kind === "custom"
                  ? {
                      "--theme-preview-shell": customThemeBase.background,
                      "--theme-preview-accent": customThemeBase.accent,
                      "--theme-preview-danger": customThemeBase.danger
                    }
                  : theme.kind === "preset" && previewBase
                    ? {
                        "--theme-preview-shell": previewBase.background,
                        "--theme-preview-accent": previewBase.accent,
                        "--theme-preview-danger": previewBase.danger
                      }
                    : {})
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
                        applyCustomPreference(customThemePreference.overrides, customThemePreference.baseThemeId);
                      } else {
                        setPresetTheme(theme.id);
                      }
                      setThemeSelectorOpen(false);
                    }}
                  >
                    <span className="theme-option-copy">
                      <span className="theme-option-label">{theme.label}</span>
                      {isActive ? <span className="theme-option-mark">activo</span> : null}
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
                      <span className="theme-option-preview theme-option-preview-system" style={previewStyle} aria-hidden="true">
                        <span className="theme-option-preview-system-base">
                          <span className="theme-option-preview-top" />
                          <span className="theme-option-preview-note">nota</span>
                        </span>
                        <span className="theme-option-preview-system-overlay">
                          <span className="theme-option-preview-top" />
                          <span className="theme-option-preview-note">nota</span>
                        </span>
                      </span>
                    ) : (
                      <span className="theme-option-preview" style={previewStyle} aria-hidden="true">
                        <span className="theme-option-preview-top" />
                        {theme.kind === "custom" ? (
                          <span className="theme-option-preview-gear" aria-hidden="true">
                            <svg viewBox="0 0 24 24" fill="none">
                              <path d="M5 7.5H19" />
                              <path d="M5 12H19" />
                              <path d="M5 16.5H19" />
                              <circle cx="9" cy="7.5" r="2.2" fill="currentColor" stroke="none" />
                              <circle cx="15" cy="12" r="2.2" fill="currentColor" stroke="none" />
                              <circle cx="11" cy="16.5" r="2.2" fill="currentColor" stroke="none" />
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
        </section>
      ) : null}

      {customThemeEditorOpen ? (
        <section className="custom-theme-modal" role="dialog" aria-modal="true" aria-label="Editor de tema custom">
          <div className="custom-theme-sheet">
            <div className="custom-theme-preview" style={customPreviewStyle}>
              <div className="custom-theme-preview-shell">
                <div className="custom-theme-preview-header">
                  <span className="custom-theme-preview-brand">memoub</span>
                  <span className="custom-theme-preview-controls" aria-hidden="true">
                    <span />
                    <span />
                    <span />
                  </span>
                </div>
                <div className="custom-theme-preview-body">
                  <p className="custom-theme-preview-note">nota custom</p>
                  <p className="custom-theme-preview-copy">ajusta colores y fuente hasta dar con tu tono.</p>
                </div>
                <div className="custom-theme-preview-footer">
                  <span className="custom-theme-preview-dot" />
                  <span className="custom-theme-preview-status">2026-04-15 | 21:14:59 | sincronizado</span>
                  <span className="custom-theme-preview-status-samples" aria-hidden="true">
                    <span className="custom-theme-preview-dot custom-theme-preview-dot-saving" />
                    <span className="custom-theme-preview-dot custom-theme-preview-dot-danger" />
                  </span>
                </div>
              </div>
            </div>

            <div className="custom-theme-controls">
              <div className="custom-theme-toolbar">
                <button className="custom-theme-reset" type="button" onClick={resetCustomTheme}>
                  Reset custom
                </button>

                <label className="custom-theme-font">
                  <span className="custom-theme-control-label">Font family</span>
                  <select value={customThemeBase.fontFamily} onChange={(event) => updateCustomFontFamily(event.target.value)}>
                    {FONT_FAMILY_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
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
                      <span className="custom-theme-control-label">{field.label}</span>
                      <span className="custom-theme-color-inputs">
                        <input
                          className="custom-theme-color-picker"
                          type="color"
                          value={value}
                          onChange={(event) => updateCustomColor(field.key, event.target.value)}
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
        Nota sincronizada
      </label>
      <textarea
        id="note-editor"
        className="note-surface"
        value={noteContent}
        onChange={(event) => void setNoteContent(event.target.value)}
        placeholder="Escribe aqui. Tus cambios se guardan solos."
        disabled={Boolean(syncState.conflict)}
        spellCheck
      />

      {syncState.conflict ? (
        <section className="conflict-sheet">
          <div className="conflict-sheet-copy">
            <p className="eyebrow">Conflicto detectado</p>
            <h2>Hay dos versiones distintas de la nota.</h2>
            <p>Elige si quieres conservar lo escrito en este dispositivo o recuperar la version remota guardada.</p>
          </div>
          <div className="conflict-grid">
            <article className="conflict-card">
              <p className="conflict-title">Version local</p>
              <p className="conflict-time">{formatDate(syncState.conflict.localNote.updatedAt)}</p>
              <p className="conflict-preview">{previewContent(syncState.conflict.localNote.content)}</p>
              <button className="primary-button" onClick={() => void keepLocalConflictVersion()}>
                Mantener mi version
              </button>
            </article>
            <article className="conflict-card">
              <p className="conflict-title">Version remota</p>
              <p className="conflict-time">{formatDate(syncState.conflict.remoteNote.updatedAt)}</p>
              <p className="conflict-preview">{previewContent(syncState.conflict.remoteNote.content)}</p>
              <button className="ghost-button" onClick={() => void useRemoteConflictVersion()}>
                Usar version remota
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
              <span className="footer-secondary">{formatFooterDate(syncState.lastSyncedAt)}</span>
              <span className="footer-tertiary">{footerDetail}</span>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}

export default App;
