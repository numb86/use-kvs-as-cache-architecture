addEventListener("fetch", (event) => {
  event.respondWith(handleRequest(event));
});

async function handleRequest(event) {
  if (event.request.url === APP_PAGE_URL) {
    const storedValue = JSON.parse(await MY_KV.get(event.request.url));

    if (!storedValue) {
      return fetch(event.request);
    }

    const { headers, body } = storedValue;
    if (headers && body) {
      return new Response(body, {
        headers: headers,
      });
    }
  }
  return fetch(event.request);
}
