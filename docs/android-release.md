# Release Android manual

## Objetivo

Generar una **APK release firmada** de `memoub` para distribuirla manualmente fuera de Google Play.

## Estado actual

- El proyecto Android ya vive en [`android/`](../android)
- La app ya se ha instalado y validado en dispositivo real
- El login nativo de Google ya funciona tambien en build `release`

## Archivos locales sensibles

Estos archivos **no deben subirse al repo**:

- `android/keystore.properties`
- `android/*.jks`
- `android/*.keystore`

El proyecto ya los ignora en Git.

## Keystore release

La firma release usa un keystore local, por ejemplo:

- `android/memoub-release.keystore`

Y un archivo local:

- `android/keystore.properties`

Con este formato:

```properties
storeFile=../memoub-release.keystore
storePassword=TU_CONTRASENA_REAL
keyAlias=memoub
keyPassword=TU_CONTRASENA_REAL
```

## Build release

Desde la carpeta [`android/`](../android):

```powershell
./gradlew.bat assembleRelease
```

Salida esperada:

- [`android/app/build/outputs/apk/release/app-release.apk`](../android/app/build/outputs/apk/release/app-release.apk)

## Login de Google en release

Para que el login nativo de Google funcione en la APK release:

1. Hay que registrar en Google Cloud un cliente OAuth de tipo **Android**
2. Debe usar:
   - `package name`: `com.fishellvvv.memoub`
   - el **SHA-1 del certificado release**

Recomendacion:

- mantener **un cliente Android para debug**
- y **otro distinto para release**

Asi no se rompe el flujo de desarrollo al cambiar el SHA-1.

## Versionado de futuras APKs

Antes de generar una nueva APK distribuible, actualiza en [`android/app/build.gradle`](../android/app/build.gradle):

- `versionCode`
- `versionName`

Ejemplo:

```gradle
versionCode 2
versionName "1.1"
```

Regla practica:

- `versionCode` siempre debe **subir**
- `versionName` es la etiqueta visible para humanos

Para que Android actualice correctamente una APK instalada manualmente:

- debe mantenerse el mismo `applicationId`: `com.fishellvvv.memoub`
- debe firmarse con el **mismo keystore release**
- el nuevo `versionCode` debe ser mayor que el anterior

## Flujo manual recomendado

1. Probar cambios en debug
2. Subir `versionCode` y `versionName`
3. Ejecutar `./gradlew.bat assembleRelease`
4. Renombrar la APK con version visible, por ejemplo:
   - `memoub-android-v1.0.1.apk`
5. Probar la APK release en un dispositivo real
6. Subirla a GitHub Releases
7. Distribuirla manualmente

## Carpeta local para subir releases

Si quieres dejar los artefactos listos para publicar en una sola carpeta local, desde la raiz puedes ejecutar:

```powershell
npm run release:collect
```

Eso copia la APK generada a:

```text
release-assets/memoub-android-vX.Y.Z.apk
```

## Distribucion manual

Opciones practicas:

- GitHub Releases
- Google Drive
- Dropbox
- OneDrive

Nota:

- Gmail suele bloquear adjuntos `.apk`
- para correo o almacenamiento intermedio, puede hacer falta renombrar temporalmente el archivo

## Convencion recomendada para futuras versiones

- Tag GitHub: `android-v1.0.1`
- Titulo de la release: `memoub Android v1.0.1`
- Asset principal: `memoub-android-v1.0.1.apk`

Ventaja:

- el historial queda claro para ti
- Android mantiene su propia linea de releases separada de Windows
- el README puede apuntar al asset correcto de Android sin depender de `latest`
