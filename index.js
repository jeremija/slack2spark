const app = require('./app')
const port = process.env.PORT || 3000

const server = app.listen(port, () => {
  console.log('Listening on %s', port)
})

function shutdown () {
  console.log('Received shutdown signal, stopping server.')
  server.close(() => {
    console.log('Server stopped.')
    process.exit()
  })
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
