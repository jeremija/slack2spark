const app = require('./app')
const config = require('config')
const nock = require('nock')
const request = require('supertest')
const url = require('url')

const spaces = config.get('spark.spaces')
const token = config.get('spark.token')
const sparkUrl = config.get('spark.url')
const accessToken = config.get('app.accessToken')

describe('app', () => {

  const parsedUrl = url.parse(sparkUrl)
  const { pathname } = parsedUrl
  let spark
  beforeEach(() => {
    const { protocol, host } = parsedUrl
    spark = nock(`${protocol}//${host}`)
  })

  afterEach(() => {
    nock.cleanAll()
  })

  describe('GET /', () => {

    it('returns application name and version', () => {
      return request(app)
      .get('/')
      .expect(200)
      .then(res => {
        expect(res.body).toEqual({
          app: 'slack2spark',
          version: jasmine.any(String),
          date: jasmine.any(String)
        })
      })
    })

  })

  describe('404', () => {

    it('returns a json error', () => {
      return request(app)
      .get('/invalid-url')
      .expect(404)
      .expect({ error: 'Not found' })
    })

  })

  const space = spaces[0]
  const endpoint = '/api/messages/' + space.name
  describe('POST ' + endpoint, () => {

    const body = {
      text: 'I am a test message <http://slack.com|link>',
      attachments: [{
        'text': 'And here\'s an attachment!'
      }]
    }

    it('returns status 401 when no token', () => {
      return request(app)
      .post(endpoint)
      .send(body)
      .expect(401)
      .expect({ error: 'Unauthorized' })
    })

    describe('status ok', () => {

      it('sends a message and responds with status 200', () => {
        const mock = spark.post(pathname, function (body) {
          expect(this.headers['authorization']).toEqual('Bearer ' + token)
          expect(body).toEqual({
            markdown: 'I am a test message [link](http://slack.com)\n\n' +
            '- And here\'s an attachment!',
            roomId: space.roomId
          })
          return true
        })
        .reply(200)
        return request(app)
        .post(endpoint + '?token=' + accessToken)
        .send(body)
        .expect(200)
        .then(() => {
          mock.done()
        })
      })

      it('does not fail when no text', () => {
        const mock = spark.post(pathname, function (body) {
          expect(this.headers['authorization']).toEqual('Bearer ' + token)
          expect(body).toEqual({
            markdown: '',
            roomId: space.roomId
          })
          return true
        })
        .reply(200)
        return request(app)
        .post(endpoint + '?token=' + accessToken)
        .send({})
        .expect(200)
        .then(() => {
          mock.done()
        })
      })

      it('works with application/x-www-form-urlencoded header', () => {
        const mock = spark.post(pathname, function (body) {
          expect(this.headers['authorization']).toEqual('Bearer ' + token)
          expect(body).toEqual({
            markdown: 'test\n\n- a\n- b',
            roomId: space.roomId
          })
          return true
        })
        .reply(200)
        return request(app)
        .post(endpoint)
        .set('Authorization', 'Token ' + accessToken)
        .set('Content-type', 'application/x-www-form-urlencoded')
        .send('payload=' + encodeURIComponent(JSON.stringify({
          text: 'test',
          attachments: [{ text: 'a' }, { text: 'b' }]
        })))
        .expect(200)
        .then(() => {
          mock.done()
        })
      })

    })

  })

})
