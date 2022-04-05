import { match } from "ts-pattern"

import { Result } from "./result"


export type File = "a" | "b" | "c" | "d" | "e" | "f" | "g" | "h"
export type Rank = "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8"
export type Piece = "K" | "Q" | "R" | "B" | "N"
export type Check = "+" | "#"
export type Color = "w" | "b"

export type Square = `${File}${Rank}`
export type ColorPiece = `${Color}${""|Piece}`

export type Board = Partial<Record<Square, ColorPiece>>

export type Move
  = `${Square}`
  | `${File}${Square}`
  | `${Piece}${Square}`
  | `${Piece}x${Square}`
  | `${Piece}${File|Rank}${Square}`
  | `${Piece}${File|Rank}x${Square}`
  | "O-O"
  | "O-O-O"
  | `${File}${"1"|"8"}${Piece}`
  | `${File}${"1"|"8"}=${Piece}`
  | `${File}x${File}${"1"|"8"}${Piece}`
  | `${File}x${File}${"1"|"8"}=${Piece}`

export type Game = Move[]


export const squares: readonly Square[]
  = Array.from("abcdefgh").flatMap(rank => Array.from("12345678").map(file => rank + file as Square))

export const startBoard: Board = {
  a8: "bR", b8: "bN", c8: "bB", d8: "bQ", e8: "bK", f8: "bB", g8: "bN", h8: "bR",
  a7: "b", b7: "b", c7: "b", d7: "b", e7: "b", f7: "b", g7: "b", h7: "b",
  a2: "w", b2: "w", c2: "w", d2: "w", e2: "w", f2: "w", g2: "w", h2: "w",
  a1: "wR", b1: "wN", c1: "wB", d1: "wQ", e1: "wK", f1: "wB", g1: "wN", h1: "wR",
}


