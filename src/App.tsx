import { useState, useCallback } from 'react'
import './App.css'

type Player = 'X' | 'O' | null
type GameStatus = 'playing' | 'winner' | 'draw'

interface PlayerInfo {
  name: string
  symbol: 'X' | 'O'
}

interface GameCurrentState {
  board: Player[][]
  currentPlayer: 'X' | 'O'
  status: GameStatus
  winner: Player
}

function App() {
  const [boardSize, setBoardSize] = useState(3)
  const [marksToWin, setMarksToWin] = useState(3)
  const [players, setPlayers] = useState<PlayerInfo[]>([
    { name: 'Player 1', symbol: 'X' },
    { name: 'Player 2', symbol: 'O' }
  ])

  const [gameCurrentState, setGameCurrentState] = useState<GameCurrentState>(() => 
    createInitialGameCurrentState(boardSize)
  )

  function createInitialGameCurrentState(size: number): GameCurrentState {
    const board = Array(size).fill(null).map(() => Array(size).fill(null))
    return {
      board,
      currentPlayer: 'X',
      status: 'playing',
      winner: null
    }
  }

  const checkWinner = useCallback((board: Player[][], row: number, col: number, player: Player): boolean => {
    const size = board.length
    const directions = [
      [0, 1],   // horizontal
      [1, 0],   // vertical
      [1, 1],   // diagonal 
      [1, -1]   // diagonal 
    ]

    for (const [dx, dy] of directions) {
      let count = 1 // Count the current placed mark

      // Check in positive direction
      for (let i = 1; i < marksToWin; i++) {
        const newRow = row + i * dx
        const newCol = col + i * dy
        if (newRow >= 0 && newRow < size && newCol >= 0 && newCol < size && board[newRow][newCol] === player) {
          count++
        } else {
          break
        }
      }

      // Check in negative direction
      for (let i = 1; i < marksToWin; i++) {
        const newRow = row - i * dx
        const newCol = col - i * dy
        if (newRow >= 0 && newRow < size && newCol >= 0 && newCol < size && board[newRow][newCol] === player) {
          count++
        } else {
          break
        }
      }

      if (count >= marksToWin) {
        return true
      }
    }

    return false
  }, [marksToWin])

  const checkDraw = useCallback((board: Player[][]): boolean => {
    return board.every(row => row.every(cell => cell !== null))
  }, [])

  const handleBoxClick = useCallback((row: number, col: number) => {
    if (gameCurrentState.status !== 'playing' || gameCurrentState.board[row][col] !== null) {
      return
    }

    const newBoard = gameCurrentState.board.map(boardRow => [...boardRow])
    newBoard[row][col] = gameCurrentState.currentPlayer

    const hasWinner = checkWinner(newBoard, row, col, gameCurrentState.currentPlayer)
    const isDraw = !hasWinner && checkDraw(newBoard)

    setGameCurrentState({
      board: newBoard,
      currentPlayer: gameCurrentState.currentPlayer === 'X' ? 'O' : 'X',
      status: hasWinner ? 'winner' : isDraw ? 'draw' : 'playing',
      winner: hasWinner ? gameCurrentState.currentPlayer : null
    })
  }, [gameCurrentState, checkWinner, checkDraw])

  const resetGame = () => {
    setGameCurrentState(createInitialGameCurrentState(boardSize))
  }

  // Auto-reset game when board size or marks to win changes
  const handleBoardSizeChange = (newSize: number) => {
    setBoardSize(newSize)
    setGameCurrentState(createInitialGameCurrentState(newSize))
  }

  const handleMarksToWinChange = (newMarks: number) => {
    setMarksToWin(newMarks)
    setGameCurrentState(createInitialGameCurrentState(boardSize))
  }

  const getStatusMessage = () => {
    const currentPlayerInfo = players.find(p => p.symbol === gameCurrentState.currentPlayer)
    const winnerInfo = players.find(p => p.symbol === gameCurrentState.winner)
    
    switch (gameCurrentState.status) {
      case 'winner':
        return `🎉 ${winnerInfo?.name} (${gameCurrentState.winner}) wins!`
      case 'draw':
        return `🤝 It's a draw!`
      case 'playing':
      default:
        return `${currentPlayerInfo?.name}'s turn (${gameCurrentState.currentPlayer})`
    }
  }

  const getBoardSize = () => {
    // Calculate optimal board size based on board dimensions and screen size
    const screenWidth = window.innerWidth
    const screenHeight = window.innerHeight
    const maxScreenSize = Math.min(screenWidth * 0.9, screenHeight * 0.8)
    
    // For very large boards, use more of the available screen space
    if (boardSize <= 6) {
      return Math.min(500, maxScreenSize)
    } else if (boardSize <= 12) {
      return Math.min(700, maxScreenSize)
    } else {
      return Math.min(900, maxScreenSize)
    }
  }

  const getCellFontSize = () => {
    if (boardSize <= 3) return '2rem'
    if (boardSize <= 5) return '1.5rem'
    if (boardSize <= 7) return '1.2rem'
    if (boardSize <= 10) return '1rem'
    if (boardSize <= 15) return '0.8rem'
    return '0.6rem'
  }

  const getGridGap = () => {
    if (boardSize <= 3) return '4px'
    if (boardSize <= 5) return '3px'
    if (boardSize <= 8) return '2px'
    if (boardSize <= 12) return '1px'
    return '0.5px'
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
              onChange={(e) => setPlayers(prev => [
                { ...prev[0], name: e.target.value || 'Player 1' },
                prev[1]
              ])}
              placeholder="Enter Player 1 name"
            />
          </div>
          <div className="player-input">
            <label htmlFor="player2">Player 2 (O): </label>
            <input
              id="player2"
              type="text"
              value={players[1].name}
              onChange={(e) => setPlayers(prev => [
                prev[0],
                { ...prev[1], name: e.target.value || 'Player 2' }
              ])}
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
            onChange={(e) => handleBoardSizeChange(parseInt(e.target.value) || 3)}
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
            onChange={(e) => handleMarksToWinChange(parseInt(e.target.value) || 3)}
          />
        </div>
      </div>

      <div className="game-status">
        {getStatusMessage()}
      </div>

      <div 
        className="game-board"
        style={{
          gridTemplateColumns: `repeat(${boardSize}, 1fr)`,
          gridTemplateRows: `repeat(${boardSize}, 1fr)`,
       
          gap: getGridGap(),
          minWidth: `${getBoardSize()}px`,
          minHeight: `${getBoardSize()}px`,
          margin: '2rem auto',
          display: 'grid',
          justifySelf: 'center',
          alignSelf: 'center',
        }}
      >
        {gameCurrentState.board.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <button
              key={`${rowIndex}-${colIndex}`}
              className={`cell ${cell ? 'filled' : ''}`}
              onClick={() => handleBoxClick(rowIndex, colIndex)}
              disabled={gameCurrentState.status !== 'playing' || cell !== null}
              style={{ fontSize: getCellFontSize() }}
            >
              {cell}
            </button>
          ))
        )}
      </div>

      <div style={{position:'relative'}}>

      <button onClick={resetGame} className="reset-btn">
        Reset Game
      </button>

      <div className="game-info">
        <p>Board: {boardSize} x {boardSize}</p>
        <p>Marks to win: {marksToWin}</p>
      </div>
        </div>
    </div>
  )
}

export default App
