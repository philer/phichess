import { h, render } from "preact"
import { useReducer, useState } from "preact/hooks"

import "./global.scss"

import { Board, ColorPiece, executeMove, Game, Move, Square, startBoard } from "./chess"
import { Chessboard, Utf8Piece } from "./Chessboard"

import * as classes from "./App.module.scss"


const App = () => {
  const [game, setGame] = useState<Game>([])
  const [selectedSquare, setSelectedSquare] = useState<Square>()
  const [flipped, setFlipped] = useState(false)

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
          onClickSquare={setSelectedSquare}
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
