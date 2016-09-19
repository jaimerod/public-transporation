/** @jsx React.DOM */

var React = require('react');

var Toast = React.createClass({
  // Sets the Initial State
  getInitialState: function () {
    return {
      message: "",
      action: "",
      actionName: ""
    };
  },

  // Returns true if React should update this component
  shouldComponentsUpdate: function (nextProps, nextState) {
    return true;
  },

  // After we mount the components, do this
  componentDidMount: function () {
    var that = this;

    window.addEventListener('toast', function (e) {
      var props = {
        message: e.detail.message,
        actionName: e.detail.actionName
      };

      that.action = e.detail.action;
      that.setState(props);
    });
  },

  doAction: function () {
    this.setState({
      message: '',
      action: '',
      actionName: ''
    });

    this.action();
  },

  // Renders the React Component
  render: function () {
    return (
      <div>
        {this.state.message}
        <a onClick={this.doAction} href="#">{this.state.actionName}</a>
      </div>
    );
  }
});

module.exports = Toast;