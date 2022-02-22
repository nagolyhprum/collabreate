import { add, and, block, condition, declare, defined, div, eq, fallback, not, or, result, set, sub, symbol } from "../../language";
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
    scrollable,
    onEnter,
    onDragStart,
    onDragEnd,
    onDrop,
    margin,
    props
} from "../components";

import { File, Component as DBComponent, Prisma } from "@prisma/client"

const BoxModel = props<AdminState, DBComponent>([
    observe(({
        local,
        event
    }) => block([
        set(event.width, (local.props as ComponentProps).width),
        set(event.height, (local.props as ComponentProps).height),
    ]))
])

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
    button(WRAP, WRAP, [
        margin([16, 16, 0, 16]),
        onClick(({
            global,
            local
        }) => set(global.fileId, local.id)),
        text(WRAP, WRAP, [
            id("file_component_name"),
            observe(({
                local,
                event
            }) => set(event.text, local.name))
        ]),
    ]),
    button(WRAP, WRAP, [
        id("file_component_rename_button"),
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
        id("file_component_move_button"),
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
                parentId : local.parentId,
                select : local.parentId
            }
        ))
    ]),
    button(WRAP, WRAP, [
        id("file_component_remove_button"),
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
            id("folder_component_expand_collapse_button"),
            onClick(({
                local,
                global
            }) => set(symbol(global.ui, local.uiId), not(symbol(global.ui, local.uiId)))),
            text(WRAP, WRAP, [
                id("folder_component_expand_collapse_text"),
                observe(({
                    event,
                    local,
                    global
                }) => condition(symbol(global.ui, local.uiId), 
                    set(event.text, "-")
                ).otherwise(
                    set(event.text, "+")                    
                ))
            ])
        ]),
        text(WRAP, WRAP, [
            id("folder_component_name"),
            observe(({
                local,
                event
            }) => set(event.text, local.name)),
        ]),
        button(WRAP, WRAP, [
            id("folder_component_rename_button"),
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
            id("folder_component_move_button"),
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
                    parentId : local.parentId,
                    select : local.parentId,
                }
            ))
        ]),
        button(WRAP, WRAP, [
            id("folder_component_remove_button"),
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
            id("folder_component_add_file_button"),
            text(WRAP, WRAP, [
                "Add File"
            ]),
            onClick(({
                global,
                fetch,
                JSON,
                local
            }) => block([
                set(symbol(global.ui, local.uiId), true),
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
            id("folder_component_add_folder_button"),
            text(WRAP, WRAP, [
                "Add Folder"
            ]),
            onClick(({
                global,
                fetch,
                JSON,
                local
            }) => block([
                set(symbol(global.ui, local.uiId), true),
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
        id("folder_component_children"),
        observe(({
            event,
            local,
            global
        }) => set(event.visible, symbol(global.ui, local.uiId))),
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
            }) => set(global.modal.rename.input, event)),
            onEnter(({
                global,
                fetch,
                _,
                JSON
            }) => condition(
                and(
                    not(eq(global.modal.rename.input, "")),
                    _.reduce(global.files, ({
                        total,
                        item
                    }) => result(and(total, not(eq(global.modal.rename.input, item.name)))), true)
                ),
                block([
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
                ])
            ))
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
                    global,
                    _
                }) => set(event.enabled, and(
                    not(eq(global.modal.rename.input, "")),
                    _.reduce(global.files, ({
                        total,
                        item
                    }) => result(and(total, not(eq(global.modal.rename.input, item.name)))), true)
                ))),
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

export const RemoveModal = stack<AdminState, AdminState>(MATCH, MATCH, [
    id("remove_modal"),
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
            "Please confirm the name of the file you would like to remove"
        ]),
        input(MATCH, WRAP, [
            id("remove_modal_name_input"),
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
            }) => set(global.modal.remove.input, event)),
            onEnter(({
                global,
                fetch,
                JSON
            }) => condition(
                eq(global.modal.remove.input, global.modal.remove.name), 
                block([                    
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
                ])
            ))
        ]),
        row(MATCH, WRAP, [
            button(WRAP, WRAP, [
                id("remove_modal_cancel_button"),
                onClick(({
                    global
                }) => set(global.modal.remove.id, -1)),
                text(WRAP, WRAP, [
                    "Cancel"
                ])
            ]),
            button(WRAP, WRAP, [
                id("remove_modal_save_button"),
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
    id("move_modal"),
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
            id("move_modal_title"),
            observe(({
                event,
                global
            }) => set(event.text, add("Where would you like to move ", global.modal.move.name)))
        ]),
        select(MATCH, WRAP, [
            id("move_modal_parent_select"),
            onSelect(({
                event,
                global,
                JSON
            }) => set(global.modal.move.select, JSON.parse(event))),
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
                set(event.value, global.modal.move.select)
            ])),
            adapters({
                option : option<AdminState, {
                    label : string
                    value : string
                }>([
                    id("standard_select_option"),
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
                id("move_modal_cancel_button"),
                onClick(({
                    global
                }) => set(global.modal.move.id, -1)),
                text(WRAP, WRAP, [
                    "Cancel"
                ])
            ]),
            button(WRAP, WRAP, [
                observe(({
                    event,
                    global
                }) => set(event.enabled, not(eq(global.modal.move.parentId, global.modal.move.select)))),
                id("move_modal_save_button"),
                onClick(({
                    global,
                    fetch,
                    JSON,
                    _
                }) => block([
                    fetch("/api/file", {
                        method : "PATCH",
                        headers : {
                            "Content-Type" : "application/json; charset=utf-8"
                        },
                        body : JSON.stringify({
                            id : global.modal.move.id,
                            parentId : global.modal.move.select
                        })
                    }),
                    set(symbol(global.ui, _.reduce(global.files, ({
                        total,
                        item
                    }) => condition(
                        eq(item.id, global.modal.move.select), 
                        result(item.uiId)
                    ).otherwise(
                        result(total)
                    ), "")), true),
                    set(global.modal.move.id, -1),
                ])),
                text(WRAP, WRAP, [
                    "Move"
                ])
            ]),
        ])
    ])
])

