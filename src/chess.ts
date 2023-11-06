import { match } from "ts-pattern"

import { err, ok, type Result } from "./result"
import { isTruthy } from "./util"


export type File = "a" | "b" | "c" | "d" | "e" | "f" | "g" | "h"
export type Rank = "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8"
export type Piece = "" | "K" | "Q" | "R" | "B" | "N"
export type PieceNotPawn = Exclude<Piece, "">
export type MortalPiece = Exclude<Piece, "K">
export type PromotablePiece = Exclude<Piece, "" | "K">
export type Check = "" | "+" | "#"
export type Color = "w" | "b"

export type Square = `${File}${Rank}`
export type ColorPiece = `${Color}${Piece}`
export type MortalColorPiece = `${Color}${MortalPiece}`

export type Board = Readonly<Partial<Record<Square, ColorPiece>>>

export const START_BOARD: Board = Object.freeze({
  a8: "bR", b8: "bN", c8: "bB", d8: "bQ", e8: "bK", f8: "bB", g8: "bN", h8: "bR",
  a7: "b", b7: "b", c7: "b", d7: "b", e7: "b", f7: "b", g7: "b", h7: "b",
  a2: "w", b2: "w", c2: "w", d2: "w", e2: "w", f2: "w", g2: "w", h2: "w",
  a1: "wR", b1: "wN", c1: "wB", d1: "wQ", e1: "wK", f1: "wB", g1: "wN", h1: "wR",
})

export type AlgebraicMove
  = `${Square}${Check}`
  | `${File}x${Square}${Check}`
  | `${PieceNotPawn}${""|"x"}${Square}${Check}`
  | `${PieceNotPawn}${File}${""|"x"}${Square}${Check}`
  | `${"N"|"B"|"R"|"Q"}${Rank}${""|"x"}${Square}${Check}`
  | `${"N"|"B"|"Q"}${Square}${""|"x"}${Square}${Check}`
  | `O-O${Check}`
  | `O-O-O${Check}`
  | `${File}${1|8}${""|"="}${PieceNotPawn}${Check}`
  | `${File}x${File}${1|8}${""|"="}${PieceNotPawn}${Check}`

/** Data provided by a user that is intended to be applied to a specific game state */
export type MoveInput = {
  from: Square
  to: Square
  promotion?: PromotablePiece
}
/** Validated move details deduced from a specific game state */
export type Move = MoveInput & {
  algebraic?: AlgebraicMove
  // piece: ColorPiece
  // capture?: ColorPiece
  // check: bool
}

export type Game = Readonly<{
  board: Board
  toMove: Color
  history: ReadonlyArray<Move>
  graveyard: ReadonlyArray<MortalColorPiece>
}>

export const START_GAME: Game = Object.freeze({
  board: START_BOARD,
  toMove: "w",
  history: Object.freeze([]),
  graveyard: Object.freeze([]),
})


export const squares: readonly Square[]
  = Array.from("12345678").flatMap(
    rank => Array.from("abcdefgh",
      file => `${file}${rank}` as Square,
    ),
  )


const shift = (fileDelta: number, rankDelta: number, square: Square): Square | undefined => {
  const a = 97  // char code for 'a'
  const file = square.charCodeAt(0) - a + fileDelta
  const rank = +square[1] + rankDelta
  if (1 > rank || rank > 8 || 0 > file || file > 7) {
    return undefined
  }
  return String.fromCharCode(file + a) + rank as Square
}

function* ray(file: -1|0|1, rank: -1|0|1, square: Square) {
  for (let target, i = 1 ; target = shift(i * file, i * rank, square) ; ++i) {
    yield target
  }
}

/**
 * Iterate squares between start and end (excluding both) in a
 * vertical, horizontal or diagonal line.
 */
