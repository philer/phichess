import { match } from "ts-pattern"

import { err, ok, type Result } from "./result"
import { isTruthy, pairs } from "./util"

const { abs, floor, min, sign } = Math
const ASCII_a = "a".charCodeAt(0)
const ASCII_1 = "1".charCodeAt(0)

export type File = "a" | "b" | "c" | "d" | "e" | "f" | "g" | "h"
export type Rank = "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8"
export type Piece = "" | "K" | "Q" | "R" | "B" | "N"
export type PieceNotPawn = Exclude<Piece, "">
export type MortalPiece = Exclude<Piece, "K">
export type PromotablePiece = Exclude<Piece, "" | "K">
export type Check = "" | "+" | "#"
export type Color = "w" | "b"

export const invert = (color: Color) =>
  color === "w" ? "b" : "w"

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

export type MoveInput = {
  readonly from: Square
  readonly to: Square
  readonly promotion?: PromotablePiece
  readonly capture?: ColorPiece
}

export type Move = MoveInput & {
  readonly check: boolean
  readonly mate: boolean
  readonly algebraic: AlgebraicMove
}

export type Outcome = Color | "draw"

export type Termination =
  | "checkmate"
  | "time"
  | "stalemate"
  | "repetition"
  | "fifty-moves"
  | "insufficient"
  // | "blocked"
  | "agreement"

export type GameInput = {
  readonly board: Board
  readonly toMove: Color
  readonly history: readonly MoveInput[]
}

export type Game = Omit<GameInput, "history"> & {
  readonly history: readonly Move[]
  readonly graveyard: readonly MortalColorPiece[]
  readonly fiftyMoveCounter: number
  readonly repetitions: Readonly<Record<string, number>>
  readonly outcome?: Color | "draw"
  readonly termination?: Termination
}

export const START_GAME: Game = Object.freeze({
  board: START_BOARD,
  toMove: "w",
  history: Object.freeze([]),
  graveyard: Object.freeze([]),
  fiftyMoveCounter: 0,
  repetitions: Object.freeze({}),
})


export const squares: readonly Square[] =
  Array.from("12345678")
    .flatMap(rank => Array.from("abcdefgh", file => `${file}${rank}` as Square))


export const getSquareColor = (square: Square): Color =>
  // Note: Char codes for 'a' -> 97 and '1' -> 49 are both odd.
  (square.charCodeAt(0) & 1) ^ (square.charCodeAt(1) & 1) ? "w" : "b"


const shift = (fileDelta: number, rankDelta: number, square: Square): Square | undefined => {
  const file = square.charCodeAt(0) - ASCII_a + fileDelta
  const rank = square.charCodeAt(1) - ASCII_1 + rankDelta
  if (0 > rank || rank > 7 || 0 > file || file > 7) {
    return undefined
  }
  return String.fromCharCode(file + ASCII_a) + String.fromCharCode(rank + ASCII_1) as Square
}

function* ray(fileStep: -1|0|1, rankStep: -1|0|1, from: Square) {
  const fromFile = from.charCodeAt(0) - ASCII_a
  const fromRank = from.charCodeAt(1) - ASCII_1
  const limit = min(
    fileStep < 0 ? fromFile + 1 : 8 - fromFile * fileStep,
    rankStep < 0 ? fromRank + 1 : 8 - fromRank * rankStep,
  )
  for (let i = 1 ; i < limit ; ++i) {
    yield String.fromCharCode(fromFile + i * fileStep + ASCII_a)
        + String.fromCharCode(fromRank + i * rankStep + ASCII_1) as Square
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
  const delta = abs(fileDelta || rankDelta)
  const fileStep = sign(fileDelta)
  const rankStep = sign(rankDelta)
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
  ].filter(isTruthy)

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
  ].filter(isTruthy)

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
  ].filter(isTruthy)


const castleSquares = (square: Square): Square[] =>
  [
    shift(+2, 0, square),
    shift(-2, 0, square),
  ].filter(isTruthy)


export const isAttacked = (by: Color, square: Square, board: Board) =>
  pawnCaptureSquares(by, square).some(square => board[square] === by)
  || knightSquares(square).some(square => board[square] === `${by}N`)
  || bishopPaths(square).some(path => findOnPath(`${by}B`, path, board))
  || rookPaths(square).some(path => findOnPath(`${by}R`, path, board))
  || queenPaths(square).some(path => findOnPath(`${by}Q`, path, board))
  || kingSquares(square).some(square => board[square] === `${by}K`)

