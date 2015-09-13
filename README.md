# Survey Randomizer

[![Build Status](https://api.travis-ci.org/suitupalex/survey-randomizer.svg)](https://travis-ci.org/suitupalex/survey-randomizer)

A tool to generate, manage, and and randomly display surveys.

## Environment Variables
```bash
$ # DB Address
$ export DB=mysql://username@password:3306/databaseName
$
$ # Server Port
$ export PORT=8080
$
$ # Socket URL
$ export SOCKET_URL=http://localhost:8080
```

## Endpoints
* `/` or `/creator` - The survey creator page.
* `/reports` - The survey reports page.
* `/example` - Example page with the survey plugin.

## Install
```bash
$ npm install
```

## Build
This will build the client-side JS for both the admin page and the plugin.

```bash
$ npm run build
```

## Run
This will run `npm run build` before starting the service.

```bash
$ npm start
```

## Watch and run (for development)
This starts `webpack` to watch for frontend changes. It also wraps the service
with `nodemon` to watch for backend changes.

```bash
$ npm run watch
```

## Test
If an instance of the server is already running:

```bash
$ npm test
```

If not, this will spin up an instance and kill it after the tests are run:

```bash
$ npm run full-test
```

## Debugging
Server-side debugging can be enabled with:

```bash
$ export DEBUG=SR*
```

Client-side debugging can be enabled with:
```js
> localStorage.debug = 'SR*'
```

## License
No License.
