const axios = require('axios')
const bodyParser = require('body-parser')
const config = require('config')
const express = require('express')

const app = express()

const token = config.get('spark.token')
const roomId = config.get('spark.roomId')
const url = config.get('spark.url')

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

app.post('/', (req, res) => {
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
  .catch(err => {
    log('Error: ' + err.stack)
    res.status(500).end()
  })
})

module.exports = app
