FROM alpine
RUN apk add --update nodejs npm
COPY package*.json /src/
COPY .env /usr/src/.env
WORKDIR /src
RUN npm install
COPY . .
EXPOSE 3000
ENTRYPOINT ["node", "./app.js"]