'use strict'

// Utility Modules
const debug = {
  express: require('debug')('SR:server:express')
, socket: require('debug')('SR:server:socket')
}
const path = require('path')

// Server Modules
const express = require('express')
const app = express()
const http = require('http').createServer(app)
const io = require('socket.io')(http)

const PATH_FRONTEND = path.join(__dirname, '..', 'frontend')
const PATH_BASE_JS = path.join(PATH_FRONTEND, 'base.bundle.js')
const PATH_BASE = path.join(PATH_FRONTEND, 'base.jade')

app.set('views', PATH_FRONTEND)
app.set('view engine', 'jade')

app.get('/base.js', function serveBaseJs(request, response) {
  response.sendFile(PATH_BASE_JS)
  debug.express('Served /base.js -> ' + PATH_BASE_JS)
})

app.get('*', function serveWildcard(request, response) {
  response.render('base')
  debug.express('Served /* -> ' + PATH_BASE)
})

io.on('connection', function handleConnection(socket) {
  debug.socket('Client connected.')
})

const server = http.listen(process.env.PORT, function listen() {
  const address = server.address()

  const host = address.address
  const port = address.port

  debug.express('Listening on %s:%s', host, port)
})
