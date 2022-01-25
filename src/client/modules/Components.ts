import { Tab } from "./shared"
import { IncomingMessage, ServerResponse } from 'http'

export const Components = (modules : Modules) => {
    const database = modules.get("database") as Database
    modules.add("module:tab", Tab("Components"))
    modules.add("module:endpoint", async (req : IncomingMessage, res : ServerResponse) => {
        console.log("HERE", req.method, req.url)
        if(req.method === "POST" && req.url === "/api/component") {
            res.writeHead(200)
            res.write("TODO")
            res.end()
            return true;
        }
        return false
    })
}