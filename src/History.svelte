<script lang="ts">
  import { mdiDownload, mdiImport, mdiUndo } from "@mdi/js"
  import { match } from "ts-pattern"

  import Algebraic from "./Algebraic.svelte"
  import { applyMove, type Game, type Move, revertToMove } from "./chess"
  import Export from "./Export.svelte"
  import Icon from "./Icon.svelte"
  import ImportDialog from "./ImportDialog.svelte"
  import Modal from "./Modal.svelte"
  import { pairs } from "./util"

  export let game: Game

  let showExport = false
  let showImport = false
  let fullGame = game
  let movePairs: ([] | [Move] | [Move, Move])[] = []

  $: {
    if (!isSubGame(game, fullGame)) {
      fullGame = { ...game }
    }
    movePairs = fullGame.history.length
      ? Array.from(pairs(fullGame.history))
      : [[]]
  }

  const isSubGame = (short: Game, long: Game) =>
    short.history.length <= long.history.length
        && short.history.every(({ algebraic }, idx) =>
            long.history[idx].algebraic === algebraic,
          )

  const gotoMove = (idx: number) => {
    game = revertToMove(idx, fullGame)
  }

  const undoLastMove = () => {
    game = revertToMove(-1, game)
  }

  const redoLastMove = () => {
    if (fullGame.history.length > game.history.length) {
      applyMove(game, fullGame.history[game.history.length])
        .map(newGame => game = newGame)
        .mapError(console.error)
    }
  }

  const handleGlobalKeydown = (evt: KeyboardEvent) =>
    match(evt.key)
      .with("ArrowLeft", undoLastMove)
      .with("ArrowRight", redoLastMove)
</script>


<svelte:document on:keydown={handleGlobalKeydown} />

<ol>
  {#each movePairs as [whiteMove, blackMove], idx (idx)}
    <li>
      <span class="move-number">{idx + 1}.</span>
      <button
        on:click={() => gotoMove(idx * 2 + 1)}
        class:current={idx * 2 + 1 === game.history.length}
        class:ghost={idx * 2 + 1 > game.history.length}
      >
        <Algebraic move={whiteMove} />
      </button>
      <button
        on:click={() => gotoMove(idx * 2 + 2)}
        class:current={idx * 2 + 2 === game.history.length}
        class:ghost={idx * 2 + 2 > game.history.length}
      >
        <Algebraic move={blackMove} />
      </button>
    </li>
  {/each}
</ol>

<button
  on:click={undoLastMove}
  disabled={!game.history.length}
  class="tools-button"
  title="Undo last move"
><Icon path={mdiUndo} /> Undo</button>

<div style:flex-grow="1" />

<button
  on:click={() => showExport = true}
  disabled={!game.history.length}
  class="tools-button"
  title="Export game as PGN or FEN"
><Icon path={mdiDownload} /> Export</button>

<button
  on:click={() => showImport = true}
  class="tools-button"
  title="Import game as PGN"
><Icon path={mdiImport} /> Import</button>

<Modal bind:open={showExport}>
  <svelte:fragment slot="title">Export</svelte:fragment>
  <Export {game} />
</Modal>

<ImportDialog
  bind:open={showImport}
  on:import={({ detail }) => game = detail}
/>


<style lang="sass">
  ol
    display: grid
    align-content: start
    grid-template-columns: min-content 1fr 1fr
    overflow: auto
    background: #222

  li
    display: contents
    span, button
      padding: .25em .5em
      text-align: left
      white-space: nowrap

  .move-number
    text-align: right
    font-weight: bold
    opacity: .5
    background: #444

  li > button
    transition: .2s background, .2s opacity
    &:hover, &:focus, &:active
      background: #fff2

  .current
    background: #fff2
    &:hover
      background: #fff4

  .ghost
    opacity: .5

  button.tools-button
    line-height: 2em
    width: 100%
    margin-top: 1px
    background: #333
    transition: .2s background

    &:not(:disabled)
      &:hover, &:focus, &:active
        background: #555

    &:disabled
      opacity: .3
      cursor: default
</style>
