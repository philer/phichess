<script lang="ts">
  import { onMount } from "svelte"

  import { START_GAME } from "./chess"
    import History from "./History.svelte"
  import Perspective from "./Perspective.svelte"

  let game = START_GAME

  let showHistory = true

  type Layout = {
    perspectives: 1 | 2,
    opposite: boolean,
    autoflip: boolean,
  }

  let layout: Layout = {
    perspectives: 2,
    opposite: true,
    autoflip: false,
  }

  let layoutContainer: HTMLDivElement
  let flowDirection: "row" | "column" = "row"
  let perspectiveSize: number = 100

  onMount(() => {
    const resizeObserver = new ResizeObserver(([entry]) => {
      const { inlineSize: width, blockSize: height } = entry.contentBoxSize[0]
      flowDirection = width > height ? "row" : "column"
      perspectiveSize = flowDirection === "row"
        ? Math.min(height, width / 2)
        : Math.min(width, height / 2)
    })
    resizeObserver.observe(layoutContainer)
    return () => resizeObserver.unobserve(layoutContainer)
  })

</script>

<div class="game">
  <div bind:this={layoutContainer} class="layout" style:flex-flow={flowDirection} style:--perspective-size={`${perspectiveSize}px`}>
    {#each { length: layout.perspectives } as _, idx (idx)}
      <Perspective bind:game />
    {/each}
  </div>

  {#if showHistory}
    <aside class="history">
      <button class="close" on:click={() => showHistory = false}>✕</button>
      <History {game} />
    </aside>
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
    width: 100%;
    height: 100%;
    flex: 100% 1 1;

    display: flex;
    align-items: center;
    justify-content: space-around;
    overflow: hidden;
  }

  .history {
    position: relative;
    width: 12em;
    height: 100%;
    // margin: 0 1em;
    background: #0003;
  }
  .close {
    padding: .25em;
    font-family: sans-serif;
    position: absolute;
    inset: 0 0 auto auto;

    opacity: .5;
    transition: .2s opacity;
    &:hover, &:active, &:focus {
      opacity: 1;
    }
  }
</style>
