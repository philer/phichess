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
  export let outline: boolean = false
  const { pieces } = getContext<Theme>("theme")
</script>

{#if pieces.type === "font"}
  <span class={piece[0]} class:outline>
    {PIECE_TO_UTF8[piece.slice(1)]}
  </span>
{:else}
  <img
    src={`/pieces/${pieces.name}/${piece}.svg`}
    alt={piece}
    class={piece[0]}
    class:outline
    style:font-size={`${pieces.scale}em`}
  />
{/if}

<style lang="scss">
  span {
    font-family: "Linux Libertine";

    &:global(.w) { color: white }
    &:global(.b) { color: #111 }
    &.outline {
      &:global(.w) { -webkit-text-stroke: .012em black }
      &:global(.b) { -webkit-text-stroke: .012em white }
    }
  }

  img {
    height: 1em;

    &.outline {
      &:global(.w) { filter: drop-shadow(0 0 1px black); }
      &:global(.b) { filter: drop-shadow(0 0 1px white); }
    }
  }
</style>