export const isInCheck = (color: Color, board: Board) =>
  isAttacked(
    invert(color),
    (Object.keys(board) as Square[]).find(square => board[square] === `${color}K`) as Square,
    board,
  )


const getAttackedSquaresOnRays = function*(toMove: Color, board: Board, rays: Iterable<Square>[]) {
  for (const path of rays) {
    for (const square of path) {
      if (board[square]) {
        if (board[square]![0] !== toMove) {
          yield square
        }
        break
      } else {
        yield square
      }
    }
  }
}

const withPromotions = (toMove: Color, { from, to }: MoveInput): MoveInput[] =>
  to[1] === (toMove === "w" ? "8" : "1")
    ? Array.from("QNRB" as Iterable<PromotablePiece>, promotion => ({ from, to, promotion }))
    : [{ from, to }]

const generateMoves = function*(from: Square, board: Board): Iterable<MoveInput> {
  const piece = board[from]
  if (!piece) {
    return
  }
  const toMove = piece[0] as Color
  switch (piece.slice(1)) {
    case "": {
      const forwards = toMove === "w" ? 1 : -1
      for (const fileDelta of [1, -1]) {
        const to = shift(fileDelta, forwards, from)
        if (to) {
          yield* withPromotions(toMove, { from, to })
        }
      }
      yield* withPromotions(toMove, { from, to: shift(0, forwards, from)! })
      if (from[1] === (toMove === "w" ? "2" : "7")) {
        yield { from, to: shift(0, 2 * forwards, from)! }
      }
      break
    }
    case "K": {
      yield* kingSquares(from).map(to => ({ from, to }))
      const rank = toMove === "w" ? 1 : 8
      if (from === `e${rank}`) {
        yield* Array.from("acgh" as Iterable<File>, file => ({ from, to: `${file}${rank}` }))
      }
      break
    }
    case "N":
      yield* knightSquares(from).map(to => ({ from, to }))
      break
    case "B":
      for (const to of getAttackedSquaresOnRays(toMove, board, bishopPaths(from))) {
        yield { from, to }
      }
      break
    case "R":
      for (const to of getAttackedSquaresOnRays(toMove, board, rookPaths(from))) {
        yield { from, to }
      }
      break
    case "Q":
      for (const to of getAttackedSquaresOnRays(toMove, board, queenPaths(from))) {
        yield { from, to }
      }
      break
  }
}

export const generateLegalMoves = function*(from: Square, game: GameInput): IterableIterator<MoveInput> {
  for (const move of generateMoves(from, game.board)) {
    yield* checkMove(game, move)
  }
}

export const generateAllLegalMoves = function*(game: GameInput): IterableIterator<MoveInput> {
  for (const [from, piece] of Object.entries(game.board) as [Square, ColorPiece][]) {
    if (piece[0] === game.toMove) {
      yield* generateLegalMoves(from, game)
    }
  }
}

export const hasLegalMoves = (game: GameInput) =>
  !generateAllLegalMoves(game).next().done

const PIECE_NAMES = {
  "K": "king",
  "Q": "queen",
  "R": "rook",
  "B": "bishop",
  "N": "knight",
  "": "pawn",
}

/** Generate algebraic notation for a legal move. */
export const toAlgebraic = (
  { from, to, promotion, capture, check, mate }: Omit<Move, "algebraic">,
  board: Board,
): Result<AlgebraicMove, string> => {
  const colorPiece = board[from]
  if (!colorPiece) {
    return err(`There is no piece on ${from}.`)
  }
  const color = colorPiece[0] as Color
  const piece = (colorPiece[1] ?? "") as Piece
  const checkSign = mate ? "#" : check ? "+" : ""

  // castling
  const fileDelta = to.charCodeAt(0) - from.charCodeAt(0)
  if (piece === "K" && abs(fileDelta) > 1) {
    return ok(`${fileDelta > 0 ? "O-O" : "O-O-O"}${checkSign}` satisfies AlgebraicMove)
  }

  const candidates = match(piece)
    .with("", () => capture ? pawnCaptureSquares(color, to) : [from])
    .with("N", () => knightSquares(to))
    .with("B", () => bishopPaths(to).map(path => findOnPath(colorPiece, path, board)))
    .with("R", () => rookPaths(to).map(path => findOnPath(colorPiece, path, board)))
    .with("Q", () => queenPaths(to).map(path => findOnPath(colorPiece, path, board)))
    .with("K", () => kingSquares(to).concat(castleSquares(to)))
    .exhaustive()
    .filter(isTruthy)
    .filter(square => board[square] === colorPiece)

  if (candidates.length === 0) {
    return err(`You have no ${PIECE_NAMES[piece]} on ${from}.`)
  }

  const suffix = `${capture ? "x" : ""}${to}${promotion ? `=${promotion}` : ""}${checkSign}`
  if (candidates.length === 1 && !(piece === "" && capture)) {
    return ok(`${piece}${suffix}` as AlgebraicMove)
  }
  if (candidates.filter(candidate => candidate[0] === from[0]).length === 1) {
    return ok(`${piece}${from[0]}${suffix}` as AlgebraicMove)
  }
  if (candidates.filter(candidate => candidate[1] === from[1]).length === 1) {
    return ok(`${piece}${from[1]}${suffix}` as AlgebraicMove)
  }
  return ok(`${piece}${from}${suffix}` as string as AlgebraicMove)
}

