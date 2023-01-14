FROM klakegg/hugo as build-step
WORKDIR /app
COPY . .
RUN hugo && echo ls

FROM 0.11.16-onbuild
#COPY --from=build-step /app/public /usr/share/nginx/html
EXPOSE 80
