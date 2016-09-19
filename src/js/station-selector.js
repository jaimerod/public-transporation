/** @jsx React.DOM */

var browserHistory = require('react-router').browserHistory;
var React = require('react');
var TrainFinder = require('./train-finder');

var StationSelector = React.createClass({
  // Sets the Initial State
  getInitialState: function () {
    return {
      arrival: null,
      departure: null,
      stations: [],
      showNext: false
    };
  },

  // Returns true if React should update this component
  shouldComponentsUpdate: function (nextProps, nextState) {
    return true;
  },

  // Before we mount the components, do this
  componentWillMount: function () {

  },

  // Before we remove the components, do this
  componentWillUnmount: function () {

  },

  componentWillReceiveProps: function(nextProps) {
    var that = this;
    var stations = nextProps.stations.filter(function (station) {
      return station.code.startsWith(nextProps.line);
    });

    that.setState({
      stations: stations
    });
  },

  handleSubmit: function (e) {
    e.preventDefault();

    this.setState({
      arrival: this.refs.arrival.value,
      departure: this.refs.departure.value,
      showNext: true
    });

    var arrivalStation = this.refs.arrival.value;
    var departureStation = this.refs.departure.value;
  },

  // Renders the React Component
  render: function () {
    var visibility;

    if (this.props.visibility) {
      visibility = {display: 'block'};
    } else {
      visibility = {display: 'none'};
    }

    return (
      <div style={visibility}>
        <h2>Stops</h2>
        <form action="">
          <fieldset>
            <legend>Please choose your stops:</legend>
            <ul>
              <li>
                <label>Departure Station:</label>
                <select id="departure" ref="departure" name="selDeparture">
                  {this.state.stations.map(function (station, i, arr) {
                    var id = "d" + station.code;
                    return (
                      <option key={id} value={station.code}>{station.name}</option>
                    );
                  })}
                </select>
              </li>
              <li>
                <label>Arrival Station:</label>
                <select id="arrival" ref="arrival" name="selArrival">
                  {this.state.stations.map(function (station, i, arr) {
                    var id = "a" + station.code;
                    return (
                      <option key={id} value={station.code}>{station.name}</option>
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
        <TrainFinder
          arrival={this.state.arrival}
          departure={this.state.departure}
          details={this.props.details}
          predictions={this.props.predictions}
          visibility={this.state.showNext} />
      </div>
    );
  }
});

module.exports = StationSelector;