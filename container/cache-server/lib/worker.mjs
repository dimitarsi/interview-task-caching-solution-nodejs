import cp from "child_process";
import { randomUUID } from "crypto";

let worker;
let workerResponses = {};


export function replaceWorker() {
    worker = cp.fork("./lib/preprocessHtml/listener.mjs")
    worker.on("message", ({html, uuid}) => {
        workerResponses[uuid] = html;
    })
}

export function expensivePreprocessHtml(htmlAsString) {
    if(!worker) {
        replaceWorker()
    }
    const uuid = randomUUID()
    worker.send({html: htmlAsString, uuid})

    const waitForResponse = () => {
        return workerResponses[uuid]
    }

    return new Promise((resolve, rej) => {

        const checkResponse = () => {
            const response = waitForResponse()
            if(response) {
                resolve(response)
            } else {
                setTimeout(checkResponse, 100)
            }
        }
        
        checkResponse()
    })
}