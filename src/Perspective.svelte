<script lang="ts">
  import { mdiArrowUpDownBold, mdiChessPawn, mdiFormatRotate90 } from "@mdi/js"

  import { type Game, outcomeToString, START_GAME } from "./chess"
  import Chessboard from "./Chessboard.svelte"
  import Clock from "./Clock.svelte"
  import Graveyard from "./Graveyard.svelte"
  import Icon from "./Icon.svelte"
  import Modal from "./Modal.svelte"
  import { settings } from "./stores"

  export let game: Game
  export let asWhite = true
  export let rotate = 0
  export let flipOpponentPieces = false

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
</script>

<div
  class="perspective"
  class:show-board-frame={$settings.showBoardFrame}
  style:transform={`rotate(${rotate}deg)`}
>
  {#if $settings.showBoardFrame}
    <div class="above">
      {#if $settings.showGraveyards}
        <Graveyard {game} color={asWhite ? "w" : "b"} />
      {/if}
      {#if $settings.useTimeControl}
        <Clock forColor={asWhite ? "b" : "w"} />
      {/if}
    </div>

    <div class="below">
      {#if $settings.showGraveyards}
        <Graveyard {game} color={asWhite ? "b" : "w"} />
      {/if}
      {#if $settings.useTimeControl}
        <Clock forColor={asWhite ? "w" : "b"} />
      {/if}
    </div>

   <!-- <div class="left"></div> -->

    <div class="right">
      <div class="tools">
        <button on:click={() => rotate += 90}>
          <Icon path={mdiFormatRotate90} flip="vertical" />
        </button>
        <button on:click={() => asWhite = !asWhite}>
          <Icon path={mdiArrowUpDownBold} />
        </button>
        <button on:click={() => flipOpponentPieces = !flipOpponentPieces}>
          <Icon path={mdiChessPawn} flip={flipOpponentPieces ? undefined : "vertical"} />
        </button>
      </div>
    </div>
  {/if}

  <Chessboard bind:game {asWhite} {rotate} {flipOpponentPieces} />

  <Modal local bind:open={openOutcome} on:close={() => outcomeClosed = true}>
    <svelte:fragment slot="title">Game over!</svelte:fragment>
    <p>{outcomeToString(game.outcome, game.termination)}</p>
    <button slot="actions" class="new-game-button" on:click={() => game = START_GAME}>
      New game
    </button>
  </Modal>
</div>

<style lang="sass">
  @use "common"

  .perspective
    --frame-size: calc(1/2/9 * var(--perspective-size))
    &:not(.show-board-frame)
      --frame-size: 0px
    --board-size: calc(var(--perspective-size) - 2 * var(--frame-size))
    --square-size: calc(1/8 * var(--board-size))

    width: var(--perspective-size)
    height: var(--perspective-size)
    font-size: max(10px, calc(.02 * var(--perspective-size)))

    transform: rotate(0deg)
    transition: 0.5s transform

    display: grid
    grid-template-rows: var(--frame-size) var(--board-size) var(--frame-size)
    grid-template-columns: var(--frame-size) var(--board-size) var(--frame-size)
    grid-template-areas: ".    above     ." "left board right" ".    below     ."

    background: #fff2

  .above
    grid-area: above
  .below
    grid-area: below
  // .left
  //   grid-area: left
  .right
    grid-area: right

  .right, .above, .below //, .left
    display: flex
    align-items: center
    justify-content: space-between

  .right //, .left
    flex-direction: column

  .tools
    display: flex
    flex-direction: column
    box-shadow: 1px 1px 7px #0008
    > button
      font-size: 1.75em
      height: var(--square-size)
      aspect-ratio: .5

      display: flex
      justify-content: center
      align-items: center

      background: #fff2
      box-shadow: inset .7em .7em 1em -.5em #fff6
      transition: .3s background
      &:hover, &:active, &:focus
        background: #fff5

  .new-game-button
    @include common.start-button
    white-space: nowrap
</style>
