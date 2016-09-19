/** @jsx React.DOM */

var React = require('react');

var TrainFinder = React.createClass({
  // Sets the Initial State
  getInitialState: function () {
    return null;
  },

  // Returns true if React should update this component
  shouldComponentsUpdate: function (nextProps, nextState) {
    return true;
  },


  // Renders the React Component
  render: function () {
    var that = this;
    var visibility;

    if (this.props.visibility) {
      visibility = {display: 'block'};
    } else {
      visibility = {display: 'none'};
    }

    return (
      <div style={visibility}>
        <h2>Info</h2>
        <table>
          <tbody>
            <tr>
              <th>Station</th>
              <th>Time</th>
              <th>Duration</th>
              <th>Distance</th>
              <th>Cost</th>
            </tr>
            {
              that.props.details.filter(function (detail) {
                return detail.source == that.props.departure && detail.destination == that.props.arrival;
              }).map(function (detail, i, arr) {
                that.props.predictions.filter(function (prediction) {
                  return prediction.arrivalCode == that.props.arrival && prediction.departureCode == that.props.departure;
                }).map(function (prediction, i, arr){
                  console.log(prediction);
                });

                return (
                  <tr key={detail.id}>
                    <td>{detail.source}</td>
                    <td>{detail.destination}</td>
                    <td>{detail.duration}</td>
                    <td>{detail.distance}</td>
                    <td>{detail.cost}</td>
                  </tr>
                );
              })
            }
          </tbody>
        </table>
      </div>
    );
  }
});

module.exports = TrainFinder;