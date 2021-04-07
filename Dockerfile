FROM node:15
RUN mkdir /app
ADD . /app
WORKDIR /app

RUN npm i -g typescript

RUN npm i
RUN npm run build

CMD ["npm", "start"]