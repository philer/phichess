import { h, render } from "preact"
import { useReducer, useState } from "preact/hooks"

import "./global.scss"

import { applyMove, Board, ColorPiece, Game, Move, Square, START_GAME } from "./chess"
import { Chessboard, Utf8Piece } from "./Chessboard"

import * as classes from "./App.module.scss"


const App = () => {
  const [game, setGame] = useState<Game>(START_GAME)
  const [selectedSquare, setSelectedSquare] = useState<Square | undefined>(undefined)
  const [flipped, setFlipped] = useState(false)

  const handleSquareClick = (square: Square) => {
    if (game.board[square]?.[0] === game.toMove) {
      setSelectedSquare(square)
    } else if (selectedSquare && game.board[square]?.[0] !== game.toMove) {
      applyMove({
        from: selectedSquare,
        to: square,
        // promotion:
      }, game)
        .map(setGame)
        .map(() => setSelectedSquare(undefined))
        .mapError(console.log)
    }
  }

  return (
    <div class={classes.root}>
      <div class={classes.game}>
        {/*<div class={classes.graveyard}>
          <div>
            {graveyard
              .filter(([color]) => color === "w")
              .map((piece, idx) => <Utf8Piece key={idx + piece} piece={piece} />)
            }
          </div>
          <div>
            {graveyard
              .filter(([color]) => color === "b")
              .reverse()
              .map((piece, idx) => <Utf8Piece key={idx + piece} piece={piece} />)
            }
          </div>
        </div>*/}
        <Chessboard
          board={game.board}
          flipped={flipped}
          selected={selectedSquare}
          onClickSquare={handleSquareClick}
        />
        <div class={classes.tools}>
          <button onClick={() => setFlipped(yes => !yes)}>⇅</button>
        </div>
      </div>
    </div>
  )
}

// Go!
render(<App />, document.body)
