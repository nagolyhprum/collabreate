import express, { Router } from "express"
import { Admin } from "../client/admin";
import { MATCH, WRAP } from '../client/components'
import { render } from "../client/render/html";
import { Dependencies } from "./dependencies";
import { defaultAdminState } from "./state";

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
    width : 100%;
    min-height : 100%;
}
html, body, button {
    background : transparent;
    margin : 0;
    padding : 0;
    border : 0;
    font-size : 16px;
}
button {
    background : green;
    border-radius : 4px;
    padding : 4px;
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
var socket = (function () {
    var socket = io();
    return {
        on : function(name, callback) {
            socket.on(name, function(data) {
                callback({ data })
                update();
            })
        }
    };
})();
var _ = {
    sort : function(list, callback) {
        return list.sort(function (a, b) {
            return callback({
                a : a,
                b : b
            });
        });
    },
    reduce : function(list, callback, start) {
        return list.reduce(function(total, item) {
            return callback({
                total : total,
                item : item
            })
        }, start);
    },
    upsert : function(list, upsert) {
        var item = list.find(function(item) {
            return (item.id && upsert.id && item.id === upsert.id) || (item.key && upsert.key && item.key === upsert.key)
        })
        if(item) {
            var index = list.indexOf(item);
            return [].concat(list.slice(0, index), [Object.assign(item, upsert)], list.slice(index + 1));
        } else {
            return list.concat([upsert]);
        }
    },
    assign : function() {
        return Object.assign.apply(null, arguments);
    },
    map : function(list, callback) {
        return list.map(function(item, index, items) {
            return callback({
                item : item,
                index : index,
                items : items
            })
        })
    },
    filter : function(list, callback) {
        return list.filter(function(item, index) {
            return callback({
                item : item,
                index : index
            })
        })
    },
    toString : function(input) {
        return "" + input;
    },
    concat : function(a, b) {
        return a.concat(b);
    },
    find : function(list, callback, or) {
        return list.find(function(item) {
            return callback({
                item : item
            });
        }) || or;
    }
};
var fetch = (function(url, config) {
    var windowFetch = fetch;
    return function(url, config) {
        windowFetch(url, {
            method : config.method,
            body : config.body,
            headers : config.headers
        }).then(function(res) {
            if(config.callback) {
                return res.text().then(function(text) {
                    config.callback({
                        status : res.status,
                        body : text,
                        headers : res.headers
                    });
                    update();
                })
            }
        })
    }
})();
function Local(value, index) {
    return {
        value : value,
        index : index
    };
}
function $(html) {
    var div = document.createElement("div");
    div.innerHTML = html;
    var child = div.children[0];
    return function() {
        return child.cloneNode(true);
    };
}
function setEvent(id, name, callback) {
    events[id] = events[id] || {};
    events[id][name] = callback;
}

function numberToMeasurement(input) {
    if(input === null || input === undefined) {
        return "";
    }
    if(0 < input && input < 1) {
        return (input * 100) + "%";
    } else if(input === ${WRAP}) {
        return "auto";
    } else if(input === ${MATCH}) {
        return "100%";
    } else {
        return input + "px";
    }
}
function Component(component) {
    var cache = {};
    return new Proxy(component, {
        get : function(target, key) {
            if(key === "isMounted") {
                return document.body.contains(component);
            }
        },
        set : function(target, key, value) {
            if(!(key in cache) || cache[key] !== value) {
                cache[key] = value;
                switch(key) {
                    case "width":
                    case "height":
                        target.style[key] = numberToMeasurement(value);
                        return;
                    case "focus":
                        target.focus();
                        target.setSelectionRange(0, target.value.length);
                        return;
                    case "enabled":
                        target.disabled = !value;
                        return;
                    case "placeholder":
                        target.placeholder = value;
                        return;
                    case "value":
                        target.value = value;
                        return;
                    case "text":
                        target.innerText = value;
                        return;
                    case "data":
                        var prev = cache.prevData || [];
                        var curr = value.map(function(it) {
                            return "id" in it ? it.id : it.key;
                        });
                        // REMOVE
                        var removed = [];
                        for(var i = prev.length - 1; i >= 0; i--) {
                            if(!curr.includes(prev[i])) {
                                prev.splice(i, 1);
                                removed.push(target.removeChild(target.children[i]));
                            }
                        }
                        // ADD
                        for(var i = 0; i < curr.length; i++) {
                            if(!prev.includes(curr[i])) {
                                var item = value[i];
                                // TODO : ATTEMPT TO REUSE REMOVED COMPONENTS
                                var child = adapters[target.dataset.id + "_" + item.adapter]();
                                bind(child, Local(item, i))
                                if(i < target.children.length) {
                                    target.insertBefore(child, target.children[i]);
                                } else {
                                    target.appendChild(child);
                                }
                            }
                        }
                        // MOVE / UPDATE
                        for(var i = 0; i < value.length; i++) {
                            target.children[i].__local__.value = value[i];
                            target.children[i].__local__.index = i;
                        }
                        cache.prevData = curr;
                        target.value = cache.value;
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
var update = (function() {
    var timeout;
    return function() {
        clearTimeout(timeout);
        timeout = setTimeout(function() {
            listeners.forEach(function (listener) {
                listener.callback(listener.local.value, listener.local.index, listener.component)
            });        
            listeners = listeners.filter(function(listener) {
                return listener.component.isMounted;
            });
        });
    }
})();
function bind(root, local) {
    root.__local__ = local;
    Array.from(root.querySelectorAll("[data-id]")).concat(root.dataset.id ? [root] : []).forEach(function(component) {
        var toBind = events[component.dataset.id];
        Object.keys(toBind).forEach(function(event) {
            var callback = toBind[event];
            if(event === "onDrop") {
                function prevent(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    e.cancelBubble = true;
                    return false;
                };
                component.ondragenter = prevent
                component.ondragleave = prevent
                component.ondragover = prevent
                component.ondrop = function() {
                    callback(local.value, local.index);
                    update();
                };
            } else if(event === "onDragStart") {
                component.ondragstart = function() {
                    callback(local.value, local.index);
                    update();
                };
            } else if(event === "onDragEnd") {
                component.ondragend = function() {
                    callback(local.value, local.index);
                    update();
                };
            } else if(event === "onSelect") {
                component.onchange = function() {
                    callback(local.value, local.index, this.value);
                    update();
                };
            } else if(event === "onInput") {
                component.oninput = function() {
                    callback(local.value, local.index, this.value);
                    update();
                };
            } else if(event === "onClick") {
                component.onclick = function() {
                    callback(local.value, local.index/*,event*/);
                    update();
                };
            } else if(event === "onEnter") {
                component.onkeypress = function(e) {
                    if(e.which === 13) {
                        callback(local.value, local.index);
                        update();
                    }
                };
            } else if(event === "observe") {
                var wrapped = Component(component);
                callback(local.value, local.index, wrapped)
                listeners.push({
                    component : wrapped,
                    callback : callback,
                    local : local,
                });
            } else if(event === "onInit") {
                callback(local.value, local.index);
                update();
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

export { WebSockets } from '../client/modules/WebSockets'
export { Database } from '../client/modules/Database'

export default (modules : Module[]) => {
    const router = Router();
    router.use(express.json({}))
    const dependencies = new Dependencies();
    dependencies.set("router", router);
    modules.map(it => it(dependencies))
    router.get("/admin", async (_, res) => {
        const state : AdminState = defaultAdminState()
        const {
            html,
            js
        } = render(Admin)({
            parent : {
                width : MATCH,
                height : MATCH,
                name : "root"
            },
            global : state,
            local : state
        })
        res.status(200).header({
            "Content-type" : "text/html; charset=utf-8"
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