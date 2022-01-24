import { Directory } from "./shared"

export const Commit = (modules : Modules) => {
    modules.add("module:directory", Directory("Commit"))
}