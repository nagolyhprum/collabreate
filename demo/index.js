const http = require("http");
const {
    default : collabreate,
    Components,
    Pages,
    Test,
    Commit,
    Deploy,
    Branches,
    Projects
} = require("../dist/index.js");

const server = http.createServer(collabreate({
    database : {
        get() {
            return []
        }
    },
    modules : [
        Projects,
        Branches,
        Components,
        Pages,
        Test,
        Commit,
        Deploy,
    ]
}))

server.listen(process.env.PORT || 80, () => {
    console.log("listening on port 80");
});