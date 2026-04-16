# memoub

`memoub` es una PWA minima para editar una unica nota y mantenerla sincronizada entre Windows y Android.

## Estado actual

- Login con Google funcionando en local
- Guardado de la nota funcionando en Supabase
- Persistencia correcta al recargar la aplicacion
- Cache local con soporte offline basico
- Sincronizacion automatica entre sesiones abiertas
- Resincronizacion tras volver desde offline validada
- Conflictos offline detectados con eleccion entre version local y remota
- Panel de conflicto mobile-first ya ajustado visualmente
- Flujo validado entre Android y Windows
- Despliegue en produccion funcionando en Vercel
- Sistema de temas local por dispositivo funcionando
- Selector de temas con presets, modo sistema y tema `Custom` funcionando
- Selector de idioma con `es` y `en`, con fallback al idioma del sistema

## Limitacion actual

El flujo principal ya esta validado en local y en produccion. Lo siguiente es pulir mejor la experiencia mobile-first, el editor visual de temas y algunos casos limite de sincronizacion.

## Direccion de producto

La siguiente fase toma **Android como experiencia principal** y usara un enfoque **mobile-first** para el rediseño visual.  
La definicion base de esa experiencia esta en [`docs/android-ux.md`](docs/android-ux.md).

## Stack

- React + TypeScript + Vite
- Supabase Auth + Postgres
- IndexedDB para cache local y soporte offline basico
- `vite-plugin-pwa` para instalacion y cache de la shell
- Sistema de temas local con presets, modo sistema y `Custom`
- Localizacion ligera con selector manual y fallback al idioma del sistema

## Desarrollo

1. Instala dependencias con `npm install`.
2. Copia `.env.example` a `.env` y rellena `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` con la URL del proyecto y la clave publica de Supabase.
3. Aplica la SQL de [`supabase/schema.sql`](supabase/schema.sql) en tu proyecto de Supabase.
4. Activa el proveedor Google en Supabase Auth y anade la URL del frontend en los redirect URLs.
5. Ejecuta `npm run dev`.

## Seguridad del repo

- No subas `.env`, claves secretas ni credenciales OAuth privadas
- Usa solo la clave publica de Supabase en el frontend
- Manten el repo publico libre de URLs privadas de entornos no publicos o credenciales pegadas en ejemplos

## Scripts

- `npm run dev`
- `npm run build`
- `npm run test`

## Despliegue

La app ya esta desplegada en Vercel y el login en produccion ha quedado validado.
Para nuevos despliegues, manten configuradas en el hosting las mismas variables de entorno usadas en local.
