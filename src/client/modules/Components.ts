import { Tab, Body } from "./shared"
import { IncomingMessage, ServerResponse } from 'http'
import { adapters, background, button, column, grow, MATCH, observe, onClick, row, text, WRAP } from "../components"
import { add, set } from "../../language"

export const Components = (modules : Modules) => {
    const database = modules.get("database") as Database
    const name = "Components"
    modules.add("admin:header", Tab(name))
    modules.add("admin:main", Body({
        name,
        content : row(MATCH, MATCH, [
            column(.3, MATCH, [
                button(WRAP, WRAP, [
                    text(WRAP, WRAP, [
                        "New"
                    ]),
                    onClick(({
                        global,
                        _
                    }) => set(global.Components.files, _.concat(global.Components.files, [{
                        adapter : "file",
                        contents : "",
                        name : add("File", "_", _.toString(global.Components.files.length))
                    }])))
                ]),
                column(MATCH, WRAP, [
                    observe(({
                        event,
                        global
                    }) => set(event.data, global.Components.files)),
                    adapters({
                        folder : text(WRAP, WRAP, [
                            "Folder"
                        ]),
                        file : text<AdminState, ComponentFile>(WRAP, WRAP, [
                            observe(({
                                local,
                                event
                            }) => set(event.text, local.name))
                        ])
                    })
                ]),
                background("yellow")
            ]),
            column(0, MATCH, [
                grow(true),
                background("purple")
            ])
        ])
    }))
    modules.add("endpoint", async (req : IncomingMessage, res : ServerResponse) => {
        if(req.method === "POST" && req.url === "/api/component") {
            res.writeHead(200)
            res.write("TODO")
            res.end()
            return true;
        }
        return false
    })
}