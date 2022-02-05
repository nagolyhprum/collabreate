export const defaultAdminState = (
    state: RecursivePartial<AdminState> = {}
) : AdminState => ({
    dragging : "",
    fileId : -1,
    selectedDirectory : "components",
    files : [] as any,
    components : [] as any,
    ...state,
    ui : {
        ...state.ui
    },
    branch : {
        id : "",
        previousBranchId : "",
        projectId : "",
        ...state.branch
    },
    project : {
        id : "",
        latestBranchId : "",
        ...state.project
    },
    modal : {
        remove : {
            id : -1,
            name : "",
            input : "",
            ...state.modal?.remove
        },
        rename : {
            id : -1,
            name : "",
            input : "",
            ...state.modal?.rename
        },
        move : {
            id : -1,
            name : "",
            parentId : null,
            ...state.modal?.move as any
        },
    },
})