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

#### `/files` (<kbd>GET</kbd>)

Used for getting the list of all the files stored in the filesystem.

*Example output:*

```json
{
  "files": [
    {
      "path": "/regional.c11amz",
      "size": 69507
    },
    {
      "path": "/garden_gloves_superstructure.mp21",
      "size": 16377
    },
    {
      "path": "/hack_programming_schemas.p7m",
      "size": 52174
    }
  ]
}
```

#### `/nets` (<kbd>GET</kbd>)

Lists all the networks the device has in range.

*Example output:*

```json
{
  "networks": [
    {
      "ssid": "One network"
    },
    {
      "ssid": "Another network"
    }
  ]
}
```

#### `/connect/:ssid` (<kbd>POST</kbd>)

Requests the device to connect to the Wi-Fi network with SSID `ssid`. Requires the body of the request to contain:

```yml
# Replace <password> with the password of the network,
# or leave empty for non-protected networks.
pass=<password>
```

Response can be:

* `ok` (`200`): The device was connected successfully.
* `fail:out-of-range` (`400`): The network is not in range.
* `fail:auth-error` (`400`): Further authentication is required, or password is wrong.
* `fail:unknown-error` (`400`): An unexpected error has occurred.
