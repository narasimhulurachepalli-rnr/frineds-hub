import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';
import Loader from '../components/Loader';
import { 
  Gamepad2, Trophy, Play, RefreshCw, ChevronLeft, 
  Sparkles, Award, Flame, User, Monitor, AlertCircle
} from 'lucide-react';

export const GamesRoom = () => {
  const { user } = useAuth();
  const { themeColor } = useTheme();

  const [activeGame, setActiveGame] = useState(null); // 'snake' | 'tictactoe' | 'rps' | 'memory' | 'guess' | 'typing' | 'quiz'
  const [leaderboard, setLeaderboard] = useState([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(true);

  const getAccentBtn = () => {
    switch (themeColor) {
      case 'violet': return 'bg-violet-600 hover:bg-violet-700 text-white';
      case 'emerald': return 'bg-emerald-600 hover:bg-emerald-700 text-white';
      case 'rose': return 'bg-rose-600 hover:bg-rose-700 text-white';
      case 'amber': return 'bg-amber-600 hover:bg-amber-700 text-white';
      case 'girls': return 'bg-pink-400 hover:bg-pink-500 text-slate-950 font-bold';
      case 'indigo':
      default: return 'bg-indigo-600 hover:bg-indigo-700 text-white';
    }
  };

  const getAccentText = () => {
    switch (themeColor) {
      case 'violet': return 'text-violet-400';
      case 'emerald': return 'text-emerald-400';
      case 'rose': return 'text-rose-400';
      case 'amber': return 'text-amber-400';
      case 'girls': return 'text-pink-300';
      case 'indigo':
      default: return 'text-indigo-400';
    }
  };

  const fetchLeaderboard = async () => {
    setLeaderboardLoading(true);
    try {
      const res = await api.get('/games/leaderboard');
      setLeaderboard(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLeaderboardLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const saveScore = async (gameName, score, won = false) => {
    try {
      await api.post('/games/score', { gameName, score, won });
      fetchLeaderboard(); // refresh leaderboard scores
    } catch (err) {
      console.error('Score saving failed:', err);
    }
  };

  // -------------------------------------------------------------
  // GAME 1: CLASSIC RETRO SNAKE
  // -------------------------------------------------------------
  const SnakeGame = () => {
    const canvasRef = useRef(null);
    const [score, setScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [gameStarted, setGameStarted] = useState(false);
    
    const directionRef = useRef({ x: 0, y: -1 });
    const nextDirectionRef = useRef({ x: 0, y: -1 });
    const snakeRef = useRef([
      { x: 10, y: 10 },
      { x: 10, y: 11 },
      { x: 10, y: 12 },
    ]);
    const foodRef = useRef({ x: 5, y: 5 });

    const GRID_SIZE = 20;
    const CELL_COUNT = 15; // 15x15 grids

    const generateFood = () => {
      let rx, ry;
      let onSnake = true;
      while (onSnake) {
        rx = Math.floor(Math.random() * CELL_COUNT);
        ry = Math.floor(Math.random() * CELL_COUNT);
        onSnake = snakeRef.current.some((part) => part.x === rx && part.y === ry);
      }
      foodRef.current = { x: rx, y: ry };
    };

    const resetGame = () => {
      snakeRef.current = [
        { x: 7, y: 7 },
        { x: 7, y: 8 },
        { x: 7, y: 9 },
      ];
      directionRef.current = { x: 0, y: -1 };
      nextDirectionRef.current = { x: 0, y: -1 };
      setScore(0);
      setGameOver(false);
      setGameStarted(true);
      generateFood();
    };

    useEffect(() => {
      const handleKeyDown = (e) => {
        if (!gameStarted || gameOver) return;
        const dir = directionRef.current;
        if (e.key === 'ArrowUp' && dir.y !== 1) nextDirectionRef.current = { x: 0, y: -1 };
        if (e.key === 'ArrowDown' && dir.y !== -1) nextDirectionRef.current = { x: 0, y: 1 };
        if (e.key === 'ArrowLeft' && dir.x !== 1) nextDirectionRef.current = { x: -1, y: 0 };
        if (e.key === 'ArrowRight' && dir.x !== -1) nextDirectionRef.current = { x: 1, y: 0 };
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }, [gameStarted, gameOver]);

    useEffect(() => {
      if (!gameStarted || gameOver) return;

      const interval = setInterval(() => {
        directionRef.current = nextDirectionRef.current;
        const head = snakeRef.current[0];
        const dir = directionRef.current;
        
        const newHead = {
          x: head.x + dir.x,
          y: head.y + dir.y,
        };

        // Wall collisions
        if (
          newHead.x < 0 ||
          newHead.x >= CELL_COUNT ||
          newHead.y < 0 ||
          newHead.y >= CELL_COUNT
        ) {
          setGameOver(true);
          saveScore('Snake', score, score >= 10); // win if score is >= 10 points
          return;
        }

        // Self collisions
        if (snakeRef.current.some((part) => part.x === newHead.x && part.y === newHead.y)) {
          setGameOver(true);
          saveScore('Snake', score, score >= 10);
          return;
        }

        snakeRef.current.unshift(newHead);

        // Food eat check
        if (newHead.x === foodRef.current.x && newHead.y === foodRef.current.y) {
          setScore((s) => s + 1);
          generateFood();
        } else {
          snakeRef.current.pop();
        }

        // Draw Canvas
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#0f172a'; // background slate-900
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw grid boundaries helper
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
        for (let i = 0; i <= CELL_COUNT; i++) {
          ctx.beginPath();
          ctx.moveTo(i * GRID_SIZE, 0);
          ctx.lineTo(i * GRID_SIZE, canvas.height);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(0, i * GRID_SIZE);
          ctx.lineTo(canvas.width, i * GRID_SIZE);
          ctx.stroke();
        }

        // Draw Food
        ctx.fillStyle = '#f43f5e'; // rose-500 red food
        ctx.beginPath();
        ctx.arc(
          foodRef.current.x * GRID_SIZE + GRID_SIZE / 2,
          foodRef.current.y * GRID_SIZE + GRID_SIZE / 2,
          GRID_SIZE / 2.5,
          0,
          2 * Math.PI
        );
        ctx.fill();

        // Draw Snake
        snakeRef.current.forEach((part, index) => {
          ctx.fillStyle = index === 0 ? '#6366f1' : '#4f46e5'; // Indigo head, darker body
          ctx.fillRect(part.x * GRID_SIZE + 1, part.y * GRID_SIZE + 1, GRID_SIZE - 2, GRID_SIZE - 2);
        });

      }, 150);

      return () => clearInterval(interval);
    }, [gameStarted, gameOver, score]);

    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <h3 className="text-sm font-bold text-white">Classic Retro Snake</h3>
        <span className="text-xs text-slate-400">Score: <span className="font-bold text-indigo-400">{score}</span></span>
        
        <canvas
          ref={canvasRef}
          width={GRID_SIZE * CELL_COUNT}
          height={GRID_SIZE * CELL_COUNT}
          className="border-2 border-slate-800 rounded-2xl shadow-xl bg-slate-900 overflow-hidden"
        />

        {!gameStarted && (
          <button onClick={resetGame} className={`rounded-xl px-5 py-2.5 text-xs font-bold text-white cursor-pointer ${getAccentBtn()}`}>
            Start Game
          </button>
        )}

        {gameOver && (
          <div className="flex flex-col gap-2 items-center">
            <span className="text-xs text-rose-500 font-bold">Game Over! Final Score: {score}</span>
            <button onClick={resetGame} className={`rounded-xl px-4 py-2 text-xs font-semibold text-white cursor-pointer ${getAccentBtn()}`}>
              Play Again
            </button>
          </div>
        )}
      </div>
    );
  };

  // -------------------------------------------------------------
  // GAME 2: TIC-TAC-TOE VS AI BOT
  // -------------------------------------------------------------
  const TicTacToeGame = () => {
    const [board, setBoard] = useState(Array(9).fill(null));
    const [isXNext, setIsXNext] = useState(true);
    const [winner, setWinner] = useState(null);

    const calculateWinner = (squares) => {
      const lines = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
      ];
      for (let i = 0; i < lines.length; i++) {
        const [a, b, c] = lines[i];
        if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
          return squares[a];
        }
      }
      return null;
    };

    const handleClick = (idx) => {
      if (board[idx] || winner || !isXNext) return;

      const boardCopy = [...board];
      boardCopy[idx] = 'X';
      setBoard(boardCopy);
      
      const w = calculateWinner(boardCopy);
      if (w) {
        setWinner(w);
        saveScore('TicTacToe', 50, true);
        return;
      }

      if (boardCopy.every((cell) => cell !== null)) {
        setWinner('Draw');
        saveScore('TicTacToe', 10, false);
        return;
      }

      setIsXNext(false);
    };

    // AI Bot play logic (random or basic block check)
    useEffect(() => {
      if (isXNext || winner) return;

      const timer = setTimeout(() => {
        const emptyIndices = board
          .map((cell, index) => (cell === null ? index : null))
          .filter((val) => val !== null);
          
        if (emptyIndices.length > 0) {
          // AI selects random cell
          const randomIdx = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
          const boardCopy = [...board];
          boardCopy[randomIdx] = 'O';
          setBoard(boardCopy);

          const w = calculateWinner(boardCopy);
          if (w) {
            setWinner(w);
            saveScore('TicTacToe', 0, false);
          } else if (boardCopy.every((cell) => cell !== null)) {
            setWinner('Draw');
            saveScore('TicTacToe', 10, false);
          } else {
            setIsXNext(true);
          }
        }
      }, 500);

      return () => clearTimeout(timer);
    }, [isXNext, board, winner]);

    const resetGame = () => {
      setBoard(Array(9).fill(null));
      setIsXNext(true);
      setWinner(null);
    };

    return (
      <div className="flex flex-col items-center gap-4 text-center max-w-sm mx-auto">
        <h3 className="text-sm font-bold text-white">Tic-Tac-Toe vs Bot</h3>
        <span className="text-xs text-slate-400">
          {winner ? (winner === 'Draw' ? 'It\'s a Draw!' : `Winner: ${winner}`) : `Turn: ${isXNext ? 'Player (X)' : 'FriendBot (O)'}`}
        </span>

        <div className="grid grid-cols-3 gap-3 w-64 h-64 mt-2">
          {board.map((cell, idx) => (
            <button
              key={idx}
              onClick={() => handleClick(idx)}
              className={`rounded-2xl border text-2xl font-black flex items-center justify-center transition-all bg-slate-900/50 hover:bg-slate-900 ${
                cell === 'X' ? 'text-indigo-400 border-indigo-500/30' : cell === 'O' ? 'text-rose-400 border-rose-500/30' : 'border-slate-800'
              }`}
            >
              {cell}
            </button>
          ))}
        </div>

        {(winner) && (
          <button onClick={resetGame} className={`rounded-xl px-5 py-2.5 text-xs font-bold text-white cursor-pointer mt-2 ${getAccentBtn()}`}>
            Play Again
          </button>
        )}
      </div>
    );
  };

  // -------------------------------------------------------------
  // GAME 3: ROCK PAPER SCISSORS VS AI
  // -------------------------------------------------------------
  const RPSGame = () => {
    const choices = ['Rock ✊', 'Paper ✋', 'Scissors ✌️'];
    const [pChoice, setPChoice] = useState(null);
    const [bChoice, setBChoice] = useState(null);
    const [result, setResult] = useState('');

    const playRound = (playerChoice) => {
      const idx = choices.indexOf(playerChoice);
      const botIdx = Math.floor(Math.random() * choices.length);
      const botChoice = choices[botIdx];

      setPChoice(playerChoice);
      setBChoice(botChoice);

      if (idx === botIdx) {
        setResult('Draw');
        saveScore('RockPaperScissors', 10, false);
      } else if ((idx - botIdx + 3) % 3 === 1) {
        setResult('You Win!');
        saveScore('RockPaperScissors', 50, true);
      } else {
        setResult('You Lose');
        saveScore('RockPaperScissors', 0, false);
      }
    };

    const resetGame = () => {
      setPChoice(null);
      setBChoice(null);
      setResult('');
    };

    return (
      <div className="flex flex-col items-center gap-6 text-center max-w-sm mx-auto">
        <h3 className="text-sm font-bold text-white">Rock Paper Scissors</h3>
        
        {!pChoice ? (
          <div className="flex flex-col gap-4 w-full">
            <span className="text-xs text-slate-400">Choose your move:</span>
            {choices.map((c) => (
              <button
                key={c}
                onClick={() => playRound(c)}
                className="w-full py-3.5 rounded-2xl border border-slate-800 bg-slate-900/50 hover:bg-indigo-950/20 hover:border-indigo-500/25 transition-all text-xs font-bold text-slate-200 cursor-pointer"
              >
                {c}
              </button>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-5 items-center w-full">
            <div className="grid grid-cols-2 gap-4 w-full text-xs font-bold">
              <div className="rounded-xl border border-slate-900 bg-slate-900/10 p-4">
                <span className="text-slate-500 block uppercase text-[9px] mb-1">Your choice</span>
                <span className="text-slate-200">{pChoice}</span>
              </div>
              <div className="rounded-xl border border-slate-900 bg-slate-900/10 p-4">
                <span className="text-slate-500 block uppercase text-[9px] mb-1">FriendBot Choice</span>
                <span className="text-slate-200">{bChoice}</span>
              </div>
            </div>

            <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/10 px-6 py-2.5 text-sm font-black text-indigo-400 mt-2 animate-pulse">
              {result}
            </div>

            <button onClick={resetGame} className={`rounded-xl px-5 py-2.5 text-xs font-bold text-white cursor-pointer mt-2 ${getAccentBtn()}`}>
              Play Again
            </button>
          </div>
        )}
      </div>
    );
  };

  // -------------------------------------------------------------
  // GAME 4: MEMORY MATCH CARDS
  // -------------------------------------------------------------
  const MemoryGame = () => {
    const cardIcons = ['🔥', '❤️', '🎉', '🌟', '💧', '☀️'];
    const [cards, setCards] = useState([]);
    const [flipped, setFlipped] = useState([]); // indices
    const [matched, setMatched] = useState([]); // matched indices
    const [moves, setMoves] = useState(0);

    const initializeDeck = () => {
      // Duplicate icons to form 12 cards total
      const deck = [...cardIcons, ...cardIcons]
        .map((icon, index) => ({ id: index, icon, matched: false }))
        .sort(() => Math.random() - 0.5);
      setCards(deck);
      setFlipped([]);
      setMatched([]);
      setMoves(0);
    };

    useEffect(() => {
      initializeDeck();
    }, []);

    const handleFlip = (idx) => {
      if (flipped.length === 2 || flipped.includes(idx) || matched.includes(idx)) return;
      
      const newFlipped = [...flipped, idx];
      setFlipped(newFlipped);

      if (newFlipped.length === 2) {
        setMoves((m) => m + 1);
        const [firstIdx, secondIdx] = newFlipped;
        
        if (cards[firstIdx].icon === cards[secondIdx].icon) {
          // Match!
          const newMatched = [...matched, firstIdx, secondIdx];
          setMatched(newMatched);
          setFlipped([]);
          
          if (newMatched.length === cards.length) {
            saveScore('MemoryCard', 100 - moves, true); // points deduct with move counts
          }
        } else {
          // Miss - flip back after delay
          setTimeout(() => {
            setFlipped([]);
          }, 800);
        }
      }
    };

    return (
      <div className="flex flex-col items-center gap-4 text-center max-w-sm mx-auto">
        <h3 className="text-sm font-bold text-white">Memory Card Match</h3>
        <span className="text-xs text-slate-400">Moves: <span className="font-bold text-indigo-400">{moves}</span></span>

        <div className="grid grid-cols-4 gap-3 w-64 h-64 mt-2">
          {cards.map((card, idx) => {
            const isFlipped = flipped.includes(idx) || matched.includes(idx);
            return (
              <button
                key={card.id}
                onClick={() => handleFlip(idx)}
                className={`rounded-2xl border text-xl flex items-center justify-center transition-all duration-300 transform font-bold shadow-md ${
                  isFlipped 
                    ? 'bg-slate-900 border-indigo-500/40 text-white rotate-0' 
                    : 'bg-indigo-950/20 border-slate-800 text-transparent -rotate-180'
                }`}
              >
                {isFlipped ? card.icon : '❓'}
              </button>
            );
          })}
        </div>

        {matched.length === cards.length && cards.length > 0 && (
          <button onClick={initializeDeck} className={`rounded-xl px-5 py-2.5 text-xs font-bold text-white cursor-pointer mt-4 ${getAccentBtn()}`}>
            Play Again
          </button>
        )}
      </div>
    );
  };

  // -------------------------------------------------------------
  // GAME 5: NUMBER GUESS
  // -------------------------------------------------------------
  const GuessGame = () => {
    const [target, setTarget] = useState(1);
    const [guess, setGuess] = useState('');
    const [feedback, setFeedback] = useState('Guess a number between 1 and 100!');
    const [attempts, setAttempts] = useState(0);
    const [gameOver, setGameOver] = useState(false);

    const initGame = () => {
      setTarget(Math.floor(Math.random() * 100) + 1);
      setGuess('');
      setFeedback('Guess a number between 1 and 100!');
      setAttempts(0);
      setGameOver(false);
    };

    useEffect(() => {
      initGame();
    }, []);

    const handleGuessSubmit = (e) => {
      e.preventDefault();
      const val = parseInt(guess);
      if (isNaN(val)) return;

      const nextAttempts = attempts + 1;
      setAttempts(nextAttempts);

      if (val === target) {
        setFeedback(`Bullseye! You guessed it in ${nextAttempts} attempts!`);
        setGameOver(true);
        saveScore('NumberGuess', Math.max(10, 100 - nextAttempts * 10), true);
      } else if (val < target) {
        setFeedback('Too Low! Try a higher number.');
      } else {
        setFeedback('Too High! Try a lower number.');
      }
      setGuess('');
    };

    return (
      <div className="flex flex-col items-center gap-4 text-center max-w-sm mx-auto">
        <h3 className="text-sm font-bold text-white">Number Guessing Game</h3>
        
        <div className="rounded-xl border border-slate-900 bg-slate-900/10 p-4 w-full">
          <p className="text-xs text-slate-300 leading-relaxed font-semibold">
            {feedback}
          </p>
        </div>

        {!gameOver ? (
          <form onSubmit={handleGuessSubmit} className="flex gap-2 w-full mt-2">
            <input
              type="number"
              value={guess}
              onChange={(e) => setGuess(e.target.value)}
              placeholder="Enter guess..."
              className="flex-grow rounded-xl py-2 px-3 text-xs glass-input font-medium"
              min="1"
              max="100"
              required
            />
            <button
              type="submit"
              className={`rounded-xl px-4 text-xs font-bold transition-all cursor-pointer ${getAccentBtn()}`}
            >
              Guess
            </button>
          </form>
        ) : (
          <button onClick={initGame} className={`rounded-xl px-5 py-2.5 text-xs font-bold text-white cursor-pointer mt-2 ${getAccentBtn()}`}>
            Play Again
          </button>
        )}
      </div>
    );
  };

  // -------------------------------------------------------------
  // GAME 6: TYPING SPEED TEST
  // -------------------------------------------------------------
  const TypingGame = () => {
    const passages = [
      "The quick brown fox jumps over the lazy dog in a spectacular manner.",
      "Vite is a next generation frontend tooling framework that is extremely fast.",
      "Node and Express serve REST APIs while Mongoose acts as a clean ODM mapper for MongoDB."
    ];

    const [passage, setPassage] = useState('');
    const [input, setInput] = useState('');
    const [timeLeft, setTimeLeft] = useState(15);
    const [isStarted, setIsStarted] = useState(false);
    const [wpm, setWpm] = useState(0);
    const [finished, setFinished] = useState(false);
    const timerRef = useRef(null);

    const initTest = () => {
      const idx = Math.floor(Math.random() * passages.length);
      setPassage(passages[idx]);
      setInput('');
      setTimeLeft(15);
      setIsStarted(false);
      setWpm(0);
      setFinished(false);
      if (timerRef.current) clearInterval(timerRef.current);
    };

    useEffect(() => {
      initTest();
      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }, []);

    const handleInputChange = (e) => {
      const val = e.target.value;
      setInput(val);

      if (!isStarted) {
        setIsStarted(true);
        timerRef.current = setInterval(() => {
          setTimeLeft((time) => {
            if (time <= 1) {
              clearInterval(timerRef.current);
              calculateResult(val);
              return 0;
            }
            return time - 1;
          });
        }, 1000);
      }

      // Check if full passage matches
      if (val.trim() === passage.trim()) {
        clearInterval(timerRef.current);
        calculateResult(val);
      }
    };

    const calculateResult = (finalInput) => {
      setFinished(true);
      const wordsCount = finalInput.trim().split(/\s+/).length;
      const speed = Math.round((wordsCount / 15) * 60); // WPM calculation
      setWpm(speed);
      saveScore('TypingSpeed', speed, speed >= 40); // Win if WPM >= 40
    };

    return (
      <div className="flex flex-col items-center gap-4 text-center max-w-sm mx-auto">
        <h3 className="text-sm font-bold text-white">Typing Speed Benchmark</h3>
        <div className="flex justify-between w-full text-xs font-bold text-slate-500">
          <span>Time Remaining: <span className="text-white font-mono">{timeLeft}s</span></span>
          {finished && <span>Speed WPM: <span className="text-indigo-400 font-mono">{wpm} WPM</span></span>}
        </div>

        <div className="rounded-xl border border-slate-900 bg-slate-900/10 p-4 w-full text-xs text-slate-300 text-left leading-relaxed">
          {passage}
        </div>

        {!finished ? (
          <textarea
            value={input}
            onChange={handleInputChange}
            disabled={timeLeft === 0}
            placeholder="Type the passage above here..."
            className="w-full rounded-xl p-3 text-xs glass-input font-medium min-h-20"
          />
        ) : (
          <button onClick={initTest} className={`rounded-xl px-5 py-2.5 text-xs font-bold text-white cursor-pointer mt-2 ${getAccentBtn()}`}>
            Restart Benchmark
          </button>
        )}
      </div>
    );
  };

  // -------------------------------------------------------------
  // GAME 7: DAILY QUIZ RUNNER
  // -------------------------------------------------------------
  const QuizGame = () => {
    const [quiz, setQuiz] = useState(null);
    const [currentIdx, setCurrentIdx] = useState(0);
    const [answers, setAnswers] = useState({}); // qId -> selectedOptionIdx
    const [timer, setTimer] = useState(60);
    const [quizLoading, setQuizLoading] = useState(true);
    const [quizFinished, setQuizFinished] = useState(false);
    const [quizFeedback, setQuizFeedback] = useState(null);

    const quizTimerRef = useRef(null);

    const fetchQuiz = async () => {
      try {
        const res = await api.get('/games/quizzes');
        setQuiz(res.data.daily); // Default to daily quiz
        setTimer(res.data.daily.timeLimit || 60);
        setQuizLoading(false);

        // Start timer
        quizTimerRef.current = setInterval(() => {
          setTimer((t) => {
            if (t <= 1) {
              clearInterval(quizTimerRef.current);
              submitAnswersAuto();
              return 0;
            }
            return t - 1;
          });
        }, 1000);
      } catch (err) {
        console.error(err);
      }
    };

    useEffect(() => {
      fetchQuiz();
      return () => {
        if (quizTimerRef.current) clearInterval(quizTimerRef.current);
      };
    }, []);

    const submitAnswersAuto = async () => {
      clearInterval(quizTimerRef.current);
      try {
        const res = await api.post('/games/quiz/submit', {
          quizType: 'daily',
          answers: answers,
        });
        setQuizFeedback(res.data);
        setQuizFinished(true);
        fetchLeaderboard(); // refresh ranking scores
      } catch (err) {
        console.error(err);
      }
    };

    const handleOptionSelect = (optionIdx) => {
      const qId = quiz.questions[currentIdx].id;
      setAnswers({ ...answers, [qId]: optionIdx });
    };

    const handleNext = () => {
      if (currentIdx < quiz.questions.length - 1) {
        setCurrentIdx(currentIdx + 1);
      } else {
        submitAnswersAuto();
      }
    };

    if (quizLoading) return <Loader />;

    return (
      <div className="flex flex-col items-center gap-4 text-center max-w-sm mx-auto">
        <h3 className="text-sm font-bold text-white">{quiz.title}</h3>
        
        {!quizFinished ? (
          <div className="w-full flex flex-col gap-4">
            <div className="flex justify-between text-xs font-bold text-slate-500">
              <span>Question {currentIdx + 1} of {quiz.questions.length}</span>
              <span>Time Left: <span className="text-white font-mono">{timer}s</span></span>
            </div>

            <div className="rounded-xl border border-slate-900 bg-slate-900/10 p-4 text-xs font-semibold text-slate-200 text-left leading-relaxed">
              {quiz.questions[currentIdx].question}
            </div>

            <div className="flex flex-col gap-2">
              {quiz.questions[currentIdx].options.map((opt, i) => {
                const qId = quiz.questions[currentIdx].id;
                const isSelected = answers[qId] === i;
                return (
                  <button
                    key={opt}
                    onClick={() => handleOptionSelect(i)}
                    className={`w-full text-left rounded-xl p-3 border text-xs font-medium transition-all ${
                      isSelected 
                        ? 'border-indigo-500 bg-indigo-950/20 text-white font-bold' 
                        : 'border-slate-850 hover:bg-slate-900/40 text-slate-400'
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>

            <button
              onClick={handleNext}
              className={`w-full py-3 rounded-xl text-xs font-bold text-white transition-all shadow-md mt-2 cursor-pointer ${getAccentBtn()}`}
            >
              {currentIdx === quiz.questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4 items-center w-full">
            <div className="rounded-xl border border-slate-900 bg-slate-900/10 p-4 w-full">
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Quiz Completed</span>
              <p className="text-sm text-indigo-400 font-extrabold mt-1.5">
                Score: {quizFeedback.score} Points ({quizFeedback.correct} / {quizFeedback.total} Correct)
              </p>
            </div>
            
            {quizFeedback.perfect && (
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-2 text-xs font-bold text-amber-400 flex items-center gap-1">
                <Award className="h-4 w-4 animate-bounce" /> Perfect Score Badge Unlocked!
              </div>
            )}

            <button onClick={fetchQuiz} className={`w-full py-3 rounded-xl text-xs font-bold text-white transition-all shadow-md cursor-pointer ${getAccentBtn()}`}>
              Retry Quiz
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Central Game Screen (Arcade View) */}
      <div className="lg:col-span-2 rounded-2xl border border-slate-900 bg-slate-950/45 p-6 shadow-lg min-h-[460px] flex flex-col relative">
        
        {activeGame ? (
          <div>
            {/* Back button */}
            <button
              onClick={() => setActiveGame(null)}
              className="absolute top-4 left-4 rounded-xl px-3 py-1.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-[10px] font-bold text-slate-400 hover:text-white transition-all flex items-center gap-1 cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" /> Arcade Lobby
            </button>

            {/* Render selected active game */}
            <div className="mt-8">
              {activeGame === 'snake' && <SnakeGame />}
              {activeGame === 'tictactoe' && <TicTacToeGame />}
              {activeGame === 'rps' && <RPSGame />}
              {activeGame === 'memory' && <MemoryGame />}
              {activeGame === 'guess' && <GuessGame />}
              {activeGame === 'typing' && <TypingGame />}
              {activeGame === 'quiz' && <QuizGame />}
            </div>
          </div>
        ) : (
          /* Lobby grid */
          <div className="flex flex-col gap-5 h-full">
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Arcade Games Lobby</span>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { id: 'snake', name: 'Snake Game', icon: '🐍' },
                { id: 'tictactoe', name: 'Tic-Tac-Toe', icon: '❌' },
                { id: 'rps', name: 'Rock Paper Scissors', icon: '✊' },
                { id: 'memory', name: 'Memory Cards', icon: '🃏' },
                { id: 'guess', name: 'Number Guess', icon: '❓' },
                { id: 'typing', name: 'Typing Test', icon: '⌨️' },
                { id: 'quiz', name: 'Daily Quiz', icon: '🧠' },
              ].map((g) => (
                <button
                  key={g.id}
                  onClick={() => setActiveGame(g.id)}
                  className="rounded-xl border border-slate-850 p-5 bg-slate-900/30 hover:bg-indigo-950/20 hover:border-indigo-500/25 transition-all text-center flex flex-col items-center gap-2.5 group cursor-pointer"
                >
                  <span className="text-3xl group-hover:scale-125 transition-transform">{g.icon}</span>
                  <span className="text-xs font-bold text-slate-300 group-hover:text-white">{g.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Leaderboard summary card */}
      <div className="rounded-2xl border border-slate-900 bg-slate-950/45 p-5 shadow-lg flex flex-col gap-4 max-h-[460px]">
        <div className="pb-2 border-b border-slate-900 flex justify-between items-center">
          <span className="text-sm font-bold flex items-center gap-2">
            <Trophy className="h-4.5 w-4.5 text-indigo-400" /> Circle Leaderboard
          </span>
          <span className="text-[9px] text-slate-500 font-bold uppercase">Global score</span>
        </div>

        {leaderboardLoading ? (
          <Loader />
        ) : (
          <div className="flex flex-col gap-3 overflow-y-auto pr-1">
            {leaderboard.map((row, index) => (
              <div key={row._id} className="flex items-center justify-between rounded-xl bg-slate-900/20 border border-slate-900 p-2.5">
                <div className="flex items-center gap-2.5">
                  <span className={`text-xs font-mono font-black w-4 text-center ${
                    index === 0 ? 'text-amber-400' : index === 1 ? 'text-slate-400' : index === 2 ? 'text-amber-600' : 'text-slate-600'
                  }`}>
                    {index + 1}
                  </span>
                  <img
                    src={row.avatar || 'https://via.placeholder.com/150'}
                    alt="Row Avatar"
                    className="h-7 w-7 rounded-lg object-cover border border-slate-800"
                  />
                  <span className="text-xs font-bold text-slate-300 truncate max-w-24">{row.username}</span>
                </div>

                <div className="flex items-center gap-1 font-mono text-[10px] text-slate-400 font-bold">
                  <span>{row.totalPoints} PTS</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default GamesRoom;
