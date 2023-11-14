<script lang="ts">
  import { mdiClose, mdiCog } from "@mdi/js"
  import { match } from "ts-pattern"

  import { START_GAME } from "./chess"
  import Game from "./Game.svelte"
  import Icon from "./Icon.svelte"
  import { settings } from "./settings"
  import Settings from "./Settings.svelte"

  let showSettings = false

  let game = START_GAME

  const newGame = () => {
    game = START_GAME
    showSettings = false
  }

  $: theme = $settings.theme

  const handleGlobalKeydown = (evt: KeyboardEvent) =>
    match(evt.key)
      .with("Escape", () => { showSettings = false })
</script>


<svelte:document on:keydown={handleGlobalKeydown} />

<div
  class="app"
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

    <div style:flex-grow="1" />

    <button on:click={newGame} class="new-game-button">New Game</button>

    <button
      title="Settings"
      on:click={() => showSettings = !showSettings}
      class="settings-button"
    >
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
  .app {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: stretch;
  }
  header {
    flex: 2em 0 0;
    display: flex;
    align-items: center;
    gap: 2em;
    padding: 0 1em;
    background: #111;
    white-space: nowrap;
  }
  h1 {
    font-size: 1.2em;
  }
  .new-game-button {
    padding: 0 .5em;
    font-size: .85em;
    font-weight: bold;
    line-height: 1.5em;
    background: #6c5;
    color: #050;
    border: 1px solid #050;
    border-radius: .25em;
    text-shadow: none;
  }
</style>
