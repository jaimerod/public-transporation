/** @jsx React.DOM */

var React = require('react');
var Link = require('react-router').Link;

module.exports = React.createClass({
  // Sets the Initial State
  getInitialState: function () {
    return null;
  },

  // Renders the React Component
  render: function () {
    return (
      <div>
        <h2>File not found</h2>
        <Link to="/">Home</Link>
      </div>
    );
  }
});
