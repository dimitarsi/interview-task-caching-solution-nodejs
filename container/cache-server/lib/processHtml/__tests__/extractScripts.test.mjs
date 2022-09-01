import { extractScripts, extractSrcAttributes } from "../extractScripts.mjs"

const htmlWithScripts = `
    <!html>
        <head>
            <link rel="stylesheet" href="/css/main.css?v=1646807089238" />
            <link rel="stylesheet" href="/css/style.css?v=1646807089238" />
            <script src="/js/app.js?v=1646807089238"></script>
        </head>
        <body>
        <script src="/js/main.js?v=1646807089400"></script>
        </body>
    <html>
`

describe("Parsing HTML to extract <script /> tags", () => {
    test("Finds simple scripts", () => {
        expect(extractScripts(htmlWithScripts)).toEqual([
            '<script src="/js/app.js?v=1646807089238">',
            '<script src="/js/main.js?v=1646807089400">'
        ])
    })

    test("Finds the src attribute", () => {
        expect(extractSrcAttributes("<script src=\"/js/app.js?v=1646807089238\">")).toEqual("/js/app.js?v=1646807089238")
    })
})