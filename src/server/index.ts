import { Router } from "express"
import { Sequelize } from "sequelize/dist";
import { Admin } from "../client/admin";
import { MATCH } from '../client/components'
import { render } from "../client/render/html";

const document = ({
    scripts,
    html,
    js
} : {    
    scripts : string[]
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
* { 
    box-sizing: border-box;
}
        </style>
        ${scripts.map(src => `<script src="${src}"></script>`).join("")}
    <head>
    </head>
    <body>
        ${html}
        <script>
const socket = io();
var _ = {
    toString : function(input) {
        return "" + input;
    },
    concat : function(a, b) {
        return a.concat(b);
    }
};
function Local(value, index) {
    return {
        value : value,
        index : index
    };
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
                        for(var index = 0; index < value.length; index++) {
                            var item = value[index];
                            var child = adapters[target.dataset.id + "_" + item.adapter]();
                            bind(child, Local(item, index))
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
        listener.callback(listener.local.value, listener.local.index, listener.component)
    })
}
function bind(root, local) {
    Array.from(root.querySelectorAll("[data-id]")).concat(root.dataset.id ? [root] : []).forEach(function(component) {
        const toBind = events[component.dataset.id];
        Object.keys(toBind).forEach(function(event) {
            const callback = toBind[event];
            if(event === "onClick") {
                component.onclick = function() {
                    callback(local.value, local.index/*,event*/);
                    update();
                };
            } else if(event === "observe") {
                const wrapped = Component(component);
                callback(local.value, local.index, wrapped)
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
export { Deploy } from '../client/modules/Deploy'
export { Projects } from '../client/modules/Projects'
export { Branches } from '../client/modules/Branches'
export { WebSockets } from '../client/modules/WebSockets'
export { Database } from '../client/modules/Database'

export default (modules : Module[]) => {
    const router = Router();
    const dependencies : Dependencies = {
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
    dependencies.set("router", router);
    modules.map(it => it(dependencies))
    const database = dependencies.get("admin:database") as Sequelize
    const isReady = database.sync()
    router.get("/admin", async (_, res) => {
        await isReady
        const state : AdminState = {
            selectedDirectory : "projects",
            Components : {
                files : []
            },
            __ : true
        }
        const {
            html,
            js
        } = render(Admin(dependencies))({
            parent : {
                width : MATCH,
                height : MATCH,
                name : "root"
            },
            global : state,
            local : state
        })
        res.status(200).header({
            "Content-type" : "text/html"
        }).send(document({
            scripts : dependencies.list("admin:script"),
            html : html.join(""),
            js : js.join("\n")
        }))
    })
    router.use((_, res) => {
        res.status(400).header({
            "Content-type" : "text/html"
        }).send("400")
    })

    return router;
}