# slack2spark

[![Build Status](https://travis-ci.org/jeremija/slack2spark.svg?branch=master)](https://travis-ci.org/jeremija/slack2spark)
[![Docker Build](https://img.shields.io/docker/automated/jeremija/slack2spark.svg
)](https://hub.docker.com/r/jeremija/slack2spark/)

Work in progress. Adapter that receives Slack-compatible webhooks and converts
them to Cisco Spark-compatible webhooks

# Usage

```bash
npm test                        - run tests
npm start                       - start the server
HTTPS=1 PORT=8443 node index.js - start the server on port 8443, and use HTTPS
```

Post a slack-compatible message to: http://localhost:3000/app/message and it
will be forwarded to the configured space on Spark. Make sure the user whose
token is used is added to that space.

# Docker

This project is available on Docker Hub: [jeremija/slack2spark][docker].

To enable HTTPS via docker, put your SSL/TLS certificates in `/etc/ssl/certs`
(or similar) folder run the docker image:

```bash
docker run -p 443:3000 \
  -v /etc/ssl/certs:/app/config/ssl
  -e HTTPS=1 \
  -e NODE_CONFIG='{"app":{"ssl":{"cert":"./config/ssl/cert.pem","key":"./config/ssl/cert.key"}}}' \
  jeremija/slack2spark
```

# Configuring Cisco Spark

Go to [My Apps][spark-apps] in Cisco Spark for Developers section. Create a new
bot. Copy _Bot's Access Token_. Go to Cisco Spark app and add your newly
created bot to a space, using the _Bot Username_ field. Go to [Get Room
Details][room] or [List Rooms][rooms] endpoint and get the `id` of your room.

Next, add this information to your configuration, for example
`config/local.yaml`:

```yaml
---
app:
  accessToken: 'changeme'

spark:
  token: '<token of your newly created bot>'
  spaces:
    - name: 'room-name'
      roomId: '<id of your room>'
```

After the app is started, slack-compatible [incoming webhooks][slack-webhooks]
will be forwarded to the configure Cisco Spark space:

```bash
curl -X POST 'localhost:3000/api/messages/room-name?token=changeme' \
  -H 'Content-type: application/json' \
  -d '{"text": "test", "attachments": [{"text":"test"}]}'
```

or

```bash
curl -X POST http://localhost:3000/api/messages/room-name \
  -H 'Authorization: Token changeme' \
  -H 'Content-type: application/json' \
  -d '{"text": "test"}'
```

or 

```bash
curl -X POST http://localhost:3000/api/messages/room-name?token=changeme \
  --data-urlencode 'payload={"text":"test"}'
```

# Config Files

This project uses [node-config][node-config] module. Configure
`config/default.yaml` or add `config/local.yaml`. Extra configuration is
available by putting a JSON configuration in the `NODE_CONFIG` environment
variable to a JSON.

# License

ISC

[node-config]: https://github.com/lorenwest/node-config
[docker]: https://hub.docker.com/r/jeremija/slack2spark/
[spark-apps]: https://developer.ciscospark.com/apps.html
[room]: https://developer.ciscospark.com/endpoint-rooms-roomId-get.html
[rooms]: https://developer.ciscospark.com/endpoint-rooms-get.html 
[slack-webhooks]: https://api.slack.com/incoming-webhooks
