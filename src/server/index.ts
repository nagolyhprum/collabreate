import { IncomingMessage, ServerResponse } from "http"
import { Admin } from "../client/admin";
import { MATCH } from '../client/components'
import { render } from "../client/render/html";

const document = ({
    html,
    js
} : {
    html : string
    js : string
}) => `<!doctype html>
    <html>
        <style>
html, body {
    display : flex;
    margin : 0;
    padding : 0;
    border : 0;
    font-size : 16px;
    width : 100%;
    min-height : 100%;
}
        </style>
    <head>
    </head>
    <body>
        ${html}
        <script>
var _ = {
    toString : function(input) {
        return "" + input;
    },
    concat : function(a, b) {
        return a.concat(b);
    }
}
function $(html) {
    const div = document.createElement("div");
    div.innerHTML = html;
    const child = div.children[0];
    return function() {
        return child.cloneNode(true);
    };
}
function setEvent(id, name, callback) {
    events[id] = events[id] || {};
    events[id][name] = callback;
}
function Component(component) {
    const cache = {};
    return new Proxy(component, {
        set : function(target, key, value) {
            if(cache[key] !== value) {
                cache[key] = value;
                switch(key) {
                    case "text":
                        target.innerText = value;
                        return;
                    case "data":
                        // LETS BE LAZY
                        target.innerHTML = "";
                        for(var i in value) {
                            var item = value[i];
                            var child = adapters[target.dataset.id + "_" + item.adapter]();
                            bind(child, item)
                            target.appendChild(child)
                        }
                        return;
                    case "background":
                        target.style.background = value;
                        return;
                    case "visible":
                        target.style.display = value ? (target.style.flexDirection ? "flex" : "block") : "none";
                        return;
                }
            }
        }
    });
}
function update() {
    listeners.forEach(function (listener) {
        listener.callback(listener.local, listener.component)
    })
}
function bind(root, local) {
    Array.from(root.querySelectorAll("[data-id]")).concat(root.dataset.id ? [root] : []).forEach(function(component) {
        const toBind = events[component.dataset.id];
        Object.keys(toBind).forEach(function(event) {
            const callback = toBind[event];
            if(event === "onClick") {
                component.onclick = function() {
                    callback(local/*, event*/);
                    update();
                };
            } else if(event === "observe") {
                const wrapped = Component(component);
                callback(local, wrapped)
                listeners.push({
                    component : wrapped,
                    callback : callback,
                    local : local,
                });
            }
        });
    });
}
        </script>
        <script>
${js}
        </script>
    </body>
</html>`

export { Components } from '../client/modules/Components'
export { Pages } from '../client/modules/Pages'
export { Test } from '../client/modules/Test'
export { Commit } from '../client/modules/Commit'
export { Deploy } from '../client/modules/Deploy'

export default (config : {
    database : Database
    modules : Module[]
}) => {
    const modules : Modules = {
        _map : {},
        set(name, value) {
            this._map[name] = value;
        },
        get(name) {
            return this._map[name]
        },
        add(name, value) {
            this._map[name] = this._map[name] || [];
            this._map[name].push(value);
        },
        list(name) {
            return this._map[name]
        }
    }
    modules.set("database", config.database);
    config.modules.map(it => it(modules))
    return async (req : IncomingMessage, res : ServerResponse) => {
        const endpoints = modules.get("endpoint") as Array<Endpoint>;
        const result = await endpoints.reduce(async (promise, endpoint) => {
            const value = await promise;
            if(!value) {
                return await endpoint(req, res)
            }
            return value
        }, Promise.resolve(false))
        if(!result) {
            if(req.url === "/admin") {
                res.writeHead(200, {
                    "Content-type" : "text/html"
                });
                const state : AdminState = {
                    selectedDirectory : "components",
                    Components : {
                        files : []
                    },
                    __ : true
                }
                const {
                    html,
                    js
                } = render(Admin(modules))({
                    parent : {
                        width : MATCH,
                        height : MATCH,
                        name : "root"
                    },
                    global : state,
                    local : state
                })
                res.write(document({
                    html : html.join(""),
                    js : js.join("\n")
                }))
                res.end();
            } else {
                res.writeHead(404, {
                    "Content-type" : "text/html"
                });
                res.write("404");
                res.end();
            }
        }
    };
}