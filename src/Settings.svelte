<script lang="ts">
  import {
    mdiCheckerboard,
    mdiClockOutline,
    mdiFormatListNumbered,
    mdiMonitorDashboard,
  } from "@mdi/js"

  import BoardSettings from "./BoardSettings.svelte"
  import Checkbox from "./Checkbox.svelte"
  import Icon from "./Icon.svelte"
  import LayoutSettings from "./LayoutSettings.svelte"
  import { settings } from "./stores"
  import TimeControlSettings from "./TimeControlSettings.svelte"

</script>

<form on:submit={evt => evt.preventDefault()}>
  <!-- layout -->
  <fieldset>
    <legend><Icon path={mdiMonitorDashboard} size="1.2em" />Layout</legend>
    <LayoutSettings />

    <Checkbox bind:checked={$settings.showBoardFrame} help="Required for time control">
      Show board frame
    </Checkbox>

    {#if $settings.showBoardFrame}
      <Checkbox bind:checked={$settings.showGraveyards}>Show captured pieces</Checkbox>
    {:else}
      <Checkbox checked={false} disabled help="Unavailable without board frame">Show captured pieces</Checkbox>
    {/if}
  </fieldset>

  <!-- time control -->
  <fieldset>
    <legend><Icon path={mdiClockOutline} size="1.2em" />Time Control</legend>
    <TimeControlSettings />
  </fieldset>

  <!-- board -->
  <fieldset>
    <legend><Icon path={mdiCheckerboard} size="1.2em" />Board</legend>
    <BoardSettings />
    <Checkbox bind:checked={$settings.showLegalMoves}>Show legal moves</Checkbox>
    <Checkbox bind:checked={$settings.showCoordinates}>Show coordinates</Checkbox>
  </fieldset>

  <!-- sidebar -->
  <fieldset>
    <legend><Icon path={mdiFormatListNumbered} size="1.2em" />History</legend>
    <Checkbox bind:checked={$settings.showHistory}>Show moves in sidebar</Checkbox>
    <label>
      Notation:
      <select bind:value={$settings.notation}>
        <option value="algebraic">Simple</option>
        <option value="fancy_algebraic">Fancy</option>
      </select>
    </label>
  </fieldset>
</form>


<style lang="sass">
  form, form :global(fieldset)
    display: flex
    flex-direction: column
    align-items: stretch
    gap: 1.5em

  form
    max-width: 35em
    font-size: .9em
    text-align: left
    --icon-size: 1.5em

    > :global(fieldset)
      padding-bottom: 1em
      background: #3a3a3a
      border: 1px solid #555
      box-shadow: 0 0 5px #0003

      > :global(*)
        margin: 0 1em

      > :global(legend)
        margin: 0
        float: left
        display: flex
        align-items: center
        gap: .333em
        padding: .5em
        border-bottom: 1px solid #555
        background: #4a4a4a
        font-size: 1.1em
        font-weight: bold
        font-variant: small-caps

    :global(small)
      display: block
      opacity: .75
</style>
