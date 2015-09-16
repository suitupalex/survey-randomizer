'use strict'

const async = require('async')
const debug = require('debug')('SR:server:database')
const uuid = require('node-uuid')
const Sequelize = require('sequelize')
const sequelize = new Sequelize(process.env.DB)

const SurveyQuestion = require('./models/SurveyQuestion')(sequelize)
const SurveyAnswer = require('./models/SurveyAnswer')(sequelize)
const SurveyResponse = require('./models/SurveyResponse')(sequelize)

exports.SurveyQuestion = SurveyQuestion
exports.SurveyAnswer = SurveyAnswer
exports.SurveyResponse = SurveyResponse

exports.initialize = function initialize(options, callback) {
  async.parallel([
    function syncSurveyQuestion(cb) {
      SurveyQuestion.sync(options)
        .then(function surveyQuestionSyncSuccess() {
          debug('Successfully synced surveyQuestion.')
          cb(null)
        })
        .catch(function surveyQuestionSyncFailure(error) {
          debug('Failed to sync surveyQuestion:', error)
          cb(error)
        })
    }
  , function syncSurveyAnswer(cb) {
      SurveyAnswer.sync(options)
        .then(function surveyAnswerSyncSuccess() {
          debug('Successfully synced surveyAnswer.')
          cb(null)
        })
        .catch(function surveyAnswerSyncFailure(error) {
          debug('Failed to sync surveyAnswer:', error)
          cb(error)
        })
    }
  , function syncSurveyResponse(cb) {
      SurveyResponse.sync(options)
        .then(function surveyResponseSyncSuccess() {
          debug('Successfully synced surveyResponse.')
          cb(null)
        })
        .catch(function surveyResponseSyncFailure(error) {
          debug('Failed to sync surveyResponse:', error)
          cb(error)
        })
    }
  ], callback)
}

exports.updateSurvey = function updateSurvey(creates, updates, callback) {
  debug('Updating survey.')

  SurveyQuestion.bulkCreate(creates)
    .then(function surveyQuestionCreateSuccess() {
      debug('Succesfully created questions.')

      async.each(updates, function updateSurveyQuestion(update, cb) {
        SurveyQuestion.update({
          isArchived: update.isArchived
        }, {
          where: {
            id: update.id
          }
        }).then(function surveyQuestionUpdateSuccess() {
          debug('Succesfully updated questions.')
          cb(null)
        }).catch(function surveyQuestionUpdateFailure(error) {
          debug('Failed to update questions:', error)
          cb(error)
        })
      }, callback)
    })
    .catch(function surveyQuestionCreateFailure(error) {
      debug('Failed to create questions:', error)
      callback(error)
    })

  var answers = creates.reduce(function answerReducer(result, question) {
    var answers = question.answers

    question.answers = answers.map(function answerMapper(answer) {
      answer = {
        id: uuid.v4()
      , surveyQuestionId: question.id
      , text: answer.text
      }

      result.push(answer)

      return answer
    })

    return result
  }, [])

  SurveyAnswer.bulkCreate(answers)
    .then(function surveyAnswerCreateSuccess() {
      debug('Successfully created answers.')
    })
    .catch(function surveyAnswerCreateFailure(error) {
      debug('Failed to create answers:', error)
    })
}

exports.getSurvey = function getSurvey(callback) {
  debug('Getting survey.')

  async.waterfall([
    function getSurveyQuestions(cb) {
      SurveyQuestion.findAll()
        .then(function surveyQuestionGetSuccess(questions) {
          cb(null, questions.map(function questionMapper(question) {
            var q = question.get()
            q.answers = []
            return q
          }))
        })
    }
  , function getSurveyAnswers(questions, cb) {
      SurveyAnswer.findAll()
        .then(function surveyAnswerGetSuccess(answers) {
          answers.forEach(function(answer) {
            answer = answer.get()
            var length = questions.length
            for (let i = 0; i < length; i++) {
              let question = questions[i]
              if (question.id === answer.surveyQuestionId) {
                question.answers.push(answer)
              }
            }
          })
          cb(null, questions)
        })
    }
  ], callback)
}

exports.getResponses = function getResponse(callback) {
  debug('Getting responses.')

  async.waterfall([
    function getSurveyQuestions(cb) {
      SurveyQuestion.findAll()
        .then(function surveyQuestionGetSuccess(questions) {
          cb(null, questions.map(function questionMapper(question) {
            var q = question.get()
            q.answers = []
            return q
          }))
        })
    }
  , function getSurveyAnswers(questions, cb) {
      SurveyAnswer.findAll()
        .then(function surveyAnswerGetSuccess(answers) {
          answers.forEach(function(answer) {
            answer = answer.get()
            var length = questions.length
            answer.count = 0
            for (let i = 0; i < length; i++) {
              let question = questions[i]
              if (question.id === answer.surveyQuestionId) {
                question.answers.push(answer)
                break
              }
            }
          })
          cb(null, questions)
        })
    }
  , function getSurveyResponse(questions, cb) {
      SurveyResponse.findAll()
        .then(function surveyResponseGetSuccess(responses) {
          responses.forEach(function(response) {
            var length = questions.length
            for (let i = 0; i < length; i++) {
              let question = questions[i]
              if (question.id === response.surveyQuestionId) {
                let answers = question.answers
                let answerLength = answers.length
                for (let j = 0; j < answerLength; j++) {
                  let answer = answers[j]
                  if (answer.id === response.surveyAnswerId) {
                    answer.count++
                    break
                  }
                }
                break
              }
            }
          })
          cb(null, questions)
        })
    }
  ], callback)
}

exports.insertSubmission = function insertSubmission(submission, callback) {
  SurveyResponse.create({
    surveyQuestionId: submission.questionId
  , surveyAnswerId: submission.answerId
  }).then(function surveySubmissionInsertSuccess() {
    debug('Successfully created submission.')
    callback(null)
  }).catch(function suveySubmissionInsertFailure(error) {
    debug('Failed to create submission:', error)
    callback(error)
  })
}
