<script lang="ts">
  import { type Game } from "./chess"
  import Chessboard from "./Chessboard.svelte"
  import Graveyard from "./Graveyard.svelte"
  import PieceIcon from "./PieceIcon.svelte"

  export let game: Game

  let rotate = 0
  let asWhite = true
</script>

<div class="perspective" style:transform={`rotate(${rotate}deg)`}>
  <div class="above">
    <Graveyard {game} color={asWhite ? "w" : "b"} />
  </div>
  <div class="below">
    <Graveyard {game} color={asWhite ? "b" : "w"} />
  </div>

  <div class="left"></div>

  <div class="right">
    <button on:click={() => rotate += 90}>↶</button>
    <button on:click={() => asWhite = !asWhite}>
      <PieceIcon piece={asWhite ? "b" : "w"} outline />
    </button>
  </div>

  <Chessboard bind:game {asWhite} {rotate} />
</div>

<style lang="scss">
  .perspective {
    --board-size: calc(8/9 * var(--perspective-size));
    --frame-size: calc(1/2/9 * var(--perspective-size));
    --square-size: calc(1/8 * var(--board-size));

    width: var(--perspective-size);
    height: var(--perspective-size);

    transform: rotate(0deg);
    transition: 0.5s transform;

    // display: flex;
    // align-items: stretch;
    // justify-content: stretch;

    background: #0002;

    display: grid;
    grid-template-rows: .5fr 8fr .5fr;
    grid-template-columns: .5fr 8fr .5fr;
    grid-template-areas:
      ".    above     ."
      "left board right"
      ".    below     .";
  }

  .above { grid-area: above }
  .below { grid-area: below }
  .left { grid-area: left }
  .right { grid-area: right }

  .left, .right, .above, .below {
    display: flex;
    align-items: center;
    align-items: center;
  }
  .left, .right {
    flex-direction: column;
  }

  .right > button {
    appearance: none;
    background: #0005;
    width: 100%;
    aspect-ratio: .5;
  }
</style>
