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
- Resincronizacion offline simple validada
- Resolucion manual de conflicto local/remoto validada

## Siguiente linea de desarrollo

- Diseñar la interfaz mobile-first partiendo de la spec Android
- Mejorar UX de estados y mensajes de sincronizacion
- Refinar la experiencia del panel de conflicto
- Documentar una rutina simple de release y verificaciones post-deploy

## Pendiente funcional

- Revisar si hace falta mantener algun modo de desarrollo offline mas guiado
- Adaptar la experiencia de Windows a la base Android-first

## Temas a pulir

- Mejorar mensajes de error y estados de sync
- Añadir indicador mas claro cuando hay cambios pendientes
- Revisar estrategia de conflicto si dos dispositivos editan mucho a la vez
- Reducir peso del bundle inicial si hiciera falta
- Revisar las vulnerabilidades reportadas por `npm install`
- Añadir tests de integracion del flujo con Supabase
- Añadir pruebas manuales documentadas para instalacion PWA en Windows y Android
- Mantener fuera del repo publico cualquier clave secreta, client secret o configuracion sensible
