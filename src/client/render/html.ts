import { render as renderJS, code, execute } from "../../language";
import { MATCH, WRAP } from "../components";

export const render = <Global extends GlobalState, Local>(
    root : ComponentFromConfig<Global, Local>
) => (
    config : ComponentConfig<Global, Local>
) : DocumentOutput => {
    const component = root(config);
    const output : DocumentOutput = {
        js : [
            `var adapters = {};`,
            `var events = {};`,
            `var listeners = [];`,
            `var global = ${JSON.stringify(config.global)};`,
        ],
        css : [],
        html : [],
        cache : new Set()
    }
    handle({
        component,
        global: config.global,
        local : config.local,
        output
    })
    output.js.push("bind(document.body, Local(global, 0));")
    return output;
}

function failed(_ : never) {
    throw new Error("this should never happen")
}

const getTagName = (name : Tag) : {
    name : string
    selfClosing : boolean
} => {
    switch(name) {        
        case "option":
        case "select":
        case "button":
            return {
                name,
                selfClosing : false
            };
        case "text":
            return {
                name : "span",
                selfClosing : false
            };
        case "stack":
        case "scrollable":
        case "row":
        case "root":
        case "column":
            return {
                name : "div",
                selfClosing : false
            };
        case "input":
            return {
                name : "input",
                selfClosing : true
            }
    }
    failed(name);
}

const numberToMeasurement = (input : number | null | undefined) : string => {
    if(input === null || input === undefined) {
        return "";
    }
    if(0 < input && input < 1) {
        return `${input * 100}%`
    } else if(input === WRAP) {
        return "auto"
    } else if(input === MATCH) {
        return "100%"
    } else {
        return `${input}px`
    }
}

const handleBox = (prefix : string, input : BoxProp<Array<unknown> | number>, props : TagProps) => {
    keys(input).forEach(key => {
        const value = input[key]
        if(value instanceof Array) {
            props.style[`${prefix}${key}`] = value.map(it => typeof it === "number" ? numberToMeasurement(it) : it).join(" ")
        } else {
            props.style[`${prefix}${key}`] = numberToMeasurement(value)
        }
    })
}

const handleProp = <Global extends GlobalState, Local, Key extends keyof Component<Global, Local>>({
    name,
    value,
    props,
} : {
    name : Key,
    value : Component<Global, Local>[Key],
    props : TagProps
}) : TagProps => {
    switch(name) {
        case "width":
        case "height":
            if(typeof value === "number") {
                props.style[name] = numberToMeasurement(value)
            }
            return props;
        case "name":
            if(value === "stack") {
                props.style.position = "relative";
            } else if(value === "row" || value === "column") {
                props.style.display = "flex";
                props.style["flex-direction"] = value.toString();
            }
            if(value === "scrollable") {
                props.style.overflow = "auto";
            }
            return props;
        case "background":
            props.style.background = value?.toString() ?? "";
            return props;
        case "grow":
            props.style["flex-grow"] = value ? "1" : ""
            return props;
        case "id":
            props["data-id"] = value?.toString() ?? "";
            return props;
        case "position":
            props.style.position = "absolute";
            handleBox("", value as BoxProp<number | Array<unknown>>, props)
            return props;
        case "padding":
        case "margin":
        case "border":
            handleBox(`${name}-`, value as BoxProp<number | Array<unknown>>, props)
            return props;
        case "visible":
            if(!value) {
                props.style.display = "none";
            }
            return props;
        case "value":
            props.value = value?.toString() ?? "";
            return props;
        case "placeholder":
            props.placeholder = value?.toString() ?? ""
            return props;
        case "enabled":
            props.disabled = value === false ? "disabled" : ""
            return props;
        case "onDragStart":
            props.draggable = "true";
            return props;
        case "onDragEnd":
        case "onDrop":
        case "onInit":
        case "onClick":
        case "onEnter":
        case "onInput":
        case "observe":
        case "onSelect":
        case "children":
        case "text":
        case "adapters":
        case "data":
        case "focus":
            // DO NOTHING
            return props;
    }
    failed(name);
    return props;
}

