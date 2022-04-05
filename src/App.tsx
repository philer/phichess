import { h, render } from "preact"

import "./global.scss"

import { startPieces } from "./chess"
import { Chessboard } from "./Chessboard"

import * as classes from "./App.module.scss"

const App = () =>
  <div class={classes.root}>
    <Chessboard pieces={startPieces} />
  </div>

// Go!
render(<App />, document.body)
