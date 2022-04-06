# Electronic Music Score - Interface

This is the repository that holds the development of the graphical user interface for the Electronic Music Score.

This repository contains a development web server, this should never be used on production, since it is incomplete, and
may contain bugs and security issues.

## Development server

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