var staticCacheNames = [
  'pt_v8'
];

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (cacheNames) {
      cacheNames.filter(function (cacheName) {
        return cacheName.startsWith('pt_') &&
          cacheName !== staticCacheNames[0];
      }).map(function (cacheName) {
        return caches.delete(cacheName);
      });
    })
  );
});

self.addEventListener('fetch', function (event) {
  // Serve from cache if possible
  event.respondWith(
    caches.match(event.request).then(function (response) {
      return response || fetch(event.request);
    })
  );
});

self.addEventListener('install', function (event) {
  var UrlsToCache = {
    'pt': [
      '/build/js/app.js',
      '/build/css/main.css',
      'https://api.wmata.com/Rail.svc/json/jStations',
      'https://api.wmata.com/Rail.svc/json/jStationTimes',
      'https://api.wmata.com/Rail.svc/json/jSrcStationToDstStationInfo',
      'https://api.wmata.com/StationPrediction.svc/json/GetPrediction/all'
    ]
  };

  event.waitUntil(
    staticCacheNames.map(function (cacheName) {
      caches.open(cacheName).then(function (cache) {
        var key = cacheName.replace(/_v[0-9]*/, '');
        UrlsToCache[key].map(function (url) {
          fetch(url, {
            headers: new Headers({
              'api_key': 'c23f17feef984123872cc1894d236fa1'
            })
          }).then(function (response) {
            return cache.put(url, response);
          })
        });
        //return cache.addAll(UrlsToCache[key]);
      });
    })
  );
});

self.addEventListener('message', function (event) {
  if (event.data.refresh) {
    self.skipWaiting();
  }
});