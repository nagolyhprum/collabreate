import { ClientRequest, ServerResponse } from "http"
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
var events = {};
var listeners = [];
function setEvent(id, name, callback) {
    events[id] = events[id] || {};
    events[id][name] = callback;
}
function update() {
    listeners.forEach(function (listener) {
        listener.callback({
            global : global,
            component : Component(listner.component)
        })
    })
}
function bind(root) {
    root.querySelectorAll("[data-id]").forEach(function(component) {
        const toBind = events[component.dataset.id];
        Object.keys(toBind).forEach(function(event) {
            if(event === "onClick") {
                component.onclick = function() {
                    toBind[event]({
                        global : global
                    });
                    update();
                };
            } else if(event === "observe") {
                listeners.push({
                    component : component,
                    callback : toBind[event]
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
        add(name, value) {
            this._map[name] = this._map[name] || [];
            this._map[name].push(value);
        },
        get(name) {
            const list = this._map[name]
            return list[list.length - 1]
        },
        list(name) {
            return this._map[name]
        }
    }
    config.modules.map(it => it(modules))
    return async (req : ClientRequest, res : ServerResponse) => {
        if(req.path === "/admin") {
            res.writeHead(200, {
                "Content-type" : "text/html"
            });
            const state : AdminState = {
                selectedDirectory : "",
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
    };
}