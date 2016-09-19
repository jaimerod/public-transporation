/** @jsx React.DOM */

var React = require('react');
var StationSelector = require('./station-selector');

var LineSelector = React.createClass({
  // Sets the Initial State
  getInitialState: function () {
    return {
      lines: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'J', 'K', 'N'],
      stations: [],
      details: [],
      predictions: [],
      showNext: false
    };
  },

  // Returns true if React should update this component
  shouldComponentsUpdate: function (nextProps, nextState) {
    return true;
  },

  handleSubmit: function (e) {
    var that = this;

    e.preventDefault();

    that.setState({
      line: that.refs.line.value,
      showNext: true
    });
  },

  // Renders the React Component
  render: function () {
    return (
      <div>
        <h1>Train App</h1>
        <p>Please select a train line.</p>
        <form action="">
          <fieldset>
            <ul>
              <li>
                <label>Train Lines:</label>
                <select id="line" ref="line" name="selLine">
                  {this.state.lines.map(function (line, i, arr) {
                    return (
                      <option key={line} value={line}>{line}</option>
                    );
                  })}
                </select>
              </li>
            </ul>
          </fieldset>
          <fieldset>
            <ul>
              <li>
                <input onClick={this.handleSubmit} type="submit" value="Search" />
              </li>
            </ul>
          </fieldset>
        </form>
        <StationSelector
          details={this.props.details}
          line={this.state.line}
          predictions={this.props.predictions}
          stations={this.props.stations}
          visibility={this.state.showNext} />
      </div>
    );
  }
});

module.exports = LineSelector;