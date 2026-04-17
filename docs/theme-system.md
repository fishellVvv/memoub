# Theme System

## Objetivo
Reducir cada tema de `memoub` a **8 colores base cerrados** y derivar automáticamente el resto de tokens visuales.

La idea es que cada archivo de tema contenga solo la intención cromática principal, y que el sistema calcule:

- bordes
- overlays
- placeholders
- estados
- botones
- scrollbar
- variantes suaves

Este sistema ya esta implementado y sirve como base del selector de temas y del editor `Custom`.

## Comportamiento por defecto
Si el usuario **no ha elegido un tema explícito**, la app sigue el modo del sistema operativo del dispositivo:

- sistema `light` -> aplica `paper`
- sistema `dark` -> aplica `graphite`

Este seguimiento es local a cada dispositivo y reacciona también si el sistema cambia entre claro y oscuro con la app abierta.

## Persistencia
Las preferencias visuales se guardan **por dispositivo/navegador**, no por usuario.

Eso incluye:

- tema activo explícito, si existe
- configuración completa del tema `Custom`

En las apps empaquetadas de Android y Windows se mantiene esta misma regla: persistencia local por dispositivo.

## Tokens base
Cada tema declara solo estos 8 valores:

```ts
type ThemeBase = {
  background: string;
  surface: string;
  editor: string;
  text: string;
  muted: string;
  accent: string;
  success: string;
  danger: string;
};
```

## Responsabilidad de cada token

- `background`
  Fondo general de la app.

- `surface`
  Header, footer, menú y popups.

- `editor`
  Fondo de la zona de nota.

- `text`
  Texto principal.

- `muted`
  Texto secundario y elementos suaves.

- `accent`
  Color principal del tema.
  Botón principal, foco, resaltados suaves y estados no críticos.

- `success`
  Estado positivo.
  Icono de guardado, sincronización correcta, etc.

- `danger`
  Error, acción destructiva y estado de red problemática.

## Tokens derivados
Estos no se definen manualmente en los temas; salen de los 8 tokens base.

### Texto

- `app-text` -> `text`
- `app-text-muted` -> `muted`
- `app-text-soft` -> versión más suave de `muted`
- `app-text-placeholder` -> `muted` con menor opacidad
- `app-text-disabled` -> `muted` con opacidad media
- `app-text-danger` -> `danger`
- `eyebrow` -> mezcla de `accent` con `muted`

### Superficies

- `surface-start` -> `background`
- `surface-end` -> mezcla de `background` con `surface`
- `surface-glow` -> `accent` con baja opacidad
- `app-screen-highlight` -> `text` o blanco translúcido, según contraste
- `chrome-surface` -> `surface`
- `note-surface` -> `editor`
- `card-surface` -> mezcla de `surface` con `background`
- `menu-surface` -> `surface`
- `conflict-surface` -> mezcla neutra de `surface` y `background`
- `conflict-card-surface` -> mezcla de `editor` con `surface`
- `code-surface` -> `text` con baja opacidad
- `ghost-surface` -> `text` con muy baja opacidad

### Acciones

- `primary-surface` -> `accent`
- `primary-text` -> color automático por contraste sobre `accent`

### Bordes y separación

- `line` -> `text` o `muted` con baja opacidad
- `line-strong` -> misma base, con más presencia
- `card-border` -> derivado de `line`
- `ghost-border` -> derivado de `line-strong`
- `conflict-border` -> derivado neutro de `line-strong`
- `conflict-card-border` -> derivado de `line`

### Overlay y sombras

- `overlay` -> `background` o `text` muy oscuro con opacidad
- `card-shadow` -> sombra neutra derivada de `background`
- `menu-shadow` -> variante más intensa de `card-shadow`
- `conflict-shadow` -> similar a `menu-shadow`, con un poco más de cuerpo

### Estados

- `status-neutral` -> derivado de `muted`
- `status-neutral-ring` -> derivado de `muted`
- `status-saved` -> `success`
- `status-saved-ring` -> `success` con opacidad
- `status-saving` -> `accent`
- `status-saving-ring` -> `accent` con opacidad
- `status-offline` -> `danger`
- `status-offline-ring` -> `danger` con opacidad
- `status-conflict` -> mezcla de `accent` y `danger`
- `status-conflict-ring` -> misma mezcla con opacidad
- `status-loading` -> derivado de `muted`
- `status-loading-ring` -> derivado de `muted`

### Scrollbar

- `scrollbar-track` -> mezcla de `editor` con `surface`
- `scrollbar-thumb` -> derivado de `muted`
- `scrollbar-thumb-hover` -> derivado de `text` o `accent`

## Estrategia técnica
Los derivados se calculan en TypeScript, no en CSS.

Motivos:

- más control
- más fácil testear
- menos dependencia de soporte de `color-mix()`
- más sencillo exportar/importar temas custom en el futuro

## Estructura actual

```text
src/themes/types.ts
src/themes/
  paper.ts
  sea.ts
  graphite.ts
  matrix.ts
src/lib/theme.ts
```

### Cada tema base

```ts
import type { ThemeBase } from "../types";

export const paperTheme: ThemeBase = {
  background: "...",
  surface: "...",
  editor: "...",
  text: "...",
  muted: "...",
  accent: "...",
  success: "...",
  danger: "..."
};
```

### El resolver
`src/lib/theme.ts` se encarga de:

1. recibir un `ThemeBase`
2. generar `ThemeTokens`
3. aplicar variables CSS
4. persistir preferencia

## Criterio de éxito
Consideramos el sistema bien resuelto cuando:

- cada tema tenga solo 8 colores manuales
- el CSS siga consumiendo variables finales, no colores hardcodeados
- cambiar de tema no altere layout ni contraste de forma inesperada
- estados, scrollbar, menú y footer sigan heredando el tema activo
