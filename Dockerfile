FROM securetrading1/js-payments-image:master as builder

COPY . /app/js-payments
WORKDIR /app/js-payments
RUN npm rebuild node-sass
RUN npm config set js-payments:host merchant.example.com
RUN npm config set unsafe-perm true
RUN npm install -g npm
RUN npm install
RUN npm run build

FROM nginx:1.15.12-alpine
COPY --from=builder ./app/js-payments/dist /usr/share/nginx/html
COPY docker/nginx/prod.conf /etc/nginx/conf.d/default.conf
COPY docker/nginx/key.pem /etc/ssl/st-cert/key.pem
COPY docker/nginx/cert.pem /etc/ssl/st-cert/cert.pem
