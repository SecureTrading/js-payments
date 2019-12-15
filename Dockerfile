FROM securetrading1/js-payments-image:master
COPY . /app/js-payments
WORKDIR /app/js-payments
RUN npm rebuild node-sass
# RUN git pull --ff-only
RUN npm config set js-payments:host merchant.example.com
RUN npm config set unsafe-perm true
RUN npm install -g npm && npm install && npm run build:automated
EXPOSE 8080
ENTRYPOINT ["npm", "start:automated"]
