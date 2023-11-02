<script lang="ts">
  import { START_GAME } from "./chess"
  import Chessboard from "./Chessboard.svelte"
  import Utf8Piece from "./Utf8Piece.svelte"
  import { pairs, partition } from "./util"

  let game = START_GAME
  $: ({ graveyard, history } = game)

  let flipped = false

  $: movePairs = Array.from(pairs(history))
  $: [whiteGraveyard, blackGraveyard] = partition(([color]) => color === "w", graveyard)
</script>

<div class="game">
  <div class="graveyard">
    <div>
      {#each whiteGraveyard as piece, idx (idx + piece)}
        <Utf8Piece {piece} />
      {/each}
    </div>
    <div>
      {#each blackGraveyard as piece, idx (idx + piece)}
        <Utf8Piece {piece} />
      {/each}
    </div>
  </div>
  <Chessboard bind:game {flipped} />
  <div class="tools">
    <button
      on:click={() => {
        flipped = !flipped
      }}>⇅</button
    >
  </div>
  <aside>
    <ol class="history">
      {#each movePairs as [whiteMove, blackMove], idx (idx)}
        <li>
          <span class="moveNumber">{idx + 1}.</span>
          <span>{whiteMove.algebraic}</span>
          <span>{blackMove?.algebraic ?? ""}</span>
        </li>
      {/each}
    </ol>
  </aside>
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

    :global(.b) {
      text-shadow: 0 0 3px #fffc;
    }
  }

  .history {
    display: grid;
    grid-template-columns: min-content 1fr 1fr;
    gap: 0.5em 1em;
    li {
      display: contents;
    }
    span {
      text-align: left;
    }
    .moveNumber {
      text-align: right;
    }
  }
</style>
