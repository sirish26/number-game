import { useEffect, useState } from "react";
import io from "socket.io-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";

const socket = io("http://localhost:3001");

export default function Game() {
  const [status, setStatus] = useState("Waiting for another player...");
  const [winner, setWinner] = useState<string | null>(null);
  const [randomNumber, setRandomNumber] = useState<number | null>(null);

  useEffect(() => {
    socket.on("startGame", () => {
      setStatus("Game started! Pick your number.");
      setWinner(null);
      setRandomNumber(null);
    });

    socket.on("result", (data) => {
      setRandomNumber(data.randomNumber);
      if (data.winner === "tie") {
        setWinner("It's a tie!");
      } else if (data.winner === socket.id) {
        setWinner("You Win!");
      } else {
        setWinner("You Lose!");
      }
    });

    return () => {
      socket.off("startGame");
      socket.off("result");
    };
  }, []);

  const chooseNumber = (num: number) => {
    socket.emit("chooseNumber", num);
    setStatus(`You chose ${num}. Waiting for opponent just chill while another player joins..`);
  };

  const playAgain = () => {
    socket.emit("playAgain");
  };

  return (
    <div className="flex items-center justify-center w-screen h-screen bg-gray-100">
      <Card className="w-full max-w-3xl h-[90vh] flex flex-col shadow-lg">
        <CardHeader className="text-center border-b">
          <CardTitle className="text-3xl font-bold text-gray-800">
            Number Guess Game
          </CardTitle>
          <p className="text-gray-600 mt-2">{status}</p>
        </CardHeader>

        <CardContent className="flex flex-col flex-1 items-center justify-center p-8 gap-8">
          {winner && (
            <div className="w-full max-w-lg p-6 rounded-lg border text-center bg-white shadow">
              <h3 className="font-bold text-2xl mb-2">{winner}</h3>
              <p className="text-gray-700 text-lg">
                Random number was:{" "}
                <span className="font-semibold">{randomNumber}</span>
              </p>
            </div>
          )}

          <div className="grid grid-cols-5 gap-4 w-full max-w-lg">
            {[...Array(10)].map((_, i) => (
              <Button
                key={i + 1}
                variant="outline"
                className="h-16 text-xl font-semibold"
                onClick={() => chooseNumber(i + 1)}
                disabled={!!winner} // disable after result
              >
                {i + 1}
              </Button>
            ))}
          </div>
        </CardContent>

        {winner && (
          <CardFooter className="flex justify-center border-t p-4">
            <Button onClick={playAgain} className="px-6 py-2 text-lg">
              Play Again
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
