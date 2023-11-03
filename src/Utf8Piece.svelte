<script context="module" lang="ts">
  import type { ColorPiece, Piece } from "./chess"

  const PIECE_TO_UTF8 = {
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

  $: utf8 = PIECE_TO_UTF8[piece.slice(1) as Piece]
</script>

<span class={"piece " + piece[0]}>
  {utf8}
</span>

<style lang="scss">
  .piece {
    font-family: "Linux Libertine";

    &:global(.w) {
      color: white;
      -webkit-text-stroke: .012em black;
    }
    &:global(.b) {
      // color: black;
      color: #022;
        -webkit-text-stroke: .012em #acc;
    }
  }
</style>
