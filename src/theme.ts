export type PieceTheme =
  | { type: "font", name: string, scale: number }
  | { type: "svg", name: string, scale: number }

export type BoardTheme = {
  lightBackground: string,
  darkBackground: string,
  selectedLightBackground: string,
  selectedDarkBackground: string,
}

export type Theme = {
  pageBackground: string
  board: BoardTheme
  pieces: PieceTheme
}

export const lichessBoard: BoardTheme = {
  lightBackground: "#f0d9b5",
  darkBackground: "#b58863",
  selectedLightBackground: "#ced26b",
  selectedDarkBackground: "#aba23a",
}

export const chessComBoard: BoardTheme = {
  lightBackground: "#e9edcc",
  darkBackground: "#779954",
  selectedLightBackground: "#f4f67e",
  selectedDarkBackground: "#bbcc43",
}

export const cyanBoard: BoardTheme = {
  lightBackground: "#9ee",
  darkBackground: "#488",
  selectedLightBackground: "#dda",
  selectedDarkBackground: "#885",
}

export const fontPieces: PieceTheme = { type: "font", name: "serif", scale: 1.1 }

export const classicPieces: PieceTheme = { type: "svg", name: "classic", scale: 1 }
