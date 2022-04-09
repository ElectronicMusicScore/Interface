---
tags: [development, server, emulation, testing]
---

# Development server

This server can be used for emulating what the ESP32 would. This is, generating the HTTP server, and providing the API
endpoints for interacting with the hardware, such as Wi-Fi, or storage.

## Configuration

`.env` file can be created, which will be used to configure some parameters of the server. All the available properties
and their default values are:

```dotenv
# The port number for the web server
HTTP_PORT=3000

# The path where the emulated permanent filesystem is at. This directory won't be
# modified. A copy will be generated named "FS_PATH.cache", and the changes made
# will be lost when rebooting the server.
FS_PATH=./fs

# The file where to store the configuration at
CONFIG_FILE=config.yml
```

## Start

To start the web server, `npm` can be used:

```shell
npm start
```