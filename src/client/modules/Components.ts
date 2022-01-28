import { Tab, Body } from "./shared"
import { adapters, background, border, button, column, grow, MATCH, observe, onClick, onInit, padding, recursive, row, scrollable, text, WRAP } from "../components"
import { add, block, condition, declare, eq, result, set } from "../../language"
import CreateFolder from './create_folder.svg'
import CreateFile from './create_file.svg'
import { Router } from "express"

import { File } from '@prisma/client'

const File = text<AdminState, File>(WRAP, WRAP, [
    padding([16, 16, 0, 16]),
    observe(({
        local,
        event
    }) => set(event.text, local.name))
])

const Folder : ComponentFromConfig<AdminState, File> = column<AdminState, File>(MATCH, WRAP, [
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
                global,
                fetch,
                JSON,
                local
            }) => block([
                fetch("/api/file", {
                    method : "POST",
                    headers : {
                        "Content-Type" : "application/json; charset=utf-8"
                    },
                    body : JSON.stringify({
                        branchId : global.branch.id,
                        isFolder : false,
                        parentId : local.id,
                    })
                })
            ])),
        ]),
        button(WRAP, WRAP, [
            text(WRAP, WRAP, [
                "Add Folder"
            ]),
            onClick(({
                global,
                fetch,
                JSON,
                local
            }) => block([
                fetch("/api/file", {
                    method : "POST",
                    headers : {
                        "Content-Type" : "application/json; charset=utf-8"
                    },
                    body : JSON.stringify({
                        branchId : global.branch.id,
                        isFolder : true,
                        parentId : local.id,
                    })
                })
            ])),
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
            local,
            global,
            _
        }) => set(event.data, _.map(_.filter(global.files, ({
            item
        }) => result(eq(item.parentId, local.id))), ({ item }) => condition(item.isFolder, result(_.assign<File & {
            adapter : string
        }>(item, {
            adapter : "folder"
        }))).otherwise(result(_.assign<File & {
            adapter : string
        }>(item, {
            adapter : "file"
        }))))))
    ]),
])

const PLACEHOLDER = []

export const Components = (dependencies : Dependencies) => {
    const name = "Components"
    dependencies.add("admin:main", Body({
        name,
        content : row(MATCH, MATCH, [
            onInit(({
                fetch,
                global,
                JSON,
                socket,
                _
            }) => block([
                socket.on("file", ({ data }) => block([
                    set(global.files, _.upsert<File>(global.files, data))
                ])),
                fetch("/api/project", {
                    callback : ({
                        body
                    }) => declare(({
                        json
                    }) => [
                        set(global.project, json.project),
                        set(global.branch, json.branch),
                        set(global.files, json.files),
                        set(global.components, json.components),
                    ], {
                        json : JSON.parse(body)
                    })
                })
            ])),
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
                                _,
                                fetch,
                                JSON
                            }) => block([
                                fetch("/api/file", {
                                    method : "POST",
                                    headers : {
                                        "Content-Type" : "application/json; charset=utf-8"
                                    },
                                    body : JSON.stringify({
                                        branchId : global.branch.id,
                                        isFolder : false,
                                        parentId : null,
                                    })
                                })
                            ])),
                        ]),
                        button(WRAP, WRAP, [
                            text(WRAP, WRAP, [
                                "Add Folder"
                            ]),
                            onClick(({
                                global,
                                fetch,
                                JSON
                            }) => block([
                                fetch("/api/file", {
                                    method : "POST",
                                    headers : {
                                        "Content-Type" : "application/json; charset=utf-8"
                                    },
                                    body : JSON.stringify({
                                        branchId : global.branch.id,
                                        isFolder : true,
                                        parentId : null,
                                    })
                                })
                            ])),
                        ]),
                    ]),
                    column(MATCH, WRAP, [
                        border({
                            left : [1, "solid", "black"]
                        }),
                        observe(({
                            event,
                            global,
                            _
                        }) => set(event.data, _.map(_.filter(global.files, ({
                            item
                        }) => result(eq(item.parentId, null))), ({
                            item
                        }) => 
                            condition(item.isFolder, 
                                result(_.assign<File & {
                                    adapter : string
                                }>(item, {
                                    adapter : "folder"
                                }))
                            ).otherwise(
                                result(_.assign<File & {
                                    adapter : string
                                }>(item, {
                                    adapter : "file"
                                }))
                            ),
                        ))),
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
}