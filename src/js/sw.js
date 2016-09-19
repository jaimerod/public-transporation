var sw = (function () {
  return {
    register: function () {
      if (navigator.serviceWorker) {
        navigator.serviceWorker.register('/sw.js').then(function (reg) {
          // If we update the service worker reload the page
          navigator.serviceWorker.addEventListener('controllerchange', function (event) {
            location.reload();
          });

          // Send a toast message to the user, there is an update
          function toastUpdate (worker) {
            var event = new CustomEvent('toast', { detail: {
              message: 'New update available',
              actionName: 'Update Now',
              action: function () {
                worker.postMessage({
                  refresh: true
                });
              }
            }});
            window.dispatchEvent(event);
          }

          // Wait for the installed state, then notify the user
          function trackInstalling (worker) {
            worker.addEventListener('statechange', function () {
              if (worker.state === 'installed') {
                toastUpdate(worker);
              }
            });
          }

          // Already the latest version
          if (!navigator.serviceWorker.controller) {
            return;
          }

          // There is a new service working, let then know
          if (reg.waiting) {
            toastUpdate(reg.installing);
            return;
          }

          if (reg.installing) {
            trackInstalling(reg.installing);
            return;
          }

          reg.addEventListener('updatefound', function () {
            trackInstalling(reg.installing);
          });
        });
      } else {
        console.log('Cannot register ServiceWorker.');
      }
    }
  }
}());

module.exports = sw;