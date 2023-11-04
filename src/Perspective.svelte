<script lang="ts">
  import { type Game } from "./chess"
  import Chessboard from "./Chessboard.svelte"
  import PieceIcon from "./PieceIcon.svelte"
  import { partition } from "./util"

  export let game: Game

  let flipped = false

  $: [whiteGraveyard, blackGraveyard] = partition(([color]) => color === "w", game.graveyard)
</script>

<div class="perspective">
  <div class="graveyard">
    <div>
      {#each flipped ? blackGraveyard : whiteGraveyard as piece, idx (idx + piece)}
        <PieceIcon {piece} />
      {/each}
    </div>
    <div>
      {#each flipped ? whiteGraveyard : blackGraveyard as piece, idx (idx + piece)}
        <PieceIcon {piece} />
      {/each}
    </div>
  </div>

  <Chessboard bind:game {flipped} />

  <div class="tools">
    <button on:click={() => flipped = !flipped}>↶</button>
  </div>
</div>

<style lang="scss">
  .perspective {
    --board-size: calc(8/9 * var(--perspective-size));
    --frame-size: calc(1/2/9 * var(--perspective-size));
    --square-size: calc(1/8 * var(--board-size));

    width: var(--perspective-size);
    height: var(--perspective-size);
    padding: var(--frame-size) 0;

    // transform: rotate(90deg);

    display: flex;
    align-items: stretch;
    justify-content: stretch;

    background: #0005;
  }

  .graveyard,
  .tools,
  .graveyard > div {
    padding: 0 0.5rem;
    width: calc(.5 * var(--square-size));
    font-size: calc(.4 * var(--square-size));

    display: flex;
    flex-direction: column;
    align-items: center;

    font-weight: bold;
  }

  .graveyard {
    justify-content: space-between;
  }
</style>
