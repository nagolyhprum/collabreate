import { Body } from "../shared"
import { adapters, background, border, button, column, grow, id, input, MATCH, observe, onClick, onInit, onInput, padding, position, recursive, row, scrollable, stack, text, WRAP } from "../../components"
import { add, block, condition, declare, eq, not, result, set } from "../../../language"
import CreateFolder from '../create_folder.svg'
import CreateFile from '../create_file.svg'

import { File } from '@prisma/client'

export const FileComponent = row<AdminState, File>(MATCH, WRAP, [
    text(WRAP, WRAP, [
        padding([16, 16, 0, 16]),
        observe(({
            local,
            event
        }) => set(event.text, local.name))
    ]),
    button(WRAP, WRAP, [
        text(WRAP, WRAP, [
            "Rename"
        ]),
        onClick(({
            global,
            local
        }) => set(
            global.modal.rename,
            {
                id : local.id,
                name : local.name,
                input : local.name
            }
        ))
    ]),
    button(WRAP, WRAP, [
        text(WRAP, WRAP, [
            "Remove"
        ]),
        onClick(({
            global,
            local
        }) => set(
            global.modal.remove,
            {
                id : local.id,
                name : local.name,
                input : ""
            }
        ))
    ]),
])

const FolderComponent : ComponentFromConfig<AdminState, File> = column<AdminState, File>(MATCH, WRAP, [
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
                "Rename"
            ]),
            onClick(({
                global,
                local
            }) => set(
                global.modal.rename,
                {
                    id : local.id,
                    name : local.name,
                    input : local.name
                }
            ))
        ]),
        button(WRAP, WRAP, [
            text(WRAP, WRAP, [
                "Remove"
            ]),
            onClick(({
                global,
                local
            }) => set(
                global.modal.remove,
                {
                    id : local.id,
                    name : local.name,
                    input : ""
                }
            ))
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
            file : FileComponent,
            folder : recursive(() => FolderComponent)
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
    ])
])

export const Components = (dependencies : Dependencies) => {
    const name = "Components"
    dependencies.add("admin:main", Body({
        name,
        content : Root
    }))
}

const RenameModal = stack<AdminState, AdminState>(MATCH, MATCH, [
    observe(({
        event,
        global
    }) => set(event.visible, not(eq(global.modal.rename.id, -1)))),
    background("rgba(0, 0, 0, 0.7)"),
    position({
        top : 0,
        left : 0,
    }),
    column(WRAP, WRAP, [
        background("white"),
        padding(16),
        position({
            left : .5,
            top : .5
        }),
        text(WRAP, WRAP, [
            observe(({
                event,
                global
            }) => set(event.text, add("Renaming: ", global.modal.rename.name)))
        ]),
        input(MATCH, WRAP, [
            observe(({
                event,
                global
            }) => block([
                set(event.value, global.modal.rename.input),
                set(event.focus, global.modal.rename.id)
            ])),
            onInput(({
                global,
                event
            }) => set(global.modal.rename.input, event))
        ]),
        row(MATCH, WRAP, [
            button(WRAP, WRAP, [
                onClick(({
                    global
                }) => set(global.modal.rename.id, -1)),
                text(WRAP, WRAP, [
                    "Cancel"
                ])
            ]),
            button(WRAP, WRAP, [
                observe(({
                    event,
                    global
                }) => set(event.enabled, not(eq(global.modal.rename.input.length, 0)))),
                onClick(({
                    global,
                    fetch,
                    JSON
                }) => block([
                    fetch("/api/file", {
                        method : "PATCH",
                        headers : {
                            "Content-Type" : "application/json; charset=utf-8"
                        },
                        body : JSON.stringify({
                            id : global.modal.rename.id,
                            name : global.modal.rename.input
                        })
                    }),
                    set(global.modal.rename.id, -1),
                ])),
                text(WRAP, WRAP, [
                    "Save"
                ])
            ]),
        ])
    ])
])

const RemoveModal = stack<AdminState, AdminState>(MATCH, MATCH, [
    observe(({
        event,
        global
    }) => set(event.visible, not(eq(global.modal.remove.id, -1)))),
    background("rgba(0, 0, 0, 0.7)"),
    position({
        top : 0,
        left : 0,
    }),
    column(WRAP, WRAP, [
        background("white"),
        padding(16),
        position({
            left : .5,
            top : .5
        }),
        text(WRAP, WRAP, [
            observe(({
                event
            }) => set(event.text, add("Please confirm the name of the file you would like to remove")))
        ]),
        input(MATCH, WRAP, [
            observe(({
                event,
                global
            }) => block([
                set(event.value, global.modal.remove.input),
                set(event.placeholder, global.modal.remove.name),
                set(event.focus, global.modal.remove.id)
            ])),
            onInput(({
                global,
                event
            }) => set(global.modal.remove.input, event))
        ]),
        row(MATCH, WRAP, [
            button(WRAP, WRAP, [
                onClick(({
                    global
                }) => set(global.modal.remove.id, -1)),
                text(WRAP, WRAP, [
                    "Cancel"
                ])
            ]),
            button(WRAP, WRAP, [
                observe(({
                    event,
                    global
                }) => set(event.enabled, eq(global.modal.remove.input, global.modal.remove.name))),
                onClick(({
                    global,
                    fetch,
                    JSON
                }) => block([
                    fetch("/api/file", {
                        method : "DELETE",
                        headers : {
                            "Content-Type" : "application/json; charset=utf-8"
                        },
                        body : JSON.stringify({
                            id : global.modal.remove.id
                        })
                    }),
                    set(global.modal.remove.id, -1),
                ])),
                text(WRAP, WRAP, [
                    "Remove"
                ])
            ]),
        ])
    ])
])

const Root = row<AdminState, AdminState>(MATCH, MATCH, [
    onInit(({
        fetch,
        global,
        JSON,
        socket,
        _
    }) => block([
        socket.on("file.upsert", ({ data }) => block([
            set(global.files, _.upsert<File>(global.files, data))
        ])),
        socket.on("file.remove", ({ data }) => block([
            set(global.files, _.filter<File>(global.files, ({ item }) => result(not(eq(item.id, data)))))
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
                    observe(({
                        global,
                        event
                    }) => set(
                        event.text,
                        global.project.id
                    ))
                ]),
                text(WRAP, WRAP, [
                    observe(({
                        global,
                        event
                    }) => set(
                        event.text,
                        global.branch.id
                    ))
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
                    folder : FolderComponent,
                    file : FileComponent
                })
            ]),
        ]),
    ]),
    column(0, MATCH, [
        grow(true),
        background("purple")
    ]),
    RenameModal,
    RemoveModal,
])