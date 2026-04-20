FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npx @angular/cli build --configuration production

FROM nginx:alpine
# Copy custom nginx config for SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Angular 19 application builder puts files in dist/frontend/browser
COPY --from=build /app/dist/frontend/browser /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
