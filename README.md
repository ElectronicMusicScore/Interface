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
      "path": "/pants_drive_clothing.xz",
      "size": 59944
    },
    {
      "path": "/personal.ssdl",
      "size": 37261
    },
    {
      "path": "/operative_forward.msf",
      "size": 40468
    }
  ],
  "info": {
    "used": 137673,
    "max": 223553
  }
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

Responses:

* `ok` (`200`): The device was connected successfully.
* `fail:out-of-range` (`404`): The network is not in range.
* `fail:auth-error` (`401`): Further authentication is required, or password is wrong.
* `fail:unknown-error` (`500`): An unexpected error has occurred.

#### `/upload` (<kbd>PUT</kbd>)

Uploads a file into the filesystem. The file must be named `file` in the form data.

Responses:

* `ok` (`200`): The upload was successful.
* `fail:no-form-files` (`400`): The request doesn't contain any files.
* `fail:no-file` (`406`): There was no file named `file` in the data.
* `fail:internal` (`500`): An internal error occurred.

#### `/rename` (<kbd>PATCH</kbd>)

Renames a file in the filesystem.

Data:

* `FROM` (`string`): The path where the original file is at.
* `TO` (`string`): The path where to rename the original file.
* `FORCE` (`bool`-optional): If true, the target file will be overridden if already exists.

Responses:

* `fail:missing-params` (`400`): If some required params were not found.
* `fail:not-exist` (`404`): If the source file doesn't exist.
* `fail:exist` (`406`): If the target file already exists, and `FORCE` is not set or `false`.
* `fail:internal` (`500`): An internal error occurred.
