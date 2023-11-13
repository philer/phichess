<script context="module" lang="ts">
  import {
    mdiClockTimeEight,
    mdiClockTimeEightOutline,
    mdiClockTimeEleven,
    mdiClockTimeElevenOutline,
    mdiClockTimeFive,
    mdiClockTimeFiveOutline,
    mdiClockTimeFour,
    mdiClockTimeFourOutline,
    mdiClockTimeNine,
    mdiClockTimeNineOutline,
    mdiClockTimeOne,
    mdiClockTimeOneOutline,
    mdiClockTimeSeven,
    mdiClockTimeSevenOutline,
    mdiClockTimeSix,
    mdiClockTimeSixOutline,
    mdiClockTimeTen,
    mdiClockTimeTenOutline,
    mdiClockTimeThree,
    mdiClockTimeThreeOutline,
    mdiClockTimeTwelve,
    mdiClockTimeTwelveOutline,
    mdiClockTimeTwo,
    mdiClockTimeTwoOutline,
    mdiInfinity,
    mdiPause,
    mdiSkull,
    mdiTrophyVariant,
  } from "@mdi/js"
  import { getContext, setContext } from "svelte"
  import { type Readable, readonly, writable } from "svelte/store"

  import type { Color } from "./chess"
  import Icon from "./Icon.svelte"
  import type { ClockSettings } from "./settings"

  export type ClockState = Readonly<{
    lastUpdatedAt: number
    toMove: Color
    remaining: Record<Color, number>
  }>

  export type ClockControls = Readonly<{
    /** Reset the clock */
    reset: (settings: ClockSettings) => void
    /** Hit the clock after making a move */
    update: (toMove: Color) => void
  }>

  export const makeClock = ({ secondsPerSide, increment }: ClockSettings): ClockControls => {
    let inc = increment
    const initialClockState: ClockState = {
      lastUpdatedAt: 0,
      toMove: "w",
      remaining: { w: secondsPerSide, b: secondsPerSide },
    }

    const store = writable(initialClockState)
    setContext("clock", readonly(store))

    let frameRequestId: number = 0

    const tick = (now: number) => store.update(({ lastUpdatedAt, toMove, remaining }) => {
      if (!lastUpdatedAt) return { lastUpdatedAt, toMove, remaining }
      const remainder = Math.max(0, remaining[toMove] - (now - lastUpdatedAt) / 1000)
      if (remainder > 0) {
        frameRequestId = requestAnimationFrame(tick)
      }
      return { lastUpdatedAt: now, toMove, remaining: { ...remaining, [toMove]: remainder } }
    })

    const reset = ({ secondsPerSide, increment }: ClockSettings) => {
      inc = increment
      store.set({
        lastUpdatedAt: 0,
        toMove: "w",
        remaining: { w: secondsPerSide, b: secondsPerSide },
      })
      if (frameRequestId) {
        cancelAnimationFrame(frameRequestId)
        frameRequestId = 0
      }
    }
    const update = (nowToMove: Color) => {
      store.update(({ lastUpdatedAt, toMove, remaining }) => {
        if (nowToMove !== toMove) {
          if (!frameRequestId) {
            frameRequestId = requestAnimationFrame(tick)
          }
          const now = performance.now()
          return {
            lastUpdatedAt: now,
            toMove: nowToMove,
            remaining: {
              ...remaining,
              [toMove]:
                Math.max(0, remaining[toMove] - (now - (lastUpdatedAt || now)) / 1000 + inc),
            },
          }
        } else {
          return { lastUpdatedAt, toMove, remaining }
        }
      })
    }
    return { update, reset }
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
  const urgentClockIcons = [
    mdiClockTimeOne,
    mdiClockTimeTwo,
    mdiClockTimeThree,
    mdiClockTimeFour,
    mdiClockTimeFive,
    mdiClockTimeSix,
    mdiClockTimeSeven,
    mdiClockTimeEight,
    mdiClockTimeNine,
    mdiClockTimeTen,
    mdiClockTimeEleven,
    mdiClockTimeTwelve,
  ].reverse()
</script>

<script lang="ts">
  export let forColor: Color

  const clock = getContext<Readable<ClockState>>("clock")

  $: seconds = $clock.remaining[forColor]
  $: opponentSeconds = $clock.remaining[forColor === "w" ? "b" : "w"]
  $: running = $clock.lastUpdatedAt > 0 && $clock.toMove === forColor
</script>

<div class="clock" class:running>
  {#if running}
    {#if seconds <= 0}
      <Icon path={mdiSkull} />
    {:else if seconds < 10}
      <Icon path={urgentClockIcons[Math.floor(seconds % 12)]} />
    {:else}
      <Icon path={clockIcons[Math.floor(seconds % 12)]} />
    {/if}
  {:else}
    {#if opponentSeconds <= 0}
      <Icon path={mdiTrophyVariant} />
    {:else}
      <Icon path={mdiPause} />
    {/if}
  {/if}
  {#if seconds === Infinity}
    <Icon path={mdiInfinity} />
  {:else if seconds < 10}
    {seconds.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
  {:else if seconds < 3600}
    {Math.floor(seconds / 60)}:{doubleDigit(seconds % 60)}
  {:else}
    {Math.floor(seconds / 3600)}:${doubleDigit(seconds % 3600 / 60)}:{doubleDigit(seconds % 60)}
  {/if}
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
