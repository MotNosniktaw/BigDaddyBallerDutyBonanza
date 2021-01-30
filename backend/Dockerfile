FROM node:lts-alpine

WORKDIR /user/app

COPY package.json yarn.lock ./
RUN yarn install

COPY . .

EXPOSE 80
CMD ["npm", "start", "dev"]