'use strict'

var AmpersandView = require('ampersand-view')

module.exports = AmpersandView.extend({
  template: require('./view.jade')
, events: {
    'submit form': 'handleFormSubmit'
  , 'click body': 'handleContainerClick'
  , 'click #_sr-exit': 'handleExitClick'
  }
, bindings: {
    'model.isSubmitting': {
      type: 'booleanAttribute'
    , selector: 'input'
    , name: 'disabled'
    }
  , 'model.hasSubmitted': {
      type: 'booleanClass'
    , name: '_sr-hidden'
    }
  }
, initialize: function initialize() {
    this.model.view = this
  }
, render: function render() {
    this.renderWithTemplate(this)

    require('./view.scss')

    document.body.appendChild(this.el)

    return this
  }
, handleFormSubmit: function handleFormSubmit(event) {
    event.preventDefault()

    var answerId = event.target
      .querySelector('input[name="answer"]:checked').value

    this.model.submitAnswer(answerId)
  }
, handleContainerClick: function handleContainerClick() {
    if (event.target.id === '_sr') {
      this.model.hasSubmitted = true
      this.fadeOut()
    }
  }
, handleExitClick: function handleExitClick() {
    this.model.hasSubmitted = true
    this.fadeOut()
  }
, fadeOut: function fadeOut() {
    var self = this

    setTimeout(function delayedRemove() {
      self.remove()
    }, 1000)
  } 
})
