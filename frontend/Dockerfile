FROM node:14.15.4-alpine as build
WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH

# install dependencies
COPY ./package.json ./
COPY ./yarn.lock ./

RUN yarn install --frozen-lockfile --prod --network-timeout 600000

# add app
COPY . .

CMD ["npm", "start"]