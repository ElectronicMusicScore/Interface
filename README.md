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

# The port for the HTTPS server, note that SSL_KEY_FILE and SSL_CER_FILE should
# also exist, or the https server won't boot up.
HTTPS_PORT=3001

# The path where the emulated permanent filesystem is at. This directory won't be
# modified. A copy will be generated named "FS_PATH.cache", and the changes made
# will be lost when rebooting the server.
FS_PATH=./fs

# The file where to store the configuration at
CONFIG_FILE=config.yml

# The path where the SSL cert key is stored at
SSL_KEY_FILE=ssl/server.key

# The path where the SSL cert is stored at
SSL_CER_FILE=ssl/server.cert
```

### Start

To start the web server, `npm` can be used:

```shell
npm start
```

### Endpoints

Check the documentation at [Github Pages](https://electronicmusicscore.github.io/Interface).

[![pages-build-deployment](https://github.com/ElectronicMusicScore/Interface/actions/workflows/pages/pages-build-deployment/badge.svg)](https://github.com/ElectronicMusicScore/Interface/actions/workflows/pages/pages-build-deployment)
