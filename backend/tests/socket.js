'use strict'

const assert = require('assert')
const io = require('socket.io-client')
const url = require('url')

// Test Specifics
const NAME = 'Backend/Socket'

describe(NAME, function describeSocket() {
  const protocol = 'http' || process.env.PROTOCOL
  const host = 'localhost' || process.env.HOST
  const port = process.env.PORT
  const address = url.format({
    protocol: 'http'
  , hostname: host
  , port: port
  })

  before(function before(done) {
    assert(protocol)
    assert(port)
    assert(host)
    assert(address)

    done()
  })

  it('should connect to socket server', function checkConnect(done) {
    this.socket = io.connect(address)
    this.socket.once('connect', done)
  })
})
