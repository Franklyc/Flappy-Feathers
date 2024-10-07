import React, { useState, useEffect, useCallback } from 'react';
import { Bird } from 'lucide-react';

const GRAVITY = 0.5;
const JUMP_STRENGTH = -10;
const PIPE_SPEED = 2;
const PIPE_WIDTH = 50;
const PIPE_GAP = 150;

interface PipeProps {
  x: number;
  height: number;
}

function App() {
  const [birdPosition, setBirdPosition] = useState(250);
  const [birdVelocity, setBirdVelocity] = useState(0);
  const [pipes, setPipes] = useState<PipeProps[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);

  const jump = useCallback(() => {
    if (!gameOver) {
      setBirdVelocity(JUMP_STRENGTH);
    }
  }, [gameOver]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        jump();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [jump]);

  useEffect(() => {
    if (gameOver) return;

    const gameLoop = setInterval(() => {
      setBirdPosition((prevPosition) => {
        const newPosition = prevPosition + birdVelocity;
        if (newPosition > 500 || newPosition < 0) {
          setGameOver(true);
        }
        return newPosition;
      });

      setBirdVelocity((prevVelocity) => prevVelocity + GRAVITY);

      setPipes((prevPipes) => {
        const newPipes = prevPipes
          .map((pipe) => ({ ...pipe, x: pipe.x - PIPE_SPEED }))
          .filter((pipe) => pipe.x > -PIPE_WIDTH);

        if (prevPipes.length === 0 || prevPipes[prevPipes.length - 1].x < 300) {
          const height = Math.random() * 300 + 100;
          newPipes.push({ x: 500, height });
        }

        return newPipes;
      });

      setScore((prevScore) => prevScore + 1);

      // Check for collisions
      pipes.forEach((pipe) => {
        if (
          pipe.x < 50 + 30 &&
          pipe.x + PIPE_WIDTH > 50 &&
          (birdPosition < pipe.height || birdPosition > pipe.height + PIPE_GAP)
        ) {
          setGameOver(true);
        }
      });
    }, 20);

    return () => clearInterval(gameLoop);
  }, [birdPosition, birdVelocity, pipes, gameOver]);

  const restartGame = () => {
    setBirdPosition(250);
    setBirdVelocity(0);
    setPipes([]);
    setGameOver(false);
    setScore(0);
  };

  return (
    <div className="min-h-screen bg-sky-300 flex flex-col items-center justify-center">
      <div className="relative w-[500px] h-[500px] bg-sky-200 border-4 border-sky-600 overflow-hidden">
        <div
          className="absolute"
          style={{ left: '50px', top: `${birdPosition}px`, transition: 'top 0.1s' }}
        >
          <Bird className="text-yellow-400 w-8 h-8" />
        </div>
        {pipes.map((pipe, index) => (
          <React.Fragment key={index}>
            <div
              className="absolute bg-green-600"
              style={{
                left: `${pipe.x}px`,
                top: 0,
                width: `${PIPE_WIDTH}px`,
                height: `${pipe.height}px`,
              }}
            >
              <div className="w-full h-full bg-green-700 border-r-4 border-l-4 border-green-800"></div>
            </div>
            <div
              className="absolute bg-green-600"
              style={{
                left: `${pipe.x}px`,
                top: `${pipe.height + PIPE_GAP}px`,
                width: `${PIPE_WIDTH}px`,
                bottom: 0,
              }}
            >
              <div className="w-full h-full bg-green-700 border-r-4 border-l-4 border-green-800"></div>
            </div>
          </React.Fragment>
        ))}
      </div>
      <div className="mt-4 text-2xl font-bold text-white">Score: {score}</div>
      {gameOver && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg text-center">
            <h2 className="text-3xl font-bold mb-4">Game Over</h2>
            <p className="text-xl mb-4">Your score: {score}</p>
            <button
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
              onClick={restartGame}
            >
              Play Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;