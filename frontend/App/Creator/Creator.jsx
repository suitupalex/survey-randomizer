'use strict'

const clone = require('clone')
const deepEqual = require('deep-equal')
const moment = require('moment')
const React = require('react')
const Material = require('material-ui')
const AppBar = Material.AppBar
const IconButton = Material.IconButton
const FlatButton = Material.FlatButton
const RaisedButton = Material.RaisedButton
const TextField = Material.TextField
const Table = Material.Table
const TableHeader = Material.TableHeader
const TableBody = Material.TableBody
const TableRow = Material.TableRow
const TableHeaderColumn = Material.TableHeaderColumn
const TableRowColumn = Material.TableRowColumn

module.exports = React.createClass({
  propTypes: {
    questions: React.PropTypes.array 
  , strings: React.PropTypes.object
  , switchView: React.PropTypes.func
  , updateSurvey: React.PropTypes.func
  }
, childContextTypes: {muiTheme: React.PropTypes.object}
, getInitialState: function getInitialState() {
    return {
      inProgressQuestion: {
        prompt: ''
      , answers: [{text: ''}, {text: ''}]
      }
    , isUpdating: false
    , questions: clone(this.props.questions)
    }
  }
, componentDidMount: function componentDidMount() {
    window.addEventListener('beforeunload', this.handleBeforeUnload)
  }
, componentWillReceiveProps: function componentWillReceiveProps(props) {
    this.setState({
      questions: clone(props.questions)
    })
  }
, componentWillUnmount: function componentWillUnmount() {
    window.removeEventListener('beforeunload', this.handleBeforeUnload)
  }
, handleBeforeUnload: function handleBeforeUnload(event) {
    if (this.checkSynced()) {
      return ''
    }

    var strings = this.props.strings

    event.returnValue = strings.unsavedChanges
    return strings.unsavedChanges
  }
, toggleArchive: function toggleArchive(index) {
    var question = this.state.questions[index]
    question.isArchived = !question.isArchived

    this.setState({
      questions: this.state.questions
    })
  }
, answerMapper: function answerMapper(answer, i) {
    return (
      <li key={'answer-' + i}>{answer.text}</li>
    )
  }
, answerTrimmer: function answerTrimmer(answer) {
    return answer.text.trim()
  }
, questionMapper: function questionMapper(question, i) {
    var self = this

    var strings = self.props.strings.questions

    return (
      <TableRow key={'question-' + i}>
        <TableRowColumn style={{width: '13em'}}>
          {moment(question.createdAt).format('MMM Do, YY HH:mm')}
        </TableRowColumn>
        <TableRowColumn>{question.prompt}</TableRowColumn>
        <TableRowColumn>{question.answers.map(self.answerMapper)}</TableRowColumn>
        <TableRowColumn style={{width: '12em'}}>
          <RaisedButton
            className={question.isArchived ? 'pink' : 'deep-purple lighten-1'}
            label={question.isArchived ? strings.archive.unarchive : strings.archive.archive}
            onClick={function handleClick() { self.toggleArchive(i) }}
            primary={true}
          />
        </TableRowColumn>
      </TableRow>
    )
  }
, inProgressAnswerMapper: function inProgressAnswerMapper(answer, i) {
    var self = this

    var strings = self.props.strings.inProgress

    var deleteButton = i > 1
      ? (
          <RaisedButton
            className='deep-purple lighten-1'
            label={strings.answers.delete}
            onClick={function handleClick() {
              self.deleteInProgressAnswer(i)
            }}
            primary={true}
          />
        )
      : null

    return (
      <TableRow displayBorder={false} key={'answer-' + i}>
        <TableRowColumn style={{paddingTop: 0, paddingBottom: 0}}>
          <TextField
            floatingLabelText={strings.answers.label + (i + 1)}
            hintText={strings.answers.hint}
            onChange={function onChange(event) {
              self.handleInProgressAnswerChange(event, i)
            }}
            style={{width: '100%'}}
            value={answer.text}
          />
        </TableRowColumn>
        <TableRowColumn style={{width: '13em'}}>
          {deleteButton}
        </TableRowColumn>
      </TableRow>
    )
  }
, handleInProgressQuestionChange: function handleInProgressQuestionChange(event) {
    var inProgressQuestion = this.state.inProgressQuestion
    inProgressQuestion.prompt = event.target.value

    this.setState({
      inProgressQuestion: inProgressQuestion
    })
  }
, handleInProgressAnswerChange: function handleInProgressAnswerChange(event, i) {
    var inProgressQuestion = this.state.inProgressQuestion
    inProgressQuestion.answers[i].text = event.target.value

    this.setState({
      inProgressQuestion: inProgressQuestion
    })
  }
, deleteInProgressAnswer: function deleteInProgressAnswer(i) {
    var inProgressQuestion = this.state.inProgressQuestion
    inProgressQuestion.answers.splice(i, 1)

    this.setState({
      inProgressQuestion: inProgressQuestion
    })
  }
, addInProgressAnswer: function addInProgressAnswer() {
    var inProgressQuestion = this.state.inProgressQuestion
    inProgressQuestion.answers.push({
      text: ''
    })

    this.setState({
      inProgressQuestion: inProgressQuestion
    })
  }
, addQuestion: function addQuestion() {
    var inProgressQuestion = this.state.inProgressQuestion
    inProgressQuestion.createdAt = new Date()
    inProgressQuestion.isArchived = false

    var questions = this.state.questions
    questions.unshift(inProgressQuestion)

    this.setState({
      questions: questions
    , inProgressQuestion: {
        prompt: ''
      , answers: [{text: ''}, {text: ''}]
      }
    })
  }
, checkSynced: function checkSynced() {
    return deepEqual(this.props.questions, this.state.questions)
  }
, render: function render() {
    var self = this

    var strings = self.props.strings
    
    var isSynced = self.checkSynced()

    var inProgressQuestion = self.state.inProgressQuestion
    var inProgressAnswers = inProgressQuestion.answers.map(self.inProgressAnswerMapper)

    var questions = self.state.questions.map(self.questionMapper)
    var addQuestionButton = (
      inProgressAnswers.length < 2
      || inProgressQuestion.prompt.trim().length === 0
      || inProgressQuestion.answers.map(this.answerTrimmer).indexOf('') > -1
    ) ? <TableRowColumn style={{width: '13em'}}/>
      : (
          <TableRowColumn style={{width: '13em'}}>
            <RaisedButton
              className='light-green accent-4'
              label={strings.inProgress.add}
              onClick={function handleClick() {
                self.addQuestion()
              }}
              primary={true}
            />
          </TableRowColumn>
        )

    return (
      <section style={{paddingBottom: '3em'}}>
        <AppBar
          className='indigo'
          iconElementLeft={<IconButton
            iconClassName='material-icons'
            onClick={function handleClick() {
              self.props.switchView('reports')
            }}
            >active_assessment</IconButton>}
          iconElementRight={<FlatButton
            disabled={isSynced}
            label={isSynced ? strings.saved : strings.save}
            labelStyle={isSynced ? {opacity: 0.25} : null}
            onClick={function handleClick() {
              self.props.updateSurvey(self.state.questions)
            }}
          />}
          title={strings.title}
          zDepth={1}
        />
        <div
          className='container'
        >
          <header style={{padding: '2em 0'}}>
            <h5>{strings.inProgress.header}</h5>
            <Table
              fixedFooter={false}
              fixedHeader={false}
              multiSelectable={false}
              selectable={false}
            >
              <TableHeader
                adjustForCheckbox={false}
                displaySelectAll={false}
                enableSelectAll={false}
                style={{display: 'none'}}
              >
                <TableRow/>
              </TableHeader>
              <TableBody
                deselectOnClickway={false}
                displayRowCheckbox={false}
                showRowHover={false}
                stripedRows={false}
              >
                <TableRow displayBorder={false}>
                  <TableRowColumn style={{paddingTop: 0, paddingBottom: 0}}>
                    <TextField
                      floatingLabelText={strings.inProgress.prompt.label}
                      hintText={strings.inProgress.prompt.hint}
                      onChange={self.handleInProgressQuestionChange}
                      style={{width: '100%'}}
                      value={inProgressQuestion.prompt}
                    />
                  </TableRowColumn>
                  <TableRowColumn style={{width: '13em'}}/>
                </TableRow>
                {inProgressAnswers}
                <TableRow displayBorder={false}>
                  <TableRowColumn>
                    <RaisedButton
                      className='pink'
                      label={strings.inProgress.answers.add}
                      onClick={function handleClick() {
                        self.addInProgressAnswer()
                      }}
                      primary={true}
                    />
                  </TableRowColumn>
                  {addQuestionButton}
                </TableRow>
              </TableBody>
            </Table>
          </header>
          <article>
            <h5>{strings.questions.header}</h5>
            <Table
              fixedFooter={false}
              fixedHeader={true}
              multiSelectable={false}
              selectable={false}
            >
              <TableHeader
                adjustForCheckbox={false}
                displaySelectAll={false}
                enableSelectAll={false}
              >
                <TableRow>
                  <TableHeaderColumn
                    style={{width: '13em'}}
                    tooltip={strings.questions.createdAt.tooltip}
                  >
                    {strings.questions.createdAt.header}
                  </TableHeaderColumn>
                  <TableHeaderColumn
                    tooltip={strings.questions.prompt.tooltip}
                  >
                    {strings.questions.prompt.header}
                  </TableHeaderColumn>
                  <TableHeaderColumn
                    tooltip={strings.questions.answers.tooltip}
                  >
                    {strings.questions.answers.header}
                  </TableHeaderColumn>
                  <TableHeaderColumn
                    style={{width: '12em'}}
                    tooltip={strings.questions.archive.tooltip}
                  >
                    {strings.questions.archive.header}
                  </TableHeaderColumn>
                </TableRow>
              </TableHeader>
              <TableBody
                deselectOnClickway={false}
                displayRowCheckbox={false}
                showRowHover={false}
                stripedRows={false}
              >
                {questions}
              </TableBody>
            </Table>
          </article>
          <article style={{marginTop: '2em'}}>
            <h5>{strings.reports.header}</h5>
            {strings.reports.instructions} &nbsp;
            <a
              href='#'
              onClick={function handleClick() {
                self.props.switchView('reports')
              }}
            >{strings.reports.link}</a>
          </article>
        </div>
      </section>
    )
  }
})
