<script lang="ts">
  import Checkbox from "./Checkbox.svelte"
  import LayoutSettings from "./LayoutSettings.svelte"
  import { settings } from "./settings"
  import ThemeSettings from "./ThemeSettings.svelte"
  import TimeControlSettings from "./TimeControlSettings.svelte"

</script>

<form>
  <h2>Settings</h2>

  <!-- layout -->
  <fieldset>
    <legend>Layout</legend>
    <LayoutSettings />

    <Checkbox bind:checked={$settings.showHistory}>Show history</Checkbox>
    <Checkbox bind:checked={$settings.showGraveyards}>Show graveyards</Checkbox>
    <Checkbox bind:checked={$settings.showCoordinates}>Show coordinates</Checkbox>
  </fieldset>

  <!-- time control -->
  <fieldset>
    <TimeControlSettings />
  </fieldset>

  <!-- theme -->
  <fieldset>
    <ThemeSettings />
  </fieldset>

</form>


<style lang="sass">
  h2
    font-size: 1.3em
    margin: 0 auto
    width: 100%
    width: max-content

  form, form :global(fieldset)
    display: flex
    flex-direction: column
    align-items: stretch
    gap: 1em

  form
    font-size: .9em
    height: 100%
    width: 100%
    padding: 1em .5em
    overflow-y: auto

    text-align: left
    --icon-size: 1.5em

    > :global(fieldset)
      width: min(40em, 95vw)
      margin: 0 auto
      padding: .5em 1em

      background: #333
      border-left: .15em solid #555
      > :global(fieldset)
        padding: .5em 1em
        background: #3a3a3a
        border-left: .15em solid #5c5c5c

      > :global(legend)
        display: contents
        font-weight: bold
        font-size: 1.1em

      &:last-child
        border-bottom: 0 solid transparent

</style>
