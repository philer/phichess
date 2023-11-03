<script context="module" lang="ts">
    import { getContext } from "svelte"

  import type { ColorPiece } from "./chess"
  import type { Theme } from "./theme"

  const PIECE_TO_UTF8: Record<string, string> = {
    "K": "♚", //"♔",
    "Q": "♛", //"♕",
    "R": "♜", //"♖",
    "B": "♝", //"♗",
    "N": "♞", //"♘",
    "": "♟", //"♙",
  }
</script>

<script lang="ts">
  export let piece: ColorPiece
  const theme = getContext<Theme>("theme")
</script>

{#if theme.pieces.type === "font"}
  <span class={`fontPiece ${piece[0]}`}>{PIECE_TO_UTF8[piece.slice(1)]}</span>
{:else}
  <img src={`/pieces/${theme.pieces.name}/${piece}.svg`} alt={piece} />
{/if}

<style lang="scss">
  .fontPiece {
    font-family: "Linux Libertine";

    &:global(.w) {
      color: white;
      -webkit-text-stroke: .012em black;
    }
    &:global(.b) {
      color: #022;
        -webkit-text-stroke: .012em #acc;
    }
  }

  img {
    height: 90%
  }
</style>
