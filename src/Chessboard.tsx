import { Fragment, h } from "preact"

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
  flipped?: boolean
  showCoordinates?: boolean
  selected?: Square
  onSquareClick?: (square: Square) => void
}

export const Chessboard = ({
  board,
  flipped = false,
  showCoordinates = true,
  selected,
  onSquareClick,
}: ChessboardProps) =>
  <div class={clsx(classes.root, flipped && classes.flipped)}>
    {squares
      .map(square => ({ square, piece: board[square] } as const))
      .map(({ square, piece }, idx) =>
        <div
          key={`${square}${piece || ""}`}
          class={clsx(
            piece && piece[0],
            (idx + ~~(idx / 8)) % 2 ? classes.white : classes.black,
            selected === square && classes.selected,
          )}
          onClick={() => onSquareClick?.(square)}
        >
          {showCoordinates && (
            <>
              {square[1] === (flipped ? "8" : "1") && (
                <div class={classes.file}>{square[0]}</div>
              )}
              {square[0] === (flipped ? "h" : "a") && (
                <div class={classes.rank}>{square[1]}</div>
              )}
            </>
          )}
          {piece && PIECE_TO_UTF8[piece.slice(1) as Piece]}
        </div>,
      )}
  </div>


export const Utf8Piece = ({ piece }: { piece: ColorPiece }) =>
  <span class={clsx(piece[0], classes.piece)}>
    {PIECE_TO_UTF8[piece.slice(1) as Piece]}
  </span>
