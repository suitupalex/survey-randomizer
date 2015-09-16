'use strict'

var React = require('react')

var App = require('./App/App.jsx')

React.render(
  <App settingsPrefix='sr_' socketUrl={process.env.SOCKET_URL}/>
, document.body
)
