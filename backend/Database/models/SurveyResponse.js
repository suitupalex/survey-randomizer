'use strict'

var Sequelize = require('sequelize')

module.exports = function generateModel(sequelize) {
  return sequelize.define('surveyResponse', {
    id: {
      type: Sequelize.UUID
    , defaultValue: Sequelize.UUIDV4
    , primaryKey: true
    }
  , surveyQuestionId: {
      type: Sequelize.UUID
    }
  , surveyAnswerId: {
      type: Sequelize.UUID
    }
  })
}
