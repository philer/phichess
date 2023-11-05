<script lang="ts">
  import { setContext } from "svelte"

  import Game from "./Game.svelte"
  import { classicPieces, cyanBoard, type Theme } from "./theme"

  let theme: Theme = {
    pageBackground: "linear-gradient(0deg, rgba(1,33,61,1) 0%, rgba(0,86,103,1) 100%)",
    // board: lichessBoard,
    // board: chessComBoard,
    board: cyanBoard,
    // pieces: fontPieces,
    pieces: classicPieces,
  }
  setContext("theme", theme)
</script>

<Game
  --theme-page-background={theme.pageBackground}
  --theme-light-square-background={theme.board.lightBackground}
  --theme-dark-square-background={theme.board.darkBackground}
  --theme-selected-light-square-background={theme.board.selectedLightBackground}
  --theme-selected-dark-square-background={theme.board.selectedDarkBackground}
/>

<style lang="scss">
</style>
