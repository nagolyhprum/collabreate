import { Directory } from "./shared"

export const Deploy = (modules : Modules) => {
    modules.add("module:directory", Directory("Deploy"))
}