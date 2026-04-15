# memoub

`memoub` es una PWA minima para editar una unica nota y mantenerla sincronizada entre Windows y Android.

## Estado actual

- Login con Google funcionando en local
- Guardado de la nota funcionando en Supabase
- Persistencia correcta al recargar la aplicacion
- Cache local con soporte offline basico
- Sincronizacion automatica entre sesiones abiertas
- Flujo validado entre Android y Windows

## Limitacion actual

El flujo principal ya esta validado entre movil y escritorio, pero todavia falta validar a fondo el comportamiento offline y cerrar el despliegue de produccion.

## Stack

- React + TypeScript + Vite
- Supabase Auth + Postgres
- IndexedDB para cache local y soporte offline basico
- `vite-plugin-pwa` para instalacion y cache de la shell

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

La app esta pensada para desplegarse como sitio estatico en Vercel, Netlify o similar.
Configura las variables de entorno del paso anterior en el hosting.
