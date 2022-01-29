export const defaultAdminState = () => ({
    ui : {},
    selectedDirectory : "components",
    files : [],
    components : [],
    branch : {
        id : "",
        previousBranchId : "",
        projectId : ""
    },
    project : {
        id : "",
        latestBranchId : ""
    },
    modal : {
        remove : {
            id : -1,
            name : "",
            input : ""
        },
        rename : {
            id : -1,
            name : "",
            input : ""
        },
        move : {
            id : -1,
            name : "",
            parentId : null
        }
    },
})