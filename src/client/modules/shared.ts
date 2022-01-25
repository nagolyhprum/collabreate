import { condition, eq, set } from "../../language";
import {
    text,
    button,
    WRAP,
    onClick,
    observe,
    padding,
    row,
    MATCH
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

export const Body = <Local>(config : {
    name : string,
    content : ComponentFromConfig<AdminState, Local>
}) => row<AdminState, Local>(MATCH, MATCH, [
    observe(({
        global,
        event
    }) => set(event.visible, eq(global.selectedDirectory, config.name.toLowerCase()))),
    config.content
])