const handleChildren = <Global extends GlobalState, Local, Key extends keyof Component<Global, Local>>({
    component,
    name,
    value,
    output,
    global,
    local
} : {
    component : Component<Global, Local>
    name : Key
    value : Component<Global, Local>[Key]
    output : DocumentOutput
    global : Global
    local : Local
}) => {
    switch(name) {
        case "text":
            output.html.push(value?.toString() ?? "")
            return;
        case "children":
            (value as Component<Global, Local>[]).forEach(component => handle({
                component,
                local,
                global,
                output
            }))
            return;
        case "adapters": {
            const adapter = value as Component<Global, Local>["adapters"]
            const data = component.data
            if(adapter) {
                for(const index in adapter) {
                    const key = `${component.id}_${index}`
                    if(!output.cache.has(key)) {
                        output.cache.add(key)
                        const child = adapter[index]({
                            global : global,
                            local : null,
                            parent : {
                                height : 0,
                                width : 0,
                                name : "root",                                
                            }
                        }).children?.[0]
                        if(child) {
                            const adapterOutput = handle({
                                component : child,
                                global,
                                local : null,
                                output : {
                                    cache : output.cache,
                                    css : output.css,
                                    html : [],
                                    js : output.js
                                }
                            })
                            output.js.push(`adapters.${key} = $('${adapterOutput.html.join("")}')`)
                        }
                    }
                }
                if(data) {
                    data.forEach(local => {
                        const parent : Component<Global, unknown> = {
                            width : 0,
                            height : 0,
                            name : "root"
                        }
                        adapter[local.adapter]({
                            global,
                            local,
                            parent
                        })
                        return handle({
                            component : (parent.children || [])[0],
                            global,
                            local,
                            output
                        })
                    })
                }
            }
            return;
        }
        case "onInit":
        case "onDragStart":
        case "onDragEnd":
        case "onDrop":
        case "observe":
        case "onInput":
        case "onEnter":
        case "onSelect":
        case "onClick": {
            const id = `${name}:${component.id}`
            if(!output.cache.has(id)) {
                output.cache.add(id)
                output.js.push(`setEvent("${component.id}", "${name}", function(local, index, event) {`);
                (value as Array<(config : any) => ProgrammingLanguage>).forEach((callback) => {
                    const generated = code(callback, new Set([]));
                    output.js.push(renderJS(generated, "\t"))
                })
                output.js.push("});");
            }
            return;
        }
        case "visible":
        case "padding":
        case "margin":
        case "border":
        case "id":
        case "width":
        case "height":
        case "name":
        case "background":
        case "grow":
        case "data":
        case "position":
        case "value":
        case "placeholder":
        case "enabled":
        case "focus":
            return;
    }
    failed(name);
}

const keys = <T>(input : T) => Object.keys(input) as (keyof T)[]

const handle = <Global extends GlobalState, Local>({
    component,
    local,
    global,
    output
} : {
    component : Component<Global, Local>
    local : Local
    global : Global
    output : DocumentOutput
}) : DocumentOutput => {
    const {
        name,
        selfClosing
    } = getTagName(component.name);

    if(component.observe && local) {
        component.observe.forEach(callback => {
            const generated = code(callback, new Set([]))
            execute(generated, {
                global,
                local,
                event : component
            })
        })
    }

    const props = keys(component).reduce((props, name) => {
        return handleProp<Global, Local, typeof name>({
            name,
            props,
            value: component[name]
        });
    }, {
        style : {}
    } as TagProps)

    const render = Object.keys(props).map(key => {
        const value = props[key]
        if(key !== "children" && value) {
            if(typeof value === "object") {
                return `style="${keys(value).map((key) => {
                    return `${key.toString()}:${value[key]}`
                }).join(";")}"`
            } else {
                return `${key}="${value}"`
            }
        }
    }).filter(_ => _).join(" ")

    if(selfClosing) {
        output.html.push(`<${name} ${render}/>`)
    } else {
        output.html.push(`<${name} ${render}>`)
    }
    keys(component).forEach((name) => {
        handleChildren({
            component,
            output,
            local,
            global,
            name,
            value : component[name]
        })
    })
    if(!selfClosing) {
        output.html.push(`</${name}>`)
    }

    return output
}