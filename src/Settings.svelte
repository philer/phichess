<script lang="ts">
  import Checkbox from "./Checkbox.svelte"
  import { settings } from "./settings"

  let hours = Math.floor($settings.clock.secondsPerSide / 3600)
  let minutes = Math.floor($settings.clock.secondsPerSide % 3600 / 60)
  let seconds = Math.floor($settings.clock.secondsPerSide % 60)

  $: {
    minutes += Math.floor(seconds / 60)
    hours += Math.floor(minutes / 60)
    seconds %= 60
    minutes %= 60
    $settings.clock.secondsPerSide = hours * 3600 + minutes * 60 + seconds
  }
</script>

<form>
  <fieldset>
    <Checkbox bind:checked={$settings.showCoordinates}>Show coordinates</Checkbox>
    <Checkbox bind:checked={$settings.showHistory}>Show history</Checkbox>
    <Checkbox bind:checked={$settings.showGraveyards}>Show graveyards</Checkbox>
  </fieldset>

  <fieldset>
    <Checkbox bind:checked={$settings.useTimeControl}>Use time control</Checkbox>

    <!-- TODO <select> presets -->

    <fieldset disabled={!$settings.useTimeControl}>
      <legend>Time per side (hours : minutes : seconds)</legend>
      <div class="time-per-side">
        <input
          type="number"
          min="0"
          step="1"
          bind:value={hours}
        />
        :
        <input
          type="number"
          min="0"
          step="1"
          bind:value={minutes}
        />
        :
        <input
          type="number"
          min="0"
          step="1"
          bind:value={seconds}
        />
      </div>
    </fieldset>
    <fieldset disabled={!$settings.useTimeControl}>
      <label>
        Increment:
        <input
          type="number"
          bind:value={$settings.clock.increment}
        />
        seconds
      </label>
      <small>Time added to a player's clock after when they have made a move.</small>
    </fieldset>
  </fieldset>

  <!-- TODO layout -->
  <!-- TODO theme -->
</form>


<style lang="scss">
  form, fieldset {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 1em;
  }
  form {
    margin: 2em auto;
    max-width: 40em;

    text-align: left;
    --icon-size: 1.5em;
  }
  fieldset {
    padding: 1em;
    border-bottom: 1px dotted #fff6;

    &:last-child {
      border-bottom: 0 solid transparent;
    }

    background: #fff1;
    border-bottom: 0 solid transparent;
    border-left: 3px solid #fff3;
  }
  .time-per-side {
    display: flex;
    gap: .25em;
  }
  input[type="number"] {
    width: 5em;
    padding: .1em .3em;
    text-align: right;
    background: #444;

  }
  :disabled {
    opacity: .5;
  }
</style>
