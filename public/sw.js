self.addEventListener("install", event => {
  const indexPage = new Request("./")
  event.waitUntil(
    fetch(indexPage)
      .then(response => {
        caches.open("offline")
          .then(cache => cache.put(indexPage, response))
      }),
    )
})

self.addEventListener("fetch", event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        caches.open("offline")
          .then(cache => {
            cache.put(event.request, response.clone())
            return response
          })
      })
      .catch(_error => {
        caches.open("offline")
          .then(cache => cache.match(event.request),
        )
      }),
  )
})
