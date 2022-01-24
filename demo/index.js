const express = require("express");
const {
    default : collabreate,
    Components,
    Pages,
    Test,
    Commit,
    Deploy,
} = require("../dist/index.js");

const app = express();

app.use(collabreate({
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
}));

app.listen(process.env.PORT || 80, () => {
    console.log("listening on port 80");
});