const pawnMovePattern
  = /^(?<square>[a-h][1-8])(?<check>[+#])?$/
type PawnMove = { square: Square, check?: Check }

const pawnCapturePattern
  = /^(?<from>[a-h])x(?<square>[a-h][1-8])(?<check>[+#])?$/
type PawnCapture = { from: File, square: Square, check?: Check }

const pieceMovePattern
  = /^(?<piece>[KQRBN])(?<from>[a-h1-8])?(?<square>[a-h][1-8])(?<check>[+#])?$/
type PieceMove = { piece: Piece, from?: Rank | File, square: Square, check?: Check }

const pieceCapturePattern
  = /^(?<piece>[KQRBN])(?<from>[a-h1-8])?x(?<square>[a-h][1-8])(?<check>[+#])?$/
type PieceCapture = { square: Square, check?: Check }

const castleShortPattern
  = /^O-O(?<check>[+#])?$/
type CastleShort = { check?: Check }

const castleLongPattern
  = /^O-O-O(?<check>[+#])?$/
type CastleLong = { check?: Check }

const promotePattern
  = /^(?<square>[a-h][1-8])=?(?<piece>[KQRBN])(?<check>[+#])?$/
type Promote = { square: Square, piece: Piece, check?: Check }

const promoteCapturePattern
  = /^(?<from>[a-h])x(?<square>[a-h][1-8])=?(?<piece>[KQRBN])(?<check>[+#])?$/
type PromoteCapture = { from: Rank, square: Square, piece: Piece, check?: Check }


const nth = (n: Rank) =>
  match(n)
    .with("1", () => "1st")
    .with("2", () => "2nd")
    .with("3", () => "3rd")
    .otherwise(n => n + "th")

const appendFrom = (from: undefined | File | Rank, msg: string): string => {
  if (!from) {
    return msg
  }
  if ("12345678".includes(from)) {
    return `${msg} from the ${nth(from as Rank)} rank`
  }
  if ("abcdefgh".includes(from)) {
    return `${msg} from the ${from} file`
  }
  return msg  // should not happen
}

export const applyMove = (index: number, move: Move, board: Board): Result<Board, string> => {
  const color = index % 2 ? "w" : "b"

  let match: RegExpExecArray | null
  if (match = pawnMovePattern.exec(move)) {
    const { square, check } = match.groups as PawnMove
    // TODO
  } else if (match = pawnCapturePattern.exec(move)) {
    const { from, square, check } = match.groups as PawnCapture
    // TODO
  } else if (match = pieceMovePattern.exec(move)) {
    const { piece, from, square, check } = match.groups as PieceMove
    switch (piece) {
      case "N": {
        let candidates = knightTargets(square)
        if (candidates.length === 0) {
          return Result.err(`Invalid move ${move}: No knight in range of ${square}`)
        }
        if (candidates.length === 1) {
          if (from && !candidates[0].includes(from)) {
            return Result.err(appendFrom(from, `Invalid move ${move}: No knight in range of ${square}`))
          }
          return Result.of(executeMove(`${color}${piece}`, candidates[0], square, board))
        }
        if (!from) {
          return Result.err(`Invalid move {$move}: There are multiple knights in range of ${square}`)
        }
        candidates = candidates.filter(sqr => sqr.includes(from))
        if (candidates.length === 0) {
          return Result.err(appendFrom(from, `Invalid move ${move}: No knights in range of ${square}`))
        }
        if (candidates.length > 1) {
          return Result.err(appendFrom(from, `Invalid move {$move}: There are multiple knights in range of ${square}`))
        }
        return Result.of(executeMove(`${color}${piece}`, candidates[0], square, board))
      }
      case "B":  // TODO
      case "R":  // TODO
      case "Q":  // TODO
      case "K":  // TODO
    }
  } else if (match = pieceCapturePattern.exec(move)) {
    const { square, check } = match.groups as PieceCapture
    // TODO
  } else if (match = castleShortPattern.exec(move)) {
    const { check } = match.groups as CastleShort
    // TODO
  } else if (match = castleLongPattern.exec(move)) {
    const { check } = match.groups as CastleLong
    // TODO
  } else if (match = promotePattern.exec(move)) {
    const { square, piece, check } = match.groups as Promote
    // TODO
  } else if (match = promoteCapturePattern.exec(move)) {
    const { from, square, piece, check } = match.groups as PromoteCapture
    // TODO
  }
  return Result.err(`Invalid move notation '${move}'`)
}

const executeMove = (piece: ColorPiece, from: Square, to: Square, { [from]: _, ...board }: Board): Board =>
  ({ ...board, [to]: piece })

export const replay = (moves: Game) =>
  moves.reduce(
    (result, move, idx) => result.flatMap(board => applyMove(idx, move, board)),
    Result.of<Board, string>(startBoard),
  )


const shift = (rankDelta: number, fileDelta: number, square: Square): Square | null => {
  const a = 97  // char code for 'a'
  const rank = square.charCodeAt(0) - a + rankDelta
  const file = +square[1] + fileDelta
  if (0 > rank || rank > 7 || 0 > file || file > 7) {
    return null
  }
  return String.fromCharCode(rank + a) + file as Square
}

const knightTargets = (square: Square): Square[] =>
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

const bishopTargets = (square: Square): Square[] => {
  const targets: Square[] = []
  let target: Square | null
  for (let i = 1 ; target = shift(+i, +i, square) ; ++i) {
    targets.push(target)
  }
  for (let i = 1 ; target = shift(+i, -i, square) ; ++i) {
    targets.push(target)
  }
  for (let i = 1 ; target = shift(-i, +i, square) ; ++i) {
    targets.push(target)
  }
  for (let i = 1 ; target = shift(-i, -i, square) ; ++i) {
    targets.push(target)
  }
  return targets
}

const rookTargets = (square: Square): Square[] => {
  const targets: Square[] = []
  let target: Square | null
  for (let i = 1 ; target = shift(+i, 0, square) ; ++i) {
    targets.push(target)
  }
  for (let i = 1 ; target = shift(-i, 0, square) ; ++i) {
    targets.push(target)
  }
  for (let i = 1 ; target = shift(0, +i, square) ; ++i) {
    targets.push(target)
  }
  for (let i = 1 ; target = shift(0, -i, square) ; ++i) {
    targets.push(target)
  }
  return targets
}

const queenTargets = (square: Square): Square[] =>
  [...rookTargets(square), ...bishopTargets(square)]

const kingTargets = (square: Square): Square[] =>
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

