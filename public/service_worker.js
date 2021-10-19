var cache_name = "BudgetTracker";
var dataToBeCached = "data-cache";


let urlsToCache = ["/indexedDB.js","/index.js","/style.css","/", "/manifest.json"]

self.addEventListener("install", event => {
    console.log("Installing ...");
    event.waitUntil(
        caches
        .open(cache_name)
        .then(cache => {
            console.log('Made it this far - urlsToCache')
            return cache.addAll(urlsToCache);
        })
        .catch(err => console.log(err))
    );
});

 self.addEventListener("fetch", event => {
    console.log("You fetched " + event.url);
    if (event.request.url === "https://mkfolgerbudgettracker.herokuapp.com/") {
        event.respondWith (
            fetch(event.request).catch(err => 
                self.cache.open(cache_name).then(cache => cache.match("/offline.html"))
                )
        );
            } else {
                event.respondWith(
                    fetch(event.request).catch(err =>
                        caches.match(event.request).then(response => response)
                        )
                );
            
    }
});


self.addEventListener("fetch", function(event) {
    // cache all get requests to /api routes
    if (event.request.url.includes("/api/")) {
      event.respondWith(
        caches.open(dataToBeCached).then(cache => {
          return fetch(event.request)
            .then(response => {
                cache.put(event.request.url, response.clone());
              return response;
            })
            .catch(err => {
              // Network request failed, try to get it from the cache.
              return cache.match(event.request);
            });
        }).catch(err => console.log(err))
      );
      return;
    }
    event.respondWith(
      fetch(event.request).catch(function() {
        return caches.match(event.request).then(function(response) {
          if (response) {
            return response;
          } else if (event.request.headers.get("accept").includes("text/html")) {
            // return the cached home page for all requests for html pages
            return caches.match("/");
          }
        });
      })
    );
  });