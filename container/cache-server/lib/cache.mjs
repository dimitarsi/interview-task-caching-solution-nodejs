import { CACHE_HIT, CACHE_MISS} from "./constants.mjs"
import {getInstanceUrlFromRequest} from "./helper.mjs"

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

    res.send(result.body)
}

export async function saveInCache(req) {
    const url = getInstanceUrlFromRequest(req);

    const response = await fetch(url);

    const body = await response.text();
    
    _cache[url] = {
        body: body
    }
}


export function clearCache() {
    _cache = {};
}


// Always returns true
function isHeaderAllowed() {
    return true;
}