import { Tab } from "./shared"

export const Branches = (dependencies : Dependencies) => {
    dependencies.add("admin:header", Tab("Branches"))
}