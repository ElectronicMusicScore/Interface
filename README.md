# Electronic Music Score - Interface

This is the repository that holds the development of the graphical user interface for the Electronic Music Score.

This repository contains a development web server, this should never be used on production, since it is incomplete, and
may contain bugs and security issues.

## Development server

This server can be used for emulating what the ESP32 would. This is, generating the HTTP server, and providing the API
endpoints for interacting with the hardware, such as Wi-Fi, or storage.

### Configuration

`.env` file can be created, which will be used to configure some parameters of the server. All the available properties
and their default values are:

```dotenv
# The port number for the web server
HTTP_PORT=3000
```

### Start

To start the web server, `npm` can be used:

```shell
npm start
```

### Endpoints

Check the documentation at [Github Pages](https://electronicmusicscore.github.io/Interface).

[![pages-build-deployment](https://github.com/ElectronicMusicScore/Interface/actions/workflows/pages/pages-build-deployment/badge.svg)](https://github.com/ElectronicMusicScore/Interface/actions/workflows/pages/pages-build-deployment)
