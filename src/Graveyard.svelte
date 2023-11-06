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

<div class="graveyard">
  {#each graveCounts as [piece, count]}
    {#if piece[0] === color && count}
      <div>
        {#each { length: count } as _, idx (idx)}
          <div>
            <PieceIcon {piece} outline />
          </div>
        {/each}
      </div>
    {/if}
  {/each}
</div>

<style lang="scss">
  div {
    display: flex;
    align-items: center;
  }
  .graveyard {
    gap: .667em;
    > div > div {
      width: .33em;
    }
  }
</style>
