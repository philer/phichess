<script lang="ts">
  import BoardSettings from "./BoardSettings.svelte"
  import Checkbox from "./Checkbox.svelte"
  import LayoutSettings from "./LayoutSettings.svelte"
  import { settings } from "./stores"
  import TimeControlSettings from "./TimeControlSettings.svelte"

</script>

<form on:submit={evt => evt.preventDefault()}>
  <!-- layout -->
  <fieldset>
    <legend>Layout</legend>
    <LayoutSettings />

    <Checkbox bind:checked={$settings.showHistory}>Show moves in sidebar</Checkbox>
    <Checkbox bind:checked={$settings.showBoardFrame} help="Required for time control">
      Show board frame
    </Checkbox>

    {#if $settings.showBoardFrame}
      <Checkbox bind:checked={$settings.showGraveyards}>Show captured pieces</Checkbox>
    {:else}
      <Checkbox checked={false} disabled help="Unavailable without board frame">Show captured pieces</Checkbox>
    {/if}
  </fieldset>

  <!-- board -->
  <fieldset>
    <BoardSettings />
    <Checkbox bind:checked={$settings.showLegalMoves}>Show legal moves</Checkbox>
    <Checkbox bind:checked={$settings.showCoordinates}>Show coordinates</Checkbox>
  </fieldset>

  <!-- time control -->
  <fieldset>
    <TimeControlSettings />
  </fieldset>
</form>


<style lang="sass">
  form, form :global(fieldset)
    display: flex
    flex-direction: column
    align-items: stretch
    gap: 1em

  form
    max-width: 35em
    font-size: .9em
    text-align: left
    --icon-size: 1.5em

    > :global(fieldset)
      padding: .5em 1em

      background: #3a3a3a
      border-left: .15em solid #555
      > :global(fieldset)
        padding: .5em 1em
        background: #424242
        border-left: .15em solid #5c5c5c

      > :global(legend)
        display: contents
        font-weight: bold
        font-size: 1.1em

      &:last-child
        border-bottom: 0 solid transparent

    :global(small)
      display: block
      opacity: .75
</style>
