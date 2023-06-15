# Stage 1: Base Image
FROM node:18-alpine as base
WORKDIR /api
COPY package*.json ./
RUN npm install
COPY . .

# Stage 2: Image for checking the linting
FROM base as lint
RUN npm install gts
CMD ["npm", "run", "lint"]

# Stage 3: Image for running the server
FROM base as server
EXPOSE 3000
ENV DATA_DIRECTORY=/data
CMD ["npm", "run", "start"]

# Stage 4: Image for running the tests
FROM base as test
ENV DATA_DIRECTORY=/tests/data
CMD ["npm", "run", "test"]
