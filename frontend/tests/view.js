'use strict'

jest.autoMockOff()

var React = require('react/addons')
require('react-tap-event-plugin')()

var Material = require('material-ui')
var AppBar = Material.AppBar
var IconButton = Material.IconButton

var TestUtils = React.addons.TestUtils
var findTag = TestUtils.findRenderedDOMComponentWithTag
var findType = TestUtils.findRenderedComponentWithType

var App = require('../App/App.jsx')
var Creator = require('../App/Creator/Creator.jsx')
var Reports = require('../App/Reports/Reports.jsx')

// Test Specifics
var NAME = 'Frontend/views'

describe(NAME, function describeViews() {
  var test = {}

  it('should setup a test copy of the app', function checkSetup() {
    test.app = TestUtils.renderIntoDocument(
      <App socketUrl={null}/>
    )

    test.creator = findType(test.app, Creator)
    test.creatorMenu = findType(test.creator, AppBar)
    test.creatorMenuIconButton = findType(test.creatorMenu, IconButton)
    test.creatorMenuButton = findTag(test.creatorMenuIconButton, 'button')
  })

  it('should switch to the reports view', function checkReportsView() {
    TestUtils.Simulate.click(test.creatorMenuButton)

    test.reports = findType(test.app, Reports)
    test.reportsMenu = findType(test.reports, AppBar)
    test.reportsMenuIconButton = findType(test.reportsMenu, IconButton)
    test.reportsMenuButton = findTag(test.reportsMenuIconButton, 'button')
  })

  it('should switch to the creator view', function checkCreatorView() {
    TestUtils.Simulate.click(test.reportsMenuButton)

    test.creator = findType(test.app, Creator)
  })
})
