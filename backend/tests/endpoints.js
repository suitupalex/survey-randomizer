'use strict'

const assert = require('assert')
const fs = require('fs')
const jade = require('jade')
const path = require('path')
const request = require('request')
const url = require('url')

// Test Specifics
const NAME = 'Backend/Endpoints'

const PATH_FRONTEND = path.join(__dirname, '..', '..', 'frontend')
const PATH_BASE_JS = path.join(PATH_FRONTEND, 'base.bundle.js')
const PATH_BASE = path.join(PATH_FRONTEND, 'base.jade')

describe(NAME, function describeEndpoints() {
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

  it('should request "/"', function checkRoot(done) {
    request(url.resolve(address, '/'), function rootResponse(error, resonse, body) {
      if (error) {
        return done(error)
      }

      assert.equal(body, jade.renderFile(PATH_BASE))

      done()
    })
  })

  it('should request "/base.js"', function checkBaseJs(done) {
    request(url.resolve(address, '/base.js'), function baseJsResponse(error, resonse, body) {
      if (error) {
        return done(error)
      }

      fs.readFile(PATH_BASE_JS, function readBaseJs(error, data) {
        if (error) {
          return done(error)
        }

        assert.equal(body, data)

        done()
      })
    })
  })
})
