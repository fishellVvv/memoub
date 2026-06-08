# AGENTS.md

## Rol del repositorio

`memoub` es una app minima para mantener una unica nota sincronizada entre dispositivos.

El objetivo del repo es avanzar el producto de forma ordenada, manteniendo su enfoque: una herramienta pequena, directa y fiable, no una app pesada ni compleja.

El desarrollo se hace en VS Code con ayuda de Codex.

## Rol de Codex

Codex actua como asistente tecnico para implementar, revisar, mantener y documentar el proyecto.

- Antes de proponer o aplicar cambios, debe entender el contexto real del repo.
- Debe evitar cambios masivos sin una razon clara.
- Debe preferir cambios pequenos, revisables y coherentes con el enfoque actual.
- Debe avisar si una tarea mezcla areas que convendria separar, por ejemplo UI, sync, releases, documentacion o versionado.
- Debe distinguir entre corregir un bug, pulir UX, refactorizar, preparar release y actualizar documentacion.

## Criterios de producto

Mantener `memoub` deliberadamente simple:

- una sola nota por usuario
- texto plano
- autosave
- sincronizacion automatica
- soporte offline basico
- resolucion explicita de conflictos
- Android como experiencia principal
- Windows como companion ligero con tray
- distribucion manual por GitHub Releases mientras no se decida otra via

No introducir funciones nuevas que cambien el enfoque sin decision explicita: multiples notas, rich text, import/export, Play Store, Microsoft Store, auto-updater silencioso o instalacion directa de APK.

## Forma de trabajar

- Revisar los archivos relacionados antes de tocar codigo.
- Explicar brevemente la estrategia antes de cambios relevantes.
- Aplicar el cambio minimo necesario.
- No mezclar refactor, cambio visual, cambio funcional, releases y documentacion en un mismo cambio salvo que el usuario lo pida.
- Preferir commits pequenos y faciles de revisar.
- No revertir cambios existentes del usuario sin permiso explicito.
- Si una tarea es amplia, dividirla en fases claras.

## Seguridad

No subir ni introducir en el repo:

- `.env`
- claves privadas
- secretos OAuth
- client secrets
- keystores
- `android/keystore.properties`
- archivos `.jks`
- archivos `.keystore`

No introducir secretos en codigo cliente. Mantener fuera del repo cualquier configuracion sensible.

## Comprobaciones

Para cambios generales, usar cuando proceda:

- `npm run test`
- `npm run build`

Para Windows/Tauri:

- ejecutar `cargo check` desde `src-tauri/`

Para Android release:

- seguir `docs/android-release.md`

Para releases completas:

- seguir `docs/release-checklist.md`

No ejecutar `npm audit`, `npm audit fix`, publicar releases, crear tags, generar artefactos release o cambiar versiones salvo petición explícita.

## Documentacion de referencia

- `README.md`: descripcion publica, descargas, estado actual y uso general.
- `docs/stack.md`: arquitectura, stack tecnico y estado implementado.
- `docs/todo.md`: historico, pendientes y linea de desarrollo.
- `docs/android-ux.md`: criterio Android-first y menu mobile.
- `docs/windows-ux.md`: companion Windows, tray, preview y comportamiento nativo.
- `docs/theme-system.md`: tokens visuales, temas y sistema `Custom`.
- `docs/android-release.md`: build y publicacion manual de APK.
- `docs/windows-release.md`: build y publicacion manual del instalador Windows.
- `docs/release-checklist.md`: comprobaciones manuales antes de publicar.
