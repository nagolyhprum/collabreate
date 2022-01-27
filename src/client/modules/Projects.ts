import { Tab } from "./shared"

export const Projects = (dependencies : Dependencies) => {
    dependencies.add("admin:header", Tab("Projects"))
}