# slack2spark

Work in progress. Adapter that receives Slack-compatible webhooks and converts
them to Cisco Spark-compatible webhooks

# usage

```bash
npm test                        - run tests
npm start                       - start the server
HTTPS=1 PORT=8443 node index.js - start the server on port 8443, and use HTTPS
```

Post a slack-compatible message to: http://localhost:3000/app/message and it
will forward the adequate space on Spark. Make sure the user whose token is
used is added to that space.

# configuration

This project uses [node-config](https://github.com/lorenwest/node-config)
module. Configure `config/default.yaml` or add `config/local.yaml`. 

# license

ISC
