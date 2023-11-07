<script lang="ts">
  import { type Game } from "./chess"
  import Chessboard from "./Chessboard.svelte"
  import Graveyard from "./Graveyard.svelte"
  import PieceIcon from "./PieceIcon.svelte"

  export let game: Game
  export let asWhite = true
  export let rotate = 0
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
    <div class="tools">
      <!-- ↶ ⤶ ↵ ↱↲ ⤹⤸ ◇ 🙾 -->
      <button on:click={() => rotate += 90}>
          <div style:transform="rotate(90deg)">↱↲</div>
      </button>
      <button on:click={() => asWhite = !asWhite}>
        ⬍
        <!-- <PieceIcon piece={asWhite ? "b" : "w"} outline /> -->
      </button>
    </div>
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

    display: grid;
    grid-template-rows: var(--frame-size) var(--board-size) var(--frame-size);
    grid-template-columns: var(--frame-size) var(--board-size) var(--frame-size);
    grid-template-areas:
      ".    above     ."
      "left board right"
      ".    below     .";

    background: #fff2;
  }

  .above { grid-area: above }
  .below { grid-area: below }
  .left { grid-area: left }
  .right { grid-area: right }

  .left, .right, .above, .below {
    display: flex;
    align-items: center;
  }
  .left, .right {
    flex-direction: column;
  }

  .tools {
    display: flex;
    flex-direction: column;
    box-shadow: 1px 1px 7px #0008;
    > button {
      font-size: calc(.3333 * var(--square-size));
      height: var(--square-size);
      aspect-ratio: .5;
      background: #fff2;
      box-shadow: inset .7em .7em 1em -.5em #fff6;
      transition: .3s background;
      &:hover, &:active, &:focus {
        background: #fff5;
      }
    }
  }
</style>
