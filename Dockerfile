FROM alpine:latest
RUN apk update && apk add nodejs npm git
COPY . /app/js-payments
WORKDIR /app/js-payments
RUN npm rebuild node-sass
# RUN git pull --ff-only
RUN npm install -g npm && npm install && npm run prod
EXPOSE 8080
ENTRYPOINT ["npm", "start"]
