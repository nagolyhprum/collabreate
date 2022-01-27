FROM node:10
WORKDIR /home/node/src
RUN mkdir dist && touch dist/index.js
COPY package.json package.json
COPY package-lock.json package-lock.json
RUN npm i
COPY . .
RUN chmod 777 ./wait-for-it.sh
CMD ./wait-for-it.sh database:5432 && (npm run parcel-watch & npm run nodemon)