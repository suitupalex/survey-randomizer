'use strict'

const debug = require('debug')('SR:app')
const io = require('socket.io-client')
const React = require('react')
const Material = require('material-ui')
const ThemeManager = Material.Styles.ThemeManager()
const Creator = require('./Creator/Creator.jsx')
const Reports = require('./Reports/Reports.jsx')

const LOCALES = require('./localization/locales.json')
const STRINGS = {
  'en-US': require('./localization/en/us.json')
}

module.exports = React.createClass({
  propTypes: {
    settingsPrefix: React.PropTypes.string
  , socketUrl: React.PropTypes.string
  }
, childContextTypes: {
    muiTheme: React.PropTypes.object
  }
, getInitialState: function getInitialState() {
    window.app = this

    if (window.google) {
      window.google.load('visualization', '1', {
        packages: ['corechart']
      , callback: this.handleGoogleLoad
      })
    } else {
      debug('Google charts API is not available.')
    }

    require('./app.scss')

    var socket = {}
    if (typeof this.props.socketUrl === 'string') {
      socket = io(this.props.socketUrl)

      socket.on('connect', this.handleSocketConnect)
      socket.on('disconnect', this.handleSocketDisconnect)
      socket.on('survey update', this.handleSurveyUpdate)
      socket.on('reports update', this.handleReportsUpdate)
    }

    var locale = LOCALES.english.us

    return {
      currentView: window.location.pathname.slice(1) || 'creator'
    , locale: locale
    , isGoogleLoaded: false
    , socket: socket
    , strings: STRINGS[locale]
    , questions: []
    , reports: []
    }
  }
, getChildContext: function getChildContext() {
    return {
      muiTheme: ThemeManager.getCurrentTheme()
    }
  }
, componentDidMount: function componentDidMount() {
    window.addEventListener('popstate', this.handlePopstate)
  }
, componentWillUnmount: function componentWillUnmount() {
    window.removeEventListener('popstate', this.handlePopstate)
  }
, login: function login() {
    this.state.socket.emit('login', {type: 'admin'})
  }
, updateSurvey: function updateSurvey(questions) {
    this.state.socket.emit('survey update', questions)
  }
, handlePopstate: function handlePopstate(event) {
    this.switchView(event.state.view, true)
  }
, handleGoogleLoad: function handleGoogleLoad() {
    this.setState({
      isGoogleLoaded: true
    })
  }
, handleSocketConnect: function handleSocketConnect() { 
    debug('Socket connected')

    this.login()

    this.handleSocketSystemEvent()
  }
, handleSocketDisconnect: function handleSocketDisconnect() {
    debug('Socket disconnected')
    this.handleSocketSystemEvent()
  }
, handleSocketSystemEvent: function handleSocketSystemEvent() {
    this.setState({
      socket: this.state.socket
    })
  }
, handleSurveyUpdate: function handleSurveyUpdate(questions) {
    debug('Received survey update:', questions)
    this.setState({
      questions: questions.sort(this.questionSorter)
    })
  }
, handleReportsUpdate: function handleReportsUpdate(reports) {
    debug('Received reports update:', reports)
    this.setState({
      reports: reports
    })
  }
, questionSorter: function questionSorter(a, b) {
    if (a === b) {
      return a.createdAt - b.createdAt
    }

    return a.isArchived ? 1 : -1
  }
, switchView: function switchView(view, noPush) {
    debug('Switching view:', view)

    this.setState({
      currentView: view
    })

    if (noPush) {
      return
    }

    history.pushState({view: view}, '', view)
  }
, render: function render() {
    var page

    switch (this.state.currentView) {
      case 'creator':
        page = (
          <Creator
            questions={this.state.questions}
            strings={this.state.strings.creator}
            switchView={this.switchView}
            updateSurvey={this.updateSurvey}
          />
        )
      break
      case 'reports':
        page = (
          <Reports
            isGoogleLoaded={this.state.isGoogleLoaded}
            reports={this.state.reports}
            strings={this.state.strings.reports}
            switchView={this.switchView}
          />
        )
      break
    }

    return (
      <div>{page}</div>
    )
  }
})
