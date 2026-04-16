# UX Windows de `memoub`

## Objetivo

Definir la experiencia esperada de `memoub` en Windows como una app de escritorio ligera, siempre disponible y pensada para consulta rapida.

La idea no es replicar la web sin mas, sino ofrecer una presencia discreta y constante en el escritorio.

## Principios

- Siempre accesible
- Presencia discreta, sin molestar
- Consulta rapida sin abrir una ventana grande
- Apertura inmediata cuando haga falta editar o revisar
- Comportamiento de app nativa de Windows

## Distribucion esperada

- App instalada en Windows
- Inicio automatico con el sistema
- Icono permanente en la bandeja o zona equivalente de la barra de tareas
- Apertura manual solo cuando el usuario quiera interactuar con la ventana

## Comportamiento del icono

- `memoub` debe vivir en la barra de tareas o bandeja de sistema como app residente
- El icono debe ser reconocible y estable
- Al pasar el raton por encima, debe aparecer una previsualizacion util

## Tooltip o previsualizacion

La previsualizacion asociada al icono debe mostrar:

- el contenido completo de la nota
- y al final la informacion del footer:
  - estado de sincronizacion
  - fecha
  - hora de la ultima sincronizacion

Objetivo:

- permitir leer sin abrir la ventana principal
- usar `memoub` como nota siempre disponible de un vistazo

## Ventana principal

Al hacer clic en el icono:

- se abre una ventana simple de `memoub`
- debe tener un tamaño inicial controlado, no demasiado grande
- debe sentirse ligera y directa

Una vez abierta:

- se puede mover
- se puede redimensionar
- se puede minimizar
- se puede maximizar
- debe comportarse como una aplicacion normal de Windows

## Relacion con Android

- Android sigue siendo la referencia del producto para escritura rapida y experiencia mobile-first
- Windows se entiende como el companion de escritorio siempre disponible
- La experiencia de Windows puede ser mas utilitaria, pero debe mantener la identidad visual y funcional de `memoub`

## Consecuencias para arquitectura

Esta UX apunta mejor a una solucion de escritorio empaquetada que a una PWA pura, porque requiere:

- arranque con Windows
- icono residente
- control de ventana nativo
- previsualizacion asociada al icono

La opcion mas natural a evaluar en esta fase es:

- **Tauri** para Windows

## Consecuencias para roadmap

- Primero: cerrar esta spec de experiencia Windows
- Despues: decidir si Windows se resuelve con PWA instalada o con empaquetado nativo
- Si se busca cumplir esta UX completa, la via mas probable es empaquetado nativo
