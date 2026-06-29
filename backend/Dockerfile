FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --ignore-scripts

COPY prisma ./prisma/
RUN npx prisma generate

COPY . .

EXPOSE 3000

CMD ["sh", "-c", "for i in 1 2 3 4 5; do npx prisma db push && break || (echo 'Retrying DB push...' && sleep 3); done; npm run seed; npm start"]
