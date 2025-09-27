# Control Volumétrico - Frontend

Sistema de control volumétrico desarrollado en Angular con autenticación JWT y integración con API .NET Core 8.

---

## 🚀 Tecnologías Principales

- **Angular**: 20.2.0 (Standalone Components)
- **Node.js**: 20+
- **TypeScript**: 5.6+
- **JWT Authentication**: @auth0/angular-jwt
- **Angular Material**: 18+ (UI Components)
- **OpenAPI**: Generación automática de servicios
- **NGXS**: Gestión de estado
- **RxJS**: Programación reactiva
- **Docker**: Contenerización

---

## 📋 Requisitos Previos

- **Node.js**: 20.0.0 o superior
- **npm**: 10.0.0 o superior
- **Angular CLI**: 20.2.0 o superior
- **Docker**: 24.0+ (opcional)
- **API Backend**: .NET Core 8 ejecutándose en `https://localhost:44347`

---

## 🛠️ Instalación y Configuración

### 1. Clonar el Repositorio

```bash
git clone https://github.com/linelsk/ateb-controlvol-front.git
cd ateb-controlvol-front
```

### 2. Instalar Dependencias

```bash
npm install
```

### 3. Configurar Variables de Entorno

Verifica que el archivo `src/environments/environment.ts` tenga la URL correcta del API:

```typescript
export const environment = {
  production: false,
  apiUrl: 'https://localhost:44347'
};
```

### 4. Generar Servicios OpenAPI (Opcional)

Si el swagger.json ha cambiado, regenera los servicios:

```bash
npm run ng-openapi-gen
```

---

## 🏃‍♂️ Ejecución del Proyecto

### Modo Desarrollo

```bash
# Ejecutar servidor de desarrollo
npm start
# o
ng serve
```

La aplicación estará disponible en: **http://localhost:4200**

### Compilación para Producción

```bash
# Build de producción
npm run build
# o
ng build --configuration production
```

Los archivos compilados se generarán en la carpeta `dist/`.

### Ejecutar Tests

```bash
# Tests unitarios
npm test
# o
ng test

# Tests con cobertura
npm run test:coverage
```

---

## 🐳 Despliegue con Docker

### 1. Construir Imagen Docker

```bash
docker build -t control-volumetrico-front .
```

### 2. Ejecutar Contenedor

```bash
docker run -p 8080:80 control-volumetrico-front
```

La aplicación estará disponible en: **http://localhost:8080**

---

## 📁 Estructura del Proyecto

```
control-volumetrico/
├── 📁 src/
│   ├── 📁 app/
│   │   ├── 📁 component/          # Componentes de la aplicación
│   │   │   ├── 📁 home/           # Dashboard principal
│   │   │   ├── 📁 layout/         # Layout de la aplicación
│   │   │   └── 📁 login/          # Componente de login
│   │   ├── 📁 openapi/            # Servicios generados por OpenAPI
│   │   │   ├── 📁 api/
│   │   │   │   ├── 📁 fn/         # Funciones de servicios
│   │   │   │   ├── 📁 models/     # Modelos de datos
│   │   │   │   └── 📁 services/   # Servicios HTTP
│   │   │   └── swagger.json       # Especificación OpenAPI
│   │   ├── 📁 interceptors/       # Interceptores HTTP
│   │   │   ├── jwt.interceptor.ts # Interceptor JWT
│   │   │   └── error.interceptor.ts # Manejo de errores
│   │   ├── 📁 services/           # Servicios de negocio
│   │   │   ├── auth-jwt.service.ts # Servicio JWT principal
│   │   │   └── auth.service.ts    # Wrapper de compatibilidad
│   │   ├── 📁 models/             # Modelos de dominio
│   │   ├── app.config.ts          # Configuración de la app
│   │   ├── app.routes.ts          # Rutas de la aplicación
│   │   └── auth.guard.ts          # Guard de autenticación
│   ├── 📁 environments/           # Variables de entorno
│   │   ├── environment.ts         # Desarrollo
│   │   └── environment.prod.ts    # Producción
│   ├── index.html                 # Página principal
│   ├── main.ts                    # Punto de entrada
│   └── styles.css                 # Estilos globales
├── 📁 docs/                       # Documentación e imágenes
├── 📄 angular.json                # Configuración Angular
├── 📄 package.json                # Dependencias del proyecto
├── 📄 Dockerfile                  # Configuración Docker
├── 📄 ng-openapi-gen.json         # Configuración OpenAPI
└── 📄 README.md                   # Este archivo
```

---

## 🔐 Sistema de Autenticación

### Características JWT

