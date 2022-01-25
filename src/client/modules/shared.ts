import { condition, eq, set } from "../../language";
import {
    text,
    button,
    WRAP,
    onClick,
    observe,
    padding
} from "../components";

export const Tab = <Local>(name : string) => button<AdminState, Local>(WRAP, WRAP, [
    padding(16),
    onClick(({
        global
    }) => set(global.selectedDirectory, name.toLowerCase())),
    observe(({
        global,
        event
    }) => condition(eq(global.selectedDirectory, name.toLowerCase()), set(
        event.background, "red"
    )).otherwise(set(
        event.background, "blue"
    ))),
    text(WRAP, WRAP, [
        name
    ])
])