const COMPONENTS = ["input", "button", "text", "column"]

export const RightPanel = scrollable<AdminState, AdminState>(.3, MATCH, [
    background("yellow"),
    column(WRAP, WRAP, [
        ...COMPONENTS.map(component => text<AdminState, AdminState>(WRAP, WRAP, [
            component,
            onDragStart(({
                global
            }) => set(global.dragging, component)),
            onDragEnd(({
                global
            }) => set(global.dragging, ""))
        ]))
    ])
])

export const LeftPanel = scrollable<AdminState, AdminState>(.3, MATCH, [
    background("yellow"),
    column(MATCH, WRAP, [
        padding(16),
        row(MATCH, WRAP, [
            text(WRAP, WRAP, [
                id("project_name"),
                observe(({
                    global,
                    event
                }) => set(
                    event.text,
                    global.project.id
                ))
            ]),
            text(WRAP, WRAP, [
                id("branch_name"),
                observe(({
                    global,
                    event
                }) => set(
                    event.text,
                    global.branch.id
                ))
            ]),
            button(WRAP, WRAP, [
                id("add_file_button"),
                text(WRAP, WRAP, [
                    "Add File"
                ]),
                onClick(({
                    global,
                    fetch,
                    JSON
                }) => fetch("/api/file", {
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
                ),
            ]),
            button(WRAP, WRAP, [
                id("add_folder_button"),
                text(WRAP, WRAP, [
                    "Add Folder"
                ]),
                onClick(({
                    global,
                    fetch,
                    JSON
                }) => fetch("/api/file", {
                    method : "POST",
                    headers : {
                        "Content-Type" : "application/json; charset=utf-8"
                    },
                    body : JSON.stringify({
                        branchId : global.branch.id,
                        isFolder : true,
                        parentId : null,
                    })
                })),
            ]),
        ]),
        column(MATCH, WRAP, [
            id("root_folder_file"),
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
])

const RootDropZone = stack<AdminState, AdminState>(100, 100, [
    onDrop(({
        global,
        fetch,
        JSON
    }) => fetch("api/component", {        
        method : "POST",
        headers : {
            "Content-Type" : "application/json; charset=utf-8"
        },
        body : JSON.stringify({    
            props : {
                type : global.dragging,
                index : 0
            },
            parentId : null,
            branchId : global.branch.id,
            fileId : global.fileId,
        })
    })),
    background("blue"),
    observe(({
        event,
        global,
        _
    }) => declare(({
        root
    }) => [
        set(event.visible, and(
            not(eq(global.fileId, -1)), 
            not(defined(root)), 
            not(eq(global.dragging, ""))
        ))
    ], {
        root : _.find(global.components, ({ 
            item 
        }) => result(and(eq(item.fileId, global.fileId), eq(item.parentId, null))), null)
    }))
])

const ComponentDropZone = stack<AdminState, DBComponent & {
    index?: number
}>(100, 100, [
    onDrop(({
        global,
        fetch,
        JSON,
        local
    }) => fetch("api/component", {        
        method : "POST",
        headers : {
            "Content-Type" : "application/json; charset=utf-8"
        },
        body : JSON.stringify({            
            props : {
                type : global.dragging,
                index : fallback(local.index, 0)
            },
            parentId : local.id,
            branchId : global.branch.id,
            fileId : global.fileId,
        })
    })),
    background("blue"),
    observe(({
        event,
        global,
        _,
        local
    }) => declare(({
        root
    }) => [
        set(event.visible, and(
            not(eq(global.fileId, -1)), 
            or(not(defined(root)), eq((local.props as ComponentProps).type, "column")),
            not(eq(global.dragging, ""))
        ))
    ], {
        root : _.find(global.components, ({ 
            item 
        }) => result(and(eq(item.fileId, global.fileId), eq(item.parentId, local.id))), null)
    }))
])

const ComponentManager : ComponentFromConfig<AdminState, DBComponent> = stack<AdminState, DBComponent>(0, 0, [
    BoxModel,
    observe(({
        event,
        local,
        _,
    }) => set(event.data, [_.assign<DBComponent & {
        adapter : string
    }>({}, local, {
        adapter : (local.props as ComponentProps).type as string
    })])),
    adapters({
        column : column<AdminState, DBComponent>(MATCH, MATCH, [
            stack(WRAP, WRAP, [
                observe(({
                    event,
                    local,
                    _,
                    global    
                }) => declare(({
                    first
                }) => [
                    set(event.data, [_.assign<DBComponent & {
                        index : number
                        adapter : string
                    }>({}, local, {
                        index : sub((first.props as ComponentProps).index, 1),
                        adapter : "local"
                    })])
                ], {
                    first : fallback<{
                        props : Prisma.JsonValue
                    }>(symbol(_.sort(
                        _.filter(global.components, ({
                            item
                        }) => result(and(eq(item.fileId, global.fileId), eq(item.parentId, local.id)))),
                        ({ a, b }) => result(sub((a.props as ComponentProps).index, (b.props as ComponentProps).index))
                    )
                    , 0), {
                        props : {
                            index : 1
                        }
                    })
                })),
                adapters({
                    local : ComponentDropZone
                })
            ]),
            column(MATCH, MATCH, [
                observe(({
                    _,
                    event,
                    global,
                    local
                }) => set(event.data, _.map(
                    _.sort(
                        _.filter(global.components, ({
                            item
                        }) => result(and(eq(item.fileId, global.fileId), eq(item.parentId, local.id)))),
                        ({ a, b }) => result(sub((a.props as ComponentProps).index, (b.props as ComponentProps).index))
                    ),
                    ({
                        item,
                        index,
                        items
                    }) => result(_.assign<DBComponent | {
                        adapter : string
                        parent : DBComponent
                        index : number
                    }>({}, item, {
                        adapter : "local",
                        parent : local,
                        index : div(add(
                            (item.props as ComponentProps).index, 
                            (fallback<{
                                props : Prisma.JsonValue
                            }>(symbol(items, add(index, 1)), {
                                props : {
                                    index : (item.props as ComponentProps).index
                                }
                            }).props as ComponentProps).index
                        ), 2)
                    }))
                ))),
                adapters({
                    local : column<AdminState, DBComponent & {
                        parent : DBComponent
                        index : number
                    }>(WRAP, WRAP, [
                        recursive(() => ComponentManager as any),
                        stack(WRAP, WRAP, [
                            observe(({
                                event,
                                local,
                                _
                            }) => set(
                                event.data,
                                [_.assign<DBComponent & {
                                    adapter : string
                                    index : number
                                }>({}, local.parent, {
                                    adapter : "local",
                                    index : local.index
                                })]
                            )),
                            adapters({
                                local : ComponentDropZone
                            })
                        ])
                    ])
                })            
            ])
        ]),
        input : input<AdminState, DBComponent>(MATCH, MATCH, [
        ]),
        button : button<AdminState, DBComponent>(MATCH, MATCH, [
            ComponentDropZone,
            stack(MATCH, MATCH, [
                observe(({
                    _,
                    event,
                    global,
                    local
                }) => set(event.data, _.map(
                    _.sort(
                        _.filter(global.components, ({
                            item
                        }) => result(and(eq(item.fileId, global.fileId), eq(item.parentId, local.id)))),
                        ({ a, b }) => result(sub((a.props as ComponentProps).index, (b.props as ComponentProps).index))
                    ),
                    ({
                        item
                    }) => result(_.assign<DBComponent | {
                        adapter : string
                    }>({}, item, {
                        adapter : "local"
                    }))
                ))),
                adapters({
                    local : recursive(() => ComponentManager)
                })
            ])
        ]),
        text : text<AdminState, DBComponent>(MATCH, MATCH, [
            observe(({
                local,
                event
            }) => set(event.text, (local.props as ComponentProps).text))
        ]),
    })
])

export const Preview = column<AdminState, AdminState>(0, MATCH, [
    grow(true),
    background("purple"),
    RootDropZone,
    stack(WRAP, WRAP, [
        observe(({
            _,
            event,
            global,
        }) => set(event.data, _.map(
            _.sort(
                _.filter(global.components, ({
                    item
                }) => result(and(eq(item.fileId, global.fileId), eq(item.parentId, null)))),
                ({ a, b }) => result(sub((a.props as ComponentProps).index, (b.props as ComponentProps).index))
            ),
            ({
                item
            }) => result(_.assign<DBComponent | {
                adapter : string
            }>({}, item, {
                adapter : "local"
            }))
        ))),
        adapters({
            local : ComponentManager
        })
    ])
])

export const Editor = row<AdminState, AdminState>(MATCH, MATCH, [
    id("editor_root"),
    onInit(({
        fetch,
        global,
        JSON,
        socket,
        _
    }) => block([
        socket.on("component.upsert", ({ data }) => block([
            set(global.components, _.upsert(global.components, data))
        ])),
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
    LeftPanel,
    Preview,
    RightPanel,
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