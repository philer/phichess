<script lang="ts">
  import { BOARD_THEMES } from "./settings"
  import { settings } from "./stores"

  let themeName = $settings.theme.board._name
  $: $settings.theme.board = BOARD_THEMES.find(theme => theme._name === themeName) ?? BOARD_THEMES[0]
</script>


<legend>Board</legend>

<div class="theme-list">
  {#each BOARD_THEMES as theme (theme._name)}
    <label class:selected={themeName === theme._name}>
      <input type="radio" value={theme._name} bind:group={themeName} />
      <div
        class="board"
        style:--theme-light-square-background={theme.lightBackground}
        style:--theme-dark-square-background={theme.darkBackground}
        style:--theme-selected-light-square-background={theme.selectedLightBackground}
        style:--theme-selected-dark-square-background={theme.selectedDarkBackground}
        style:--theme-last-move-light-square-background={theme.lastMoveLightBackground}
        style:--theme-last-move-dark-square-background={theme.lastMoveDarkBackground}
        style:--theme-check-light-square-background={theme.checkLightBackground}
        style:--theme-check-dark-square-background={theme.checkDarkBackground}
      >
        <div /><div /><div /><div />
      </div>
    </label>
  {/each}
</div>


<style lang="sass">
  .theme-list
    display: flex
    justify-content: center
    flex-wrap: wrap
    gap: 2em 2em

  .board
    width: 5em
    height: 5em
    display: grid
    grid-template-rows: 1fr 1fr
    grid-template-columns: 1fr 1fr
    > div
      &:nth-of-type(1), &:nth-of-type(4)
        background-color: var(--theme-light-square-background)
      &:nth-of-type(2), &:nth-of-type(3)
        background-color: var(--theme-dark-square-background)

  label
    display: flex
    padding: .4em
    border: .2em solid transparent

  .selected
    border-color: currentColor
</style>
