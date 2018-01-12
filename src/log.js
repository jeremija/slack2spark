const debug = require('debug')

class Logger {
  constructor (name, log = null) {
    this.name = name
    this._log = log || debug(name)
    this.log = this.log.bind(this)
    this.getLogger = this.getLogger.bind(this)
  }
  getLogger (section) {
    const name = [this.name, section].join(':')
    const log = debug(name)
    return new Logger(name, log)
  }
  log () {
    this._log.apply(null, arguments)
  }
}

module.exports = new Logger('slack2spark')
module.exports.Logger = Logger
