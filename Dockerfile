# Stage 1: Base Image
FROM node:18-alpine as base
WORKDIR /api
COPY package*.json ./
RUN npm install
COPY . .

# Stage 2: Final Image for running the server
FROM base as server
EXPOSE 3000
ENV DATA_DIRECTORY=/data
CMD ["npm", "run", "start"]

# Stage 3: Final Image for running the tests
FROM base as test
ENV DATA_DIRECTORY=/tests/data
CMD ["npm", "run", "test"]
