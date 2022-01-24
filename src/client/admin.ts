import { 
    text, 
    background, 
    MATCH, 
    row, 
    WRAP, 
    column, 
    grow
} from "./components";

const Header = (modules : Modules) => row<AdminState, AdminState>(MATCH, 64, [
    background("red")
]);

const LeftSideBar = (modules : Modules) => column<AdminState, AdminState>(300, MATCH, [
    background("green"),
    text(MATCH, WRAP, [
        "Directories"
    ]),
    column(MATCH, WRAP, [
        ...modules.list("module:directory")
    ])
]);

const Main = (modules : Modules) => row<AdminState, AdminState>(0, MATCH, [
    grow(true),
    background("blue")
]);

const RightSidebar = (modules : Modules) => row<AdminState, AdminState>(300, MATCH, [
    background("yellow")
]);

export const Admin = (modules : Modules) => column<AdminState, AdminState>(MATCH, MATCH, [
    Header(modules),
    row(MATCH, 0, [
        grow(true),
        LeftSideBar(modules),
        Main(modules),
        RightSidebar(modules)
    ]),
])