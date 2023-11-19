console.log("sw.js", self)

// install trigger -> cache index.html
self.addEventListener("install", event => {
  console.log("INSTALL")
  const indexPage = new Request("./")
  event.waitUntil(
    fetch(indexPage)
      .then(response =>
       caches.open("offline")
        .then(cache => cache.put(indexPage, response)),
      ),
    )
})

self.addEventListener("activate", () => {
  console.log("ACTIVATE")
})

// fetch trigger -> fetch from server, save to cache, if fail: serve from cache
self.addEventListener("fetch", event => {
  console.log("FETCH")
  event.respondWith(
    fetch(event.request)
      .then(response =>
        caches.open("offline")
          .then(cache => {
            cache.put(event.request, response.clone())
            return response
          }),
      )
      .catch(_error =>
        caches.open("offline")
          .then(cache => cache.match(event.request),
        ),
      ),
  )
})
