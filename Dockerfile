# Stage 1: Base Image
FROM node:18-alpine as base
WORKDIR /api
COPY package*.json ./
RUN npm ci
COPY . .

# Stage 2: Image for checking the linting
FROM base as lint
RUN npm install gts
CMD ["npm", "run", "lint"]

# Stage 3: Image for running the server
FROM base as server
# create a variable called PORT to be used by the server
EXPOSE 3000

CMD ["npm", "run", "start"]

# Stage 4: Image for running the tests
FROM base as test
CMD ["npm", "run", "test"]
