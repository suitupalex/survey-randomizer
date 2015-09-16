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
const uuid = require('node-uuid')

// DB
const Database = require('./Database/Database')

// Path Constants
const PATH_FRONTEND = path.join(__dirname, '..', 'frontend')
const PATH_DIST = path.join(__dirname, '..', 'dist')
const PATH_EXAMPLE = path.join(PATH_FRONTEND, 'example')
const PATH_PLUGIN_JS = path.join(PATH_DIST, 'plugin.bundle.js')
const PATH_BASE_JS = path.join(PATH_DIST, 'base.bundle.js')
const PATH_BASE_JADE = path.join(PATH_FRONTEND, 'base.jade')
const PATH_EXAMPLE_JS = path.join(PATH_EXAMPLE, 'example.js')
const PATH_EXAMPLE_JADE = path.join(PATH_EXAMPLE, 'example.jade')

// In-memory Cache
var surveyCache = []
var surveyVisitorCache = []
var surveyReportsCache = []

// Methods
function updateAdmins(surveyCache, surveyReportsCache) {
  io.sockets.sockets.forEach(function adminUpdateIterator(socket) {
    if (socket.type !== 'admin') {
      return
    }

    socket.emit('survey update', surveyCache)
    socket.emit('reports update', surveyReportsCache)
  })
}

function stripArchived(survey) {
  return survey.reduce(function surveyReducer(result, question) {
    if (!question.isArchived) {
      result.push(question)
    }

    return result
  }, [])
}

function updateReportsCache() {
  Database.getResponses(function getResponsesCb(error, responses) {
    if (error) {
      throw error
    }

    // Update reports cache
    surveyReportsCache = responses
    debug.socket('Updated reports cache:', surveyReportsCache)

    // Inform all admins of update
    updateAdmins(surveyCache, surveyReportsCache)
  })
}

// Database and survey cache initialization
Database.initialize(null, function dbInitCb(error) {
  if (error) {
    throw error
  }

  Database.getSurvey(function getSurveyCb(error, survey) {
    if (error) {
      throw error
    }

    // Update survey cache
    surveyCache = survey
    surveyVisitorCache = stripArchived(survey)
    // Inform all admins of update
    updateAdmins(surveyCache, surveyReportsCache)
  })

  updateReportsCache()
})

// Express configuration
app.set('views', PATH_FRONTEND)
app.set('view engine', 'jade')

app.get('/base.js', function serveBaseJs(request, response) {
  response.sendFile(PATH_BASE_JS)
  debug.express('Served /base.js -> ' + PATH_BASE_JS)
})

app.get('/v1/plugin.js', function servePluginJs(request, response) {
  response.sendFile(PATH_PLUGIN_JS)
  debug.express('Served /v1/plugin.js -> ' + PATH_PLUGIN_JS)
})

app.get('/example', function serveExample(request, response) {
  response.render('example/example', {cdn: process.env.SOCKET_URL})
  debug.express('Served /example -> ' + PATH_EXAMPLE_JADE)
})

app.get('/example.js', function serveExampleJs(request, response) {
  response.sendFile(PATH_EXAMPLE_JS)
  debug.express('Served /example.js -> ' + PATH_EXAMPLE_JS)
})

app.get('*', function serveWildcard(request, response) {
  response.render('base')
  debug.express('Served /* -> ' + PATH_BASE_JADE)
})

// Socket configuration
io.on('connection', function handleConnection(socket) {
  debug.socket('Client connected.')

  // Pseudo-login
  socket.on('login', function handleLogin(data) {
    debug.socket('Received login:', data)

    socket.type = data.type

    if (data.type === 'visitor') {
      socket.emit('survey update', surveyVisitorCache)
      return
    }

    socket.emit('survey update', surveyCache)
    socket.emit('reports update', surveyReportsCache)
  })

  // Handle survey update request
  socket.on('survey update', function handleSurveyUpdate(questions) {
    debug.socket('Received survey update:', questions)

    if (socket.type !== 'admin') {
      debug.socket('Unauthorized survey update request:', socket)
    }

    // Distinguish between creates and updates
    var creates = []
    var updates = []
    questions.forEach(function assignQuestionIds(question) {
      if (!question.id) {
        question.id = uuid.v4()
        creates.push(question)
        return
      }

      updates.push(question)
    })

    // Store survey in the database
    Database.updateSurvey(
      creates
    , updates
    , function updateSurveyCb(error) {
      if (error) {
        return
      }

      // Update cache
      surveyCache = questions
      surveyVisitorCache = stripArchived(questions)
      debug.socket('Updated cache:', surveyCache)
      updateReportsCache()
    })
  })

  // Handle survey submission request
  socket.on('survey submission', function handleSurveySubmission(submission) {
    debug.socket('Received survey submission:', submission)

    Database.insertSubmission(submission, function insertSubmissionCb(error) {
      if (error) {
        return
      }

      // Update cache
      updateReportsCache()

      socket.emit('survey submission', true)
    })
  })
})

// Server initialization
const server = http.listen(process.env.PORT, function listen() {
  const address = server.address()

  const host = address.address
  const port = address.port

  debug.express('Listening on %s:%s', host, port)
})
