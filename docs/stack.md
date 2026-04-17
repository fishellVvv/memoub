# Stack de `memoub`

## Base

- **Frontend**: React 19 + TypeScript + Vite
- **PWA**: `vite-plugin-pwa`
- **Android nativo**: Capacitor + Android Studio
- **Windows nativo**: Tauri
- **Distribucion Android actual**: APK release firmada para reparto manual
- **Distribucion Windows actual**: instalador `.exe` release firmado por Tauri y repartido manualmente
- **Backend**: Supabase
- **Auth web**: Google OAuth con Supabase Auth
- **Auth Android**: Google Sign-In nativo + `signInWithIdToken` de Supabase
- **Base de datos**: Postgres en Supabase
- **Cache local**: IndexedDB
- **Testing**: Vitest
- **Tipografia**: fuentes libres autoalojadas con subsets `latin` y `latin-ext`

## Enfoque funcional

- Una sola base web compartida entre **Android** y **Windows**
- Una app Android nativa empaquetada a partir de la misma base web
- Una app Windows nativa empaquetada con Tauri
- Una sola nota por usuario
- Texto plano, sin rich text
- Autosave con debounce
- Sincronizacion con deteccion de conflicto y eleccion explicita entre local y remota
- Soporte offline basico con copia local y reintento al volver la conexion
- Preferencias visuales e idioma guardados localmente por dispositivo
- Tipografia local por bundle, sin depender de fuentes propietarias del sistema

## Estado implementado

- Auth con Google ya conectado a Supabase
- Guardado remoto y cache local ya operativos
- La sincronizacion entre sesiones abiertas ya se actualiza automaticamente
- La resincronizacion al volver desde offline ya se ha validado
- Los conflictos entre version local y remota ya se resuelven con eleccion explicita
- El flujo entre Android y Windows ya se ha probado correctamente
- La app Android nativa ya se ha instalado y validado en dispositivo real
- El login nativo de Google dentro de Android ya se ha validado
- La APK release firmada ya se ha generado y validado para distribucion manual
- La base nativa de Windows con Tauri ya esta inicializada en el repo
- La shell Windows ya abre como ventana nativa y usa tray residente
- El cierre a tray, la reapertura desde tray y el autostart ya estan implementados
- La preview de la nota desde el tray ya esta implementada con tema y texto sincronizados
- El instalador Windows real ya se ha generado y validado fuera de `tauri:dev`
- La sesion desktop y la preview del tray ya funcionan tambien en la app instalada
- La release publica de Windows ya vive en GitHub Releases
- El despliegue en Vercel y el acceso en produccion ya se han validado
- El sistema de temas ya incluye presets, modo sistema y editor `Custom`
- El idioma ya puede seguir al sistema o fijarse manualmente en `es` o `en`
- Las fuentes del proyecto ya usan familias libres aptas para uso comercial y cargadas con subsets optimizados
