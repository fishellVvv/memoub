export const LOCALE_STORAGE_KEY = "memoub.locale";

export type Locale = "es" | "en";

export type LocaleMessages = {
  localeName: string;
  localeCode: string;
  active: string;
  light: string;
  dark: string;
  noSyncYet: string;
  noText: string;
  footerPreparing: string;
  footerSaving: string;
  footerOffline: string;
  footerError: string;
  footerConflict: string;
  footerPending: string;
  footerReady: string;
  footerSynced: string;
  footerUpdated: string;
  loadingLabel: string;
  savingLabel: string;
  savedLabel: string;
  offlineLabel: string;
  errorLabel: string;
  conflictLabel: string;
  readyLabel: string;
  configEyebrow: string;
  configTitle: string;
  configLeadBefore: string;
  configLeadAfter: string;
  configHelper: string;
  authEyebrow: string;
  authTitle: string;
  authLead: string;
  signInWithGoogle: string;
  openMenu: string;
  closePanels: string;
  changeTheme: string;
  changeLanguage: string;
  checkForUpdates: string;
  checkingUpdates: string;
  updateAvailableTitle: string;
  updateAvailableBody: string;
  updateNotAvailableTitle: string;
  updateNotAvailableBody: string;
  updateUnsupportedTitle: string;
  updateUnsupportedBody: string;
  updateErrorTitle: string;
  updateErrorBody: string;
  openUpdate: string;
  closeUpdatePanel: string;
  currentVersionLabel: string;
  availableVersionLabel: string;
  forceSync: string;
  signOut: string;
  themeSelectorLabel: string;
  languageSelectorLabel: string;
  systemTheme: string;
  customTheme: string;
  textSize: string;
  customNote: string;
  customPreviewCopy: string;
  saveChanges: string;
  resetCustom: string;
  fontFamily: string;
  colorLabels: {
    background: string;
    surface: string;
    editor: string;
    text: string;
    muted: string;
    accent: string;
    success: string;
    danger: string;
  };
  fontOptions: {
    sourceSerif4: string;
    ibmPlexSerif: string;
    sourceSans3: string;
    ibmPlexSans: string;
    atkinsonHyperlegible: string;
    ibmPlexMono: string;
    jetbrainsMono: string;
  };
  synchronizedNoteLabel: string;
  notePlaceholder: string;
  conflictEyebrow: string;
  conflictTitle: string;
  conflictBody: string;
  localVersion: string;
  remoteVersion: string;
  keepLocalVersion: string;
  useRemoteVersion: string;
  noEmail: string;
};

