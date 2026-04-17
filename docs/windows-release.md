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

- `versionName` visible: `1.0.2`, `1.0.3`, `1.1.0`...
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

Ejemplo validado:

```text
src-tauri/target/release/bundle/nsis/memoub_1.0.2_x64-setup.exe
```

## Validacion minima antes de subir

1. Instalar el `.exe`
2. Abrir `memoub`
3. Verificar login con Google
4. Verificar que recuerda la sesion al cerrar con `Quit memoub` y volver a abrir
5. Verificar que la preview del tray refleja la nota real
6. Verificar que el tray sigue funcionando con:
   - abrir
   - cierre a tray
   - `Iniciar con Windows`

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
