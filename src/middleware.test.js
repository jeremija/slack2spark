const express = require('express')
const request = require('supertest')
const { handleError } = require('./middleware')

describe('middleware', () => {

  let app
  beforeEach(() => {
    app = express()
  })

  describe('handleError', () => {

    beforeEach(() => {
      app.get('/', (req, res) => {
        throw new Error('test')
      })
      app.use(handleError)
    })

    it('does not expose stack trace on error', () => {
      return request(app)
      .get('/')
      .expect(500)
      .expect({ error: 'Internal Server Error' })
    })

  })

})
