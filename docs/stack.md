# Stack de `memoub`

## Base

- **Frontend**: React 19 + TypeScript + Vite
- **PWA**: `vite-plugin-pwa`
- **Backend**: Supabase
- **Auth**: Google OAuth con Supabase Auth
- **Base de datos**: Postgres en Supabase
- **Cache local**: IndexedDB
- **Testing**: Vitest

## Enfoque funcional

- Una sola aplicacion web instalable en **Windows** y **Android**
- Una sola nota por usuario
- Texto plano, sin rich text
- Autosave con debounce
- Sincronizacion simple con criterio **last write wins**
- Soporte offline basico con copia local y reintento al volver la conexion
