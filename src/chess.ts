import { match } from "ts-pattern"

import { Result } from "./result"


export type File = "a" | "b" | "c" | "d" | "e" | "f" | "g" | "h"
export type Rank = "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8"
export type Piece = "K" | "Q" | "R" | "B" | "N"
export type PieceOrPawn = Piece | ""
export type Check = "" | "+" | "#"
export type Color = "w" | "b"

export type Square = `${File}${Rank}`
export type ColorPiece = `${Color}${""|Piece}`

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
  | `${Piece}${""|"x"}${Square}${Check}`
  | `${Piece}${File}${""|"x"}${Square}${Check}`
  | `${"N"|"B"|"R"|"Q"}${Rank}${""|"x"}${Square}${Check}`
  | `${"N"|"B"|"Q"}${Square}${""|"x"}${Square}${Check}`
  | "O-O${Check}"
  | "O-O-O${Check}"
  | `${File}${1|8}${""|"="}${Piece}${Check}`
  | `${File}x${File}${1|8}${""|"="}${Piece}${Check}`

export type Move = {
  // algebraic: string
  // piece: ColorPiece
  from: Square
  to: Square
  // capture?: ColorPiece
  promotion?: ColorPiece
  // check: bool
}

export type Game = Readonly<{
  board: Board
  history: Move[]
  toMove: Color
  canCastle: Readonly<{
    whiteLong: boolean
    whiteShort: boolean
    blackLong: boolean
    blackShort: boolean
  }>
}>

export const START_GAME: Game = Object.freeze({
  board: START_BOARD,
  history: [],
  toMove: "w",
  canCastle: Object.freeze({
    whiteLong: true,
    whiteShort: true,
    blackLong: true,
    blackShort: true,
  }),
})


export const squares: readonly Square[]
  = Array.from("abcdefgh").flatMap(
    file => Array.from("12345678",
      rank => `${file}${rank}` as Square,
    ),
  )


