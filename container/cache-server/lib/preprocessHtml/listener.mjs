import {preprocessHtml} from "./preprocessHtml.mjs"

process.on("message", ({html, uuid}) =>{ 
    process.send({
        html: preprocessHtml(html),
        uuid
    })
})