import { Directory } from "./shared"

export const Components = (modules : Modules) => {
    modules.add("module:directory", Directory("Components"))
}