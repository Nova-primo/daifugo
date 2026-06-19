const express = require("express");
const WebSocket = require("ws");

const app = express();

app.use(express.static("public"));

const PORT = process.env.PORT || 10000;

const server = app.listen(PORT, () => {
    console.log("Server running on port " + PORT);
});

const wss = new WebSocket.Server({ server });

let clients = [];
let turn = 0;

wss.on("connection", (ws) => {
    console.log("接続された");

    clients.push(ws);

    ws.on("message", (msg) => {
        console.log("受信:", msg.toString());

        if (clients[turn] === ws) {

             clients.forEach(c => {
                c.send(JSON.stringify({
                    type: "play",
                    card: msg.toString()
                }));
            });

            turn = (turn + 1) % clients.length;

        } else {
            console.log("今はあなたのターンじゃない");
        }
    });

    ws.on("close", () => {
        clients = clients.filter(c => c !== ws);
        console.log("切断された");

        if (turn >= clients.length) {
            turn = 0;
        }
    });
});