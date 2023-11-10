import { writable } from "svelte/store"

export type LayoutPerspective = { asWhite: boolean, autoflip?: boolean }

export type ClockSettings = {  // TODO "TimeFormat"?
  secondsPerSide: number
  increment: number
}

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

export const clockPresets: ReadonlyArray<ClockSettings> = [
  { secondsPerSide: 30 * 60, increment: 10 },
  { secondsPerSide: 30 * 60, increment: 0 },
  { secondsPerSide: 10 * 60, increment: 10 },
  { secondsPerSide: 10 * 60, increment: 0 },
  { secondsPerSide: 5 * 60, increment: 3 },
  { secondsPerSide: 5 * 60, increment: 1 },
  { secondsPerSide: 5 * 60, increment: 0 },
  { secondsPerSide: 3 * 60, increment: 2 },
  { secondsPerSide: 3 * 60, increment: 1 },
  { secondsPerSide: 3 * 60, increment: 0 },
  { secondsPerSide: 2 * 60, increment: 1 },
  { secondsPerSide: 2 * 60, increment: 0 },
  { secondsPerSide: 1 * 60, increment: 1 },
  { secondsPerSide: 1 * 60, increment: 0 },
]

export const boardThemePresets: ReadonlyArray<BoardTheme> = [
  { // lichess
    lightBackground: "#f0d9b5",
    darkBackground: "#b58863",
    selectedLightBackground: "#819669",
    selectedDarkBackground: "#646d40",
    lastMoveLightBackground: "#ced26b",
    lastMoveDarkBackground: "#aba23a",
    checkLightBackground: "#ffa9a5",
    checkDarkBackground: "#d56853",
  },
  { // chess.com
    lightBackground: "#e9edcc",
    darkBackground: "#779954",
    selectedLightBackground: "#f4f67e",
    selectedDarkBackground: "#bbcc43",
    lastMoveLightBackground: "#f4f67e",
    lastMoveDarkBackground: "#bbcc43",
    checkLightBackground: "#e9edcc",
    checkDarkBackground: "#779954",
  },
  { // cyan
    lightBackground: "#9ee",
    darkBackground: "#488",
    selectedLightBackground: "#dda",
    selectedDarkBackground: "#885",
    lastMoveLightBackground: "#dda",
    lastMoveDarkBackground: "#885",
    checkLightBackground: "#daa",
    checkDarkBackground: "#855",
  },
]

export const settings = writable<Settings>({
  showCoordinates: true,
  showHistory: true,
  showGraveyards: true,
  useTimeControl: false,
  clock: { secondsPerSide: 5 * 60, increment: 3 },
  layout: [
    { asWhite: true },
    // { asWhite: false },
  ],
  theme: {
    pageBackground: "#222",
    board: boardThemePresets[0],
    pieces: { name: "classic", scale: 1 },
  },
})
