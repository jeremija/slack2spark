const axios = require('axios')
const trace = require('./log').getLogger('trace').log

class SparkClient {
  constructor (url, token) {
    this.url = url
    this.token = token
  }
  async sendMessage ({ roomId, markdown }) {
    const { url, token } = this

    const options = {
      method: 'post',
      url,
      headers: {
        Authorization: `Bearer ${token}`
      },
      data: { markdown, roomId }
    }
    trace('SparkClient: %o', options)

    return axios(options)
    .then(response => response.data)
  }
}

module.exports = SparkClient
