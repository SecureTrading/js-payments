FROM node:lts-alpine as builder

COPY . /app/js-payments
WORKDIR /app/js-payments
RUN npm rebuild node-sass
RUN npm config set js-payments:host merchant.securetrading.net
RUN npm config set unsafe-perm true
RUN npm install -g npm
RUN npm install
RUN npm run build:automated

FROM nginx:stable-alpine
COPY --from=builder ./app/js-payments/dist /usr/share/nginx/html/app
COPY --from=builder ./app/js-payments/dist /usr/share/nginx/html/example
COPY docker/nginx/app.conf /etc/nginx/conf.d/app.conf
COPY docker/nginx/example.conf /etc/nginx/conf.d/example.conf
COPY docker/nginx/cert /etc/ssl/st-cert
