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
  beforeAll(() => {
    const { protocol, host } = parsedUrl
    spark = nock(`${protocol}//${host}`)
  })

  afterAll(() => {
    nock.restore()
  })

  const space = spaces[0]
  const endpoint = '/api/messages/' + space.name
  describe('POST ' + endpoint, () => {

    const body = {
      text: "I am a test message <http://slack.com|link>",
      attachments: [{
        "text": "And here's an attachment!"
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
        const mock = spark.post(pathname, body => {
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

    })

  })

})
