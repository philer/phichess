<script lang="ts">
  import { mdiChevronDoubleLeft, mdiChevronDoubleRight, mdiClose, mdiCog, mdiRestart } from "@mdi/js"
  import { match } from "ts-pattern"

  import { START_GAME } from "./chess"
  import Game from "./Game.svelte"
  import Icon from "./Icon.svelte"
  import Settings from "./Settings.svelte"
  import { game, settings } from "./stores"

  let isSettingsOpen = location.hash === "#settings"
  const handleHashChange = (_evt: HashChangeEvent) => {
    isSettingsOpen = location.hash === "#settings"
  }
  const openSettings = () => {
    window.location.hash = "settings"
  }
  const closeSettings = () => {
    if (isSettingsOpen) {
      window.location.hash = ""
    }
  }

  $: theme = $settings.theme

  const handleGlobalKeydown = (evt: KeyboardEvent) =>
    match(evt.key)
      .with("Escape", closeSettings)
</script>

<svelte:window on:hashchange={handleHashChange} />
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
    <h1><a href="/">φ</a></h1>

    {#if !isSettingsOpen && $game.history.length > 0}
      <button
        on:click={() => $game = START_GAME}
        title="New game"
        class="icon-button"
      >
        <Icon path={mdiRestart} />
      </button>
    {/if}

    <button
      on:click={isSettingsOpen ? closeSettings : openSettings}
      title="Settings"
      class="icon-button"
    >
      <Icon path={isSettingsOpen ? mdiClose : mdiCog} />
    </button>

    {#if !isSettingsOpen}
      <button
        on:click={() => $settings.showHistory = !$settings.showHistory}
        title={$settings.showHistory ? "Hide history" : "Show history"}
        class="icon-button"
      >
        <Icon path={$settings.showHistory ? mdiChevronDoubleRight : mdiChevronDoubleLeft} />
      </button>
    {/if}
  </header>

  {#if isSettingsOpen}
    <Settings />
  {:else}
    <Game bind:game={$game} />
  {/if}
</div>


<style lang="sass">
  @use "common"

  .app
    width: 100%
    height: 100%
    display: flex
    flex-direction: column
    justify-content: stretch

  header
    --header-height: 2rem
    flex: var(--header-height) 0 0
    display: flex
    align-items: center
    background: #111
    white-space: nowrap
    > button.icon-button
      width: var(--header-height)
      height: var(--header-height)

  h1
    font-size: 1.6em
    flex: min-content 1 1
    font-family: "Linux Libertine"
    font-weight: normal
    > a
      display: block
      width: var(--header-height)
      height: var(--header-height)
      line-height: calc(.7 * var(--header-height))
      text-align: center
      color: inherit
      text-decoration: none
</style>
