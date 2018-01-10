const axios = require('axios')
const bodyParser = require('body-parser')
const createError = require('http-errors')
const config = require('config')
const express = require('express')

const app = express()

const token = config.get('spark.token')
const roomId = config.get('spark.roomId')
const url = config.get('spark.url')
const accessToken = config.get('app.accessToken')

app.use(bodyParser.json({ limit: '2048kb' }))

function slack2spark (payload) {
  const { text, attachments } = payload
  let markdown = text

  if (attachments && attachments.length) {
    const lines = attachments.map(a => '- ' + a.text).join('\n')
    markdown += '\n\n' + lines
  }

  // replace slack formatted links
  return markdown.replace(/<(.*)\|(.*)>/g, (_, a, b) => `[${b}](${a})`)
}

function log () {
  const args = [new Date().toISOString()].concat(Array.from(arguments))
  console.log.apply(console, args)
}

app.get('/', (req, res) => {
  res.json({ app: 'slack2spark', date: new Date() })
})

app.use('/api', (req, res, next) => {
  let token = req.headers['authorization'] || req.query.token || ''
  token = token.replace(/^Token /, '')
  if (token !== accessToken) {
    return next(createError(401, 'Unauthorized'))
  }
  next()
})

app.post('/api/message', (req, res, next) => {
  const markdown = slack2spark(req.body)
  log('Got message:', markdown)

  axios({
    method: 'post',
    url,
    headers: {
      Authorization: `Bearer ${token}`
    },
    data: { markdown, roomId }
  })
  .then(() => {
    log('Status OK')
    res.status(200).end()
  })
  .catch(next)
})

app.use((err, req, res, next) => {
  if (err instanceof createError.HttpError) {
    return res.status(err.statusCode).json({
      error: err.message
    })
  }

  res.status(500).json({
    error: 'An unexpected error has occurred'
  })
})

module.exports = app
