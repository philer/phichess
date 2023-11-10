<script lang="ts">
  import { mdiClose, mdiCog } from "@mdi/js"

  import { START_GAME } from "./chess"
  import Game from "./Game.svelte"
  import Icon from "./Icon.svelte"
  import { settings } from "./settings"
  import Settings from "./Settings.svelte"

  const { theme } = $settings
  let showSettings = false

  let game = START_GAME
</script>

<div
  style:background={theme.pageBackground}
  style:--theme-page-background={theme.pageBackground}
  style:--theme-light-square-background={theme.board.lightBackground}
  style:--theme-dark-square-background={theme.board.darkBackground}
  style:--theme-selected-light-square-background={theme.board.selectedLightBackground}
  style:--theme-selected-dark-square-background={theme.board.selectedDarkBackground}
  style:--theme-last-move-light-square-background={theme.board.lastMoveLightBackground}
  style:--theme-last-move-dark-square-background={theme.board.lastMoveDarkBackground}
  style:--theme-check-light-square-background={theme.board.checkLightBackground}
  style:--theme-check-dark-square-background={theme.board.checkDarkBackground}
>
  <header>
    <h1>Kind of OTB Chess</h1>
    <button on:click={() => showSettings = !showSettings} title="Settings">
      <Icon path={showSettings ? mdiClose : mdiCog} />
    </button>
  </header>

  {#if showSettings}
    <Settings />
  {:else}
    <Game bind:game />
  {/if}

</div>

<style>
  div {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: stretch;
  }
  header {
    flex: 2em 0 0;
    display: flex;
    justify-content: space-between;
    padding: 0 1em;
    background: #111;
  }
  h1 {
    font-size: 1.2em;
  }
</style>
