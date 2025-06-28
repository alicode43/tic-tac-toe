import { useState, useCallback } from "react";
import "./App.css";

type Signs = "X" | "O" | null;
type GameStatus = "playing" | "winner" | "draw";

interface Player {
  name: string;
  symbol: "X" | "O";
}

interface game {
  board: Signs[][];
  currentPlayer: "X" | "O";
  status: GameStatus;
  winner: Signs;
}

function App() {
  const [boardSize, setBoardSize] = useState(3);
  const [marksToWin, setMarksToWin] = useState(3);
  const [players, setPlayers] = useState<Player[]>([
    { name: "Player 1", symbol: "X" },
    { name: "Player 2", symbol: "O" },
  ]);

  const [game, setgame] = useState<game>(() => stState(boardSize));

  function stState(size: number): game {
    const board: Signs[][] = Array(size)
      .fill(null)
      .map(() => Array(size).fill(null));
    return {
      board,
      currentPlayer: "X",
      status: "playing",
      winner: null,
    };
  }

  const checkWinner = useCallback(
    (
      board: Signs[][],
      row: number,
      col: number,
      player: Signs
    ): boolean => {
      const size = board.length;
      const directions = [
        [0, 1], // horizontal
        [1, 0], // vertical
        [1, 1], // diagonal
        [1, -1], // diagonal
      ];

      for (let dirIndex = 0; dirIndex < directions.length; dirIndex++) {
        const x = directions[dirIndex][0];
        const y = directions[dirIndex][1];
        let count = 1; // Count the current placed mark

        // Check in positive direction
        for (let i = 1; i < marksToWin; i++) {
          const newRow = row + i * x;
          const newCol = col + i * y;
          if (
            newRow >= 0 &&
            newRow < size &&
            newCol >= 0 &&
            newCol < size &&
            board[newRow][newCol] === player
          ) {
            count++;
          } else {
            break;
          }
        }

        // Check in negative direction
        for (let i = 1; i < marksToWin; i++) {
          const newRow = row - i * x;
          const newCol = col - i * y;
          if (
            newRow >= 0 &&
            newRow < size &&
            newCol >= 0 &&
            newCol < size &&
            board[newRow][newCol] === player
          ) {
            count++;
          } else {
            break;
          }
        }

        if (count >= marksToWin) {
          return true;
        }
      }

      return false;
    },
    [marksToWin]
  );

  function checkDraw(board: Signs[][]): boolean {
    for (let row = 0; row < board.length; row++) {
      for (let col = 0; col < board[row].length; col++) {
        if (board[row][col] === null) {
          return false;
        }
      }
    }
    return true;
  }

  function onBoxClick(row: number, col: number) {
    if (game.status !== "playing" || game.board[row][col] !== null) {
      return;
    }

    // Create a deep copy of the board using traditional for loops
    const newBoard: Signs[][] = [];
    for (let i = 0; i < game.board.length; i++) {
      const newRow: Signs[] = [];
      for (let j = 0; j < game.board[i].length; j++) {
        newRow[j] = game.board[i][j];
      }
      newBoard[i] = newRow;
    }

    newBoard[row][col] = game.currentPlayer;

    const hasWinner = checkWinner(newBoard, row, col, game.currentPlayer);
    let isDraw = false;
    if (!hasWinner) {
      isDraw = checkDraw(newBoard);
    }

    let newCurrentPlayer: "X" | "O";
    if (game.currentPlayer === "X") {
      newCurrentPlayer = "O";
    } else {
      newCurrentPlayer = "X";
    }

    let newStatus: GameStatus;
    if (hasWinner) {
      newStatus = "winner";
    } else if (isDraw) {
      newStatus = "draw";
    } else {
      newStatus = "playing";
    }

    let newWinner: Signs;
    if (hasWinner) {
      newWinner = game.currentPlayer;
    } else {
      newWinner = null;
    }

    setgame({
      board: newBoard,
      currentPlayer: newCurrentPlayer,
      status: newStatus,
      winner: newWinner,
    });
  }

  function resetGame() {
    setgame(stState(boardSize));
  }

  // Auto-reset game when board size or marks to win changes
  function onSizeChange(newSize: number) {
    setBoardSize(newSize);
    setgame(stState(newSize));
  }

  function checkMarks(newMarks: number) {
    setMarksToWin(newMarks);
    setgame(stState(boardSize));
  }

  const msgStatus = () => {
    let currentPlayer: Player | undefined;
    for (let i = 0; i < players.length; i++) {
      if (players[i].symbol === game.currentPlayer) {
        currentPlayer = players[i];
        break;
      }
    }

    let winnerInfo: Player | undefined;
    for (let i = 0; i < players.length; i++) {
      if (players[i].symbol === game.winner) {
        winnerInfo = players[i];
        break;
      }
    }

    switch (game.status) {
      case "winner":
        return `🎉 ${winnerInfo?.name} (${game.winner}) wins!`;
      case "draw":
        return `Game over! It's a draw!`;
      case "playing":
      default:
        return `${currentPlayer?.name}'s turn (${game.currentPlayer})`;
    }
  };

  const BoardSize = () => {
    // Calculate optimal board size based on board dimensions and screen size
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const maxScreenSize = Math.min(screenWidth * 0.9, screenHeight * 0.8);

    // For very large boards, use more of the available screen space
    if (boardSize <= 6) {
      return Math.min(500, maxScreenSize);
    } else if (boardSize <= 12) {
      return Math.min(700, maxScreenSize);
    } else {
      return Math.min(900, maxScreenSize);
    }
  };

  function CellFontSize(): string {
    if (boardSize <= 3) {
      return "2rem";
    } else if (boardSize <= 5) {
      return "1.5rem";
    } else if (boardSize <= 7) {
      return "1.2rem";
    } else if (boardSize <= 10) {
      return "1rem";
    } else if (boardSize <= 15) {
      return "0.8rem";
    } else {
      return "0.6rem";
    }
  }

  function GridGap(): string {
    if (boardSize <= 3) {
      return "4px";
    } else if (boardSize <= 5) {
      return "3px";
    } else if (boardSize <= 8) {
      return "2px";
    } else if (boardSize <= 12) {
      return "1px";
    } else {
      return "0.5px";
    }
  }

  return (
    <div className="app">
      <h1>Tic-Tac-Toe Pro</h1>

      <div className="player-setup">
        <h3>Player Setup</h3>
        <div className="player-inputs">
          <div className="player-input">
            <label htmlFor="player1">Player 1 (X): </label>
            <input
              id="player1"
              type="text"
              value={players[0].name}
              onChange={(e) =>
                setPlayers((prev) => [
                  { ...prev[0], name: e.target.value || "Player 1" },
                  prev[1],
                ])
              }
              placeholder="Enter Player 1 name"
            />
          </div>
          <div className="player-input">
            <label htmlFor="player2">Player 2 (O): </label>
            <input
              id="player2"
              type="text"
              value={players[1].name}
              onChange={(e) =>
                setPlayers((prev) => [
                  prev[0],
                  { ...prev[1], name: e.target.value || "Player 2" },
                ])
              }
              placeholder="Enter Player 2 name"
            />
          </div>
        </div>
      </div>

      <div className="game-settings">
        <div className="setting">
          <label htmlFor="boardSize">Board Size (N x N): </label>
          <input
            id="boardSize"
            type="number"
            min="3"
            value={boardSize}
            onChange={(e) => onSizeChange(parseInt(e.target.value) || 3)}
          />
        </div>
        <div className="setting">
          <label htmlFor="marksToWin">Marks to Win (M): </label>
          <input
            id="marksToWin"
            type="number"
            min="3"
            max={boardSize}
            value={marksToWin}
            onChange={(e) => checkMarks(parseInt(e.target.value) || 3)}
          />
        </div>
      </div>

      <div className="game-status">{msgStatus()}</div>

      <div
        className="game-board"
        style={{
          gridTemplateColumns: `repeat(${boardSize}, 1fr)`,
          gridTemplateRows: `repeat(${boardSize}, 1fr)`,

          gap: GridGap(),
          minWidth: `${BoardSize()}px`,
          minHeight: `${BoardSize()}px`,
          margin: "2rem auto",
          display: "grid",
          justifySelf: "center",
          alignSelf: "center",
        }}
      >
        {game.board.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <button
              key={`${rowIndex}-${colIndex}`}
              className={`cell ${cell ? "filled" : ""}`}
              onClick={() => onBoxClick(rowIndex, colIndex)}
              disabled={game.status !== "playing" || cell !== null}
              style={{ fontSize: CellFontSize() }}
            >
              {cell}
            </button>
          ))
        )}
      </div>

      <div style={{ position: "relative" }}>
        <button onClick={resetGame} className="reset-btn">
          Reset Game
        </button>

        <div className="game-info">
          <p>
            Board: {boardSize} x {boardSize}
          </p>
          <p>Marks to win: {marksToWin}</p>
        </div>
      </div>
    </div>
  );
}

export default App;
