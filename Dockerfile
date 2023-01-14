FROM klakegg/hugo as build-step
WORKDIR /app
COPY . .
RUN hugo && echo ls

FROM golang:1.5.1
#COPY --from=build-step /app/public /usr/share/nginx/html
EXPOSE 80
