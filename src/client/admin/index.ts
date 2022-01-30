import { add, and, block, condition, declare, eq, not, result, set, symbol } from "../../language";
import {
    text,
    background,
    MATCH,
    row,
    WRAP,
    column,
    grow,
    padding,
    id,
    observe,
    button,
    onClick,
    border,
    adapters,
    recursive,
    stack,
    position,
    input,
    onInput,
    select,
    onSelect,
    option,
    onInit,
    scrollable
} from "../components";

import { File } from "@prisma/client"

const Header = row<AdminState, AdminState>(MATCH, WRAP, [
    background("red"),
    row(0, WRAP, [
        grow(true),
        text(WRAP, WRAP, [
            padding(16),
            "Collabreate"
        ]),
    ])
]);

export const FileComponent = row<AdminState, File>(MATCH, WRAP, [
    text(WRAP, WRAP, [
        id("file_component_name"),
        padding([16, 16, 0, 16]),
        observe(({
            local,
            event
        }) => set(event.text, local.name))
    ]),
    button(WRAP, WRAP, [
        id("file_component_rename_buttom"),
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
        id("file_component_move_buttom"),
        text(WRAP, WRAP, [
            "Move"
        ]),
        onClick(({
            global,
            local
        }) => set(
            global.modal.move,
            {
                id : local.id,
                name : local.name,
                parentId : local.parentId
            }
        ))
    ]),
    button(WRAP, WRAP, [
        id("file_component_remove_buttom"),
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

export const FolderComponent : ComponentFromConfig<AdminState, File> = column<AdminState, File>(MATCH, WRAP, [
    padding([16, 16, 0, 16]),
    row(MATCH, WRAP, [
        button(WRAP, WRAP, [
            onClick(({
                local,
                global
            }) => set(symbol(global.ui, local.id), not(symbol(global.ui, local.id)))),
            text(WRAP, WRAP, [
                observe(({
                    event,
                    local,
                    global
                }) => condition(symbol(global.ui, local.id), 
                    set(event.text, "-")
                ).otherwise(
                    set(event.text, "+")                    
                ))
            ])
        ]),
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
                "Move"
            ]),
            onClick(({
                global,
                local
            }) => set(
                global.modal.move,
                {
                    id : local.id,
                    name : local.name,
                    parentId : local.parentId
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
                set(symbol(global.ui, local.id), true),
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
        observe(({
            event,
            local,
            global
        }) => set(event.visible, symbol(global.ui, local.id))),
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

export const RenameModal = stack<AdminState, AdminState>(MATCH, MATCH, [
    id("rename_modal"),
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
            id("rename_modal_title"),
            observe(({
                event,
                global
            }) => set(event.text, add("Renaming: ", global.modal.rename.name)))
        ]),
        input(MATCH, WRAP, [
            id("rename_modal_name_input"),
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
                id("rename_modal_cancel_button"),
                onClick(({
                    global
                }) => set(global.modal.rename.id, -1)),
                text(WRAP, WRAP, [
                    "Cancel"
                ])
            ]),
            button(WRAP, WRAP, [
                id("rename_modal_save_button"),
                observe(({
                    event,
                    global
                }) => set(event.enabled, not(eq(global.modal.rename.input, "")))),
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
            }) => set(event.text, "Please confirm the name of the file you would like to remove"))
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

export const MoveModal = stack<AdminState, AdminState>(MATCH, MATCH, [
    observe(({
        event,
        global
    }) => set(event.visible, not(eq(global.modal.move.id, -1)))),
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
            }) => set(event.text, add("Where would you like to move ", global.modal.move.name)))
        ]),
        select(MATCH, WRAP, [
            onSelect(({
                event,
                global,
                JSON
            }) => set(global.modal.move.parentId, JSON.parse(event))),
            observe(({
                event,
                global,
                _
            }) => block([
                set(event.data, _.concat([{
                    adapter : "option",
                    label : "<root>",
                    value : "null"
                }], _.map(
                        _.filter(global.files, ({
                            item
                        }) => result(
                            and(
                                not(eq(item.id, global.modal.move.id)),
                                item.isFolder
                            )
                        )),
                        ({ item }) => result({
                            adapter : "option",
                            label : item.name,
                            value : item.id
                        })
                    )
                )),
                set(event.value, global.modal.move.parentId)
            ])),
            adapters({
                option : option<AdminState, {
                    label : string
                    value : string
                }>([
                    observe(({
                        event,
                        local
                    }) => block([
                        set(event.text, local.label),
                        set(event.value, local.value),
                    ]))
                ]),
            })
        ]),
        row(MATCH, WRAP, [
            button(WRAP, WRAP, [
                onClick(({
                    global
                }) => set(global.modal.move.id, -1)),
                text(WRAP, WRAP, [
                    "Cancel"
                ])
            ]),
            button(WRAP, WRAP, [
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
                            id : global.modal.move.id,
                            parentId : global.modal.move.parentId
                        })
                    }),
                    set(global.modal.move.id, -1),
                ])),
                text(WRAP, WRAP, [
                    "Move"
                ])
            ]),
        ])
    ])
])

export const Editor = row<AdminState, AdminState>(MATCH, MATCH, [
    onInit(({
        fetch,
        global,
        JSON,
        socket,
        _
    }) => block([
        socket.on("file.upsert", ({ data }) => block([
            set(global.files, _.upsert(global.files, data))
        ])),
        socket.on("file.remove", ({ data }) => block([
            set(global.files, 
                _.map(
                    _.filter(global.files, ({ item }) => result(not(eq(item.id, data)))),
                    ({
                        item
                    }) => condition(eq(item.parentId, data), result(_.assign(item, {
                        parentId : null
                    }))).otherwise(result(item))
                )                
            ),
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
    MoveModal,
])

const Main = row<AdminState, AdminState>(MATCH, 0, [
    grow(true),
    background("blue"),
    Editor
]);

export const Admin = column<AdminState, AdminState>(MATCH, MATCH, [
    Header,
    Main,
])