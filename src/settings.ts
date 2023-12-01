export type LayoutPerspective = {
  asWhite: boolean,
  rotate: 0 | 90 | 180 | 270,
  flipOpponentPieces: boolean,
}

export type ClockSettings = {  // TODO "TimeFormat"?
  secondsPerSide: number
  increment: number
}

export type PieceTheme = { name: string, scale: number }

export type BoardTheme = {
  _name: string,
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

export type Notation =
  | "algebraic"
  | "fancy_algebraic"

export type Settings = {
  showLegalMoves: boolean
  showCoordinates: boolean
  showHistory: boolean
  showBoardFrame: boolean
  showGraveyards: boolean
  notation: Notation

  useTimeControl: boolean
  clock: ClockSettings

  layout: LayoutPerspective[]
  theme: Theme
}

export const BOARD_THEMES: ReadonlyArray<Readonly<BoardTheme>> = [
  {
    _name: "brown",
    lightBackground: "#f0d9b5",
    darkBackground: "#b58863",
    selectedLightBackground: "#819669",
    selectedDarkBackground: "#646d40",
    lastMoveLightBackground: "#ced26b",
    lastMoveDarkBackground: "#aba23a",
    checkLightBackground: "#ffa9a5",
    checkDarkBackground: "#d56853",
  },
  {
    _name: "green",
    lightBackground: "#e9edcc",
    darkBackground: "#779954",
    selectedLightBackground: "#f4f67e",
    selectedDarkBackground: "#bbcc43",
    lastMoveLightBackground: "#f4f67e",
    lastMoveDarkBackground: "#bbcc43",
    checkLightBackground: "#e9edcc",
    checkDarkBackground: "#779954",
  },
  {
    _name: "teal",
    lightBackground: "#bee",
    darkBackground: "#588",
    selectedLightBackground: "#ada",
    selectedDarkBackground: "#585",
    lastMoveLightBackground: "#ada",
    lastMoveDarkBackground: "#585",
    checkLightBackground: "#daa",
    checkDarkBackground: "#855",
  },
  {
    _name: "grey",
    lightBackground: "#ccc",
    darkBackground: "#666",
    selectedLightBackground: "#bbb",
    selectedDarkBackground: "#777",
    lastMoveLightBackground: "#bbb",
    lastMoveDarkBackground: "#777",
    checkLightBackground: "#ccc",
    checkDarkBackground: "#666",
  },
] as const


export const DEFAULT_SETTINGS: Readonly<Settings> = Object.freeze({
  showLegalMoves: true,
  showCoordinates: true,
  showHistory: false,
  showBoardFrame: true,
  showGraveyards: true,
  notation: "fancy_algebraic",

  useTimeControl: false,
  clock: { secondsPerSide: 5 * 60, increment: 3 },

  layout: [
    // Assume that any touchscreen is a mobile device placed in between players
    {
      asWhite: false,
      rotate: navigator.maxTouchPoints > 0 ? 180 : 0,
      flipOpponentPieces: false,
    } as const,
    {
      asWhite: true,
      rotate: 0,
      flipOpponentPieces: false,
    } as const,
  ],

  theme: {
    pageBackground: "#222",
    board: BOARD_THEMES[0],
    pieces: { name: "classic", scale: 1 },
  },
})
