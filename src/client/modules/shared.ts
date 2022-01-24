import { 
    text,
    button,
    MATCH,
    WRAP,
    onClick,
    observe
} from "../components";

export const Directory = <Local>(name : string) => button<AdminState, Local>(MATCH, WRAP, [
    onClick(({
        global
    }) => {
        global.selectedDirectory = name.toLowerCase()
    }),
    observe(({
        global,
        event
    }) => {
        event.background = global.selectedDirectory === name.toLowerCase() ? "red" : "blue";
    }),
    text(MATCH, WRAP, [
        name
    ])
])