- **Autenticación basada en JWT** con refresh automático
- **Roles de usuario**: Administrador, Cliente
- **Guards de ruta** para proteger componentes
- **Interceptores automáticos** para incluir tokens en requests
- **Manejo de errores** 401/403 con redirección automática

### Flujo de Autenticación

1. **Login**: `POST /api/Auth/login` con email/password
2. **Token Storage**: Almacenamiento seguro en localStorage
3. **Auto-Injection**: Interceptor agrega automáticamente Bearer token
4. **Role Management**: Mapeo de perfilId a roles de aplicación
5. **Auto-Logout**: Redirección automática en tokens expirados

---

## 🌐 Integración con API

### Endpoints Principales

- **Autenticación**: `POST /api/Auth/login`
- **Usuarios**: `GET/POST/PUT /api/Usuarios`
- **Weather**: `GET /api/WeatherForecast` (ejemplo)

### Configuración OpenAPI

El proyecto utiliza `ng-openapi-gen` para generar automáticamente servicios TypeScript desde el swagger.json del backend.

```bash
# Regenerar servicios cuando cambie el API
npm run ng-openapi-gen
```

---

## 🎯 Funcionalidades Principales

### ✅ Implementadas

- **Sistema de Login** con validación de credenciales
- **Dashboard Administrativo** con información del usuario
- **Dashboard Cliente** con datos específicos del rol
- **Navegación Protegida** con guards de autenticación
- **Manejo de Errores** con interceptores HTTP
- **Logout Automático** en tokens expirados
- **Responsive Design** con Angular Material

### 🚧 En Desarrollo

- **Gestión de Usuarios** (CRUD completo)
- **Reportes y Analytics**
- **Configuración de Perfil**
- **Notificaciones en tiempo real**

---

## 🧪 Testing

### Comandos de Testing

```bash
# Tests en modo watch
npm test

# Tests de una sola ejecución
npm run test:ci

# Tests con reporte de cobertura
npm run test:coverage

# Tests con modo headless
ng test --watch=false --browsers=ChromeHeadless
```

### Cobertura de Código

Los reportes de cobertura se generan en la carpeta `coverage/` y incluyen:

- **Statements**: Cobertura de líneas de código
- **Branches**: Cobertura de ramas condicionales
- **Functions**: Cobertura de funciones
- **Lines**: Cobertura de líneas ejecutables

---

## 🔧 Scripts NPM Disponibles

```bash
npm start           # Servidor de desarrollo
npm run build       # Build de producción
npm test            # Tests unitarios
npm run lint        # Linting del código
npm run e2e         # Tests end-to-end
npm run ng-openapi-gen  # Generar servicios OpenAPI
```

---

## 🌍 Variables de Entorno

### Desarrollo (`environment.ts`)

```typescript
export const environment = {
  production: false,
  apiUrl: 'https://localhost:44347'
};
```

### Producción (`environment.prod.ts`)

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://your-production-api.com'
};
```

---

## 📝 Notas Importantes

- **API Backend**: Debe ejecutarse en `https://localhost:44347` para desarrollo
- **CORS**: El backend debe estar configurado para aceptar requests desde `http://localhost:4200`
- **SSL**: El API usa HTTPS, asegúrate de que los certificados estén configurados
- **Tokens JWT**: Se almacenan en localStorage (considerar httpOnly cookies para producción)
- **Roles**: El mapeo de perfilId a roles se maneja en `AuthJwtService.mapPerfilIdToRole()`

---

## 🐛 Solución de Problemas

### Error de CORS

```bash
# Si hay problemas de CORS, usar proxy de Angular
ng serve --proxy-config proxy.conf.json
```

### Error de SSL

```bash
# Para desarrollo, ignorar errores SSL
ng serve --ssl=false
```

### Error de Memoria

```bash
# Para builds grandes, aumentar memoria de Node
export NODE_OPTIONS="--max-old-space-size=8192"
npm run build
```

---

## 🤝 Contribución

1. **Fork** el proyecto
2. **Crea** una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. **Commit** tus cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. **Push** a la rama (`git push origin feature/nueva-funcionalidad`)
5. **Abre** un Pull Request

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

---

## 📞 Soporte y Contacto

Para soporte técnico o consultas sobre el proyecto:

- **Repositorio**: [https://github.com/linelsk/ateb-controlvol-front](https://github.com/linelsk/ateb-controlvol-front)
- **Issues**: [Reportar un problema](https://github.com/linelsk/ateb-controlvol-front/issues)

---

**✨ ¡Proyecto listo para desarrollo! Sigue esta guía y tendrás la aplicación funcionando sin problemas.**