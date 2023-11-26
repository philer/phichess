<script lang="ts">
  import { onMount } from "svelte"
  import { slide } from "svelte/transition"

  import { type Game } from "./chess"
  import { makeClock } from "./Clock.svelte"
  import History from "./History.svelte"
  import Perspective from "./Perspective.svelte"
  import { settings } from "./stores"

  export let game: Game

  const { remaining, ...clock } = makeClock($settings.clock)
  $: {
    if (game.history.length === 0) {
      clock.reset($settings.clock)
    } else if ($settings.useTimeControl) {
      if (game.outcome) {
        clock.stop()
      } else {
        clock.update(game.toMove)
      }
      if ($remaining[game.toMove] <= 0) {
        game = { ...game, outcome: game.toMove, termination: "time" }
      }
    }
  }

  let layoutContainer: HTMLDivElement
  let flowDirection: "row" | "column" = "row"
  let perspectiveSize: number = 100

  const resize = (width: number, height: number) => {
    flowDirection = width > height ? "row" : "column"
    perspectiveSize = flowDirection === "row"
      ? Math.min(height, width / $settings.layout.length)
      : Math.min(width, height / $settings.layout.length)
  }

  $: if (layoutContainer && $settings.layout.length) {
    const { width, height } = layoutContainer.getBoundingClientRect()
    resize(width, height)
  }

  onMount(() => {
    const resizeObserver = new ResizeObserver(([entry]) => {
      const { inlineSize: width, blockSize: height } = entry.contentBoxSize[0]
      resize(width, height)
    })
    resizeObserver.observe(layoutContainer)
    return () => resizeObserver.unobserve(layoutContainer)
  })
</script>


<div class="game">
  <div
    bind:this={layoutContainer}
    class="layout"
    class:show-board-frame={$settings.showBoardFrame}
    style:flex-flow={flowDirection}
    style:--perspective-size={`${perspectiveSize}px`}
  >
    {#each $settings.layout as { asWhite, rotate, flipOpponentPieces }, idx (idx)}
      <Perspective bind:game bind:asWhite bind:rotate bind:flipOpponentPieces />
    {/each}

  </div>

  {#if $settings.showHistory}
    <aside class="sidebar" transition:slide={{ duration: 200, axis: "x" }}>
      <History bind:game />
    </aside>
  {/if}
</div>


<style lang="sass">
  .game, .layout
    position: relative
    width: 100%
    height: 100%
    flex: 100% 1 1
    overflow: hidden
    display: flex

  .game
    align-items: stretch
    justify-content: stretch

  .layout
    align-items: center
    justify-content: space-around

  .sidebar
    width: 12em
    height: 100%
    display: flex
    flex-direction: column
    background: #0003
    box-shadow: 1px 1px 3px #0008

    @media (min-width: 900px)
      margin-left: .5em
      border-left: 1px solid #333
</style>
