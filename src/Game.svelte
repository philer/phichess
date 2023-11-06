<script lang="ts">
  import { mdiChevronDoubleLeft, mdiChevronDoubleRight } from "@mdi/js"
  import { onMount } from "svelte"
  import { derived, writable } from "svelte/store"

  import { type Color, START_GAME } from "./chess"
  import History from "./History.svelte"
  import Icon from "./Icon.svelte"
  import Perspective from "./Perspective.svelte"

  let game = START_GAME
  const secondsPerSide: number = 5 * 60
  const increment: number = 5

  type ClockState = Readonly<{
    running: boolean
    toMove: Color
    lastUpdatedAt: number
    remaining: Record<Color, number>
  }>

  const initialClockState: ClockState = {
    running: false,
    toMove: "w",
    lastUpdatedAt: 0,
    remaining: { w: secondsPerSide, b: secondsPerSide },
  }

  const clockState = writable(initialClockState)
  const clock = derived(clockState, state => state.remaining)


  let frameRequestId: number = 0
  const tick = (now: number) => clockState.update(({ remaining, lastUpdatedAt, ...state }) => {
    if (!state.running) return { remaining, lastUpdatedAt, ...state }
    const remainder = Math.max(0, remaining[state.toMove] - (now - lastUpdatedAt) / 1000)
    if (remainder > 0) {
      frameRequestId = requestAnimationFrame(tick)
    }
    return { ...state, lastUpdatedAt: now, remaining: { ...remaining, [state.toMove]: remainder } }
  })

  $: {
    if (game.history.length === 0) {
      clockState.set(initialClockState)
      if (frameRequestId) {
        cancelAnimationFrame(frameRequestId)
        frameRequestId = 0
      }
    } else if (game.toMove !== $clockState.toMove) {
      clockState.update(({ running, remaining, toMove, lastUpdatedAt, ...state }) => {
        const now = performance.now()
        return {
          ...state,
          running: true,
          toMove: game.toMove,
          lastUpdatedAt: now,
          remaining: running
            ? {
              ...remaining,
              [toMove]: Math.max(0, remaining[toMove] - (now - lastUpdatedAt) / 1000 + increment),
            }
            : remaining,
        }
      })
      if (!frameRequestId) {
        frameRequestId = requestAnimationFrame(tick)
      }
    }
  }


  let showSidebar = true

  type Layout = { asWhite: boolean, autoflip?: boolean }[]

  const layout: Layout = [
    { asWhite: true },
    // { asWhite: false },
  ]

  let layoutContainer: HTMLDivElement
  let flowDirection: "row" | "column" = "row"
  let perspectiveSize: number = 100

  onMount(() => {
    const resizeObserver = new ResizeObserver(([entry]) => {
      const { inlineSize: width, blockSize: height } = entry.contentBoxSize[0]
      flowDirection = width > height ? "row" : "column"
      perspectiveSize = flowDirection === "row"
        ? Math.min(height, width / layout.length)
        : Math.min(width, height / layout.length)
    })
    resizeObserver.observe(layoutContainer)
    return () => resizeObserver.unobserve(layoutContainer)
  })

</script>

<div class="game">
  <div
    bind:this={layoutContainer}
    class="layout"
    style:flex-flow={flowDirection}
    style:--perspective-size={`${perspectiveSize}px`}
  >
    {#each layout as { asWhite }, idx (idx)}
      <Perspective bind:game bind:asWhite {clock} />
    {/each}

    {#if game.history.at(-1)?.mate}
      <div class="modal">
        <div class="checkmate">
          <h3>Checkmate!</h3>
          {game.toMove === "w" ? "Black" : "White"} wins.
        </div>
      </div>
    {/if}
  </div>

  {#if showSidebar}
    <aside class="sidebar">
      <button class="close" on:click={() => showSidebar = false}><Icon path={mdiChevronDoubleRight} /></button>
      <History bind:game />
    </aside>
  {:else}
    <button class="showSidebar" on:click={() => showSidebar = true}><Icon path={mdiChevronDoubleLeft} /></button>
  {/if}

</div>

<style lang="scss">
  .game {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: stretch;
    justify-content: stretch;
  }
  .layout {
    position: relative;
    width: 100%;
    height: 100%;
    flex: 100% 1 1;

    display: flex;
    align-items: center;
    justify-content: space-around;
    overflow: hidden;
  }

  button {
    font-family: sans-serif;
    transition: .3s background, .3s box-shadow;
    background: #333;
    box-shadow: 1px 1px 3px #0005;
    &:hover, &:focus, &:active {
      background: #666;
      box-shadow: 1px 1px 5px #0008;
    }
  }

  .sidebar {
    width: 12em;
    height: 100%;
    display: flex;
    flex-direction: column;
    background: #0003;
    box-shadow: 1px 1px 3px #0008;
    .close {
      height: 2em;
    }
  }
  .showSidebar {
    position: absolute;
    inset: 0 0 auto auto;
    width: 2em;
    height: 2em;
  }

  .modal {
    position: absolute;
    inset: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    > div {
      background: #333;
      border-radius: 3px;
      box-shadow: 3px 3px 10px #0008;
    }
  }
  .checkmate {
    h3 {
      margin-bottom: 1em;
    }
    padding: 1em 2em;
  }
</style>
