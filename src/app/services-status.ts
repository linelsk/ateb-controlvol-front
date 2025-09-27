// Servicios temporalmente deshabilitados hasta que se actualice la API
// Los siguientes componentes necesitarán ser actualizados cuando los servicios estén disponibles:

// 1. HomeComponent - usa ClientesService y PolizasService
// 2. LayoutComponent - usa ClientesService

// Para habilitar estos componentes:
// 1. Verificar que los endpoints existan en swagger.json
// 2. Regenerar los servicios con: npx ng-openapi-gen
// 3. Actualizar las importaciones en los componentes
// 4. Probar la funcionalidad

export const DISABLED_SERVICES = [
  'ClientesService',
  'PolizasService'
];