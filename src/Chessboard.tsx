import { h } from "preact"

import { Board } from "./chess"

import * as classes from "./Chessboard.module.scss"


export type ChessboardProps = {
  board: Board
}

export const Chessboard = ({ board }: ChessboardProps) =>
  <div class={classes.root}>
    TODO
  </div>
