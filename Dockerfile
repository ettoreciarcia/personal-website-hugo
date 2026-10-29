FROM node:22-alpine AS build
WORKDIR /site
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /site/dist /usr/share/nginx/html
EXPOSE 80
