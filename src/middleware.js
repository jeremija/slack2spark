const createError = require('http-errors')
const config = require('config')
const { log } = require('./log')

const accessToken = config.get('app.accessToken')

function authenticate (req, res, next) {
  let token = req.headers['authorization'] || req.query.token || ''
  token = token.replace(/^Token /, '')
  if (token !== accessToken) {
    return next(createError(401, 'Unauthorized'))
  }

  next()
}

function convertPayload (req, res, next) {
  if (req.headers['content-type'] === 'application/x-www-form-urlencoded') {
    req.body = JSON.parse(req.body.payload)
  }

  next()
}

function handle404 (req, res, next) {
  res.status(404).json({ error: 'Not found' })
}

const handlePromise = callback => (req, res, next) => {
  callback(req, res)
  .then(result => res.json(result))
  .catch(next)
}

function handleError (err, req, res, next) {
  if (err instanceof createError.HttpError) {
    log(req.path, err.statusCode, err.message)
    return res.status(err.statusCode).json({
      error: err.message
    })
  }

  log(req.path, 500, err && err.stack)
  res.status(500).json({
    error: 'Internal Server Error'
  })
}

module.exports = {
  authenticate,
  convertPayload,
  handle404,
  handlePromise,
  handleError
}
