const {
    default : collabreate,
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
]))

app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).send('Something broke!')
})

const port = process.env.PORT || 80

server.listen(port, () => {
    console.log("listening on port " + port);
});