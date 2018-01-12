const SparkClient = require('./spark')
const bodyParser = require('body-parser')
const config = require('config')
const express = require('express')
const { log, getLogger } = require('./log')
const { slack2spark } = require('./adapters')
const { version } = require('../package.json')

const {
  authenticate,
  convertPayload,
  handle404,
  handleError,
  handlePromise
} = require('./middleware')

const app = express()
const trace = getLogger('trace').log

const spaces = config.get('spark.spaces')
const sparkToken = config.get('spark.token')
const sparkUrl = config.get('spark.url')

const sparkClient = new SparkClient(sparkUrl, sparkToken)

app.disable('x-powered-by')
app.use(bodyParser.json({ limit: '2048kb' }))
app.use(bodyParser.urlencoded({ extended: true }))

app.get('/', (req, res) => {
  res.json({ app: 'slack2spark', date: new Date(), version })
})

app.use('/api', [
  authenticate,
  convertPayload
])

const createEndpoint = roomId => handlePromise(async (req, res, next) => {
  trace(req.body)
  const markdown = slack2spark(req.body)
  log('Got message:', markdown)

  return sparkClient.sendMessage({ roomId, markdown })
})

spaces.forEach(space => {
  const { roomId, name } = space
  const endpoint = `/api/messages/${name}`
  log('Creating endpoint:', endpoint)
  app.post(endpoint, createEndpoint(roomId))
})

app.use(handle404)
app.use(handleError)

module.exports = app
