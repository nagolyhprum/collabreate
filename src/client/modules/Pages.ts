import { Directory } from "./shared"

export const Pages = (modules : Modules) => {
    modules.add("module:directory", Directory("Pages"))
}