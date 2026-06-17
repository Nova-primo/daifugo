const express = require("express");
const WebSocket = require("ws");

const app = express();
app.use(express.static("public"));

const server = app.listen(10000, () => {
    console.log("Server running on http://localhost:10000");
});

const wss = new WebSocket.Server({ server });

let clients = [];

wss.on("connection", (ws) => {
    console.log("接続された");

    clients.push(ws);

    ws.on("message", (msg) => {
        console.log("受信:", msg.toString());

        clients.forEach(c => {
            if (c !== ws) {
                c.send(msg.toString());
            }
        });
    });

    ws.on("close", () => {
        clients = clients.filter(c => c !== ws);
        console.log("切断された");
    });
});