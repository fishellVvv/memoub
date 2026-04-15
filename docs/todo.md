# TODO de `memoub`

## Hecho

- Proyecto Supabase creado
- Tabla `notes` y politicas RLS aplicadas
- Login con Google configurado en Supabase
- Variables locales de entorno configuradas
- Login validado en local
- Guardado y persistencia de la nota validados
- Sincronizacion automatica entre dos sesiones validada
- Flujo Android -> Windows validado
- Produccion desplegada en Vercel
- Login y sincronizacion validados en produccion

## Siguiente linea de desarrollo

- Validar comportamiento offline y resincronizacion de extremo a extremo
- Mejorar UX de estados y mensajes de sincronizacion

## Pendiente funcional

- Documentar una rutina simple de release y verificaciones post-deploy

## Temas a pulir

- Mejorar mensajes de error y estados de sync
- Añadir indicador mas claro cuando hay cambios pendientes
- Revisar estrategia de conflicto si dos dispositivos editan mucho a la vez
- Reducir peso del bundle inicial si hiciera falta
- Revisar las vulnerabilidades reportadas por `npm install`
- Añadir tests de integracion del flujo con Supabase
- Añadir pruebas manuales documentadas para instalacion PWA en Windows y Android
- Mantener fuera del repo publico cualquier clave secreta, client secret o configuracion sensible
