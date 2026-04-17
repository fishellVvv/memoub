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
- App Android nativa empaquetada con Capacitor e instalada en dispositivo real
- Login nativo de Google validado dentro de la app Android
- APK release firmada validada para distribucion manual fuera de Google Play
- Flujo manual de build Android release documentado
- Arquitectura Windows fijada en Tauri
- Base Tauri inicializada
- Shell Windows nativa funcionando con Tauri
- Ventana Windows con tamano inicial de escritorio implementada
- Cierre a tray y reapertura desde tray implementados
- Opcion de iniciar con Windows implementada desde el menu del tray
- Preview de la nota en el tray implementada y ajustada visualmente
- Instalador Windows `.exe` validado fuera de `tauri:dev`
- Persistencia de sesion y preview del tray validadas en la app Windows instalada
- Flujo manual de release Windows documentado
- Release publica Windows subida a GitHub
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
- Direccion UX de Windows documentada
- Base visual y de UX considerada suficientemente pulida para esta fase
- Icono final de `memoub` definido y aplicado en Android, Windows y web
- Login Windows validado tambien en instalacion limpia de la app instalada
- Releases publicas Android `1.0.1` y Windows `1.0.3` ya publicadas
- README actualizado ya con enlaces a las releases publicas vigentes

## Siguiente linea de desarrollo

- Definir si Android seguira con distribucion manual por APK o pasara a Play Store
- Decidir si Windows seguira con distribucion manual por GitHub Releases o tendra una via mas automatizada

## Pendiente funcional

- Decidir si Android seguira con distribucion manual por APK o pasara a Play Store
- Valorar si conviene anadir import/export o presets compartibles para `Custom`
- Revisar si hace falta mantener algun modo de desarrollo offline mas guiado

## Calidad y robustez

- Vigilar si el bundle de fuentes sigue necesitando mas recorte en el futuro
- Revisar las vulnerabilidades reportadas por `npm install`
- Añadir tests de integracion del flujo con Supabase
- Añadir pruebas manuales documentadas para instalacion Android y Windows
- Mantener fuera del repo publico cualquier clave secreta, client secret o configuracion sensible
