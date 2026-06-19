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

const strength = {
    "3":1,"4":2,"5":3,"6":4,"7":5,"8":6,
    "9":7,"10":8,"J":9,"Q":10,"K":11,"A":12,"2":13,
    "JOKER":14
};

let currentStrength = 0;

wss.on("connection", (ws) => {
    console.log("接続された");

    clients.push(ws);

    ws.on("message", (msg) => {
        const text = msg.toString();
        console.log("受信:", text);

        if (clients[turn] === ws) {

            if (text === "パス") {

                clients.forEach(c => {
                    c.send(JSON.stringify({
                        type: "pass"
                    }));
                });

            } else {

                let rank;
                if (text === "JOKER") {
                    rank = "JOKER";
                } else {
                    rank = text.slice(1);
                }

                const power = strength[rank];

                if (power > currentStrength) {

                    currentStrength = power;

                    clients.forEach(c => {
                        c.send(JSON.stringify({
                            type: "play",
                            card: text
                        }));
                    });

                } else {
                    console.log("弱いカードは出せない！");
                    return;
                }
            }

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