function* range(from: Square, to: Square) {
  const fromFile = from.charCodeAt(0)
  const fromRank = from.charCodeAt(1)
  const toFile = to.charCodeAt(0)
  const toRank = to.charCodeAt(1)
  const fileDelta = toFile - fromFile
  const rankDelta = toRank - fromRank
  const delta = Math.abs(fileDelta || rankDelta)
  const fileStep = Math.sign(fileDelta)
  const rankStep = Math.sign(rankDelta)
  for (let i = 1 ; i < delta ; ++i) {
    yield `${String.fromCharCode(fromFile + fileStep)}${String.fromCharCode(fromRank + rankStep)}` as Square
  }
}

function findBlockedSquare(board: Board, from: Square, to: Square) {
  for (const square of range(from, to)) {
    if (board[square]) {
      return square
    }
  }
}

const findOnPath = (piece: ColorPiece, path: Iterable<Square>, board: Board) => {
  for (const square of path) {
    if (board[square]) {
      return board[square] === piece ? square : undefined
    }
  }
}

const pawnCaptureSquares = (color: Color, square: Square) =>
  [
    shift(-1, color === "w" ? -1 : 1, square),
    shift(+1, color === "w" ? -1 : 1, square),
  ].filter(Boolean) as Square[]

const knightSquares = (square: Square): Square[] =>
  [
    shift(+1, +2, square),
    shift(+1, -2, square),
    shift(-1, +2, square),
    shift(-1, -2, square),
    shift(+2, +1, square),
    shift(+2, -1, square),
    shift(-2, +1, square),
    shift(-2, -1, square),
  ].filter(Boolean) as Square[]

const bishopPaths = (square: Square): Iterable<Square>[] =>
  [
    ray(+1, +1, square),
    ray(+1, -1, square),
    ray(-1, +1, square),
    ray(-1, -1, square),
  ]

const rookPaths = (square: Square): Iterable<Square>[] =>
  [
    ray(+1, 0, square),
    ray(-1, 0, square),
    ray(0, +1, square),
    ray(0, -1, square),
  ]

const queenPaths = (square: Square): Iterable<Square>[] =>
  [...rookPaths(square), ...bishopPaths(square)]

const kingSquares = (square: Square): Square[] =>
  [
    shift(-1, -1, square),
    shift(-1, 0, square),
    shift(-1, +1, square),
    shift(0, -1, square),
    shift(0, +1, square),
    shift(+1, -1, square),
    shift(+1, 0, square),
    shift(+1, +1, square),
  ].filter(Boolean) as Square[]


const castleSquares = (square: Square): Square[] =>
  [
    shift(+2, 0, square),
    shift(-2, 0, square),
  ].filter(Boolean) as Square[]


export const isAttacked = (by: Color, square: Square, board: Board) =>
  pawnCaptureSquares(by, square).some(square => board[square] === by)
  || knightSquares(square).some(square => board[square] === `${by}N`)
  || bishopPaths(square).some(path => findOnPath(`${by}B`, path, board))
  || rookPaths(square).some(path => findOnPath(`${by}R`, path, board))
  || queenPaths(square).some(path => findOnPath(`${by}Q`, path, board))
  || kingSquares(square).some(square => board[square] === `${by}K`)

export const isInCheck = (color: Color, board: Board) =>
  isAttacked(
    color === "w" ? "b" : "w",
    (Object.keys(board) as Square[]).find(square => board[square] === `${color}K`) as Square,
    board,
  )


const PIECE_NAMES = {
  "K": "king",
  "Q": "queen",
  "R": "rook",
  "B": "bishop",
  "N": "knight",
  "": "pawn",
}

