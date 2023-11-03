export type PieceTheme =
  | { type: "font" }
  | { type: "svg", name: "classic" }

export type BoardTheme = {
  whiteBackground: string,
  blackBackground: string,
  selectedWhiteBackground: string,
  selectedBlackBackground: string,
}

export type Theme = {
  pageBackground: string
  board: BoardTheme
  pieces: PieceTheme
}

export const lichessBoard: BoardTheme = {
  whiteBackground: "#f0d9b5",
  blackBackground: "#b58863",
  selectedWhiteBackground: "#ced26b",
  selectedBlackBackground: "#aba23a",
}

export const chessComBoard: BoardTheme = {
  whiteBackground: "#e9edcc",
  blackBackground: "#779954",
  selectedWhiteBackground: "#f4f67e",
  selectedBlackBackground: "#bbcc43",
}

export const cyanBoard: BoardTheme = {
  whiteBackground: "#9ee",
  blackBackground: "#488",
  selectedWhiteBackground: "#dda",
  selectedBlackBackground: "#885",
}

export const fontPieces: PieceTheme = { type: "font" }

export const classicPieces: PieceTheme = { type: "svg", name: "classic" }
