'use strict'

const React = require('react')
const Material = require('material-ui')
const AppBar = Material.AppBar

module.exports = React.createClass({
  propTypes: {
    strings: React.PropTypes.object
  , switchView: React.PropTypes.func
  }
, childContextTypes: {muiTheme: React.PropTypes.object}
, render: function render() {
    var strings = this.props.strings

    return (
      <section>
        <AppBar
          className='indigo'
          title={strings.title}
          zDepth={1}
        />
        <div
          className='pink white-text'
          style={{padding:'1em 0', textAlign: 'center'}}
        >
          <div
            className='container'
            dangerouslySetInnerHTML={
              {__html: '<script src="http://localhost:8080/v1/plugin.js"></script>'}
            }
          >
          </div>
        </div>
      </section>
    )
  }
})
