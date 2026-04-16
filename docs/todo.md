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
- Panel de conflicto ajustado visualmente para movil con scroll interno
- Sistema de temas con presets `paper`, `sea`, `graphite`, `matrix` y `custom` implementado
- Opcion `Tema de sistema` implementada con seguimiento local de `light` y `dark`
- Editor visual del tema `Custom` implementado con persistencia local por dispositivo
- Selector de idioma con `es` y `en` implementado
- Fallback al idioma del sistema implementado con ingles por defecto fuera de variantes del espanol
- Sistema tipografico migrado a fuentes libres con subsets optimizados para `es` y `en`

## Siguiente linea de desarrollo

- Diseñar la interfaz mobile-first partiendo de la spec Android
- Seguir puliendo la experiencia mobile-first y el acabado visual
- Refinar la UX del selector de temas y del editor `Custom`
- Refinar la UX del selector de idioma
- Mejorar UX de estados y mensajes de sincronizacion
- Documentar una rutina simple de release y verificaciones post-deploy

## Pendiente funcional

- Adaptar la experiencia de Windows a la base Android-first
- Valorar si conviene anadir import/export o presets compartibles para `Custom`
- Revisar si hace falta mantener algun modo de desarrollo offline mas guiado

## Temas a pulir

- Mejorar mensajes de error y estados de sync
- Revisar accesibilidad y contraste de algunos temas
- Probar el editor `Custom` en pantallas pequenas y tactiles
- Vigilar si el bundle de fuentes sigue necesitando mas recorte en el futuro
- Revisar las vulnerabilidades reportadas por `npm install`
- Añadir tests de integracion del flujo con Supabase
- Añadir pruebas manuales documentadas para instalacion PWA en Windows y Android
- Mantener fuera del repo publico cualquier clave secreta, client secret o configuracion sensible
