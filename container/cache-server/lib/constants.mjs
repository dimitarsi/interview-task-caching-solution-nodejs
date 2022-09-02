export const CACHE_HIT = 1;
export const CACHE_MISS = 2;

export const CACHED_INSTANCE = 'http://load-balancer:8080'

export const CACHE_PORT = parseInt(process.env.PORT || "7777")
export const CACHE_API_PORT = parseInt(process.env.CACHE_API_PORT || "8888")