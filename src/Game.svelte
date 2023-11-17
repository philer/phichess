<script lang="ts">
  import { mdiChevronDoubleLeft, mdiChevronDoubleRight } from "@mdi/js"
  import { onMount } from "svelte"
  import { match } from "ts-pattern"

  import { type Game, START_GAME } from "./chess"
  import { makeClock } from "./Clock.svelte"
  import History from "./History.svelte"
  import Icon from "./Icon.svelte"
  import Modal from "./Modal.svelte"
  import Perspective from "./Perspective.svelte"
  import { settings } from "./settings"

  export let game: Game

  /** Show the game over modal */
  let openOutcome = false
  /**
   * Game over modal was closed by user and should not be shown again
   * until a new game has been started.
   */
  let outcomeClosed = false
  $: {
    if (game.history.length === 0) {
      openOutcome = false
      outcomeClosed = false
    }
    if (game.outcome && !outcomeClosed) {
      openOutcome = true
    }
  }

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
    {#each $settings.layout as { asWhite, rotate, flipOpponentPieces }, idx (idx)}
      <Perspective bind:game bind:asWhite bind:rotate bind:flipOpponentPieces />
    {/each}

    <Modal bind:open={openOutcome} on:close={() => outcomeClosed = true}>
      <svelte:fragment slot="title">Game over!</svelte:fragment>
      <p slot="content">
        {match(game.outcome)
            .with("w", () => "White wins")
            .with("b", () => "Black wins")
            .with("draw", () => "Draw")
            .with(undefined, () => "???")
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
      <button slot="actions" class="new-game-button" on:click={() => game = START_GAME}>
        New game
      </button>
    </Modal>
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
    @include common.start-button

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
</style>
