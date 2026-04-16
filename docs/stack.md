# Stack de `memoub`

## Base

- **Frontend**: React 19 + TypeScript + Vite
- **PWA**: `vite-plugin-pwa`
- **Backend**: Supabase
- **Auth**: Google OAuth con Supabase Auth
- **Base de datos**: Postgres en Supabase
- **Cache local**: IndexedDB
- **Testing**: Vitest
- **Tipografia**: fuentes libres autoalojadas con subsets `latin` y `latin-ext`

## Enfoque funcional

- Una sola aplicacion web instalable en **Windows** y **Android**
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
- El despliegue en Vercel y el acceso en produccion ya se han validado
- El sistema de temas ya incluye presets, modo sistema y editor `Custom`
- El idioma ya puede seguir al sistema o fijarse manualmente en `es` o `en`
- Las fuentes del proyecto ya usan familias libres aptas para uso comercial y cargadas con subsets optimizados
