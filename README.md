# Interview task

TLDR: The task consists of implementing a `preprocessHtml` function that takes care of normalizing the cache server entry.

The problem at hand is: having a multi-instance application pointing to the same resource (css, js), but each instance uses
a different cache buster. We need to eliminate the performance issue of having each instance requesting the resources with a unique key.

Limitations:
  - cannot change the implementation of the servers.
  - can save global variables alongside `preprocessHtml` function.
  - `preprocessHtml` is safe to make HTTP requests since it is not part of the critical user path.

Assumptions:
  - `preprocessHtml` should return a `Promise<string>`, i.e. can be asynchronous.
  - when the cache server is purged, the global variables associated with `preprocessHtml` are also reset.
  - cache purge is run after all servers have been deployed.
  - the load balancer can be either sticky or round-robin
  - for this implementation, we don't want to bother about third-party URLs ( although we shouldn't have to request or cache those )

# Solution

The [preprocessHtml function](https://github.com/dimitarsi/interview-task-caching-solution-nodejs/blob/master/container/cache-server/lib/preprocessHtml/preprocessHtml.mjs) generates a resource map,
storing metadata about the request with the following structure:

```
{
    'http://load-balancer:8080/main.css?v=1234': {
        'original': '/main.css?v=1234',
        'url': 'http://load-balancer:8080/main.css?v=1234',
        'bodyHash': 'f72017485fbf6423499baf9b240daa14f5f095a1',
        'replaceWith': null,
    },
    'http://load-balancer:8080/main.css?v=7890': {
        'original': '/main.css?v=7890',
        'url': 'http://load-balancer:8080/main.css?v=7890',
        'bodyHash': 'f72017485fbf6423499baf9b240daa14f5f095a1',
        'replaceWith': 'http://load-balancer:8080/main.css?v=1234',
    }
}
```

Description of the fields:
 - `original` - contains the original (relative or absolute) url
 - `url` - the complete url of the resource
 - `bodyHash` - sha1 hash of the request body
 - `replaceWith` - determines how we should overwrite the `original` url

Refer to the test cases of what the final output of the cache server should be - [preprocessHtml.test.mjs](https://github.com/dimitarsi/interview-task-caching-solution-nodejs/blob/master/container/cache-server/lib/preprocessHtml/__tests__/preprocessHtml.test.mjs)

# Extra

The source code extends to a naive and oversimplified version of:
- [cache server](https://github.com/dimitarsi/interview-task-caching-solution-nodejs/blob/master/container/cache-server/lib/server.mjs) - handles the cache in memory and starts a subprocess of the `preprocessHtml`.
    - Cache server is accessible with default port `80` outside the docker container
    - Cache server also exposes `2 routes`:
        - cache inspection: [http://localhost:81]
        - purge [http://localhost:81/purge]
- [sticky load balancer](container\load-balancer\lib\server.mjs) - routes the traffic to one of three nginx instances
    - The load balancer is access directly bypassing the cache server - [http://localhost:8080](http://localhost:8080)
- public folder served by three nginx containers, each has a unique `index.html` and `about.html` files,
      share the same `assets` folder

The repo is meant to be run in a [remote container](https://code.visualstudio.com/docs/remote/containers) or by running the
command `docker-compose up --build -d` in a terminal.