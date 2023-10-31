import { h, render } from "preact"
import { useMemo, useState } from "preact/hooks"

import "./global.scss"

import { applyMove, type Game, type Square, START_GAME } from "./chess"
import { Chessboard, Utf8Piece } from "./Chessboard"
import { pairs } from "./util"

import * as classes from "./App.module.scss"


const App = () => {
  const [game, setGame] = useState<Game>(START_GAME)
  const { board, toMove, history, graveyard } = game
  const [selectedSquare, setSelectedSquare] = useState<Square | undefined>(undefined)
  const [flipped, setFlipped] = useState(false)

  const movePairs = useMemo(() => Array.from(pairs(history)), [history])

  const handleSquareClick = (square: Square) => {
    if (board[square]?.[0] === toMove) {
      setSelectedSquare(square)
    } else if (selectedSquare && board[square]?.[0] !== toMove) {
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
        <div class={classes.graveyard}>
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
        </div>
        <Chessboard
          board={board}
          flipped={flipped}
          selected={selectedSquare}
          onSquareClick={handleSquareClick}
        />
        <div class={classes.tools}>
          <button onClick={() => setFlipped(yes => !yes)}>⇅</button>
        </div>
        <aside>
          <ol class={classes.history}>
            {movePairs.map(([whiteMove, blackMove], idx) =>
              <li key={idx}>
                <span class={classes.moveNumber}>{idx + 1}.</span>
                <span>{whiteMove.algebraic}</span>
                <span>{blackMove?.algebraic}</span>
              </li>,
            )}
          </ol>
        </aside>
      </div>
    </div>
  )
}

// Go!
render(<App />, document.body)
