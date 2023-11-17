import { writable } from "svelte/store"

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

export type Settings = {
  layout: LayoutPerspective[]
  theme: Theme

  useTimeControl: boolean
  clock: ClockSettings

  showCoordinates: boolean
  showHistory: boolean
  showGraveyards: boolean
  // minimal: boolean
}

export const boardThemes: ReadonlyArray<BoardTheme> = [
  {
    _name: "lichess",
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
    _name: "chessCom",
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
    _name: "cyan",
    lightBackground: "#9ee",
    darkBackground: "#488",
    selectedLightBackground: "#dda",
    selectedDarkBackground: "#885",
    lastMoveLightBackground: "#dda",
    lastMoveDarkBackground: "#885",
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

export const settings = writable<Settings>({
  showCoordinates: true,
  showHistory: true,
  showGraveyards: true,
  useTimeControl: false,
  clock: { secondsPerSide: 5 * 60, increment: 3 },
  layout: [
    // Assume that any touchscreen is a mobile device placed in between players
    {
      asWhite: false,
      rotate: navigator.maxTouchPoints > 0 ? 180 : 0,
      flipOpponentPieces: false,
    },
    {
      asWhite: true,
      rotate: 0, flipOpponentPieces: false,
      flipOpponentPieces: false,
    },
  ],
  theme: {
    pageBackground: "#222",
    board: boardThemes[0],
    pieces: { name: "classic", scale: 1 },
  },
})
