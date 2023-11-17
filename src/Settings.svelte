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
    max-width: calc(40em / 1.3)

  form, form :global(fieldset)
    display: flex
    flex-direction: column
    align-items: stretch
    gap: 1em

  form
    height: 100%
    padding: 1em
    overflow: auto

    text-align: left
    --icon-size: 1.5em

    :global(fieldset)
      > :global(legend)
        display: contents
        font-weight: bold
        font-size: 1.1em

      padding: 1em
      margin: 0 auto
      width: 100%
      max-width: 40em

      &:last-child
        border-bottom: 0 solid transparent

      background: #333
      border-left: .15em solid #555
      > :global(fieldset)
        background: #3a3a3a
        border-left: .15em solid #5c5c5c
</style>
