import { Tab } from "./shared"

export const Deploy = (modules : Modules) => {
    modules.add("admin:header", Tab("Deploy"))
}