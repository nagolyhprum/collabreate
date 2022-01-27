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

const Header = (dependencies : Dependencies) => row<AdminState, AdminState>(MATCH, WRAP, [
    background("red"),
    row(0, WRAP, [
        grow(true),
        text(WRAP, WRAP, [
            padding(16),
            "Collabreate"
        ]),
        ...dependencies.list("admin:header")
    ])
]);

const Main = (dependencies : Dependencies) => row<AdminState, AdminState>(MATCH, 0, [
    grow(true),
    background("blue"),
    ...dependencies.list("admin:main")
]);

export const Admin = (dependencies : Dependencies) => column<AdminState, AdminState>(MATCH, MATCH, [
    Header(dependencies),
    Main(dependencies),
])