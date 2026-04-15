import { useEffect, useMemo, useState } from "react";
import { useMemoubApp } from "./hooks/useMemoubApp";
import type { SyncState } from "./lib/types";

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

  useEffect(() => {
    document.title = noteContent.trim() ? `${noteContent.trim().slice(0, 24)} - memoub` : "memoub";
  }, [noteContent]);

  useEffect(() => {
    if (authState !== "authenticated") {
      setMenuOpen(false);
    }
  }, [authState]);

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

      {menuOpen ? <button className="menu-backdrop" aria-label="Cerrar menu" onClick={() => setMenuOpen(false)} /> : null}

      <aside className={`menu-sheet ${menuOpen ? "menu-sheet-open" : ""}`}>
        <div className="menu-group">
          <div className="menu-account">
            <span className="menu-item-detail">{userEmail}</span>
          </div>
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

      <section className="editor-stage">
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
      </section>

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
        {syncState.hasPendingChanges ? <span className="footer-pill">Pendiente</span> : null}
      </footer>
    </main>
  );
}

export default App;
