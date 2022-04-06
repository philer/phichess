import { h } from "preact"

import { Board, ColorPiece, Piece, Square, squares } from "./chess"
import { clsx } from "./util"

import * as classes from "./Chessboard.module.scss"

const PIECE_TO_UTF8 = {
  "K": "♚", //"♔",
  "Q": "♛", //"♕",
  "R": "♜", //"♖",
  "B": "♝", //"♗",
  "N": "♞", //"♘",
  "": "♟", //"♙",
}

export type ChessboardProps = {
  board: Board
  flipped: boolean
  selected?: Square
  onClickSquare?: (square: Square) => void
}

export const Chessboard = ({ board, flipped, selected, onClickSquare }: ChessboardProps) =>
  <div class={clsx(classes.root, flipped && classes.flipped)}>
    {squares
      .map(square => [square, board[square]] as const)
      .map(([square, piece], idx) =>
        <div
          key={`${square}${piece || ""}`}
          class={clsx(
            piece && piece[0],
            (idx + ~~(idx / 8)) % 2 ? classes.white : classes.black,
            selected === square && classes.selected,
          )}
          onClick={() => onClickSquare?.(square)}
        >
          {piece && PIECE_TO_UTF8[piece.slice(1) as Piece]}
        </div>,
      )}
  </div>


export const Utf8Piece = ({ piece }: { piece: ColorPiece }) =>
  <span class={clsx(piece[0], classes.piece)}>
    {PIECE_TO_UTF8[piece.slice(1) as Piece]}
  </span>
