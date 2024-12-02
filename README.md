# Plugins Store

The idea is to provide the user a quick way to discover and install plugins via the plugin store.
This server run to serve plugins.jami.net, the API is the same.

## Prerequisites

+ npm
+ Node.js 18.16+
+ Docker
+ ts-node

## Installation of Node.js 18.16

how to install nvm

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash
```

```bash
wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash
```

```bash
export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")"
```
```bash
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" # This loads nvm
```
verify with
```bash
command -v nvm
```

how to install Node.js 18.16 with nvm

```bash
nvm install 18.16.0
```

# Installation of ts-node

```bash
sudo apt install ts-node
```

# installation of dotenv and typedi

```bash
npm install dotenv typedi
```

# Scripts

run the server

```bash
npm start
```

lint

```bash
npm run lint
```

fix the linting

```bash
npm run fix
```

run tests and see code coverage

```bash
npm test
```

## Add plugin in development environnement

If you want to retrieve plugins via a local self hosted server or via a docker server image you first need to add plugins.

```bash
python3 ./build.py --plugin <path-to-plugin> --arch <architecture-target>
```

## Send API requests

### Get all plugins

```bash
curl -X GET http://localhost:3000/?arch=x86_64-linux-gnu
```
### Get a plugin's details

```bash
curl -X GET http://localhost:3000/details/GreenScreen?arch=AnyArgWorks # Even an invalid arch works but you need to add the arch parameter to get results
```
### Download a plugin by its id

```bash
curl -X GET http://localhost:3000/download/x86_64-linux-gnu/GreenScreen --output ./GreenScreen.jpl
```

### Get a plugin's version

```bash
curl -X GET http://localhost:3000/versions/GreenScreen?arch=x86_64-linux-gnu
```
### Get a plugin's icon

```bash
curl -X GET http://localhost:3000/icons/GreenScreen?arch=x86_64-linux-gnu
```
### Get a plugin's background

```bash
curl -X GET http://localhost:3000/backgrounds/GreenScreen?arch=x86_64-linux-gnu
```
## Contributing

We have a set of ESLint rules that define clear syntax rules (/.eslintrc.json). You will need the following tools:

* ESLint (https://eslint.org/)

We will not accept patches introducing non-ESLint-compliant code.


## Docker

### Installation
To install Docker please read this manual: https://docs.docker.com/engine/install/ubuntu/#install-using-the-repository

> Reminder: To successfully run the docker server image and retrieve plugins your first need to add plugins. To do so, please follow the instructions in the section "Add plugin in development environnement".
### Run the server in a docker container

Build a docker image:

```bash
docker build -t server-image --target server .
```
Run the docker container:

```bash
docker run -p 3000:3000 -ti server-image
```


To stop the container do CTRL + C in the terminal.

### Run tests in the docker container

Build the test image:

```bash
docker build -t test-image --target test .
```

Run the test image:

```bash
docker run test-image
```

### To check if the code has been linted correctly in the docker container

Build the lint image:

```bash
docker build -t lint-image --target lint .
```

Run the lint image:

```bash
docker run lint-image
```
