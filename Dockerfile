FROM node:alpine

WORKDIR /p2e-bot

COPY package*.json ./

RUN npm install

COPY . .

RUN touch config/production.json

EXPOSE 3000

CMD [ "sh", "scripts/start_production.sh" ]