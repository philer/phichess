<script lang="ts">
  import Checkbox from "./Checkbox.svelte"
  import LayoutSettings from "./LayoutSettings.svelte"
  import { settings } from "./settings"
  import TimeControlSettings from "./TimeControlSettings.svelte"

</script>

<form>
  <!-- layout -->
  <fieldset>
    <legend>Layout</legend>
    <LayoutSettings />
  </fieldset>

  <!-- view options -->
  <fieldset>
    <Checkbox bind:checked={$settings.showCoordinates}>Show coordinates</Checkbox>
    <Checkbox bind:checked={$settings.showHistory}>Show history</Checkbox>
    <Checkbox bind:checked={$settings.showGraveyards}>Show graveyards</Checkbox>
  </fieldset>

  <!-- time control -->
  <fieldset>
    <TimeControlSettings />
  </fieldset>

  <!-- TODO theme -->
</form>


<style lang="scss">
  form, form :global(fieldset) {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 1em;
  }
  form {
    height: 100%;
    padding: 2em 1em;
    overflow: auto;

    text-align: left;
    --icon-size: 1.5em;

    :global(fieldset) {
      padding: 1em;
      margin: 0 auto;
      width: 100%;
      max-width: 40em;

      &:last-child {
        border-bottom: 0 solid transparent;
      }

      background: #333;
      border-left: .15em solid #555;
      > :global(fieldset) {
        background: #3a3a3a;
        border-left: .15em solid #5c5c5c;
      }
    }
  }
</style>
