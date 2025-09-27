# Etapa 1: Build y test
FROM node:20-alpine AS build

WORKDIR /app

# Instala dependencias necesarias para Chrome Headless
RUN apk add --no-cache \
	chromium \
	nss \
	freetype \
	harfbuzz \
	ca-certificates \
	ttf-freefont

ENV CHROME_BIN=/usr/bin/chromium-browser \
	PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

# Copia package.json y package-lock.json
COPY package*.json ./

# Instala dependencias
RUN npm install

# Copia el resto del código fuente
COPY . .



# Ejecuta los tests unitarios usando Chrome Headless con --no-sandbox
#RUN npm run test -- --watch=false --browsers=ChromeHeadless --no-sandbox --code-coverage

# Construye la app Angular para producción
RUN npm run build

# Etapa 2: Servir la app con NGINX
FROM nginx:alpine

COPY --from=build /app/dist/prueba-tecnica-zurich/browser /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
