import { Tab } from "./shared"

export const Deploy = (modules : Modules) => {
    modules.add("module:tab", Tab("Deploy"))
}