/** Generate algebraic notation for a legal move. */
export const toAlgebraic = ({ from, to, promotion }: MoveInput, board: Board): Result<AlgebraicMove, string> => {
  // TODO promotion
  const piece = board[from]
  if (!piece) {
    return err(`There is no piece on ${from}.`)
  }
  const color = piece[0] as Color
  const pieceName = piece.slice(1) as Piece | ""

  // castling
  const fileDelta = from.charCodeAt(0) - to.charCodeAt(0)
  if (pieceName === "K" && Math.abs(fileDelta) === 2) {
    return ok(fileDelta > 0 ? "O-O" : "O-O-O")
  }

  const opponentPiece = board[to]
    // en passant
    ?? (pieceName === "" && from[0] !== to[0] ? to[1] + from[0] : undefined)
  let takes: "" | "x" = ""
  const promoted = promotion ? `=${promotion}` : ""
  if (opponentPiece) {
    if (opponentPiece[0] === color) {
      return err(`Can't take your own piece on ${to}.`)
    }
    takes = "x"
  }
  const candidates = match(pieceName)
    .with("", () => takes ? pawnCaptureSquares(color, to) : [from])
    .with("N", () => knightSquares(to))
    .with("B", () => bishopPaths(to).map(path => findOnPath(piece, path, board)))
    .with("R", () => rookPaths(to).map(path => findOnPath(piece, path, board)))
    .with("Q", () => queenPaths(to).map(path => findOnPath(piece, path, board)))
    .with("K", () => kingSquares(to).concat(castleSquares(to)))
    .exhaustive()
    .filter(isTruthy)
    .filter(sqr => board[sqr] === piece)

  if (candidates.length === 0) {
    return err(`You have no ${PIECE_NAMES[pieceName]} on ${from}.`)
  }
  if (candidates.length === 1 && !(pieceName === "" && takes)) {
    return ok(`${pieceName}${takes}${to}${promoted}` as AlgebraicMove)
  }
  if (candidates.filter(candidate => candidate[0] === from[0]).length === 1) {
    return ok(`${pieceName}${from[0]}${takes}${to}${promoted}` as AlgebraicMove)
  }
  if (candidates.filter(candidate => candidate[1] === from[1]).length === 1) {
    return ok(`${pieceName}${from[1]}${takes}${to}${promoted}` as AlgebraicMove)
  }
  return ok(`${pieceName}${from}${takes}${to}${promoted}` as AlgebraicMove)
}

/**
 * Does the given move require specifying a promoted piece,
 * i.e. does a pawn reach the end of the board from its player's perspective?
 * */
export const requiresPromotion = ({ from, to }: MoveInput, board: Board) =>
  board[from]?.length === 1 && to[1] === (board[from] === "w" ? "8": "1")

/**
 * Validate a move given as user input against the current game state and
 * return an updated game state if the move is legal.
 */
