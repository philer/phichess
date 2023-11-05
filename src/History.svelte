<script lang="ts">
  import { revertLastMove, type Game } from "./chess"
  import { pairs } from "./util"

  export let game: Game

  $: movePairs = game.history.length ? Array.from(pairs(game.history)) : [[]]
</script>

<div>
  <ol>
    {#each movePairs as [whiteMove, blackMove], idx (idx)}
      <li>
        <span class="moveNumber">{idx + 1}.</span>
        <span>{whiteMove?.algebraic ?? ""}</span>
        <span>{blackMove?.algebraic ?? ""}</span>
      </li>
    {/each}
  </ol>
  <button on:click={() => game = revertLastMove(game)}>Undo last move</button>
</div>

<style lang="scss">
  div {

  }
  ol {
    display: grid;
    align-content: start;
    grid-template-columns: min-content 1fr 1fr;
    gap: 0.5em 1em;

    padding: 1em 1em .5em;
  }
  li {
    display: contents;
  }
  span {
    text-align: left;
  }
  .moveNumber {
    text-align: right;
    font-weight: bold;
    opacity: .5;
  }
</style>
