FROM node:8.11-stretch
WORKDIR app
COPY package.json .
RUN npm install
COPY app.js .
CMD ["node", "app.js"]
