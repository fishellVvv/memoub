import { useEffect, useMemo } from "react";
import { useMemoubApp } from "./hooks/useMemoubApp";

function formatDate(value: string | null): string {
  if (!value) {
    return "Aun sin sincronizar";
  }

  return new Intl.DateTimeFormat("es-ES", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(new Date(value));
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
    userEmail,
    isConfigured
  } = useMemoubApp();

  const statusLabel = useMemo(() => {
    switch (syncState.status) {
      case "loading":
        return "Cargando";
      case "saving":
        return "Guardando";
      case "saved":
        return "Guardado";
      case "offline":
        return "Sin conexion";
      case "error":
        return "Error";
      default:
        return "Listo";
    }
  }, [syncState.status]);

  useEffect(() => {
    document.title = noteContent.trim() ? `${noteContent.trim().slice(0, 24)} - memoub` : "memoub";
  }, [noteContent]);

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
    <main className="shell shell-app">
      <section className="card app-card">
        <header className="app-header">
          <div>
            <p className="eyebrow">memoub</p>
            <h1>Tu unica nota</h1>
          </div>
          <div className="header-actions">
            <div className={`status-badge status-${syncState.status}`}>
              <span>{statusLabel}</span>
              <span className="status-separator">|</span>
              <span>{formatDate(syncState.lastSyncedAt)}</span>
            </div>
            <button className="ghost-button" onClick={() => void retrySync()}>
              Reintentar sync
            </button>
            <button className="ghost-button" onClick={() => void signOut()}>
              Salir
            </button>
          </div>
        </header>

        <div className="app-meta">
          <span>{userEmail}</span>
          {syncState.hasPendingChanges ? <span>Cambios pendientes</span> : <span>Todo al dia</span>}
          {syncState.message ? <span>{syncState.message}</span> : null}
        </div>

        <label className="editor-label" htmlFor="note-editor">
          Nota sincronizada
        </label>
        <textarea
          id="note-editor"
          className="note-editor"
          value={noteContent}
          onChange={(event) => void setNoteContent(event.target.value)}
          placeholder="Escribe aqui. Tus cambios se guardan solos."
          spellCheck
        />
      </section>
    </main>
  );
}

export default App;
