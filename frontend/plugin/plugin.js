'use strict'

var Model = require('./lib/Model/Model')
var View = require('./lib/View/View')

// Reset plugin container styles
require('./reset.scss')

// Generate plugin singleton
if (!window._sr || !window._sr.queue) {
  window._sr = function _sr() {
    var length = arguments.length
    var args = new Array(length)
    for (var i = 0; i < length; i++) {
      args[i] = arguments[i]
    }
    window._sr.queue.push(args)
  }
  window._sr.queue = []
}

var model = window.srPlugin = new Model({})
window.srPluginView = new View({model: model})
