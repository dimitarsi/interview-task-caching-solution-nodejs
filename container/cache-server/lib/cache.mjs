import { CACHE_HIT, CACHE_MISS} from "./constants.mjs"
import {getInstanceUrlFromRequest} from "./helper.mjs"
import {expensivePreprocessHtml, replaceWorker} from "./worker.mjs"

// The cache is a simple map in our case
let _cache = {}

export function cache() {
    return _cache;
}

export function checkCache(req) {
    const url = getInstanceUrlFromRequest(req);

    return _cache[url.toString()] ? CACHE_HIT : CACHE_MISS;
}

export function serveFromCache(req, res) {

    const url = getInstanceUrlFromRequest(req);
    
    const result = _cache[url.toString()];

    res.setHeader('cache-hit', 1)
    res.setHeader('content-type', result.contentType)

    res.send(result.body)
}

export async function saveInCache(req) {
    const url = getInstanceUrlFromRequest(req);

    const response = await fetch(url);
    const body = await response.text();

    const contentType = response.headers['content-type'] || inferContentTypeFormUrl(url)
    const cachedBody = contentType === 'text/html' ? await expensivePreprocessHtml(body) : body;
    
    _cache[url] = {
        body: cachedBody,
        contentType
    }
}


export function clearCache() {
    _cache = {};
    replaceWorker();
}


// Always returns true
function isHeaderAllowed() {
    return true;
}

// Workaround since the LB is not sending back the content-type!
function inferContentTypeFormUrl(urlAsString) {
    const url = new URL(urlAsString);
    if(url.pathname.match(/\.css$/)) {
        return 'text/css'
    }
    if(url.pathname.match(/\.js$/)) {
        return 'application/javascript'
    }
    if(url.pathname.match(/\.json$/)) {
        return 'application/json'
    }
    if(url.pathname.match(/\.jpg$/)) {
        return 'image/jpeg'
    }
    if(url.pathname.match(/\.ico$/)) {
        return 'image/x-icon'
    }

    return "text/html";
}