const messages: Record<Locale, LocaleMessages> = {
  es: {
    localeName: "Español",
    localeCode: "ES",
    active: "activo",
    light: "claro",
    dark: "oscuro",
    noSyncYet: "Aun sin sincronizar",
    noText: "(sin texto)",
    footerPreparing: "preparando...",
    footerSaving: "guardando...",
    footerOffline: "sin conexion",
    footerError: "error",
    footerConflict: "conflicto",
    footerPending: "pendiente",
    footerReady: "listo",
    footerSynced: "sincronizado",
    footerUpdated: "actualizado",
    loadingLabel: "Cargando",
    savingLabel: "Guardando",
    savedLabel: "Guardado",
    offlineLabel: "Sin conexion",
    errorLabel: "Error",
    conflictLabel: "Conflicto",
    readyLabel: "Listo",
    configEyebrow: "Configuracion pendiente",
    configTitle: "memoub necesita tu proyecto de Supabase",
    configLeadBefore: "Define ",
    configLeadAfter: " en un archivo .env para activar el login y la sincronizacion.",
    configHelper: "La app ya incluye cache local y la logica de sync. Solo falta conectar tu proyecto real.",
    authEyebrow: "Una nota, dos dispositivos",
    authTitle: "Escribe en el movil y sigue en Windows sin pensar en nada mas.",
    authLead: "memoub mantiene una unica nota sincronizada mediante Supabase, con cache local para seguir trabajando incluso si la conexion falla un rato.",
    signInWithGoogle: "Entrar con Google",
    openMenu: "Abrir menu",
    closePanels: "Cerrar paneles",
    changeTheme: "Cambiar tema",
    changeLanguage: "Cambiar idioma",
    checkForUpdates: "Buscar actualizaciones",
    checkingUpdates: "Buscando actualizaciones…",
    updateAvailableTitle: "Actualización disponible",
    updateAvailableBody: "Hay una nueva versión de memoub disponible.",
    updateNotAvailableTitle: "memoub está actualizado",
    updateNotAvailableBody: "Ya tienes la versión más reciente para este dispositivo.",
    updateUnsupportedTitle: "Actualizaciones no disponibles",
    updateUnsupportedBody: "La comprobación de actualizaciones está pensada para las apps instaladas de Android y Windows.",
    updateErrorTitle: "No se pudo buscar actualizaciones",
    updateErrorBody: "Revisa tu conexión e inténtalo de nuevo.",
    openUpdate: "Abrir actualización",
    closeUpdatePanel: "Cerrar",
    currentVersionLabel: "Versión actual:",
    availableVersionLabel: "Versión disponible:",
    forceSync: "Forzar sincronizacion",
    signOut: "Cerrar sesion",
    themeSelectorLabel: "Selector de temas",
    languageSelectorLabel: "Selector de idioma",
    systemTheme: "Tema de sistema",
    customTheme: "Custom",
    textSize: "Tamaño del texto",
    customNote: "nota custom",
    customPreviewCopy: "ajusta colores y fuente hasta dar con tu tono.",
    saveChanges: "Guardar cambios",
    resetCustom: "Reset custom",
    fontFamily: "Font family",
    colorLabels: {
      background: "Background",
      surface: "Surface",
      editor: "Editor",
      text: "Text",
      muted: "Muted",
      accent: "Accent",
      success: "Success",
      danger: "Danger"
    },
    fontOptions: {
      sourceSerif4: "Source Serif 4",
      ibmPlexSerif: "IBM Plex Serif",
      sourceSans3: "Source Sans 3",
      ibmPlexSans: "IBM Plex Sans",
      atkinsonHyperlegible: "Atkinson Hyperlegible",
      ibmPlexMono: "IBM Plex Mono",
      jetbrainsMono: "JetBrains Mono"
    },
    synchronizedNoteLabel: "Nota sincronizada",
    notePlaceholder: "Escribe aqui. Tus cambios se guardan solos.",
    conflictEyebrow: "Conflicto detectado",
    conflictTitle: "Hay dos versiones distintas de la nota.",
    conflictBody: "Elige si quieres conservar lo escrito en este dispositivo o recuperar la version remota guardada.",
    localVersion: "Version local",
    remoteVersion: "Version remota",
    keepLocalVersion: "Mantener mi version",
    useRemoteVersion: "Usar version remota",
    noEmail: "Sin email"
  },
  en: {
    localeName: "English",
    localeCode: "EN",
    active: "active",
    light: "light",
    dark: "dark",
    noSyncYet: "Not synced yet",
    noText: "(no text)",
    footerPreparing: "preparing...",
    footerSaving: "saving...",
    footerOffline: "offline",
    footerError: "error",
    footerConflict: "conflict",
    footerPending: "pending",
    footerReady: "ready",
    footerSynced: "synced",
    footerUpdated: "updated",
    loadingLabel: "Loading",
    savingLabel: "Saving",
    savedLabel: "Saved",
    offlineLabel: "Offline",
    errorLabel: "Error",
    conflictLabel: "Conflict",
    readyLabel: "Ready",
    configEyebrow: "Configuration required",
    configTitle: "memoub needs your Supabase project",
    configLeadBefore: "Set ",
    configLeadAfter: " in a .env file to enable login and sync.",
    configHelper: "The app already includes local cache and sync logic. You only need to connect your real project.",
    authEyebrow: "One note, two devices",
    authTitle: "Write on mobile and keep going on Windows without thinking about it.",
    authLead: "memoub keeps a single note synced through Supabase, with local cache so you can keep working even if the connection drops for a while.",
    signInWithGoogle: "Sign in with Google",
    openMenu: "Open menu",
    closePanels: "Close panels",
    changeTheme: "Change theme",
    changeLanguage: "Change language",
    checkForUpdates: "Check for updates",
    checkingUpdates: "Checking for updates…",
    updateAvailableTitle: "Update available",
    updateAvailableBody: "A new version of memoub is available.",
    updateNotAvailableTitle: "memoub is up to date",
    updateNotAvailableBody: "You already have the latest version for this device.",
    updateUnsupportedTitle: "Updates unavailable",
    updateUnsupportedBody: "Update checks are intended for the installed Android and Windows apps.",
    updateErrorTitle: "Could not check for updates",
    updateErrorBody: "Check your connection and try again.",
    openUpdate: "Open update",
    closeUpdatePanel: "Close",
    currentVersionLabel: "Current version:",
    availableVersionLabel: "Available version:",
    forceSync: "Force sync",
    signOut: "Sign out",
    themeSelectorLabel: "Theme selector",
    languageSelectorLabel: "Language selector",
    systemTheme: "System theme",
    customTheme: "Custom",
    textSize: "Text size",
    customNote: "custom note",
    customPreviewCopy: "adjust colors and type until it feels right.",
    saveChanges: "Save changes",
    resetCustom: "Reset custom",
    fontFamily: "Font family",
    colorLabels: {
      background: "Background",
      surface: "Surface",
      editor: "Editor",
      text: "Text",
      muted: "Muted",
      accent: "Accent",
      success: "Success",
      danger: "Danger"
    },
    fontOptions: {
      sourceSerif4: "Source Serif 4",
      ibmPlexSerif: "IBM Plex Serif",
      sourceSans3: "Source Sans 3",
      ibmPlexSans: "IBM Plex Sans",
      atkinsonHyperlegible: "Atkinson Hyperlegible",
      ibmPlexMono: "IBM Plex Mono",
      jetbrainsMono: "JetBrains Mono"
    },
    synchronizedNoteLabel: "Synced note",
    notePlaceholder: "Write here. Your changes save automatically.",
    conflictEyebrow: "Conflict detected",
    conflictTitle: "There are two different versions of the note.",
    conflictBody: "Choose whether to keep what was written on this device or recover the saved remote version.",
    localVersion: "Local version",
    remoteVersion: "Remote version",
    keepLocalVersion: "Keep my version",
    useRemoteVersion: "Use remote version",
    noEmail: "No email"
  }
};

export function readSystemLocale(): Locale {
  if (typeof navigator === "undefined") {
    return "en";
  }

  const languages = Array.isArray(navigator.languages) && navigator.languages.length > 0 ? navigator.languages : [navigator.language];
  return languages.some((language) => language.toLowerCase().startsWith("es")) ? "es" : "en";
}

export function isLocale(value: string): value is Locale {
  return value === "es" || value === "en";
}

export function readStoredLocale(): Locale | null {
  if (typeof window === "undefined") {
    return null;
  }

  const value = window.localStorage.getItem(LOCALE_STORAGE_KEY);
  return value && isLocale(value) ? value : null;
}

export function writeStoredLocale(locale: Locale): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
}

export function clearStoredLocale(): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(LOCALE_STORAGE_KEY);
}

export function getLocaleMessages(locale: Locale): LocaleMessages {
  return messages[locale];
}
