'use strict'

const debug = require('debug')('SR:app:reports')
const React = require('react')
const Material = require('material-ui')
const AppBar = Material.AppBar
const IconButton = Material.IconButton
const CircularProgress = Material.CircularProgress

module.exports = React.createClass({
  propTypes: {
    isGoogleLoaded: React.PropTypes.bool
  , reports: React.PropTypes.array
  , strings: React.PropTypes.object
  , switchView: React.PropTypes.func
  }
, childContextTypes: {muiTheme: React.PropTypes.object}
, componentDidMount: function componentDidMount() {
    window.addEventListener('resize', this.drawCharts)
    this.drawCharts()
  }
, componentDidUpdate: function componentDidUpdate() {
    this.drawCharts()
  }
, componentWillUnmount: function componentWillUnmount() {
    window.removeEventListener('resize', this.drawCharts)
  }
, drawCharts: function drawCharts() {
    if (!this.props.isGoogleLoaded) {
      return
    }

    this.props.reports.forEach(this.reportsIterator)
  }
, reportsIterator: function reportsIterator(report, i) {
    if (!window.google) {
      debug('Google charts API is not available.')
      return
    }

    var dataTable = new window.google.visualization.DataTable()
    dataTable.addColumn('string', 'Prompt')
    dataTable.addColumn('number', 'Count')
    dataTable.addRows(report.answers.map(this.answersMapper))
    
    var chart = new window.google.visualization.PieChart(
      document.getElementById('chart-' + i)
    )
    chart.draw(dataTable, {
      backgroundColor: 'transparent'
    , height: 400
    , pieHole: 0.33
    , pieSliceText: 'none'
    , legend: {position: 'labeled'}
    })
  }
, answersMapper: function answersMapper(answer) {
    return [answer.text, answer.count]
  }
, answersReducer: function answersReducer(result, answer) {
    return result + answer.count
  }
, reportsMapper: function reportsMapper(report, i) {
    var isEmpty = report.answers.reduce(this.answersReducer, 0) === 0

    return (
      <div
        className={'row ' + (i % 2 === 1 ? 'indigo lighten-5' : 'white')}
        key={i}
        style={{paddingTop: '2em'}}
      >
        <div className='col s12'>
          <div className='container'>
            <h5>{report.prompt}</h5>
            <b style={{
              display: isEmpty ? 'inline-block' : 'none'
            , marginBottom: '2em'
            }}>
              No responses yet.
            </b>
            <div id={'chart-' + i} style={{
              width: '100%'
            , height: '100%'
            , display: isEmpty ? 'none' : 'block'
            }}/>
          </div>
        </div>
      </div>
    )
  }
, render: function render() {
    var self = this

    var strings = self.props.strings

    var charts = self.props.isGoogleLoaded
      ? self.props.reports.map(self.reportsMapper)
      : (
          <div style={{textAlign: 'center', paddingTop: '10em'}}>
            <CircularProgress mode='indeterminate' size={2}/>
          </div>
        )

    return (
      <section>
        <AppBar
          className='indigo'
          iconElementLeft={<IconButton
            iconClassName='material-icons'
            onClick={function handleClick() {
              self.props.switchView('creator')
            }}
          >active_build</IconButton>}
          title={strings.title}
          zDepth={1}
        />
        <div
          className='pink white-text'
          style={{padding:'1em 0', textAlign: 'center'}}
        >
          <div className='container'>
            <p>{strings.noRefresh}</p>
          </div>
        </div>
        {charts}
      </section>
    )
  }
})
