import { background, button, column, MATCH, position, stack, text, WRAP } from "../components"

export const Projects = (dependencies : Dependencies) => {
    dependencies.add("admin:header", stack(WRAP, WRAP, [
        button(WRAP, MATCH, [
            text(WRAP, MATCH, [
                "Projects"
            ])
        ]),
        column(WRAP, WRAP, [
            background("yellow"),
            position({
                top : MATCH
            }),
            text(WRAP, WRAP, [
                "Collabreate"
            ])
        ])
    ]))
}