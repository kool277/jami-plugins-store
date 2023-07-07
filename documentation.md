# API documentation

## Prerequisites

+ npm
+ Node.js 18.16+
+ Docker

## Installation of Node.js 18.16

how to install Node.js 18.16 with nvm

```bash
$ curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash
```

```bash
$ wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash
```

```bash
$ export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")"\n[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" # This loads nvm
```

```bash
$ command -v nvm
```

how to install Node.js 18.16 with nvm

```bash
$ nvm install 18.16.0
```

## Contributing

We have a set of ESLint rules that define clear syntax rules (/.eslintrc.json). You will need the following tools:

* ESLint (https://eslint.org/)

We will not accept patches introducing non-ESLint-compliant code.

## Docker

To install Docker please read this manual: https://docs.docker.com/engine/install/ubuntu/#install-using-the-repository

The Docker needs a data directory to store the plugins. You need a /data/ folder in your repo. The API will look for the plugins in this folder. This is a temporary situation until we have a database implemented.

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

### To run tests in the docker container

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

## GET methods

### endpoint: `/?arch={arch}`

example:
```bash
curl -X GET http://localhost:3000/?arch=desktop
```

### endpoint: `/details/{id}?arch={arch}`

example:
```bash
curl -X GET http://localhost:3000/details/AudioFilter?arch=desktop
```

### endpoint: `/download/{arch}/{id}`

example:
```bash
curl -X GET http://localhost:3000/download/android/AudioFilter
```

### endpoint: `/icons/{id}?arch={arch}`

example:
```bash
curl -X GET http://localhost:3000/icons/AudioFilter?arch=android
```

### endpoint: `/versions/{id}?arch={arch}`
example:
```bash
curl -X GET http://localhost:3000/versions/AudioFilter?arch=android
```

## Add plugin in development environnement

```bash
python3 ./build.py --plugin <path-to-plugin> --arch <architecture-target>
```