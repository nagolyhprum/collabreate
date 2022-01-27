const {
    default : collabreate,
    Components,
    Deploy,
    Branches,
    Projects,
    WebSockets
} = require("../dist/index.js");
const http = require("http")
const express = require("express")

const app = express();

const server = http.createServer(app)

app.use(collabreate({
    database : {
        get() {
            return []
        }
    },
    modules : [
        Projects,
        Branches,
        Components,
        Deploy,
        WebSockets(server)
    ]
}))

server.listen(process.env.PORT || 80, () => {
    console.log("listening on port 80");
});