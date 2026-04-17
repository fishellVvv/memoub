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

Estado actual de esta linea:

- base nativa implementada con Tauri
- tray residente funcionando
- arranque con Windows configurable desde el menu del tray
- ventana principal con comportamiento nativo ya operativa
- preview de la nota sobre el tray ya implementada
- instalador Windows real ya validado fuera de `tauri:dev`
- release publica Windows ya disponible en GitHub Releases
- login Windows ya validado tambien en instalacion limpia

## Comportamiento del icono

- `memoub` debe vivir en la barra de tareas o bandeja de sistema como app residente
- El icono debe ser reconocible y estable
- Al pasar el raton por encima, debe aparecer una previsualizacion util
- Al cerrar la ventana principal, la app debe seguir viva en tray
- Desde el tray debe poder reabrirse la ventana principal rapidamente

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

Estado actual:

- la preview ya se resuelve como una mini ventana nativa asociada al tray
- ya sigue el tema activo y muestra texto + linea final de sincronizacion
- ya muestra el estado real de la nota y de la sesion en la app instalada
- ya se ha validado sin depender de una sesion heredada de `tauri:dev`
- sigue siendo una zona razonable para pulido fino de UX si hiciera falta

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

Estado actual:

- la ventana ya abre como shell nativa de Tauri
- el tamano inicial actual es de escritorio ligero
- se puede mover, redimensionar, minimizar y maximizar
- al cerrar, vuelve a tray en lugar de cerrar la app entera
- la sesion ya se recuerda correctamente al volver a abrir la app instalada
- el icono final de `memoub` ya esta aplicado en instalador, app y tray

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

La base tecnica fijada para esta fase es:

- **Tauri** para Windows

## Consecuencias para roadmap

- Primero: usar Tauri como base nativa de Windows
- Despues: seguir puliendo la shell ya implementada y mantener el flujo real de distribucion Windows
- Si se quiere cumplir esta UX completa, la via fijada es empaquetado nativo
