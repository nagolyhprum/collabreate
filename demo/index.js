const {
    default : collabreate,
    Components,
    WebSockets,
    Database
} = require("../dist/index.js");
const http = require("http")
const express = require("express")

const app = express();

const server = http.createServer(app)

app.use(collabreate([
    WebSockets(server),
    Database,
    Components,
]))

app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).send('Something broke!')
})

server.listen(process.env.PORT || 80, () => {
    console.log("listening on port 80");
});