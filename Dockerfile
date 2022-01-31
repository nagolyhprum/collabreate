FROM node:12
WORKDIR /home/node
RUN mkdir dist && touch dist/index.js
COPY package.json package.json
COPY package-lock.json package-lock.json
RUN npm i
COPY . .
RUN npm run prisma -- generate
RUN chmod 777 ./wait-for-it.sh
CMD ./wait-for-it.sh database:5432 && npm run dev