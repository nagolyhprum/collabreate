import { Tab } from "./shared"

export const Deploy = (dependencies : Dependencies) => {
    dependencies.add("admin:header", Tab("Deploy"))
}