/**
 * Does the given move require specifying a promoted piece,
 * i.e. does a pawn reach the end of the board from its player's perspective?
 * */
export const requiresPromotion = ({ from, to }: MoveInput, board: Board) =>
  board[from]?.length === 1 && to[1] === (board[from] === "w" ? "8": "1")

/**
 * Validate a move given as user input against the current game state.
 */
const checkMove = (
  { board, toMove, history }: GameInput,
  { from, to, promotion }: MoveInput,
): Result<MoveInput, string> => {
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
  if (promotion && piece !== toMove) {
    return err(`Only pawns can be promoted.`)
  }

  const pieceName = (piece[1] ?? "") as Piece

  const fileDelta = to.charCodeAt(0) - from.charCodeAt(0)
  const rankDelta = to.charCodeAt(1) - from.charCodeAt(1)

  let isCastling = false
  let normalizedTo = to

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
          if (capture !== invert(toMove)) {
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
      if (to[1] === (toMove === "w" ? "8" : "1")) {
        if (!promotion) {
          return err("Promotion required")
        }
        if (!"QNRB".includes(promotion)) {
          return err(`Cannot promote to '${promotion}'`)
        }
        piece = `${toMove}${promotion}`
      } else if (promotion) {
        return err("The pawn has not reached the last rank and cannot promote.")
      }
      break
    }
    case "K": {
      if (abs(rankDelta) > 1 || abs(fileDelta) > 1) {
        if (from === (toMove === "w" ? "e1" : "e8") && rankDelta === 0) {
          // castling
          const rank = from[1] as Rank
          const [kingTo, rookFrom, rookTo]: [Square, Square, Square] = fileDelta > 0
            ? [`g${rank}`, `h${rank}`, `f${rank}`]
            : [`c${rank}`, `a${rank}`, `d${rank}`]
          if (findBlockedSquare(board, from, rookFrom)) {
            return err("You can't castle on this side, there is a piece in the way.")
          }
          const opponent = invert(toMove)
          if (isAttacked(opponent, from, board)) {
            return err("You can't castle while in check.")
          }
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
          isCastling = true
          normalizedTo = kingTo
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
      const dr = abs(rankDelta)
      const df = abs(fileDelta)
      if (!(df === 1 && dr === 2 || df === 2 && dr === 1)) {
        return err("Knights must move by 2/1 or 1/2.")
      }
      break
    }
    case "B":
    case "R":
    case "Q": {
      const isRookMove = rankDelta === 0 || fileDelta === 0
      const isBishopMove = abs(rankDelta) === abs(fileDelta)
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

  if (capture && capture[0] === toMove && !isCastling) {
    return err("You can't capture your own piece.")
  }

  const newBoard: Board = { ...remainingBoard, [normalizedTo]: piece }
  if (isInCheck(toMove, newBoard)) {
    return err("You are in check.")
  }
  return ok({ from, to, promotion, capture })
}


type Opt<T> = T | undefined

type PawnMoveMatch = [AlgebraicMove, Square, Opt<PromotablePiece>]
const PAWN_MOVE_PATTERN = /^([a-h][1-8])(?:=?([NBRQ]))?(?:\b|$)/

type PawnCaptureMatch = [AlgebraicMove, File, Square, Opt<PromotablePiece>]
const PAWN_CAPTURE_PATTERN = /^([a-h])x([a-h][1-8])(?:=?([NBRQ]))?(?:\b|$)/

type PieceMoveOrCaptureMatch = [AlgebraicMove, PieceNotPawn, Opt<File>, Opt<Rank>, Opt<"x">, Square]
const PIECE_MOVE_OR_CAPTURE_PATTERN = /^([NBRQK])([a-h])?([1-8])?(x)?([a-h][1-8])(?:\b|$)/

const CASTLING_PATTERN = /^[O0]-?[O0](-?[O0])?(?:\b|$)/i

/**
 * Decode a move given in algebraic notation and validate it against the current
 * game state.
 *
 * Details:
 * + Check/mate suffixes (+/#) are completely ignored
 * + Abbreviated pawn capture notation (e.g. 'de' or 'de5' for 'dxe5') is not
 *   (yet) supported.
 * + For piece moves, incorrect capture 'x' yields an error,
 *   while a missing 'x' is ignored.
 * + Surplus qualifying rank & file are accepted as long as they do not lead to
 *   contradiction.
 */
const decodeAlgebraicMove = (game: GameInput, algebraic: string): Result<MoveInput, string> => {
  const { board, toMove } = game
  const forwards = toMove === "w" ? 1 : -1
  let matchArray: RegExpMatchArray | null = null

  if (matchArray = PAWN_MOVE_PATTERN.exec(algebraic)) {
    const [_, to, promotion] = matchArray as PawnMoveMatch
    const singleStepFrom = shift(0, -forwards, to)
    if (singleStepFrom && board[singleStepFrom] === toMove) {
      return checkMove(game, { from: singleStepFrom, to, promotion })
    }
    const doubleStepFrom = shift(0, -2 * forwards, to)
    if (doubleStepFrom && board[doubleStepFrom] === toMove) {
      return checkMove(game, { from: doubleStepFrom, to, promotion })
    }
    return err(`There is no Pawn to move to ${to}.`)
  }

  if (matchArray = PAWN_CAPTURE_PATTERN.exec(algebraic)) {
    const [_, fromFile, to, promotion] = matchArray as PawnCaptureMatch
    const from = shift(0, -forwards, `${fromFile}${to[1] as Rank}`)
    if (!from) {
      return err(`There is no Pawn that can capture on ${to}.`)
    }
    return checkMove(game, { from, to, promotion })
  }

  if (matchArray = PIECE_MOVE_OR_CAPTURE_PATTERN.exec(algebraic)) {
    const [_, piece, file, rank, capture, to] = matchArray as PieceMoveOrCaptureMatch
    const colorPiece: ColorPiece = `${toMove}${piece}`
    if (capture && !board[to]) {
      return err(`There is nothing to capture on ${to}.`)
    }
    let candidates = match(piece)
      .with("N", () => knightSquares(to))
      .with("B", () => bishopPaths(to).map(path => findOnPath(colorPiece, path, board)))
      .with("R", () => rookPaths(to).map(path => findOnPath(colorPiece, path, board)))
      .with("Q", () => queenPaths(to).map(path => findOnPath(colorPiece, path, board)))
      .with("K", () => kingSquares(to).concat(castleSquares(to)))
      .exhaustive()
      .filter(isTruthy)
      .filter(square => board[square] === colorPiece)
    if (file) {
      candidates = candidates.filter(square => square[0] === file)
    }
    if (rank) {
      candidates = candidates.filter(square => square[1] === rank)
    }
    if (candidates.length > 1) {
      candidates = candidates.filter(square => checkMove(game, { from: square, to }).isOk())
    }
    return match(candidates.length)
      .returnType<Result<Square, string>>()
      .with(0, () => err(`No candidate ${PIECE_NAMES[piece]} found`))  // TODO details
      .with(1, () => ok(candidates[0]))
      .otherwise(() => err(`Ambiguous move: multiple ${PIECE_NAMES[piece]} could move to ${to}.`))
      .flatMap(from => checkMove(game, { from, to }))
  }

  if (matchArray = CASTLING_PATTERN.exec(algebraic)) {
    const rank = toMove === "w" ? "1" : "8"
    return checkMove(game, { from: `e${rank}`, to: `${matchArray[1] ? "c" : "g"}${rank}` })
  }

  return err(`'${algebraic}' is not a known move format.`)
}



/**
 * Determine which sides both players are still able to castle on,
 * in the "KQkq" notation defined by FEN.
 * @see https://en.wikipedia.org/wiki/Forsyth%E2%80%93Edwards_Notation#Definition
 */
const getCastlingFen = (history: readonly MoveInput[]) =>
  history.reduce((KQkq, { from }) =>
      match(from)
        .with("e1", () => KQkq.replace(/[KQ]/g, ""))
        .with("a1", () => KQkq.replace("Q", ""))
        .with("h1", () => KQkq.replace("K", ""))
        .with("e8", () => KQkq.replace(/[kq]/g, ""))
        .with("a8", () => KQkq.replace("q", ""))
        .with("h8", () => KQkq.replace("k", ""))
        .otherwise(() => KQkq),
      "KQkq",
    )

/**
 * Detect draw by insufficient material. This is a simple check if only two kings
 * or two kings with a single night or bishop remain.
 *
 * Note that there are other scenarios that could be considered an immediate
 * draw, such as a king with two knights vs. a lone king
 * or kings with one same colored bishop each. These are not covered here.
 */
const isInsufficientMaterial = (board: Board): boolean => {
  const pieces = Object.values(board).filter(piece => piece[1] !== "K")
  return pieces.length === 0 || pieces.length === 1 && "NB".includes(pieces[0][1])
}

/**
 * Validate a move given as user input against the current game state and
 * return an updated game state if the move is legal.
 * The updated game's history contains added details for the new move.
 */
export const applyMove = (game: Game, input: MoveInput | string): Result<Game, string> =>
  // @ts-ignore too complex, lol
  (typeof input === "string" ? decodeAlgebraicMove : checkMove)(game, input)
    .map(move => {
      const { board, toMove, graveyard } = game
      const { from, to, promotion, capture } = move
      const opponent = invert(toMove)
      const { [from]: piece, [to]: captureTarget, ...remainingBoard } = board

      const newBoard: Mutable<Board> = {
        ...remainingBoard,
        [to]: promotion ? `${toMove}${promotion}` : piece,
      }

      if (!captureTarget && capture === opponent) {
        // En passant pawn capture
        // @ts-ignore remainingBoard isn't empty
        delete newBoard[`${to[0]}${from[1]}`]
      }

      const rankDelta = to.charCodeAt(0) - from.charCodeAt(0)
      if (piece === `${toMove}K` && abs(rankDelta) > 1) {
        // Castling, move the rook & king
        const rank = to[1] as Rank
        if (rankDelta < 0) {  // queen side
          delete newBoard[to]
          delete newBoard[`a${rank}`]
          newBoard[`c${rank}`] = `${toMove}K`
          newBoard[`d${rank}`] = `${toMove}R`
        } else {  // king side
          delete newBoard[to]
          delete newBoard[`h${rank}`]
          newBoard[`g${rank}`] = `${toMove}K`
          newBoard[`f${rank}`] = `${toMove}R`
        }
      }

      const check = isInCheck(opponent, newBoard)
      const hasMoves = hasLegalMoves({
        board: newBoard,
        toMove: opponent,
        history: [...game.history, move],
      })
      const mate = check && !hasMoves
      const algebraic = toAlgebraic({ ...move, check, mate }, board).unwrap()
      const history = [...game.history, { ...move, check, mate, algebraic }]

      const fiftyMoveCounter = capture || piece === toMove ? 0 : game.fiftyMoveCounter + 1

      const position = [
          Object.entries(board).sort().flat().join(""),
          getCastlingFen(history),
          piece === toMove && abs(+from[1] - +to[1]) === 2 ? to : "",
        ].join(":")

      const repetitions = {
        ...game.repetitions,
        [position]: (game.repetitions[position] ?? 0) + 1,
      }

      const termination =
        mate ? "checkmate"
        : !hasMoves ? "stalemate"
        : repetitions[position] >= 3 ? "repetition"
        : fiftyMoveCounter >= 100 ? "fifty-moves"
        : isInsufficientMaterial(newBoard) ? "insufficient"
        : undefined

      return {
        board: newBoard,
        toMove: opponent,
        history,
        graveyard: capture ? [...graveyard, (capture as MortalColorPiece)] : graveyard,
        fiftyMoveCounter,
        repetitions,
        outcome: termination && (termination === "checkmate" ? toMove : "draw"),
        termination,
      }
    })


/** Validate and apply an array of moves to a given game */
export const applyHistory = (game: Game, history: readonly (MoveInput | string)[]) =>
  history.reduce(
    (result, move, idx) => result.isOk()
      ? result
          .flatMap(game => applyMove(game, move))
          .mapError(msg => `Move [${idx}] ${typeof move === "string" ? `'${move}'` : `${move.from}-${move.to}`} failed: ${msg}`)
      : result,
    ok<Game, string>(game),
  )

/** Re-create the given game up to a specific move. */
export const revertToMove = (idx: number, game: Game): Game =>
  applyHistory(START_GAME, game.history.slice(0, idx)).unwrap()


export const outcomeToString = (outcome?: Outcome, termination?: Termination) =>
  outcome
    ? (
      match(outcome)
        .with("w", () => "White wins")
        .with("b", () => "Black wins")
        .with("draw", () => "Draw")
        .exhaustive()
      + match(termination)
          .with("checkmate", () => " by checkmate.")
          .with("time", () => " on time.")
          .with("stalemate", () => " by stalemate")
          .with("insufficient", () => " by insufficient material")
          .with("repetition", () => " by threefold repetition")
          .with("fifty-moves", () => " by fifty-move rule")
          .with("agreement", () => " by agreement")
          .with(undefined, () => "")
          .exhaustive()
      )
    : "unterminated"


/**
 * Turn game state into Portable Game Notation (PGN)
 * @see https://en.wikipedia.org/wiki/Portable_Game_Notation
 */
export const toPGN = ({ history, outcome, termination }: Game): string => {
  const date = new Date().toISOString().slice(0, 10).replaceAll("-", ".")
  const result = match(outcome)
        .with("w", () => "1-0")
        .with("b", () => "0-1")
        .with("draw", () => "1/2-1/2")
        .with(undefined, () => "*")
        .exhaustive()
  const term = outcomeToString(outcome, termination)
  const moves = Array.from(
    pairs(history.map(move => move.algebraic)),
    (movePair, idx) => `${idx + 1}. ${movePair.join(" ")}`,
  )
  if (outcome) {
    moves.push(result)
  }
  return [
    `[Event "Live Chess"]`,
    `[Site "${window.location.href}"]`,
    `[Date "${date}"]`,
    `[Round "?"]`,
    `[White "?"]`,
    `[Black "?"]`,
    `[Result "${result}"]`,
    `[Termination "${term}"]`,
    // `[TimeControl "120+1"]`,
    // `[Time HH:MM:SS]`,
    // `[EndTime "3:38:57 PST"]`,
    // `[FEN "?"]`,
    "",
    moves.join(" "),
    "",
  ].join("\n")
}


/**
 * Parse a game given as string in Portable Game Notation (PGN).
 * Only moves are imported, all tags are ignored.
 */
export const parsePGN = (pgn: string): Result<Game, string> => {
  // Let's hope people aren't nesting the same type of brackets; or using 0-0 instead of O-O
  const clean = pgn.replace(/\[.*?\]|\{.*?\}|\(.*?\)|;.*$|\d+\.+|[012/½]+-[012/½]+/smg, "").trim()
  if (!clean) {
    return err("Found no moves in PGN.")
  }
  const moves = clean.split(/\s+/g)
  return applyHistory(START_GAME, moves)
}


/** Turn a ColorPiece into it's FEN eqivalent, e.g. 'wK' => 'K', 'b' => 'p' */
const pieceToFEN = ([color, piece]: ColorPiece) =>
  color === "w" ? piece || "P" : (piece || "p").toLowerCase()

/**
 * Turn game position into Forsyth–Edwards Notation (FEN)
 * @see https://en.wikipedia.org/wiki/Forsyth%E2%80%93Edwards_Notation
 */
export const toFEN = ({ board, toMove, history, fiftyMoveCounter }: Game): string => {
  const position = Array.from("87654321")
    .map(rank =>
      Array.from("abcdefgh", file => `${file}${rank}` as Square)
        .reduce(
          ({ row, empty }, square) => board[square]
            ? { row: `${row}${empty || ""}${pieceToFEN(board[square]!)}`, empty: 0 }
            : { row, empty: empty + 1 },
          { row: "", empty: 0 },
        ),
    )
    .map(({ row, empty }) => `${row}${empty || ""}`)
    .join("/")

  let enPassantSquare = "-"
  if (history.length) {
    const { from, to } = history[history.length - 1]
    if (board[to] === invert(toMove) && abs(+from[1] - +to[1]) === 2) {
      enPassantSquare = `${from[0]}${toMove === "w" ? 6 : 3}`
    }
  }
  return [
    position,
    toMove,
    getCastlingFen(history) || "-",
    enPassantSquare || "-",
    fiftyMoveCounter,
    floor(history.length / 2) + 1,
  ].join(" ")
}
