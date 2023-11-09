<script context="module" lang="ts">
  import {
    mdiClockTimeEightOutline,
    mdiClockTimeElevenOutline,
    mdiClockTimeFiveOutline,
    mdiClockTimeFourOutline,
    mdiClockTimeNineOutline,
    mdiClockTimeOneOutline,
    mdiClockTimeSevenOutline,
    mdiClockTimeSixOutline,
    mdiClockTimeTenOutline,
    mdiClockTimeThreeOutline,
    mdiClockTimeTwelveOutline,
    mdiClockTimeTwoOutline,
    mdiPause,
  } from "@mdi/js"
  import { getContext, setContext } from "svelte"
  import { type Readable, readonly, writable } from "svelte/store"

  import type { Color } from "./chess"
  import Icon from "./Icon.svelte"

  export type ClockState = Readonly<{
    running: boolean
    toMove: Color
    lastUpdatedAt: number
    remaining: Record<Color, number>
  }>

  export type ClockControls = Readonly<{
    /** Hit the clock after making a move */
    update: (toMove: Color) => void
    /** Reset the clock */
    stop: () => void
  }>

  export const makeClock = (secondsPerSide: number, increment: number): ClockControls => {
    const initialClockState: ClockState = {
      running: false,
      toMove: "w",
      lastUpdatedAt: 0,
      remaining: { w: secondsPerSide, b: secondsPerSide },
    }

    const store = writable(initialClockState)
    setContext("clock", readonly(store))

    let frameRequestId: number = 0

    const tick = (now: number) => store.update(({ remaining, lastUpdatedAt, ...state }) => {
      if (!state.running) return { remaining, lastUpdatedAt, ...state }
      const remainder = Math.max(0, remaining[state.toMove] - (now - lastUpdatedAt) / 1000)
      if (remainder > 0) {
        frameRequestId = requestAnimationFrame(tick)
      }
      return { ...state, lastUpdatedAt: now, remaining: { ...remaining, [state.toMove]: remainder } }
    })

    const stop = () => {
      store.set(initialClockState)
      if (frameRequestId) {
        cancelAnimationFrame(frameRequestId)
        frameRequestId = 0
      }
    }
    const update = (toMove: Color) => {
      store.update(({ running, remaining, lastUpdatedAt, ...state }) => {
        if (toMove !== state.toMove) {
          if (!frameRequestId) {
            frameRequestId = requestAnimationFrame(tick)
          }
          const now = performance.now()
          return {
            ...state,
            running: true,
            toMove: toMove,
            lastUpdatedAt: now,
            remaining: running
              ? {
                ...remaining,
                [toMove]: Math.max(0, remaining[toMove] - (now - lastUpdatedAt) / 1000 + increment),
              }
              : remaining,
          }
        } else {
          return { running, remaining, lastUpdatedAt, ...state }
        }
      })
    }
    return { update, stop }
  }

  const doubleDigit = (x: number) => Math.floor(x).toString().padStart(2, "0")
  const clockIcons = [
    mdiClockTimeOneOutline,
    mdiClockTimeTwoOutline,
    mdiClockTimeThreeOutline,
    mdiClockTimeFourOutline,
    mdiClockTimeFiveOutline,
    mdiClockTimeSixOutline,
    mdiClockTimeSevenOutline,
    mdiClockTimeEightOutline,
    mdiClockTimeNineOutline,
    mdiClockTimeTenOutline,
    mdiClockTimeElevenOutline,
    mdiClockTimeTwelveOutline,
  ].reverse()
</script>

<script lang="ts">

  export let forColor: Color
  const clock = getContext<Readable<ClockState>>("clock")
  $: seconds = $clock.remaining[forColor]
  $: running = $clock.running && $clock.toMove === forColor
</script>

<div class="clock" class:running>
  {#if running}
    <Icon path={clockIcons[Math.floor(seconds % 12)]} />
  {:else}
    <Icon path={mdiPause} />
  {/if}
  <span>
  {#if seconds < 10}
    {seconds.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
  {:else if seconds < 3600}
    {Math.floor(seconds / 60)}:{doubleDigit(seconds % 60)}
  {:else}
    {Math.floor(seconds / 3600)}:${doubleDigit(seconds % 3600 / 60)}:{doubleDigit(seconds % 60)}
  {/if}</span>
</div>

<style lang="scss">
  .clock {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: .33em;
    padding: .2em .33em;

    font-weight: bold;
    background: #0008;
    border: 1px solid #fff4;
    border-radius: 3px;
    color: #fffa;
    &.running {
      color: white;
    }
  }
</style>
