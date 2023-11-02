<script lang="ts">
  import type { ColorPiece, Piece } from "./chess"

  export let piece: ColorPiece

  const PIECE_TO_UTF8 = {
    "K": "♚", //"♔",
    "Q": "♛", //"♕",
    "R": "♜", //"♖",
    "B": "♝", //"♗",
    "N": "♞", //"♘",
    "": "♟", //"♙",
  }

  const utf8 = PIECE_TO_UTF8[piece.slice(1) as Piece]
</script>

<span class={"piece " + piece[0]}>
  {utf8}
</span>

<style>
  .piece {
    font-family: "Linux Libertine";
  }
</style>
