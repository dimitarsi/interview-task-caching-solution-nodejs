import express from "express"
import { checkCache, clearCache, saveInCache, serveFromCache, cache  } from "./cache.mjs";
import {CACHE_API_PORT, CACHE_PORT, CACHE_MISS} from "./constants.mjs"
import {preprocessHTML} from "./processHtml.mjs"
import {getInstanceUrlFromRequest} from "./helper.mjs"

const app = express();

app.use("*", (req, res, next) => {
    if(checkCache(req) === CACHE_MISS) {
        saveInCache(req)
        res.setHeader('cache-hit', 0)
        return next();
    }

    serveFromCache(req, res)
})

app.all("*", async (req, res) => {
    const url = getInstanceUrlFromRequest(req);

    const response = await fetch(url);

    // Process the css and js as well?
    if(response.headers['content-type']?.include('text/html')) {
        res.send(preprocessHTML(await response.text()))
    } else {
        res.send(await response.text())
    }
})

app.listen(CACHE_PORT, () => {
    console.log("Cache server started on port ", CACHE_PORT)
})

const cacheAPI = express()

cacheAPI.get("/", (_, res) => {
    res.json(cache())
})

cacheAPI.use('/purge', (_, res) => {
    clearCache()
    res.json({
        "message": "Cache Purged!"
    })
});

cacheAPI.listen(CACHE_API_PORT, () => {
    console.log("Cache API listening on port: ", CACHE_API_PORT)
})