FROM klakegg/hugo as build-step
WORKDIR /app
COPY . .
RUN hugo && echo ls

FROM nginx:alpine-slim
COPY --from=build-step /app/public /usr/share/nginx/html
EXPOSE 80
