<script lang="ts">
  import Checkbox from "./Checkbox.svelte"
  import { settings } from "./stores"

  let hours = Math.floor($settings.clock.secondsPerSide / 3600)
  let minutes = Math.floor($settings.clock.secondsPerSide % 3600 / 60)
  let seconds = Math.floor($settings.clock.secondsPerSide % 60)
  let timePreset = "Custom"

  const timePresetOptions = {
    Bullet: ["1 | 0", "1 | 1", "2 | 1"],
    Blitz: ["3 | 0", "3 | 2", "5 | 0", "5 | 3"],
    Rapid: ["10 | 0", "10 | 5", "15 | 10", "30 | 0", "30 | 20", "60 | 0", "60 | 20"],
  }

  const setTimePreset = (value: string) => {
    const match = /^(\d+) \| (\d+)$/.exec(value)
    if (match) {
      hours = 0
      minutes = +match[1]
      seconds = 0
      $settings.clock.increment = +match[2]
    }
  }

  $: {
    minutes += Math.floor(seconds / 60)
    hours += Math.floor(minutes / 60)
    seconds %= 60
    minutes %= 60
    $settings.clock.secondsPerSide = hours * 3600 + minutes * 60 + seconds

    timePreset = `${$settings.clock.secondsPerSide / 60} | ${$settings.clock.increment}`
    if (!Object.values(timePresetOptions).flat().includes(timePreset)) {
      timePreset = "Custom"
    }
  }
</script>


<legend>Time control</legend>

<Checkbox bind:checked={$settings.useTimeControl}>Enable time control</Checkbox>

<fieldset disabled={!$settings.useTimeControl}>
  <label>
    Preset:
    <select
      value={timePreset}
      on:change={evt => setTimePreset(evt.currentTarget.value)}
      disabled={!$settings.useTimeControl}
    >
      <option value="Custom">Custom</option>
      {#each Object.entries(timePresetOptions) as [label, options] (label)}
        <optgroup label="Bullet">
          {#each options as option (option)}
            <option>{option}</option>
          {/each}
        </optgroup>
      {/each}
    </select>
    <small>(Minutes | Increment)</small>
  </label>

  <div class="time-per-side">
    <legend>Time per side:</legend>
    <div>
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
    <small>(Hours : Minutes : Seconds)</small>
  </div>

  <label>
    Increment:
    <input
      type="number"
      bind:value={$settings.clock.increment}
    />
    Seconds
    <small>(Time added to a player's clock when they have made a move)</small>
  </label>
</fieldset>


<style lang="sass">
  select, input[type="number"]
    font-size: inherit
    line-height: inherit
    padding: .25em
    border-radius: .15em
    background: #444
    color: inherit
    border: 1px solid #666
    box-shadow: 1px 1px 3px #0003

  input[type="number"]
    width: 4em
    padding: .1em .3em
    text-align: right

  :disabled
    opacity: .5

  .time-per-side
    > legend
      display: inline-block
    > div
      display: inline-block

  small
    display: block
    opacity: .75
</style>
