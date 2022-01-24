const http = require("http");
const {
    default : collabreate,
    Components,
    Pages,
    Test,
    Commit,
    Deploy,
} = require("../dist/index.js");

const server = http.createServer(collabreate({
    database : {
        get() {
            return []
        }
    },
    modules : [
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