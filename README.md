# memoub

<p align="center">
  <strong>Escribe en el movil y sigue en Windows sin pensar en nada mas.</strong>
</p>

<p align="center">
  <a href="https://github.com/fishellVvv/memoub/releases/latest">
    <img alt="Descargar ultima version Android" src="https://img.shields.io/badge/Descargar%20ultima%20version%20Android-2ea44f?style=for-the-badge&logo=android&logoColor=white">
  </a>
</p>

<p align="center">
  <a href="https://memoub.vercel.app">
    <img alt="Abrir version web" src="https://img.shields.io/badge/Abrir%20version%20web-111111?style=for-the-badge&logo=vercel&logoColor=white">
  </a>
</p>

## Que es

`memoub` es una app minima para mantener **una unica nota sincronizada** entre dispositivos.

La experiencia principal ya esta validada en:

- web en produccion
- Android nativo
- sincronizacion entre movil y escritorio
- offline simple con resincronizacion
- conflictos con eleccion entre version local y remota

## Descarga rapida Android

Si te han pasado este repo solo para instalar la app, haz esto:

1. Pulsa el boton grande de arriba
2. En la release mas reciente, descarga el archivo `memoub-android-vX.Y.Z.apk`
3. Instalalo en tu movil Android
4. Abre `memoub`
5. Entra con Google

## Estado actual

- Login con Google funcionando en local y en produccion
- Guardado de la nota funcionando en Supabase
- Persistencia correcta al recargar la aplicacion
- Cache local con soporte offline basico
- Sincronizacion automatica entre sesiones abiertas
- Resincronizacion tras volver desde offline validada
- Conflictos offline detectados con eleccion entre version local y remota
- Panel de conflicto mobile-first ya ajustado visualmente
- Flujo validado entre Android y Windows
- App Android nativa empaquetada con Capacitor y validada en dispositivo real
- APK release firmada validada para distribucion manual fuera de Google Play
- Sistema de temas local por dispositivo funcionando
- Selector de temas con presets, modo sistema y tema `Custom` funcionando
- Selector de idioma con `es` y `en`, con fallback al idioma del sistema
- Sistema tipografico local con fuentes libres y subsets optimizados para `es` y `en`

## Direccion del producto

La siguiente fase toma **Android como experiencia principal** y mantiene un enfoque **mobile-first** para seguir puliendo la interfaz.

Base de esa direccion:

- [Spec Android-first](docs/android-ux.md)
- [Sistema de temas](docs/theme-system.md)

## Version web

- Produccion: `https://memoub.vercel.app`

## Version Android

- Proyecto Android nativo en [`android/`](android)
- Empaquetado con Capacitor
- Login nativo de Google dentro de la app
- Distribucion actual por APK firmada en GitHub Releases

Detalle tecnico:

- [Flujo manual de release Android](docs/android-release.md)

## Stack

- React + TypeScript + Vite
- Supabase Auth + Postgres
- IndexedDB para cache local y soporte offline basico
- `vite-plugin-pwa` para instalacion y cache de la shell
- Capacitor para empaquetado Android nativo
- Sistema de temas local con presets, modo sistema y `Custom`
- Localizacion ligera con selector manual y fallback al idioma del sistema
- Fuentes libres autoalojadas con subsets `latin` y `latin-ext`

## Desarrollo

1. Instala dependencias con `npm install`
2. Copia `.env.example` a `.env`
3. Rellena:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_GOOGLE_WEB_CLIENT_ID` si vas a compilar Android nativo
4. Aplica la SQL de [`supabase/schema.sql`](supabase/schema.sql) en tu proyecto de Supabase
5. Activa Google en Supabase Auth
6. Ejecuta `npm run dev`

## Scripts

- `npm run dev`
- `npm run build`
- `npm run test`

## Seguridad del repo

- No subas `.env`, claves secretas ni credenciales OAuth privadas
- Usa solo la clave publica de Supabase en el frontend
- Mantien fuera del repo `android/keystore.properties` y cualquier keystore release

## Documentacion tecnica

- [TODO del proyecto](docs/todo.md)
- [Stack](docs/stack.md)
- [UX Android](docs/android-ux.md)
- [Sistema de temas](docs/theme-system.md)
- [Release Android manual](docs/android-release.md)
