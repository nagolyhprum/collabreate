FROM node:10
WORKDIR /home/node/src
COPY demo demo
COPY dist dist
CMD node demo/index.js