# UX Android de `memoub`

## Objetivo

Definir la experiencia principal de `memoub` tomando **Android como referencia**.  
La version de Windows se adaptara despues a esta logica de uso, no al reves.

## Principios

- Apertura inmediata
- Pantalla limpia, sin ruido
- La nota es el centro absoluto de la app
- Sensacion de app real, no de web con adornos
- Todo lo secundario queda reducido a header y footer

## Distribucion esperada

- App instalada en Android con **icono propio** en pantalla inicial
- Apertura **a pantalla completa**
- Ideal futuro: publicacion en **Play Store**
- Mientras tanto, la UX se diseña como si ya fuera una app movil real

## Estructura de pantalla

### Header

- `memoub` pequeno arriba a la izquierda
- Icono de menu hamburguesa sutil arriba a la derecha
- Sin elementos extra ni indicadores ruidosos en la parte superior

### Cuerpo

- La nota ocupa practicamente todo el ancho disponible
- Sin tarjetas, cajas ni contenedores pesados
- La escritura debe sentirse directa, como escribir sobre la propia pantalla
- La prioridad visual absoluta es el contenido de la nota

### Footer

- Fijo abajo del todo
- Debe mostrar:
  - estado de sincronizacion
  - icono de estado
  - fecha y hora de la ultima sincronizacion
- Puede admitir algun dato adicional en el futuro, pero sin saturar

## Menu hamburguesa

Opciones aprobadas por ahora:

- `Sincronizar ahora`
- `Estado de la cuenta`
- `Cerrar sesion`

## Consecuencias para diseño

- La app debe trabajarse en **mobile-first**
- La version de escritorio sera una adaptacion de esta experiencia
- El estilo debe evitar apariencia de dashboard o formulario
- Los estados de sincronizacion tienen que ser discretos pero claros

## Consecuencias para roadmap

- Primero: cerrar layout y estilo Android
- Despues: adaptar la experiencia a Windows
- Mas adelante: decidir si conviene empaquetado Android real para Store
