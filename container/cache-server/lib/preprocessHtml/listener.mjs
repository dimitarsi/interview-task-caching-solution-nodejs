import {preprocessHtml} from "./preprocessHtml.mjs"

process.on("message", async ({html, uuid}) =>{ 
    process.send({
        html: await preprocessHtml(html),
        uuid
    })
})