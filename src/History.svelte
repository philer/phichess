<script lang="ts">
  import { type Game, type Move, revertToMove } from "./chess"
  import { pairs } from "./util"

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
</script>

<div>
  <ol>
    {#each movePairs as [whiteMove, blackMove], idx (idx)}
      <li>
        <span class="moveNumber">{idx + 1}.</span>
        <button
          on:click={() => gotoMove(idx * 2 + 1)}
          class:current={idx * 2 + 1 === game.history.length}
          class:ghost={idx * 2 + 1 > game.history.length}
        >
          {whiteMove?.algebraic ?? ""}
        </button>
        <button
          on:click={() => gotoMove(idx * 2 + 2)}
          class:current={idx * 2 + 2 === game.history.length}
          class:ghost={idx * 2 + 2 > game.history.length}
        >
          {blackMove?.algebraic ?? ""}
        </button>
      </li>
    {/each}
  </ol>
  <button on:click={undoLastMove} disabled={!game.history.length}>Undo</button>
</div>

<style lang="scss">
  ol {
    display: grid;
    align-content: start;
    grid-template-columns: min-content 1fr 1fr;
    // gap: 0.5em 1em;

    // padding: 1em 1em .5em;
    background: #fff1;
  }
  li {
    display: contents;
  }
  span, button {
    padding: .25em .5em;
    text-align: left;
  }
  .moveNumber {
    text-align: right;
    font-weight: bold;
    opacity: .5;
    background: #fff2;
  }
  .current {
    background: #fff2;
  }
  .ghost {
    opacity: .5;
  }
  button:disabled {
    opacity: .3;
    cursor: default;
  }
</style>
