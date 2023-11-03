<script lang="ts">
  import { START_GAME } from "./chess"
  import Chessboard from "./Chessboard.svelte"
  import PieceIcon from "./PieceIcon.svelte"
  import { pairs, partition } from "./util"

  let game = START_GAME
  $: ({ graveyard, history } = game)

  let showHistory = true
  let flipped = false

  $: movePairs = history.length ? Array.from(pairs(history)) : [[]]

  $: [whiteGraveyard, blackGraveyard] = partition(([color]) => color === "w", graveyard)
</script>

<div class="game">
  <div class="graveyard">
    <div>
      {#each whiteGraveyard as piece, idx (idx + piece)}
        <PieceIcon {piece} />
      {/each}
    </div>
    <div>
      {#each blackGraveyard as piece, idx (idx + piece)}
        <PieceIcon {piece} />
      {/each}
    </div>
  </div>
  <Chessboard bind:game {flipped} />
  <div class="tools">
    <button on:click={() => flipped = !flipped}>⇅</button>
    <button on:click={() => showHistory = !showHistory}>📘</button>
  </div>
  {#if showHistory}
    <aside class="history">
      <button class="close" on:click={() => showHistory = false}>✕</button>
      <ol>
        {#each movePairs as [whiteMove, blackMove], idx (idx)}
          <li>
            <span class="moveNumber">{idx + 1}.</span>
            <span>{whiteMove?.algebraic ?? ""}</span>
            <span>{blackMove?.algebraic ?? ""}</span>
          </li>
        {/each}
      </ol>
    </aside>
  {/if}
</div>

<style lang="scss">
  .game {
    display: flex;
    align-items: stretch;
  }

  .graveyard,
  .tools,
  .graveyard > div {
    padding: 0 0.5rem;
    width: 2em;
    display: flex;
    flex-direction: column;
    align-items: center;

    font-size: 3vmin;
    font-weight: bold;
  }

  .graveyard {
    justify-content: space-between;
  }

  .history {
    position: relative;
    width: 12em;
    height: 100%;
    margin: 0 1em;
    background: #0003;
    ol {
      display: grid;
      align-content: start;
      grid-template-columns: min-content 1fr 1fr;
      gap: 0.5em 1em;

      padding: 1em 1em .5em;

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
    }
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
