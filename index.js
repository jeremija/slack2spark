if (!process.env.DEBUG) {
  process.env.DEBUG = 'slack2spark'
  process.env.DEBUG_COLORS = '0'
}
const app = require('./src/app')
const config = require('config')
const { log } = require('./src/log')

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
  log('Listening on', port)
})

function shutdown () {
  log('Received shutdown signal, stopping server.')
  _server.close(() => {
    log('Server stopped.')
    process.exit()
  })
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
