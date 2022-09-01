import {CACHED_INSTANCE} from "./constants.mjs"

export function getInstanceUrlFromRequest(req) {
    const searchParams = new URLSearchParams()
    
    for(const param in req.query) {
        searchParams.set(param, req.query[param])
    }

    const url = new URL(`${req.originalUrl}?${searchParams.toString()}`, CACHED_INSTANCE);

    return url.toString()
}