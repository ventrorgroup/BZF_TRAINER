FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --ignore-scripts

COPY prisma ./prisma/
RUN npx prisma generate

COPY . .

EXPOSE 3000

CMD ["sh", "-c", "npx prisma db push && npm run seed && npm start"]
