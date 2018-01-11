const axios = require('axios')
const bodyParser = require('body-parser')
const config = require('config')
const createError = require('http-errors')
const express = require('express')
const log = require('./log')

const app = express()

const token = config.get('spark.token')
const spaces = config.get('spark.spaces')
const url = config.get('spark.url')
const accessToken = config.get('app.accessToken')

app.use(bodyParser.json({ limit: '2048kb' }))
app.use(bodyParser.urlencoded({ extended: true }))

function slack2spark (payload) {
  const { text, attachments } = payload
  let markdown = text || ''

  if (attachments && attachments.length) {
    const lines = attachments.map(a => '- ' + a.text).join('\n')
    markdown += '\n\n' + lines
  }

  // replace slack formatted links
  return markdown.replace(/<(.*)\|(.*)>/g, (_, a, b) => `[${b}](${a})`)
}

app.get('/', (req, res) => {
  res.json({ app: 'slack2spark', date: new Date() })
})

function convertPayload (req, res, next) {
  if (req.headers['content-type'] === 'application/x-www-form-urlencoded') {
    req.body = JSON.parse(req.body.payload)
  }

  next()
}

function authenticate (req, res, next) {
  let token = req.headers['authorization'] || req.query.token || ''
  token = token.replace(/^Token /, '')
  if (token !== accessToken) {
    return next(createError(401, 'Unauthorized'))
  }

  next()
}

app.use('/api', [
  authenticate,
  convertPayload
])

const createEndpoint = roomId => (req, res, next) => {
  const markdown = slack2spark(req.body)
  log('Got message:', markdown)

  const options = {
    method: 'post',
    url,
    headers: {
      Authorization: `Bearer ${token}`
    },
    data: { markdown, roomId }
  }

  // log('axios', options)
  axios(options)
  .then(() => {
    log('Status OK')
    res.status(200).end()
  })
  .catch(next)
}

spaces.forEach(space => {
  const { roomId, name } = space
  const endpoint = `/api/messages/${name}`
  log('Creating endpoint:', endpoint)
  app.post(endpoint, createEndpoint(roomId))
})

app.use((err, req, res, next) => {
  if (err instanceof createError.HttpError) {
    log(err.statusCode, err.message)
    return res.status(err.statusCode).json({
      error: err.message
    })
  }

  log(err && err.stack)
  res.status(500).json({
    error: 'An unexpected error has occurred'
  })
})

module.exports = app
