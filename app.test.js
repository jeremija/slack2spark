const app = require('./app')
const config = require('config')
const nock = require('nock')
const request = require('supertest')
const url = require('url')

const roomId = config.get('spark.roomId')
const token = config.get('spark.token')
const sparkUrl = config.get('spark.url')

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

  describe('POST /', () => {

    describe('status ok', () => {

      it('sends a message and responds with status 200', () => {
        const mock = spark.post(pathname, body => {
          expect(body).toEqual({
            markdown: 'I am a test message [link](http://slack.com)\n\n' +
            '- And here\'s an attachment!',
            roomId
          })
          return true
        })
        .reply(200)
        const body = {
          text: "I am a test message <http://slack.com|link>",
          attachments: [{
            "text": "And here's an attachment!"
          }]
        }
        return request(app)
        .post('/')
        .send(body)
        .expect(200)
        .then(() => {
          mock.done()
        })
      })

    })

  })

})