export const applyMove = (
  { board, toMove, history, graveyard }: Game,
  { from, to, promotion }: MoveInput,
): Result<Game, string> => {
  let { [from]: piece, [to]: capture, ...remainingBoard } = board

  if (!piece) {
    return err(`There is no piece on ${from}.`)
  }
  if (piece[0] !== toMove) {
    return err(`It is ${toMove === "w" ? "white" : "black"}'s turn.`)
  }
  if (from === to) {
    return err("Nothing moved.")
  }
  if (capture && capture[0] === toMove) {
    return err("You can't capture your own piece.")
  }

  const opponent = toMove === "w" ? "b" : "w"
  const pieceName = (piece[1] ?? "") as Piece

  const fileDelta = to.charCodeAt(0) - from.charCodeAt(0)
  const rankDelta = to.charCodeAt(1) - from.charCodeAt(1)

  switch (pieceName) {
    case "": {
      const forwards = toMove === "w" ? 1 : -1
      if (fileDelta === 0) {
        if (rankDelta !== forwards) {
          if (rankDelta !== 2 * forwards) {
            return err("Pawns can only move forwards by one or two squares.")
          }
          if (from[1] !== (toMove === "w" ? "2" : "7")) {
            return err("Pawns can only move by two ranks on their first move.")
          }
          if (board[shift(0, forwards, from) as Square]) {
            return err("There is a piece in the way.")
          }
        }
        if (capture) {
          return err("Pawns can only capture diagonally.")
        }
      } else if (fileDelta === 1 || fileDelta === -1) {
        if (rankDelta !== forwards) {
          return err("Pawns can only move forwards by one or two squares.")
        }
        if (!capture) {
          const enPassantSquare = shift(fileDelta, 0, from) as Square
          capture = board[enPassantSquare]
          if (!capture) {
            return err("Pawns can only move diagonally when capturing.")
          }
          if (capture !== opponent) {
            return err("Pawns can only capture pawns en passant.")
          }
          const prev = history[history.length - 1]
          if (prev.to !== enPassantSquare || prev.from !== shift(0, 2 * forwards, enPassantSquare)) {
            return err("Pawns can only be captured en passant immediately after moving by two ranks on their first move.")
          }
          // @ts-ignore remainingBoard isn't empty
          delete remainingBoard[enPassantSquare]
        }
      } else {
        return err("Pawns can't move like that.")
      }
      if (to[1] === "1" || to[1] === "8") {
        if (!promotion) {
          return err("Promotion required")
        }
        if (!"QNRB".includes(promotion)) {
          return err(`Cannot promote to '${promotion}'`)
        }
        piece = `${toMove}${promotion}`
      }
      break
    }
    case "K": {
      if (Math.abs(rankDelta) > 1 || Math.abs(fileDelta) > 1) {
        if (from === (toMove === "w" ? "e1" : "e8") && rankDelta === 0) {
          // castling
          for (const square of range(from, to)) {
            if (board[square]) {
              return err("You can't castle on this side, there is a piece in the way.")
            }
          }
          if (isInCheck(toMove, board)) {
            return err("You can't castle while in check.")
          }
          const rank = from[1] as Rank
          const [kingTo, rookFrom, rookTo]: [Square, Square, Square] = fileDelta > 0
            ? [`g${rank}`, `h${rank}`, `f${rank}`]
            : [`c${rank}`, `a${rank}`, `d${rank}`]
          if (isAttacked(opponent, rookTo, board)) {
            return err("The king can't castle through check.")
            // Target square check will be validated at the end.
          }
          if (history.some(mv => mv.from === from)) {
            return err("You can no longer castle, your king has already moved.")
          }
          if (history.some(mv => mv.from === rookFrom)) {
            return err("You can no longer castle on this side, the rook has already moved.")
          }
          to = kingTo
          // @ts-ignore remainingBoard isn't empty
          remainingBoard[rookTo] = remainingBoard[rookFrom]
          // @ts-ignore remainingBoard isn't empty
          delete remainingBoard[rookFrom]
        } else {
          return err("The king can only move by on square.")
        }
      }
      break
    }
    case "N": {
      const dr = Math.abs(rankDelta)
      const df = Math.abs(fileDelta)
      if (!(df === 1 && dr === 2 || df === 2 && dr === 1)) {
        return err("Knights must move by 2/1 or 1/2.")
      }
      break
    }
    case "B":
    case "R":
    case "Q": {
      const isRookMove = rankDelta === 0 || fileDelta === 0
      const isBishopMove = Math.abs(rankDelta) === Math.abs(fileDelta)
      if (!(
        pieceName === "B" && isBishopMove
        || pieceName === "R" && isRookMove
        || pieceName === "Q" && (isBishopMove || isRookMove)
      )) {
        return err(`${PIECE_NAMES[pieceName]}s can only move in a straight line.`)
      }

      if (findBlockedSquare(board, from, to)) {
        return err(`There is a piece in the way.`)
      }
      break
    }
  }
  const newBoard = { ...remainingBoard, [to]: piece }
  if (isInCheck(toMove, newBoard)) {
    return err("You are in check.")
  }
  return toAlgebraic({ from, to, promotion }, board)
    .map(algebraic => ({
      board: newBoard,
      toMove: toMove === "w" ? "b": "w",
      history: [...history, { from, to, promotion, algebraic }],
      graveyard: capture ? [...graveyard, (capture as MortalColorPiece)] : graveyard,
    }))
}

/** Validate and apply an array of moves to a given game */
export const applyHistory = (game: Game, history: MoveInput[]): Result<Game> =>
  history.reduce((result, move) => result.flatMap(game => applyMove(game, move)), ok(game))

/** Re-create the given game up to a specific move. */
export const revertToMove = (idx: number, game: Game): Game =>
  applyHistory(START_GAME, game.history.slice(0, idx)).unwrap()
