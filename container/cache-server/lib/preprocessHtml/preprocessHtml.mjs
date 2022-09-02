import { extractLinks, extractHrefAttributes } from "./extractLinks.mjs"
import {extractScripts, extractSrcAttributes} from "./extractScripts.mjs"
import crypto from "crypto"
import m from "./getBody.mjs"

const CACHED_INSTANCE = 'http://load-balancer:8080'

/**
 * @Example
 * ```
 * const resoucesResolutionMap = {
 *    'http://load-balancer:8080/main.css?v=1234': {
 *          'original': '/main.css?v=1234',
 *          'url': 'http://load-balancer:8080/main.css?v=7890',
 *          'bodyHash': 'f72017485fbf6423499baf9b240daa14f5f095a1',
 *          'replaceWith': null,
 *     },
 *    'http://load-balancer:8080/main.css?v=7890': {
 *          'original': '/main.css?v=7890',
 *          'url': 'http://load-balancer:8080/main.css?v=7890',
 *          'bodyHash': 'f72017485fbf6423499baf9b240daa14f5f095a1',
 *          'replaceWith': 'http://load-balancer:8080/main.css?v=1234',
 *     }
 * }
 */
let resoucesResolutionMap = {}

export async function preprocessHtml(htmlAsString) {
    const linkHref = extractLinks(htmlAsString).map(extractHrefAttributes)
    const scriptSrc = extractScripts(htmlAsString).map(extractSrcAttributes)

    const allHref = Object.keys(resoucesResolutionMap)
    const unknownUrls = filterKnownUrls(allHref, [...linkHref, ...scriptSrc]);

    for(const urlIndex in unknownUrls) {
        const {original, url} = unknownUrls[urlIndex];
        const strUrl = url.toString();
        const body = await m.getBody(strUrl);
        const bodyHash = crypto.createHash('sha1').update(body).digest('hex')
        
        const entryWithSameBody = Object.values(resoucesResolutionMap).find(entry => {
            return entry.bodyHash === bodyHash
        })

        resoucesResolutionMap[strUrl] = {
            url: strUrl,
            bodyHash: bodyHash,
            original,
            replaceWith: entryWithSameBody ? entryWithSameBody.replaceWith ||  entryWithSameBody.url : strUrl
        }
    }

    const allEntries = Object.values(resoucesResolutionMap);
    allEntries.forEach(entry => {
        if(entry.replaceWith) {
            htmlAsString = htmlAsString.replaceAll(`"${entry.original}"`, `"${entry.replaceWith}"`)
                                       .replaceAll(`'${entry.original}'`, `'${entry.replaceWith}'`)
        }
    })

    return htmlAsString;
}

export function filterKnownUrls(allHrefs, newHrefs) {
    const filtered = newHrefs.map(relLink => {
        return {
            original: relLink,
            url: new URL(relLink, CACHED_INSTANCE)
        }
    }).filter(
        entry => !allHrefs.includes(entry.url.href)
    )

    return filtered;
}


export function restoreResourceMap() {
    resoucesResolutionMap = {}
}