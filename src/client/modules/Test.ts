import { Directory } from "./shared"

export const Test = (modules : Modules) => {
    modules.add("module:directory", Directory("Test"))
}