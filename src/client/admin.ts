import {
    text,
    background,
    MATCH,
    row,
    WRAP,
    column,
    grow,
    padding
} from "./components";

const Header = (modules : Modules) => row<AdminState, AdminState>(MATCH, WRAP, [
    background("red"),
    row(0, WRAP, [
        grow(true),
        text(WRAP, WRAP, [
            padding(16),
            "Collabreate"
        ]),
        ...modules.list("admin:header")
    ])
]);

const Main = (modules : Modules) => row<AdminState, AdminState>(MATCH, 0, [
    grow(true),
    background("blue"),
    ...modules.list("admin:main")
]);

export const Admin = (modules : Modules) => column<AdminState, AdminState>(MATCH, MATCH, [
    Header(modules),
    Main(modules),
])