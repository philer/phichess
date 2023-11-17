<script lang="ts">
  import { mdiChevronDoubleLeft, mdiChevronDoubleRight, mdiClose } from "@mdi/js"
  import { onMount } from "svelte"
  import { fade, scale } from "svelte/transition"
  import { match } from "ts-pattern"

  import { type Game, START_GAME } from "./chess"
  import { makeClock } from "./Clock.svelte"
  import History from "./History.svelte"
  import Icon from "./Icon.svelte"
  import Perspective from "./Perspective.svelte"
  import { settings } from "./settings"

  export let game: Game
  let gameOverClosed = false

  const { remaining, ...clock } = makeClock($settings.clock)
  $: {
    if (game.history.length === 0) {
      clock.reset($settings.clock)
      gameOverClosed = false
    } else if ($settings.useTimeControl) {
      if (game.outcome) {
        clock.stop()
      } else {
        clock.update(game.toMove)
      }
    }
    if ($remaining[game.toMove] <= 0) {
      game = { ...game, outcome: game.toMove, termination: "time" }
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

  const handleModalBackdropClick = (evt: MouseEvent) => {
    if (evt.target === evt.currentTarget) {
      gameOverClosed = true
    }
  }
</script>

<div class="game">
  <div
    bind:this={layoutContainer}
    class="layout"
    style:flex-flow={flowDirection}
    style:--perspective-size={`${perspectiveSize}px`}
  >
    {#each $settings.layout as { asWhite, rotate, flipOpponentPieces }, idx (idx)}
      <Perspective bind:game bind:asWhite bind:rotate bind:flipOpponentPieces />
    {/each}

    {#if game.outcome && !gameOverClosed}
      <div
        class="modal"
        on:click={handleModalBackdropClick}
        transition:fade={{ duration: 200 }}
      >
        <div class="game-over" transition:scale={{ duration: 200, start: .8 }}>
          <button class="close" on:click={() => gameOverClosed = true}>
            <Icon path={mdiClose} />
          </button>
          <h3>Game over!</h3>
          <p>
            {match(game.outcome)
                .with("w", () => "White wins")
                .with("b", () => "Black wins")
                .with("draw", () => "Draw")
                .exhaustive()
            }
            {match(game.termination)
                .with("checkmate", () => "by checkmate.")
                .with("time", () => "on time.")
                .with("stalemate", () => " by stalemate")
                .with("repetition", () => " by threefold repetition")
                .with("fifty-moves", () => " by fifty moves rule")
                .with("agreement", () => " by agreement")
                .with(undefined, () => "")
                .exhaustive()
            }
          </p>
          <p>
            <button class="new-game-button" on:click={() => game = START_GAME}>
              New game
            </button>
          </p>
        </div>
      </div>
    {/if}
  </div>

  {#if $settings.showHistory}
    <aside class="sidebar">
      <button class="hideHistory" on:click={() => $settings.showHistory = false}>
        <Icon path={mdiChevronDoubleRight} />
      </button>
      <History bind:game />
    </aside>
  {:else}
    <button class="showHistory" on:click={() => $settings.showHistory = true}>
      <Icon path={mdiChevronDoubleLeft} />
    </button>
  {/if}

</div>

<style lang="sass">
  @use "common"
  .new-game-button
    @include common.new-game-button
    padding: .5em 1em

  .game
    position: relative
    width: 100%
    height: 100%
    display: flex
    align-items: stretch
    justify-content: stretch

  .layout
    position: relative
    width: 100%
    height: 100%
    flex: 100% 1 1

    display: flex
    align-items: center
    justify-content: space-around
    overflow: hidden

  button.showHistory, button.hideHistory
    font-family: sans-serif
    background: #333
    box-shadow: 1px 1px 3px #0005
    &:hover, &:focus, &:active
      background: #666
      box-shadow: 1px 1px 5px #0008
  button.showHistory
    position: absolute
    inset: 0 0 auto auto
    width: 2em
    height: 2em
  button.hideHistory
    height: 2em

  .sidebar
    width: 12em
    height: 100%
    display: flex
    flex-direction: column
    background: #0003
    box-shadow: 1px 1px 3px #0008

  .modal
    position: absolute
    inset: 0
    display: flex
    justify-content: center
    align-items: center
    background: #1115
    backdrop-filter: blur(3px)
    > div
      position: relative
      background: #333
      border-radius: 3px
      box-shadow: 3px 3px 10px #0008
      > button.close
        position: absolute
        inset: 0 0 auto auto
        width: 2.4em
        height: 2.4em

  .game-over
    h3
      font-size: 1.2em
      line-height: 2em
      padding: 0 2em
      background: #555
    p
      padding: 0em 2em
      margin: 1em 0

</style>
