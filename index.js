const app = require('./app')
const config = require('config')
const port = process.env.PORT || 3000

let server
if (process.env.HTTPS) {
  const fs = require('fs')
  const cert = fs.readFileSync(config.get('app.ssl.cert'))
  const key = fs.readFileSync(config.get('app.ssl.key'))
  server = require('https').createServer({ key, cert }, app)
} else {
  server = require('http').createServer(app)
}

const _server = server.listen(port, () => {
  console.log('Listening on %s', port)
})

function shutdown () {
  console.log('Received shutdown signal, stopping server.')
  _server.close(() => {
    console.log('Server stopped.')
    process.exit()
  })
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
