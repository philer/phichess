export type PieceTheme = { name: string, scale: number }

export type BoardTheme = {
  lightBackground: string,
  darkBackground: string,
  selectedLightBackground: string,
  selectedDarkBackground: string,
  lastMoveLightBackground: string,
  lastMoveDarkBackground: string,
  checkLightBackground: string,
  checkDarkBackground: string,
}

export type Theme = {
  pageBackground: string
  board: BoardTheme
  pieces: PieceTheme
}

export const lichessBoard: BoardTheme = {
  lightBackground: "#f0d9b5",
  darkBackground: "#b58863",
  selectedLightBackground: "#819669",
  selectedDarkBackground: "#646d40",
  lastMoveLightBackground: "#ced26b",
  lastMoveDarkBackground: "#aba23a",
  checkLightBackground: "#ffa9a5",
  checkDarkBackground: "#d56853",
}

export const chessComBoard: BoardTheme = {
  lightBackground: "#e9edcc",
  darkBackground: "#779954",
  selectedLightBackground: "#f4f67e",
  selectedDarkBackground: "#bbcc43",
  lastMoveLightBackground: "#f4f67e",
  lastMoveDarkBackground: "#bbcc43",
  checkLightBackground: "#e9edcc",
  checkDarkBackground: "#779954",
}

export const cyanBoard: BoardTheme = {
  lightBackground: "#9ee",
  darkBackground: "#488",
  selectedLightBackground: "#dda",
  selectedDarkBackground: "#885",
  lastMoveLightBackground: "#dda",
  lastMoveDarkBackground: "#885",
  checkLightBackground: "#daa",
  checkDarkBackground: "#855",
}

export const classicPieces: PieceTheme = { type: "svg", name: "classic", scale: 1 }
