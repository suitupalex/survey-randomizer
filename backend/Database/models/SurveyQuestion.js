'use strict'

var Sequelize = require('sequelize')

module.exports = function generateModel(sequelize) {
  return sequelize.define('surveyQuestion', {
    id: {
      type: Sequelize.UUID
    , defaultValue: Sequelize.UUIDV4
    , primaryKey: true
    }
  , prompt: {
      type: Sequelize.STRING
    }
  , isArchived: {
      type: Sequelize.BOOLEAN
    }
  })
}
