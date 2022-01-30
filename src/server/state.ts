export const defaultAdminState = (
    state: RecursivePartial<AdminState> = {}
) : AdminState => (<AdminState>{
    selectedDirectory : "components",
    files : [],
    components : [],
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
            ...state.modal?.move
        },
    },
})