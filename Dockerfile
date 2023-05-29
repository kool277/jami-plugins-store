# Stage 1: Base Image
FROM node:18-alpine as base
WORKDIR /api
COPY package*.json ./
RUN npm install
COPY . .
ENV DATA_DIRECTORY=/data

# Stage 2: Final Image for running the server
FROM base as server
EXPOSE 3000
CMD ["npm", "run", "start"]

# Stage 3: Final Image for running the tests
FROM base as test
CMD ["npm", "run", "test"]