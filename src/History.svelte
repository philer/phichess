<script lang="ts">
  import { mdiContentCopy, mdiDownload, mdiUndo } from "@mdi/js"
  import { match } from "ts-pattern"

import Algebraic from "./Algebraic.svelte"
  import { applyMove, type Game, type Move, revertToMove, toFEN, toPGN } from "./chess"
  import Icon from "./Icon.svelte"
  import { pairs, saveTextAs } from "./util"

  export let game: Game

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

  const copyPgn = () =>
    navigator.clipboard.writeText(toPGN(game))

  const copyFen = () =>
    navigator.clipboard.writeText(toFEN(game))

  const downloadPgn = () =>
    saveTextAs(
      toPGN(game),
      `${location.hostname}_${new Date().toISOString().slice(0, 10)}.pgn`,
      "application/vnd.chess-pgn",
    )
  const downloadFen = () =>
    saveTextAs(
      toFEN(game),
      `${location.hostname}_${new Date().toISOString().slice(0, 10)}.fen`,
    )
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
>
  <Icon path={mdiUndo} />
</button>

<div style:flex-grow="1" />

<div class="button-row">
  <button
    on:click={copyPgn}
    class="tools-button"
    title="Copy Portable Game Notation to clipboard"
  >
    <Icon path={mdiContentCopy} /> PGN
  </button>
  <button
    on:click={downloadPgn}
    class="tools-button"
    title="Download Portable Game Notation"
  >
    <Icon path={mdiDownload} /> PGN
  </button>
  <button
    on:click={copyFen}
    class="tools-button"
    title="Copy Forsyth–Edwards Notation to clipboard"
  >
    <Icon path={mdiContentCopy} /> FEN
  </button>
  <button
    on:click={downloadFen}
    class="tools-button"
    title="Download Forsyth–Edwards Notation"
  >
    <Icon path={mdiDownload} /> FEN
  </button>
</div>


<style lang="sass">
  ol
    display: grid
    align-content: start
    grid-template-columns: min-content 1fr 1fr
    overflow: auto
    // gap: 0.5em 1em

    // padding: 1em 1em .5em
    background: #fff1

  li
    display: contents
    span, button
      padding: .25em .5em
      text-align: left
      white-space: nowrap
      // display: flex
      // align-items: center

  .move-number
    text-align: right
    font-weight: bold
    opacity: .5
    background: #fff2

  .current
    background: #fff2

  .ghost
    opacity: .5

  .button-row
    display: grid
    grid-template-rows: 1fr 1fr
    grid-template-columns: 1fr 1fr
    grid-auto-flow: column
    justify-content: stretch
    font-size: .7em
    gap: 2px
    > button
      flex: 100% 1 1
      white-space: nowrap

  button.tools-button
    line-height: 2em
    width: 100%
    background: #333
    transition: .3s background
    &:not(:disabled):hover
      background: #555

    &:disabled
      opacity: .3
      cursor: default
</style>
