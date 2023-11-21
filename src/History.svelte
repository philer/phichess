<script lang="ts">
  import { mdiDownload, mdiUndo } from "@mdi/js"
  import { match } from "ts-pattern"

import Algebraic from "./Algebraic.svelte"
  import { applyMove, type Game, type Move, revertToMove, toPGN } from "./chess"
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
        && short.history.every(({ from, to, promotion }, idx) =>
            long.history[idx].from === from
            && long.history[idx].to === to
            && long.history[idx].promotion === promotion,
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

  const download = () =>
    saveTextAs(
      toPGN(game),
      `${location.hostname}_${new Date().toISOString().slice(0, 10)}.pgn`,
    )
</script>


<svelte:document on:keydown={handleGlobalKeydown} />

<div>
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
  <button
    on:click={download}
    disabled={!game.history.length}
    class="tools-button"
    title="Download PGN"
  >
    <Icon path={mdiDownload} />
  </button>
</div>

<style lang="sass">
  ol
    display: grid
    align-content: start
    grid-template-columns: min-content 1fr 1fr
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
