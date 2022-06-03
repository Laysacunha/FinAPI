const express = require("express");

const app = express();

app.get("/", (request, response) => {
    return response.send("Server ir running!");
});

app.listen(3333);