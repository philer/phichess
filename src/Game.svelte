<script lang="ts">
  import { mdiChevronDoubleLeft, mdiChevronDoubleRight } from "@mdi/js"
  import { onMount } from "svelte"

  import { type Game } from "./chess"
  import { makeClock } from "./Clock.svelte"
  import History from "./History.svelte"
  import Icon from "./Icon.svelte"
  import Perspective from "./Perspective.svelte"
  import { settings } from "./settings"

  export let game: Game

  $: clock = $settings.useTimeControl
    ? makeClock($settings.clock.secondsPerSide, $settings.clock.increment)
    : makeClock(Infinity, 0)
  $: {
    if (game.history.length === 0) {
      clock.stop()
    } else if ($settings.useTimeControl) {
      clock.update(game.toMove)
    }
  }

  let layoutContainer: HTMLDivElement
  let flowDirection: "row" | "column" = "row"
  let perspectiveSize: number = 100

  onMount(() => {
    const resizeObserver = new ResizeObserver(([entry]) => {
      const { inlineSize: width, blockSize: height } = entry.contentBoxSize[0]
      flowDirection = width > height ? "row" : "column"
      perspectiveSize = flowDirection === "row"
        ? Math.min(height, width / $settings.layout.length)
        : Math.min(width, height / $settings.layout.length)
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
    {#each $settings.layout as { asWhite }, idx (idx)}
      <Perspective bind:game bind:asWhite />
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

  {#if $settings.showHistory}
    <aside class="sidebar">
      <button class="close" on:click={() => $settings.showHistory = false}><Icon path={mdiChevronDoubleRight} /></button>
      <History bind:game />
    </aside>
  {:else}
    <button class="showHistory" on:click={() => $settings.showHistory = true}><Icon path={mdiChevronDoubleLeft} /></button>
  {/if}

</div>

<style lang="scss">
  .game {
    position: relative;
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
  .showHistory {
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
