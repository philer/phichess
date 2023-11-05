<script lang="ts">
  import { type Color, type Game } from "./chess"
  import Chessboard from "./Chessboard.svelte"
  import PieceIcon from "./PieceIcon.svelte"
  import { partition } from "./util"

  export let game: Game

  let rotate = 0
  let asWhite = true

  $: [whiteGraveyard, blackGraveyard] = partition(([color]) => color === "w", game.graveyard)
</script>

<div class="perspective" style:transform={`rotate(${rotate}deg)`}>
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

  <Chessboard bind:game {asWhite} />

  <div class="tools">
    <button on:click={() => rotate += 90}>↶</button>
    <button on:click={() => asWhite = !asWhite}>
      <PieceIcon piece={asWhite ? "b" : "w"} />
    </button>
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

    transform: rotate(0deg);
    transition: 0.5s transform;

    display: flex;
    align-items: stretch;
    justify-content: stretch;

    background: #0002;
  }

  .graveyard,
  .tools,
  .graveyard > div {
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
  button {
    appearance: none;
    background: #0005;
    width: 100%;
    aspect-ratio: .5;
  }
</style>
