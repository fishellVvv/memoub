# Release manual Windows de `memoub`

## Objetivo

Dejar un flujo simple y repetible para generar y distribuir la app Windows de `memoub` fuera de una store.

La distribucion actual se hace mediante:

- instalador `.exe` generado por Tauri
- subida manual a GitHub Releases

## Versionado

Antes de sacar una nueva build Windows, alinea la version en:

- [`package.json`](../package.json)
- [`src-tauri/tauri.conf.json`](../src-tauri/tauri.conf.json)
- [`src-tauri/Cargo.toml`](../src-tauri/Cargo.toml)

Regla:

- version visible: `1.0.2`, `1.0.3`, `1.1.0`...
- la version debe subir cada vez que saques un nuevo instalador

## Build release

Desde la raiz del proyecto:

```powershell
npm run build
```

Desde `src-tauri`:

```powershell
cargo check
```

Desde la raiz otra vez:

```powershell
npm run tauri:build
```

## Artefacto generado

El instalador queda aqui:

```text
src-tauri/target/release/bundle/nsis/memoub_X.Y.Z_x64-setup.exe
```

Ejemplo local preparado:

```text
src-tauri/target/release/bundle/nsis/memoub_1.0.3_x64-setup.exe
```

## Validacion minima antes de subir

1. Desinstalar la version anterior marcando `Delete the application data`, si quieres validar una instalacion realmente limpia
2. Instalar el `.exe`
3. Abrir `memoub`
4. Verificar login con Google en primera ejecucion
5. Verificar que recuerda la sesion al cerrar con `Quit memoub` y volver a abrir
6. Verificar que la preview del tray refleja la nota real
7. Verificar que el tray sigue funcionando con:
   - abrir
   - cierre a tray
   - `Iniciar con Windows`

## Nota importante sobre login Windows

La app Windows ya no debe depender de una sesion previa de `tauri:dev`.

El flujo correcto actual es:

- abrir Google en el navegador del sistema
- volver a la app por deep link `com.fishellvvv.memoub://auth/callback`
- completar la sesion en Tauri usando PKCE de Supabase

Si este flujo deja de funcionar en una instalacion limpia, revisa primero:

- `plugins.deep-link.desktop.schemes` en `src-tauri/tauri.conf.json`
- el registro de `tauri-plugin-deep-link` y `tauri-plugin-opener` en `src-tauri/src/lib.rs`
- el flujo desktop en `src/lib/auth-service.ts`, `src/lib/desktop-auth.ts` y `src/lib/supabase.ts`

## Nota importante sobre WebView

La app Windows usa perfiles WebView2 separados para:

- ventana principal
- preview del tray

Si en algun momento una build instalada se comporta como si siguiera ejecutando codigo viejo mientras `tauri:dev` va bien, revisa primero:

- `dataDirectory` de la ventana principal en `src-tauri/tauri.conf.json`
- `preview_data_directory()` en `src-tauri/src/lib.rs`

Esto ya se tuvo que ajustar una vez para romper herencia de un perfil WebView cacheado.

## GitHub Releases

Flujo recomendado:

1. Crear tag:

```text
windows-vX.Y.Z
```

2. Titulo de la release:

```text
memoub Windows vX.Y.Z
```

3. Subir el asset:

```text
memoub_X.Y.Z_x64-setup.exe
```

## Checklist mental para futuras versiones

- build web correcto
- `cargo check` correcto
- instalador `.exe` generado
- app instalada y probada
- sesion recordada
- tray preview correcta
- release subida a GitHub
- README apunta al asset correcto de Windows para la version publica vigente
