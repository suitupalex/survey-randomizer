'use strict'

var io = require('socket.io-client')
var AmpersandState = require('ampersand-state')

module.exports = AmpersandState.extend({
  props: {
    questionId: 'string'
  , prompt: 'string'
  , answers: 'array'
  , survey: 'array'
  , isSubmitting: ['boolean', false, false]
  , hasDisplayed: ['boolean', false, false]
  , hasSubmitted: ['boolean', false, false]
  , socket: 'object'
  , strings: ['object', false, function defaultStrings() {
      return {
        exit: 'Exit'
      }
    }]
  }
, initialize: function initialize() {
    var self = this

    localStorage['_sr-prev'] = localStorage['_sr-prev'] || ''

    self.socket = io(process.env.SOCKET_URL)

    self.socket.on('connect', function handleSocketConnection() {
      self.socket.emit('login', {type:'visitor'})
    })

    self.socket.on('survey update', function handleSurveyUpdate(survey) {
      self.survey = survey
      self.pick()
    })

    self.socket.on('survey submission', function handleSurveySubmission(success) {
      self.isSubmitting = false

      if (!success) {
        return
      }

      self.hasSubmitted = true
      self.view.fadeOut()
    })
  }
, pick: function pick() {
    var self = this

    if (self.survey.length === 0) {
      return
    }

    if (self.hasDisplayed) {
      return
    }

    var filteredSurvey = self.survey.reduce(function(result, question) {
      if (localStorage['_sr-prev'].split(',').indexOf(question.id) === -1) {
        result.push(question)
      }

      return result
    }, [])

    if (filteredSurvey.length === 0) {
      return
    }

    var question = filteredSurvey[
      Math.floor(Math.random() * filteredSurvey.length)
    ]
    self.questionId = question.id
    self.prompt = question.prompt
    self.answers = question.answers
    self.hasDisplayed = true

    setTimeout(function delayRender() {
      self.view.render()
    }, 1000)
  }
, submitAnswer: function submitAnswer(answerId) {
    var previous = localStorage['_sr-prev'].split(',')

    if (previous.indexOf(this.questionId) > -1) {
      return
    }
    
    previous.push(this.questionId)
    localStorage['_sr-prev'] = previous

    this.isSubmitting = true

    this.socket.emit('survey submission', {
      questionId: this.questionId
    , answerId: answerId
    })
  }
})
