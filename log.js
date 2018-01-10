module.exports = function log () {
  const args = [new Date().toISOString()].concat(Array.from(arguments))
  console.log.apply(console, args)
}

