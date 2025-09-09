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
    console.log("Game started between:", Object.keys(players));
  } else {
    socket.emit("waiting", { message: "Waiting for another player..." });
  }

  socket.on("chooseNumber", (num) => {
    if (!players[socket.id]) return;

    players[socket.id].choice = num;
    console.log(`Player ${socket.id} chose number:`, num);

    const choices = Object.values(players).map((p) => p.choice);
    if (choices.every((c) => c !== null) && Object.keys(players).length === 2) {
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
      Object.keys(players).forEach((id) => {
        if (players[id]) players[id].choice = null;
      });
    }
    console.log("Random number for this round:", randomNumber);
  });

  socket.on("playAgain", () => {
    console.log("Play Again clicked by", socket.id);
    Object.keys(players).forEach((id) => {
      if (players[id]) players[id].choice = null;
    });
    randomNumber = Math.floor(Math.random() * 10) + 1;
    io.emit("startGame", { message: "Game restarted! Pick your number." });
  });

  socket.on("disconnect", () => {
    delete players[socket.id];
    console.log("Player disconnected:", socket.id);

    io.emit("waiting", { message: "Player left. Waiting for next person..." });
  });
});

server.listen(3001, () => console.log("Backend running on port 3001"));
