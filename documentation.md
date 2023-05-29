# API DESIGN ⚙️

Side note: For now, the id is the same as the name of the plugin.

## Get plugins

| **HTTP request** | **Description** |
|--------------|-------------|
| GET | Retrieves the list of plugins |
| GET `/?limit=x` | Retrieves up to x plugins |

The endpoint to retrieve the list of plugins needs to support a per-page query parameter. You can refer to the [documentation on using pagination in the REST API](https://docs.github.com/en/rest/guides/using-pagination-in-the-rest-api?apiVersion=2022-11-28#changing-the-number-of-items-per-page) for more information.


### Code Example

```http
GET
```
Successful response:

```http
HTTP/1.1 200 OK
Content-Type: application/json

[
  {
    "id": "GreenScreen",
    "name": "Gr`http``een Screen",
    "description": "This plugin hides your background during a call. Your background can be blurred or changed with another image.",
    "version": "2.0.0",
    "iconPath": "https://jami.net/plugins/download?id=GreenScreen/icon.svg"
  }
]
```

Unsuccessful response:

```http
HTTP/1.1 500 Internal Server Error
Content-Type: application/json

{
  "error": "Unable to retrieve list of plugins"
}
```

## Get plugin's details by id

endpoint: `/details/<id>`


| **HTTP request** | **Description** |
|--------------|-------------|
| GET /details/<id> | Download a plugin by its id |

### Code example

```http
GET /details/GreenScreen
```

Successful response:

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "id": "GreenScreen",
  "name": "Green Screen",
  "description": "This plugin hides your background during a call. Your background can be blurred or changed with another image.",
  "version": "2.0.0",
  "iconPath": "https://jami.net/plugins/download?id=GreenScreen/icon.svg"
}
```

Unsuccessful response:

```http
HTTP/1.1 404 Not Found
Content-Type: application/json

{
  "error": "Plugin not found"
}
```

## Download plugin by id

endpoint: `/download/<id>`


| **HTTP request** | **Description** |
|--------------|-------------|
| GET `/download/<id>.jpl` | Download a plugin by its id |

Reference: *addons.mozilla.org/firefox/downloads/file/4103048/ublock_origin-1.49.2.xpi*


### Code Example

```http
GET /download/GreenScreen.jpl
```
Successful response:

```http
HTTP/1.1 200 OK
Date: Fri, 12 May 2023 16:02:09 GMT
Last-Modified: Thu, 04 Aug 2022 17:40:16 GMT
Content-Length: 147802469
```

Unsuccessful response:

```http
HTTP/1.1 404 Not Found
Content-Type: application/json

{
  "error": "Plugin not found"
}
```

Possible reasons why the request failed:

+ The plugin doesn't exist or has been removed.
+ The user doesn't have permission to download the plugin.
+ The server is experiencing issues.