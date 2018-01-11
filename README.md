# slack2spark

[![Build Status](https://travis-ci.org/jeremija/slack2spark.svg?branch=master)](https://travis-ci.org/jeremija/slack2spark)
[![Docker Build](https://img.shields.io/docker/automated/jeremija/slack2spark.svg
)](https://hub.docker.com/r/jeremija/slack2spark/)

Work in progress. Adapter that receives Slack-compatible webhooks and converts
them to Cisco Spark-compatible webhooks

# usage

```bash
npm test                        - run tests
npm start                       - start the server
HTTPS=1 PORT=8443 node index.js - start the server on port 8443, and use HTTPS
```

Post a slack-compatible message to: http://localhost:3000/app/message and it
will be forwarded to the configured space on Spark. Make sure the user whose
token is used is added to that space.

# configuration

This project uses [node-config](https://github.com/lorenwest/node-config)
module. Configure `config/default.yaml` or add `config/local.yaml`. 

# license

ISC