const shift = (fileDelta: number, rankDelta: number, square: Square): Square | undefined => {
  const a = 97  // char code for 'a'
  const file = +square[1] + fileDelta
  const rank = square.charCodeAt(0) - a + rankDelta
  if (0 > rank || rank > 7 || 0 > file || file > 7) {
    return undefined
  }
  return String.fromCharCode(rank + a) + file as Square
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

const findOnPath = (pieces: ColorPiece[], path: Iterable<Square>, board: Board) => {
  for (const square of path) {
    const piece = board[square]
    if (piece) {
      return pieces.includes(piece) ? square : undefined
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


export const isInCheck = (color: Color, board: Board) => {
  const opponent = color === "w" ? "b" : "w"
  const [king] = Object.entries(board)
    .find(([, piece]) => piece === `${color}K`) as unknown as [Square, Piece]
  return pawnCaptureSquares(color, king).some(square => board[square] === opponent)
      || knightSquares(king).some(square => board[square] === `${opponent}N`)
      || bishopPaths(king).some(path => findOnPath([`${opponent}B`, `${opponent}Q`], path, board))
      || rookPaths(king).some(path => findOnPath([`${opponent}R`, `${opponent}Q`], path, board))
      || kingSquares(king).some(square => board[square] === `${opponent}K`)
}


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

const PIECE_NAMES = {
  "K": "king",
  "Q": "queen",
  "R": "rook",
  "B": "bishop",
  "N": "knight",
  "": "pawn",
}


export const toAlgebraic = ({ from, to }: Move, board: Board): Result<AlgebraicMove, string> => {
  // TODO promotion
  const piece = board[from]
  if (!piece) {
    return Result.err(`There is no piece on ${from}`)
  }
  const color = piece[0] as Color
  const pieceName = piece.slice(1) as Piece|""
  const opponentPiece = board[to]
  let takes: "" | "x" = ""
  if (opponentPiece) {
    if (opponentPiece[0] === color) {
      return Result.err(`Can't take your own piece on ${to}`)
    }
    takes = "x"
  }
  const candidates = match(pieceName)
    .with("", () => pawnCaptureSquares(color, to))
    .with("N", () => knightSquares(to))
    .with("B", () => bishopPaths(to).map(path => findOnPath([piece], path, board)))
    .with("R", () => rookPaths(to).map(path => findOnPath([piece], path, board)))
    .with("Q", () => queenPaths(to).map(path => findOnPath([piece], path, board)))
    .with("K", () => kingSquares(to))
    .exhaustive()
    .filter(sqr => sqr && board[sqr] === piece) as Square[]

  if (candidates.length === 0) {
    return Result.err(`You have no ${PIECE_NAMES[pieceName]} on ${from}`)
  }
  if (candidates.length > 1) {

  }
  return Result.of(`${pieceName}${from}${takes}${to}`)
}


export const applyMove = (
  { from, to, promotion }: Move,
  {
    board,
    board: { [from]: piece, [to]: capture, ...remainingBoard },
    toMove,
    history,
    canCastle,
  }: Game,
): Result<Game, string> => {
  if (!piece) {
    return Result.err(`There is no piece on ${from}`)
  }
  if (piece[0] !== toMove) {
    return Result.err(`It is ${toMove === "w" ? "white" : "black"}'s turn.`)
  }
  if (from === to) {
    return Result.err("Nothing moved.")
  }
  if (capture && capture[0] === toMove) {
    return Result.err("You can't capture your own piece.")
  }

  const opponent = toMove === "w" ? "b" : "w"
  const pieceName = (piece[1] ?? "") as PieceOrPawn

  const fileDelta = to.charCodeAt(0) - from.charCodeAt(0)
  const rankDelta = to.charCodeAt(1) - from.charCodeAt(1)

  switch (pieceName) {
    case "": {
      const forwards = toMove === "w" ? 1 : -1
      if (fileDelta === 0) {
        if (rankDelta !== forwards) {
          if (rankDelta === 2 * forwards) {
            if (from[0] !== (toMove === "w" ? "2" : "7")) {
              return Result.err("Pawns can only move by two ranks on their first move.")
            }
            if (board[shift(0, forwards, from) as Square]) {
              return Result.err("There is a piece in the way.")
            }
          }
          return Result.err("Pawns can only move forwards by one or two squares.")
        }
        if (capture) {
          return Result.err("Pawns can only capture diagonally.")
        }
      } else if (fileDelta === 1 || fileDelta === -1) {
        if (rankDelta !== forwards) {
          return Result.err("Pawns can only move forwards by one or two squares.")
        }
        if (!capture) {
          const enPassantSquare = shift(fileDelta, 0, from) as Square
          capture = board[enPassantSquare]
          if (!capture) {
            return Result.err("Pawns can only move diagonally when capturing.")
          }
          if (capture !== opponent) {
            return Result.err("Pawns can only capture pawns en passant.")
          }
          const prev = history[history.length - 1]
          if (prev.to !== enPassantSquare || prev.from !== shift(0, 2 * forwards, enPassantSquare)) {
            return Result.err("Pawns can only be captured en passant immediately after moving by two ranks on their first move.")
          }
          // @ts-ignore remainingBoard isn't empty
          delete remainingBoard[enPassantSquare]
        }
      } else {
        return Result.err("Pawns can't move like that.")
      }
      if (to[1] === "1" || to[1] === "8") {
        if (!promotion) {
          return Result.err("Promotion required")
        }
        piece = promotion
      }
      break
    }
    case "K": {
      if (Math.abs(rankDelta) > 1 || Math.abs(fileDelta) > 1) {
        return Result.err("The king can only move by on square.")
      }
      break
    }
    case "N": {
      const dr = Math.abs(rankDelta)
      const df = Math.abs(fileDelta)
      if (!(df === 1 && dr === 2 || df === 2 && dr === 1)) {
        return Result.err("Knights must move by 2/1 or 1/2.")
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
        return Result.err(`${PIECE_NAMES[pieceName]}s can only move in a straight line.`)
      }

      if (findBlockedSquare(board, from, to)) {
        return Result.err(`There is a piece in the way.`)
      }
      break
    }
  }

  return Result.of({
    board: { ...remainingBoard, [to]: piece },
    toMove: toMove === "w" ? "b": "w",
    history: [...history, { from, to, promotion }],
    canCastle,
  })
}

// export const executeMove = ({ from, to }: Move, { [from]: piece, ...board }: Board): Board =>
//   ({ ...board, [to]: piece })

// export const applyMove = (index: number, move: Move, board: Board): Result<Board, string> => {
//   const color = index % 2 ? "w" : "b"

//   if (/^[a-h][1-8][+#]?$/.test(move)) {
//     const [file, rank, check] = move as unknown as [File, Rank, Check?]
//     const square: Square = `${file}${rank}`
//     // TODO
//   }

//   if (/^[a-h]x[a-h][1-8][+#]?$/.test(move)) {
//     const [from, file, rank, check] = move as unknown as [File|Rank, File, Rank, Check?]
//     const square: Square = `${file}${rank}`
//     // TODO
//   }

//   if (/^[KQRBN][a-h][1-8][+#]?$/.test(move)) {
//     const [piece, file, rank, check] = move as unknown as [Piece, File, Rank, Check?]
//     const square: Square = `${file}${rank}`
//     switch (piece) {
//       case "N": {
//         const candidates = knightSquares(square).filter(sqr => board[sqr] === `${color}N`)
//         if (candidates.length === 0) {
//           return Result.err(`No knight in range of ${square}`)
//         }
//         if (candidates.length > 1) {
//           return Result.err(`There are multiple knights in range of ${square}`)
//         }
//         return Result.of(executeMove(candidates[0], square, board))
//       }
//       case "B":  // TODO
//       case "R":  // TODO
//       case "Q":  // TODO
//       case "K":  // TODO
//         return Result.err("NOT IMPLEMENTED")
//     }
//   }

//   if (/^[KQRBN][a-h1-8][a-h][1-8][+#]?$/.test(move)) {
//     const [piece, from, file, rank, check] = move as unknown as [Piece, File|Rank, File, Rank, Check?]
//     const square: Square = `${file}${rank}`
//     switch (piece) {
//       case "N": {
//         const candidates = knightSquares(square).filter(sqr => sqr.includes(from) && board[sqr] === `${color}N`)
//         if (candidates.length === 0) {
//           return Result.err(appendFrom(from, `No knight in range of ${square}`))
//         }
//         if (candidates.length > 1) {
//           return Result.err(appendFrom(from, `There are multiple knights in range of ${square}`))
//         }
//         return Result.of(executeMove(candidates[0], square, board))
//       }
//       case "B":  // TODO
//       case "R":  // TODO
//       case "Q":  // TODO
//       case "K":  // TODO
//     }
//   }

//   if (/^[KQRBN]x[a-h][1-8][+#]?$/.test(move)) {
//     const [piece, file, rank, check] = move as unknown as [Piece, File, Rank, Check?]
//     const square: Square = `${file}${rank}`
//     const target = board[square]
//     if (target === undefined) {
//       return Result.err(`There is no piece on ${square}`)
//     }
//     if (target[0] === color) {
//       return Result.err(`Can't take your own piece on ${square}`)
//     }
//     return applyMove(index, `${piece}${square}${check || ""}`, board)
//   }

//   if (/^[KQRBN][a-h1-8]x[a-h][1-8][+#]?$/.test(move)) {
//     const [piece, from, file, rank, check] = move as unknown as [Piece, File|Rank, File, Rank, Check?]
//     const square: Square = `${file}${rank}`
//     const target = board[square]
//     // TODO
//   }

//   if (/^O-O[+#]?$/.test(move)) {
//     const [check] = move as unknown as [Check?]
//     // TODO
//   }

//   if (/^O-O-O[+#]?$/.test(move)) {
//     const [check] = move as unknown as [Check?]
//     // TODO
//   }

//   if (/^[a-h][1-8]=?[KQRBN][+#]?$/.test(move)) {
//     const [file, rank, piece, check] = move as unknown as [File, Rank, Piece, Check?]
//     const square: Square = `${file}${rank}`
//     // TODO
//   }

//   if (/^[a-h]x[a-h][1-8]=?[KQRBN][+#]?$/.test(move)) {
//     const [from, file, rank, piece, check] = move as unknown as [File, File, Rank, Piece, Check?]
//     const square: Square = `${file}${rank}`
//     // TODO
//   }

//   return Result.err(`Invalid move notation '${move}'`)
// }



// export const replay = (moves: Game) =>
//   moves.reduce(
//     (result, move, idx) => result.flatMap(board => applyMove(idx, move, board)),
//     Result.of<Board, string>(START_BOARD),
//   )
