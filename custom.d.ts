declare module "*.svg" {
    const content: string;
    export default content;
}

type Endpoint = (
    req : import("http").IncomingMessage, 
    res : import("http").ServerResponse
) => Promise<boolean>

type DocumentOutput = {
    html : string[]
    js : string[]
    css : string[]
    cache : Set<string>
}

type Unarray<T> = T extends Array<infer U> ? U : T;

type Tag = "row" | "root" | "column" | "text" | "button"

type GlobalState = {
    // I ADDED THIS SO THAT I GET TYPE ERRORS
    __ : boolean
}

type AdminState = GlobalState & {
    selectedDirectory : string
}

type TagProps = Record<string, string> & {
    style : Record<string, string>
}

type EventConfig<Global extends GlobalState, Local, Type> = {
    local : Local
    global : Global
    event : Type
}

type ComponentEvents<Global extends GlobalState, Local> = {
    observe?: Array<(event : EventConfig<Global, Local, Component<Global, Local>>) => ProgrammingLanguage>
    onClick?: Array<(event : EventConfig<Global, Local, null>) => ProgrammingLanguage>
}

type BoxProp<Type> = {
    top?: Type
    right?: Type
    bottom?: Type
    left?: Type
}

type Border = [number, "solid" | "dashed", string]

type UnwrapBoxProp<T> = T extends BoxProp<infer U> ? U : T;

type ComponentBoxProps = {
    padding?: BoxProp<number>
    margin?: BoxProp<number>
    border?: BoxProp<Border>
}

type Component<Global extends GlobalState, Local> = ComponentBoxProps & ComponentEvents<Global, Local> & {
    width : number
    height : number
    name : Tag
    id? : string
    children?: Array<Component<Global, Local>>
    text?: string
    background?: string
    grow?: boolean
    adapter?: Adapter<Global>
    data?: Array<Record<string, unknown> & {
        adapter : string
    }>
    // TODO REMOVE
}

type Adapter<Global extends GlobalState> = {
    [key : string] : ComponentFromConfig<Global, any>
}

type ComponentConfig<Global extends GlobalState, Local> = {
    parent : Component<Global, Local>
    global : Global
    local : Local
}

type ComponentFromConfig<Global extends GlobalState, Local> = (config : ComponentConfig<Global, Local>) => Component<Global, Local>

type DatabaseRecord = Record<string, unknown>

type Table = {
    id : string
    name : string
}

interface Database {
    getAll(table : Table) : Promise<Array<DatabaseRecord>>
    // null/undefined if not found
    get(table : Table, id : string[]) : Promise<Array<DatabaseRecord>>
    insert(table : Table, id : string, data : DatabaseRecord) : Promise<void>
    update(table : Table, id : string, data : DatabaseRecord) : Promise<void>
    // true if it was created
    upsert(table : Table, id : string, data : DatabaseRecord) : Promise<boolean>
    remove(table : Table, id : string) : Promise<void>
}

type ModuleName = "module:tab" | "module:endpoint" | "database"

type Modules = {
    _map : Record<string, any[]>
    set : (name : ModuleName, value : any) => void
    get : (name : ModuleName) => any
    add : (name : ModuleName, value : any) => void
    list : (name : ModuleName) => any[]
}

type Module = (modules : Modules) => void

type ProgrammingLanguage = {
    _name: "fallback",
    value: ProgrammingLanguage,
    fallback: ProgrammingLanguage
} | {
    _name: "sub",
    items: ProgrammingLanguage[]
} | {
    _name: "and",
    items: ProgrammingLanguage[]
} | {
    _name: "or",
    items: ProgrammingLanguage[]
} | {
    _name: "add",
    items: ProgrammingLanguage[]
} | {
    _name: "mult",
    items: ProgrammingLanguage[]
} | {
    _name: "div",
    items: ProgrammingLanguage[]
} | {
    _name: "gt",
    a: ProgrammingLanguage
    b: ProgrammingLanguage
} | {
    _name: "lt",
    a: ProgrammingLanguage
    b: ProgrammingLanguage
} | {
    _name: "gte",
    a: ProgrammingLanguage
    b: ProgrammingLanguage
} | {
    _name: "eq",
    a: ProgrammingLanguage
    b: ProgrammingLanguage
} | {
    _name: "set",
    variable: ProgrammingLanguage[],
    value: ProgrammingLanguage
} | {
    _name: "invoke",
    target: ProgrammingLanguage,
    fun: string,
    args: ProgrammingLanguage[]
    sideEffect?: boolean
} | {
    _name: "get",
    variable: ProgrammingLanguage[]
} | {
    _name: "declare",
    variables: {
        [key: string]:unknown
    },
    body: ProgrammingLanguage[]
} | {
    _name: "result",
    value: ProgrammingLanguage
} | {
    _name: "fun",
    args: string[],
    body: ProgrammingLanguage
} | {
    _name: "condition",
    test: ProgrammingLanguage,
    then: ProgrammingLanguage,
    otherwise?: ProgrammingLanguage
} | {
    _name: "not",
    item: ProgrammingLanguage
} | {
    _name: "defined"
    item: ProgrammingLanguage
}

