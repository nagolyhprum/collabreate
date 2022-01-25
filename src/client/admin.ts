import {
    text,
    background,
    MATCH,
    row,
    WRAP,
    column,
    grow
} from "./components";

const Header = (modules : Modules) => row<AdminState, AdminState>(MATCH, WRAP, [
    background("red"),
    row(0, WRAP, [
        grow(true),
        text(WRAP, WRAP, [
            "Collabreate"
        ]),
        ...modules.list("module:tab")
    ])
]);

const Main = () => row<AdminState, AdminState>(MATCH, 0, [
    grow(true),
    background("blue")
]);

export const Admin = (modules : Modules) => column<AdminState, AdminState>(MATCH, MATCH, [
    Header(modules),
    Main(),
])