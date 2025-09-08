import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();
app.use(cors());

const server = createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

let players = {};
let randomNumber = Math.floor(Math.random() * 10) + 1;

io.on("connection", (socket) => {
  console.log("Player connected:", socket.id);

  players[socket.id] = { choice: null };

  if (Object.keys(players).length === 2) {
    io.emit("startGame", { message: "Game started" });
  }

  socket.on("chooseNumber", (num) => {
    players[socket.id].choice = num;

    const choices = Object.values(players).map((p) => p.choice);
    if (choices.every((c) => c !== null)) {
      const [p1, p2] = Object.keys(players);
      const [c1, c2] = choices;

      const diff1 = Math.abs(randomNumber - c1);
      const diff2 = Math.abs(randomNumber - c2);

      let winner;
      if (diff1 < diff2) winner = p1;
      else if (diff2 < diff1) winner = p2;
      else winner = "tie";

      io.emit("result", {
        randomNumber,
        choices: { [p1]: c1, [p2]: c2 },
        winner,
      });

      randomNumber = Math.floor(Math.random() * 10) + 1;
      players = {};
    }
  });

  socket.on("disconnect", () => {
    delete players[socket.id];
    console.log("Player disconnected:", socket.id);
  });
});

server.listen(3001, () => console.log("Backend running"));
