require('es6-promise').polyfill();
require('whatwg-fetch');
require('./md5.js');

var idb = require('./idb.js');

module.exports = (function () {
  var API = {
    stationList: 'https://api.wmata.com/Rail.svc/json/jStations',
    stationDetailsAll: 'https://api.wmata.com/Rail.svc/json/jStationTimes',
    stationDetails: 'https://api.wmata.com/Rail.svc/json/jStationTimes?StationCode={{ station-code }}',
    travelTime: 'https://api.wmata.com/Rail.svc/json/jSrcStationToDstStationInfo[?FromStationCode][&ToStationCode]',
    travelTimeAll: 'https://api.wmata.com/Rail.svc/json/jSrcStationToDstStationInfo',
    predictions: 'https://api.wmata.com/StationPrediction.svc/json/GetPrediction/all'
  };
  var _dbPromise;
  var primaryKey = 'c23f17feef984123872cc1894d236fa1';

  function getJSON (url, cb) {
    fetch(url, {
      headers: new Headers({
        'api_key': primaryKey
      })
    }).then(function (request) {
      return request.json();
    }).then(function (json) {
      if (typeof cb === 'function') cb(json);
    });
  }

  function isNew(url, md5, cb) {
    // Read the md5 from the database
    _dbPromise.then(function (db) {
      var tx = db.transaction('md5');
      var keyValStore = tx.objectStore('md5');

      return keyValStore.get(url);
    }).then(function (val) {
      // check if it is new data based on MD5
      var hasNewData = val.md5 !== md5;

      if (hasNewData) {
        this.reject();
      } else {
        if (typeof cb === 'function') cb(false);
      }
    }).catch(function (err) {
      // MD5 Doesn't match
      _dbPromise.then(function (db) {
        var tx = db.transaction('md5', 'readwrite');
        var keyValStore = tx.objectStore('md5');
          keyValStore.put({
            url: url,
            md5: md5
          });
      }).then(function () {
        if (typeof cb === 'function') cb(true);
      });
    });
  }

  function storePredictions(json, cb) {
    isNew(API.predictions, md5(JSON.stringify(json)), function (hasNewData) {
      if (!hasNewData) {
        if (typeof cb === 'function') return cb();
      }

      // Write a value to DB
      _dbPromise.then(function (db) {
        var tx = db.transaction('predictions', 'readwrite');
        var keyValStore = tx.objectStore('predictions');
        keyValStore.clear();
        json.forEach(function (train) {
          keyValStore.put({
            departureCode: train.LocationCode,
            departureName: train.LocationName,
            arrivalCode: train.DestinationCode,
            arrivalName: train.DestinationName,
            time: train.Min
          });
        });

        return tx.complete;
      }).then(function () {
        if (typeof cb === 'function') cb();
      });
    });
  }

  function storeStations(json, cb) {
    isNew(API.stationList, md5(JSON.stringify(json)), function (hasNewData) {
      if (!hasNewData) {
        if (typeof cb === 'function') return cb();
      }

      // Write a value to DB
      _dbPromise.then(function (db) {
        var tx = db.transaction('stations', 'readwrite');
        var keyValStore = tx.objectStore('stations');
        keyValStore.clear();
        json.forEach(function (station) {
          keyValStore.put({
            code: station.Code,
            name: station.Name
          });
        });

        return tx.complete;
      }).then(function () {
        if (typeof cb === 'function') cb();
      });
    });
  }

  function storeDetails(json, cb) {
    if (typeof cb === 'function') cb();

    // Write a value to DB
    _dbPromise.then(function (db) {
      var tx = db.transaction('trainDetails', 'readwrite');
      var keyValStore = tx.objectStore('trainDetails');
      keyValStore.clear();
      json.forEach(function (detail) {
        keyValStore.put({
          code: detail.Code,
          name: detail.StationName
        });
      });

      return tx.complete;
    }).then(function () {
      if (typeof cb === 'function') cb();
    });
  }

  function storeTimings(json, cb) {
    isNew(API.travelTimeAll, md5(JSON.stringify(json)), function (hasNewData) {
      if (!hasNewData) {
        if (typeof cb === 'function') return cb();
      }

      // Write a value to DB
      _dbPromise.then(function (db) {
        var tx = db.transaction('timings', 'readwrite');
        var keyValStore = tx.objectStore('timings');
        keyValStore.clear();
        json.forEach(function (timing) {
          keyValStore.put({
            source: timing.SourceStation,
            destination: timing.DestinationStation,
            distance: timing.CompositeMiles,
            duration: timing.RailTime,
            cost: timing.RailFare.PeakTime
          });
        });

        return tx.complete;
      }).then(function () {
        if (typeof cb === 'function') cb();
      });
    });
  }

  return {
    getData: function (cb) {
      var that = this;

      // create a promise for the database
      _dbPromise = idb.open('trains-db', 1, function (upgradeDb) {
        switch(upgradeDb.oldVersion) {
          case 0:
            upgradeDb.createObjectStore('predictions', { keyPath: 'id', autoIncrement: true });
            upgradeDb.createObjectStore('timings', { keyPath: 'id', autoIncrement: true });
            upgradeDb.createObjectStore('stations', { keyPath: 'code' });
            upgradeDb.createObjectStore('md5', { keyPath: 'url' });
        }
      });

      // Get a value from the DB
      _dbPromise.then(function (db) {
        var tx = db.transaction('stations');
        var keyValStore = tx.objectStore('stations');

        return keyValStore.get('A01');
      }).then(function (val) {

        // update in the background
        that.updateDb(function () {
          // load the database into an object
          that.loadDb(function (data) {
            // return what we currently have
            if (typeof cb === 'function') cb(data);
          });
        });

        // If there some data stored locally
        if (typeof val !== 'undefined') {
          // load the db into an object
          that.loadDb(function (data) {
            // return what we currently have
            if (typeof cb === 'function') cb(data);
          });
        }
      });
    },

    getTiming: function (departure, arrival, cb) {
      _dbPromise.then(function (db) {
          var tx = db.transaction('timings');
          var keyValStore = tx.objectStore('timings');
          return keyValStore.getAll();
        }).then(function (details) {
        });
    },

    loadDb: function (cb) {
      var data = {};

      _dbPromise.then(function (db) {
        var tx = db.transaction('stations');
        var keyValStore = tx.objectStore('stations');
        return keyValStore.getAll();
      }).then(function (stations) {
        data.stations = stations;

        _dbPromise.then(function (db) {
          var tx = db.transaction('timings');
          var keyValStore = tx.objectStore('timings');
          return keyValStore.getAll();
        }).then(function (details) {
          data.details = details;
          _dbPromise.then(function (db) {
            var tx = db.transaction('predictions');
            var keyValStore = tx.objectStore('predictions');
            return keyValStore.getAll();
          }).then(function (predictions) {
            data.predictions = predictions;
            if (typeof cb === 'function') cb(data);
          });
        });
      });
    },

    updateDb: function (cb) {
      getJSON(API.stationList, function (json) {
        storeStations(json.Stations, function () {
          getJSON(API.predictions, function (json) {
            storePredictions(json.Trains, function () {
              getJSON(API.travelTimeAll, function (json) {
                storeTimings(json.StationToStationInfos, function () {
                  if (typeof cb === 'function') cb();
                });
              });
            });
          });
        });
      });
    }
  }
}());