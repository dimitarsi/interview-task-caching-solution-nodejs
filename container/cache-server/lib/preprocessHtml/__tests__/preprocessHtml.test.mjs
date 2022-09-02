import {jest} from '@jest/globals';
import { preprocessHtml, filterKnownUrls, restoreResourceMap } from "../preprocessHtml.mjs";
import module from "../getBody.mjs"
import {stripWhitespaces} from '../helpers/stripWhitespaces.mjs'

jest.spyOn(module, "getBody").mockImplementation((url) => `/* CSS - ${url.includes('main.css') ? 'main' : 'style'} */`)

const CACHED_INSTANCE = 'http://load-balancer:8080'
const known = [`${CACHED_INSTANCE}/main.js`, `${CACHED_INSTANCE}/main.css`]

describe("Preprocessing HTML", () => {

    beforeEach(() => {
        restoreResourceMap()
    })

    test("getBody is mocked", async () => {
        console.log(module.getBody+"")
        let res = await module.getBody('/main.css') 
        expect(res).toEqual(`/* CSS - main */`)
        res = await module.getBody('/style.css')
        expect(res).toEqual(`/* CSS - style */`) 
    })

    test("Filter known URL", () => {
        const newHrefs = [
            '/main.js',
            '/main.css',
            '/style.css'
        ];
        expect(filterKnownUrls(known, newHrefs)).toEqual([
            {
                original: '/style.css',
                url: new URL('http://load-balancer:8080/style.css')
            }
        ])
    })

    test("Resolves unknown urls", async () => {
        const html = `
            <!html>
                <head>
                    <link href='/assets/main.css' rel="stylesheet" />"
                    <link href="/assets/style.css" rel="stylesheet" />"
                </head>
                <body>
                </body>
            </html>
        `;
        const result = await preprocessHtml(html)

        expect(stripWhitespaces(result)).toEqual(stripWhitespaces(`
        <!html>
            <head>
                <link href='http://load-balancer:8080/assets/main.css' rel="stylesheet" />"
                <link href="http://load-balancer:8080/assets/style.css" rel="stylesheet" />"
            </head>
            <body>
            </body>
        </html>
        `))
    })


    test("Resolves the same URL across different pages", async () => {
        const pageA = `
            <!html>
                <head>
                    <link href='/assets/main.css?v=123456' rel="stylesheet" />"
                    <link href="/assets/style.css?v=123456" rel="stylesheet" />"
                </head>
                <body>
                    <h1>Page A</h1>
                </body>
            </html>
        `;
        const pageB = `
            <!html>
                <head>
                    <link href='/assets/main.css?v=789' rel="stylesheet" />"
                    <link href="/assets/style.css?v=789" rel="stylesheet" />"
                </head>
                <body>
                    <h1>Page B</h1>
                </body>
            </html>
        `;

        await preprocessHtml(pageA)
        const resultB = await preprocessHtml(pageB)
        
        expect(stripWhitespaces(resultB)).toEqual(stripWhitespaces(`
        <!html>
            <head>
                <link href='http://load-balancer:8080/assets/main.css?v=123456' rel="stylesheet" />"
                <link href="http://load-balancer:8080/assets/style.css?v=123456" rel="stylesheet" />"
            </head>
            <body>
                <h1>Page B</h1>
            </body>
        </html>
        `))
    })
})