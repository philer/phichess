<script lang="ts">
  import { setContext } from "svelte"

  import Game from "./Game.svelte"
  import { classicPieces, lichessBoard, type Theme } from "./theme"

  const theme = setContext<Theme>("theme", {
    // pageBackground: "linear-gradient(0deg, rgba(1,33,61,1) 0%, rgba(0,86,103,1) 100%)",
    pageBackground: "#222",
    board: lichessBoard,
    // board: chessComBoard,
    // board: cyanBoard,
    // pieces: fontPieces,
    pieces: classicPieces,
  })
</script>

<div
  style:background={theme.pageBackground}
  style:--theme-page-background={theme.pageBackground}
  style:--theme-light-square-background={theme.board.lightBackground}
  style:--theme-dark-square-background={theme.board.darkBackground}
  style:--theme-selected-light-square-background={theme.board.selectedLightBackground}
  style:--theme-selected-dark-square-background={theme.board.selectedDarkBackground}
>
  <Game />
</div>

<style>
  div {
    width: 100%;
    height: 100%;
  }
</style>
