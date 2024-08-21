FROM peaceiris/hugo:v0.133.0-full as build-step
WORKDIR /app
COPY . .
RUN hugo --gc --minify && npx pagefind --source 'public'

FROM nginx:alpine-slim
COPY --from=build-step /app/public /usr/share/nginx/html
EXPOSE 80
