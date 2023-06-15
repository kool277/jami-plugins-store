# Plugins Store

The idea is to provide the user a quick way to discover and install plugins via the plugin store.

# Prerequisites

+ npm
+ Node.js 18.16+
+ Docker

# Installation of Node.js 18.16

how to install Node.js 18.16 with nvm

`$ curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash`

`$ wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash`

`$ export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")"\n[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" # This loads nvm`

`$ command -v nvm`

how to install Node.js 18.16 with nvm

`$ nvm install 18.16.0`

# Scripts

run the server

`$ npm run start`

lint

`$ npm run lint`

fix the linting

`$ npm run fix`

run tests and see code coverage

`$ npm run test`

# Send API requests

### Get all plugins

`$ curl -X GET http://localhost:3000/`

### Get a plugin's details

`$ curl -X GET http://localhost:3000/details/AudioFilter`

### Download a plugin by its id

`$ curl -X GET http://localhost:3000/download/WaterMark.jpl`

# Contributing

We have a set of ESLint rules that define clear syntax rules (/.eslintrc.json). You will need the following tools:

* ESLint (https://eslint.org/)

We will not accept patches introducing non-ESLint-compliant code.

# Docker

To install Docker please read this manual: https://docs.docker.com/engine/install/ubuntu/#install-using-the-repository

The Docker needs a data directory to store the plugins. You need a /data/ folder in your repo. The API will look for the plugins in this folder. This is a temporary situation until we have a database implemented.

## Run the server in a docker container

Build a docker image:

`docker build -t server-image --target server .`


Run the docker container:

`docker run -p 3000:3000 -ti server-image`


To stop the container do CTRL + C in the terminal.

## To run tests in the docker container

Build the test image:

`docker build -t test-image --target test .`

Run the test image:

`docker run test-image`

## To check if the code has been linted correctly in the docker container

Build the lint image:

`docker build -t lint-image --target lint .`

Run the lint image:

`docker run lint-image`

# Linting via pre-commit hook

Set up the pre-commit hook:

In the root directory of your Git repository, navigate to the `.git/hooks` folder.
Create or edit the pre-commit file (with no file extension) in that folder.

If you only want to use our pre-commit hook:

```bash
cp ./extras/scripts/pre-commit.sh .git/hooks/pre-commit
chmod +x ./git/hooks/pre-commit
chmod +x .extras/scripts/pre-commit
```
