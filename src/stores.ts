import { type Writable, writable } from "svelte/store"

import { applyHistory, START_GAME } from "./chess"
import { DEFAULT_SETTINGS, type Settings } from "./settings"
import { identity } from "./util"


export const persisted = <T, C = T>(
  key: string,
  initialValue: T,
  encode: ((value: T) => C) = identity as ((value: T) => C),
  decode: ((encoded: C) => T) = identity as ((encoded: C) => T),
): Writable<T> => {
  const stored = localStorage.getItem(key)
  let storedInit: T | undefined = undefined
  if (stored) {
    try {
      storedInit = decode(JSON.parse(stored))
    } catch (e) {
      console.error(`Failed to decode value from localStorage key '${key}':`, e)
    }
  }
  const store = writable<T>(storedInit ?? initialValue)
  store.subscribe(value => {
    localStorage.setItem(key, JSON.stringify(encode(value)))
  })
  return store
}


export const settings = persisted<Settings>("settings", DEFAULT_SETTINGS)


export const game = persisted(
  "game",
  START_GAME,
  // TODO store only algebraic
  game => game.history,
  history => applyHistory(START_GAME, history).unwrap(),
)
