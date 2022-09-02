import {extractHrefAttributes, extractLinks} from "../extractLinks.mjs"

const htmlWithLinks = `
    <!html>
        <head>
            <link rel="stylesheet" href="/css/main.css?v=1646807089238" />
            <link rel="stylesheet" href="/css/style.css?v=1646807089238" />
        </head>
        <body>
        </body>
    <html>
`

describe("Parsing HTML to extract <link /> tags", () => {
    test("Finds simple links", () => {
        expect(extractLinks(htmlWithLinks)).toEqual([
            '<link rel="stylesheet" href="/css/main.css?v=1646807089238" />',
            '<link rel="stylesheet" href="/css/style.css?v=1646807089238" />'
        ])
    })
    
    test("Finds all attributes for links", () => {
        expect(extractHrefAttributes('<link rel="stylesheet" href="/css/main.css?v=1646807089238" />')).toEqual("/css/main.css?v=1646807089238")
    })
})