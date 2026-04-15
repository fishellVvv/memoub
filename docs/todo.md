# TODO de `memoub`

## Pendiente para dejarlo usable

- Crear `.env` desde `.env.example`
- Configurar `VITE_SUPABASE_URL`
- Configurar `VITE_SUPABASE_ANON_KEY`
- Ejecutar `supabase/schema.sql` en el proyecto Supabase
- Activar login con Google en Supabase Auth
- Añadir las redirect URLs del entorno local y del deploy

## Desarrollo siguiente

- Probar flujo completo de login en local
- Verificar que la primera nota se crea correctamente en Supabase
- Validar sincronizacion real entre Android y Windows
- Validar comportamiento offline y resincronizacion
- Desplegar el frontend en Vercel o similar
- Configurar variables de entorno en el hosting

## Temas a pulir

- Mejorar mensajes de error y estados de sync
- Añadir indicador mas claro cuando hay cambios pendientes
- Revisar estrategia de conflicto si dos dispositivos editan mucho a la vez
- Reducir peso del bundle inicial si hiciera falta
- Revisar las vulnerabilidades reportadas por `npm install`
- Añadir tests de integracion del flujo con Supabase
- Añadir pruebas manuales documentadas para instalacion PWA en Windows y Android