type PollyDate = {
    now: () => number
}

type PollyTimeout = (callback: () => ProgrammingLanguage, ms: number) => number

type PollyJSON = {
    stringify(input: unknown, replacer? : unknown, space? : string): string
    parse(input: string): unknown
}

type PollyFetch = (url: string, config: {
    body?: string
    headers?: Record<string, string>
    method?: "POST" | "GET" | "PUT" | "DELETE"
    callback?: (response: {
        status: number
        body: string
        headers: Record<string, string>
    }) => ProgrammingLanguage
}) => void

type UnderscoreProgramming = {  
    toLowerCase: (input : string) => string,
    split: (input : string, token : string) => string[],
    toString: (input : unknown) => string  
    replace: (haystack: string, needle: string, replace: string) => string
    slice: <T>(items: T[], from : number, to : number) => T[]
    reduce: <T, U>(items: T[], callback: (args: {
        item: T,
        total: U
    }) => ProgrammingLanguage, initial: U) => U
    indexOf: <T>(items: T[], callback: (args: {
        item: T
    }) => ProgrammingLanguage) => number
    some: <T>(items: T[], callback: (args: {
        item: T
    }) => ProgrammingLanguage) => boolean
    every: <T>(items: T[], callback: (args: {
        item: T
    }) => ProgrammingLanguage) => boolean
    forEach: <T, U>(items: T[], callback: (args: {
        item: T
        index: number
    }) => ProgrammingLanguage) => void
    // TODO ADD INDEX TO IOS AND ANDROID
    map: <T, U>(items: T[], callback: (args: {
        item: T
        index: number
    }) => ProgrammingLanguage) => U[]
    filter: <T>(items: T[], callback: (args: {
        item: T
    }) => ProgrammingLanguage) => T[]
    includes: <T>(items: T[], item: T) => boolean
    concat: <T>(...lists: T[][]) => T[]
    assign: <T>(target: Partial<T>, ...overwrite: Array<Partial<T>>) => T
    find: <T>(items: T[], callback: (args: {
        item: T
    }) => ProgrammingLanguage, or: T | null) => T
    sort: <T>(items: T[], callback: (args: {
        a: T,
        b: T
    }) => ProgrammingLanguage) => T[]
    compare: <T>(a: T, b: T) => number
    upsert: <T extends {
        key: string
    }>(list: T[], item: T) => T[]
}

type UnderscoreProgramming = {  
    toLowerCase: (input : string) => string,
    split: (input : string, token : string) => string[],
    toString: (input : unknown) => string  
    replace: (haystack: string, needle: string, replace: string) => string
    slice: <T>(items: T[], from : number, to : number) => T[]
    reduce: <T, U>(items: T[], callback: (args: {
        item: T,
        total: U
    }) => ProgrammingLanguage, initial: U) => U
    indexOf: <T>(items: T[], callback: (args: {
        item: T
    }) => ProgrammingLanguage) => number
    some: <T>(items: T[], callback: (args: {
        item: T
    }) => ProgrammingLanguage) => boolean
    every: <T>(items: T[], callback: (args: {
        item: T
    }) => ProgrammingLanguage) => boolean
    forEach: <T, U>(items: T[], callback: (args: {
        item: T
        index: number
    }) => ProgrammingLanguage) => void
    // TODO ADD INDEX TO IOS AND ANDROID
    map: <T, U>(items: T[], callback: (args: {
        item: T
        index: number
    }) => ProgrammingLanguage) => U[]
    filter: <T>(items: T[], callback: (args: {
        item: T
    }) => ProgrammingLanguage) => T[]
    includes: <T>(items: T[], item: T) => boolean
    concat: <T>(...lists: T[][]) => T[]
    assign: <T>(target: Partial<T>, ...overwrite: Array<Partial<T>>) => T
    find: <T>(items: T[], callback: (args: {
        item: T
    }) => ProgrammingLanguage, or: T | null) => T
    sort: <T>(items: T[], callback: (args: {
        a: T,
        b: T
    }) => ProgrammingLanguage) => T[]
    compare: <T>(a: T, b: T) => number
    upsert: <T extends {
        key: string
    }>(list: T[], item: T) => T[]
}