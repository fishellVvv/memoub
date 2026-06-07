# Checklist de verificacion profesional

Este checklist complementa la CI. La CI confirma que el proyecto compila y que los tests automatizados pasan; estos pasos validan los flujos reales de producto antes de publicar una release manual.

## Preflight comun

- Ejecutar `npm run test`.
- Ejecutar `npm run build`.
- Confirmar que `.env`, `android/keystore.properties`, `android/*.jks` y `android/*.keystore` no aparecen en `git status`.
- Confirmar que `package.json`, `src-tauri/tauri.conf.json`, `src-tauri/Cargo.toml` y `android/app/build.gradle` tienen las versiones esperadas para la release.
- Ejecutar `npm audit` solo si se aprueba explicitamente enviar metadatos de dependencias al servicio externo de npm.

## Web

- Abrir la build o el despliegue de produccion.
- Entrar con Google.
- Escribir en la nota y recargar.
- Confirmar que la nota persiste.
- Confirmar que el selector de idioma y temas sigue guardando preferencias locales.
- Probar al menos `paper`, `graphite`, `sea`, `matrix` y `custom`.

## Android

- Ejecutar `npm run build`.
- Ejecutar `npx cap sync android`.
- Desde `android/`, ejecutar `./gradlew.bat assembleRelease` en Windows o `./gradlew assembleRelease` en Linux/macOS.
- Instalar la APK release en un dispositivo real.
- Entrar con Google usando el flujo nativo.
- Escribir offline, volver online y confirmar resincronizacion.
- Confirmar que una APK nueva actualiza correctamente una version previa firmada con el mismo keystore y `versionCode` superior.

## Windows

- Ejecutar `cargo check` desde `src-tauri/`.
- Ejecutar `npm run tauri:build`.
- Desinstalar la version anterior y borrar datos de la aplicacion si se quiere validar instalacion limpia.
- Instalar el `.exe` generado.
- Entrar con Google desde cero y confirmar vuelta por deep link.
- Cerrar la ventana y confirmar que queda en tray.
- Reabrir desde tray.
- Pasar el raton sobre el tray y confirmar que la preview refleja nota, tema y estado.
- Desactivar `Iniciar con Windows`, cerrar con `Quit memoub`, abrir de nuevo y confirmar que la opcion sigue desactivada.

## Conflictos y sincronizacion

- Abrir dos sesiones con la misma cuenta.
- Editar en una sesion y confirmar refresco en la otra.
- Forzar un cambio offline en una sesion y otro remoto en otra.
- Volver online y confirmar que aparece el panel de conflicto.
- Probar conservar version local y version remota en pasadas separadas.
