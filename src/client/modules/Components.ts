import { Tab, Body } from "./shared"
import { IncomingMessage, ServerResponse } from 'http'
import { adapters, background, border, button, column, grow, MATCH, observe, onClick, padding, recursive, row, scrollable, text, WRAP } from "../components"
import { add, block, set } from "../../language"
import CreateFolder from './create_folder.svg'
import CreateFile from './create_file.svg'
import { Router } from "express"

const File = text<AdminState, ComponentFile>(WRAP, WRAP, [
    padding([16, 16, 0, 16]),
    observe(({
        local,
        event
    }) => set(event.text, local.name))
])

const Folder : ComponentFromConfig<AdminState, ComponentFolder> = column<AdminState, ComponentFolder>(MATCH, WRAP, [
    padding([16, 16, 0, 16]),
    row(MATCH, WRAP, [
        text(WRAP, WRAP, [
            observe(({
                local,
                event
            }) => set(event.text, local.name)),
        ]),
        button(WRAP, WRAP, [
            text(WRAP, WRAP, [
                "Add File"
            ]),
            onClick(({
                local,
                _
            }) => set(local.children, _.concat(local.children, [{
                adapter : "file",
                contents : "",
                name : add("File_", _.toString(local.children.length))
            }])))
        ]),
        button(WRAP, WRAP, [
            text(WRAP, WRAP, [
                "Add Folder"
            ]),
            onClick(({
                local,
                _
            }) => set(local.children, _.concat(local.children, [{
                adapter : "folder",
                children : [],
                name : add("Folder_", _.toString(local.children.length))
            }])))
        ]),
    ]),
    column(MATCH, WRAP, [
        border({
            left : [1, "solid", "black"]
        }),
        adapters({
            file : File,
            folder : recursive(() => Folder)
        }),
        observe(({
            event,
            local
        }) => set(event.data, local.children))
    ]),
])

export const Components = (dependencies : Dependencies) => {
    const database = dependencies.get("admin:database") as Database
    const name = "Components"
    dependencies.add("admin:header", Tab(name))
    dependencies.add("admin:main", Body({
        name,
        content : row(MATCH, MATCH, [
            scrollable(.3, MATCH, [
                background("yellow"),
                column(MATCH, WRAP, [
                    padding(16),
                    row(MATCH, WRAP, [
                        text(WRAP, WRAP, [
                            "Components"
                        ]),
                        button(WRAP, WRAP, [
                            text(WRAP, WRAP, [
                                "Add File"
                            ]),
                            onClick(({
                                global,
                                _
                            }) => set(global.Components.files, _.concat(global.Components.files, [{
                                adapter : "file",
                                contents : "",
                                name : add("File_", _.toString(global.Components.files.length))
                            }]))),
                        ]),
                        button(WRAP, WRAP, [
                            text(WRAP, WRAP, [
                                "Add Folder"
                            ]),
                            onClick(({
                                global,
                                _
                            }) => set(global.Components.files, _.concat(global.Components.files, [{
                                adapter : "folder",
                                children : [],
                                name : add("Folder_", _.toString(global.Components.files.length))
                            }]))),
                        ]),
                    ]),
                    column(MATCH, WRAP, [
                        border({
                            left : [1, "solid", "black"]
                        }),
                        observe(({
                            event,
                            global
                        }) => set(event.data, global.Components.files)),
                        adapters({
                            folder : Folder,
                            file : File
                        })
                    ]),
                ]),
            ]),
            column(0, MATCH, [
                grow(true),
                background("purple")
            ])
        ])
    }))
    const router = dependencies.get("router") as Router
    router.post("/api/component", (_, res) => {
        res.status(200).send("TODO")
    })
}