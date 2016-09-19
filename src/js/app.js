/** @jsx React.DOM */

require('es6-promise').polyfill();

var data = require('./data');
var React = require('react');
var render = require('react-dom').render;
var sw = require('./sw');

/* Components */
var Toast = require('./toast');

/* Pages */
var LineSelector = require('./line-selector');

var Application = React.createClass({
  // Sets the Initial State
  getInitialState: function () {
    return {
      details: [],
      predictions: [],
      stations: []
    };
  },

  // Before we mount the components, do this
  componentWillMount: function () {
    var that = this;

    data.getData(function (data) {
      that.setState(data);
    });
  },

  render: function () {
    return (
      <LineSelector stations={this.state.stations} details={this.state.details} predictions={this.state.predictions}/>
    );
  }
});

sw.register();

render(
  <Application />,
  document.getElementById('app')
);

render(
  <Toast />,
  document.getElementById('toast')
);
