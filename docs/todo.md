# TODO de `memoub`

## Hecho

- Proyecto Supabase creado
- Tabla `notes` y politicas RLS aplicadas
- Login con Google configurado en Supabase
- Variables locales de entorno configuradas
- Login validado en local
- Guardado y persistencia de la nota validados
- Sincronizacion manual entre dos sesiones validada

## Siguiente linea de desarrollo

- Anadir sincronizacion automatica entre sesiones abiertas sin depender de `Reintentar sync` o recargar
- Decidir si la actualizacion en vivo se resuelve con Supabase Realtime, polling o una combinacion simple
- Validar que la sesion de Windows refleje cambios hechos desde otra sesion en pocos segundos

## Pendiente funcional

- Validar comportamiento offline y resincronizacion de extremo a extremo
- Probar el flujo desde Android real
- Desplegar el frontend en Vercel o similar
- Configurar variables de entorno en el hosting
- Anadir la URL de produccion a Google OAuth y Supabase Auth

## Temas a pulir

- Mejorar mensajes de error y estados de sync
- Añadir indicador mas claro cuando hay cambios pendientes
- Revisar estrategia de conflicto si dos dispositivos editan mucho a la vez
- Reducir peso del bundle inicial si hiciera falta
- Revisar las vulnerabilidades reportadas por `npm install`
- Añadir tests de integracion del flujo con Supabase
- Añadir pruebas manuales documentadas para instalacion PWA en Windows y Android
- Mantener fuera del repo publico cualquier clave secreta, client secret o configuracion sensible
