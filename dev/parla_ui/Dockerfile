FROM node:18-slim

WORKDIR /app

COPY . .

COPY package*.json ./

RUN npm install
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]