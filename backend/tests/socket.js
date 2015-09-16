'use strict'

const assert = require('assert')
const async = require('async')
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

  it('should connect admin socket', function checkAdminConnect(done) {
    this.admin = io.connect(address, {forceNew: true})
    this.admin.once('connect', done)
  })

  it('should connect visitor socket', function checkVisitorConnect(done) {
    this.visitor = io.connect(address, {forceNew: true})
    this.visitor.once('connect', done)
  })

  it('should login admin', function checkAdminLogin(done) {
    var self = this

    async.parallel([
      function checkSurveyUpdate(cb) {
        self.admin.once('survey update', function surveyUpdateCb() {
          cb()
        })
      }
    , function checkReportsUpdate(cb) {
        self.admin.once('reports update', function reportsUpdateCb() {
          cb()
        })
      }
    ], done)

    self.admin.emit('login', {type: 'admin'})
  })

  it('should login visitor', function checkAdminLogin(done) {
    this.visitor.once('survey update', function surveyUpdateCb() {
      done()
    })

    this.visitor.emit('login', {type: 'visitor'})
  })
})
