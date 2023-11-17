<script lang="ts">
  import { mdiChevronDoubleLeft, mdiChevronDoubleRight, mdiClose, mdiCog, mdiRestart } from "@mdi/js"
  import { match } from "ts-pattern"

  import { START_GAME } from "./chess"
  import Game from "./Game.svelte"
  import Icon from "./Icon.svelte"
  import { settings } from "./settings"
  import Settings from "./Settings.svelte"

  let showSettings = false

  let game = START_GAME

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

    {#if !showSettings && game.history.length > 0}
      <button
        on:click={() => game = START_GAME}
        title="New game"
        class="icon-button"
      >
        <Icon path={mdiRestart} />
      </button>
    {/if}

    <button
      on:click={() => showSettings = !showSettings}
      title="Settings"
      class="icon-button"
    >
      <Icon path={showSettings ? mdiClose : mdiCog} />
    </button>

    {#if !showSettings}
      <button
        on:click={() => $settings.showHistory = !$settings.showHistory}
        title={$settings.showHistory ? "Hide history" : "Show history"}
        class="icon-button"
      >
        <Icon path={$settings.showHistory ? mdiChevronDoubleRight : mdiChevronDoubleLeft} />
      </button>
    {/if}
  </header>

  {#if showSettings}
    <Settings />
  {:else}
    <Game bind:game />
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
    --header-height: 2em
    flex: var(--header-height) 0 0
    display: flex
    align-items: center
    background: #111
    white-space: nowrap
    > button.icon-button
      width: var(--header-height)
      height: var(--header-height)

  h1
    font-size: 1.2em
    flex: min-content 1 1
    text-align: left
    overflow: hidden
    text-overflow: ellipsis

  .new-game-button
    @include common.button
    margin-right: 1em
</style>
