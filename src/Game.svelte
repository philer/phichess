<script lang="ts">
  import { onMount } from "svelte"

  import { START_GAME } from "./chess"
  import History from "./History.svelte"
  import Perspective from "./Perspective.svelte"

  let game = START_GAME

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

  {#if showSidebar}
    <aside class="sidebar">
      <button class="close" on:click={() => showSidebar = false}>»</button>
      <History bind:game />
    </aside>
  {:else}
    <button class="showSidebar" on:click={() => showSidebar = true}>«</button>
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
