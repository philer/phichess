<script lang="ts">
  import { type Color, type ColorPiece, type Game } from "./chess"
  import PieceIcon from "./PieceIcon.svelte"

  export let game: Game
  export let color: Color

  $: graveCounts = Object.entries(
      game.graveyard.reduce(
        (counts, piece) => ({ ...counts, [piece]: counts[piece] + 1 }),
        { w: 0, wN: 0, wB: 0, wR: 0, wQ: 0, b: 0, bN: 0, bB: 0, bR: 0, bQ: 0 },
      ),
    ) as [ColorPiece, number][]
</script>

<div class={`graveyard ${color}`}>
  {#each graveCounts as [piece, count]}
    {#if piece[0] === color && count}
      <div>
        {#each { length: count } as _, idx (idx)}
          <div>
            <PieceIcon piece={piece.slice(1)} />
          </div>
        {/each}
      </div>
    {/if}
  {/each}
</div>

<style lang="scss">
  .graveyard {
    gap: .667em;
    display: flex;
    align-items: center;
    > div {
      > div {
        display: inline-block;
        width: .33em;
        overflow: visible;
        --icon-vertical-align: middle;
      }
    }
    &:global(.w) {
      color: #ddd;
      --icon-stroke: #333;
    }
    &:global(.b) {
      color: #111;
      --icon-stroke: #777;
    }
  }
</style>
