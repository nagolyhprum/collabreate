import { render as renderJS, code, execute } from "../../language";
import { generateId, MATCH, WRAP } from "../components";

export const render = <Global extends GlobalState, Local>(
    root : ComponentFromConfig<Global, Local>
) => (
    config : ComponentConfig<Global, Local>
) : DocumentOutput => {
    const component = root(config);
    const output : DocumentOutput = {
        js : [
            `var global = ${JSON.stringify(config.global)};`
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
    output.js.push("bind(document.body);")
    return output;
}

function failed(_ : never) {
    console.log("this should never happen")
}

const getTagName = (name : Tag) : string => {
    switch(name) {
        case "button":
            return "button";
        case "text":
            return "span";
        case "row":
        case "root":
        case "column":
            return "div";
    }
    failed(name);
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
                if(0 < value && value < 1) {
                    props.style[name] = `${value * 100}%`
                } else if(value === WRAP) {
                    props.style[name] = "auto"
                } else if(value === MATCH) {
                    props.style[name] = "100%"
                } else {
                    props.style[name] = `${value}px`;
                }
            }
            return props;
        case "name":
            if(value === "row" || value === "column") {
                props.style.display = "flex";
                props.style["flex-direction"] = value;
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
        case "onClick":
        case "children":
        case "text":
        case "adapter":
        case "observe":
        case "data":
            // TODO
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
        case "adapter": {

            const adapter = value as Component<Global, Local>["adapter"]
            const data = component.data
            if(data && adapter) {
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
            return;
        }
        case "observe":
        case "onClick": {
            const id = `${name}:${component.id}`
            if(!output.cache.has(id)) {
                output.cache.add(id)
                output.js.push(`setEvent("${component.id}", "${name}", function(local, event) {`);
                (value as Array<(config : any) => ProgrammingLanguage>).forEach((callback) => {
                    const generated = code(callback, new Set([]));
                    output.js.push(renderJS(generated, "\t"))
                })
                output.js.push("});");
            }
            return;
        }
        case "id":
        case "width":
        case "height":
        case "name":
        case "background":
        case "grow":
        case "data":
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
    const name = getTagName(component.name);

    if(component.observe) {
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
                return `style=${keys(value).map((key) => {
                    return `${key.toString()}:${value[key]}`
                }).join(";")}`
            } else {
                return `${key}="${value}"`
            }
        }
    }).filter(_ => _).join(" ")

    output.html.push(`<${name} ${render}>`)

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

    output.html.push(`</${name}>`)

    return output
}