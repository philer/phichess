<script lang="ts">
  import { mdiCheckerboard, mdiRadioboxBlank, mdiRadioboxMarked } from "@mdi/js"

  import Checkbox from "./Checkbox.svelte"
  import Icon from "./Icon.svelte"
  import { settings } from "./settings"

  let layout: string = $settings.layout.length === 1 ? "single" : "double"
  let landscape: boolean = window.innerWidth > window.innerHeight

  const handleResize = () => {
    landscape = window.innerWidth > window.innerHeight
  }

  $: {
    if (layout === "single" && $settings.layout.length !== 1) {
      $settings.layout = [{ asWhite: true, rotate: 0 }]
    } else if (layout === "double" && $settings.layout.length !== 2) {
      $settings.layout = [
        { asWhite: true, rotate: 0 },
        { asWhite: false, rotate: 0 },
      ]
    }
  }


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

<svelte:window on:resize={handleResize} />

<form>
  <!-- layout -->
  <fieldset>
    <legend>Layout</legend>
    <div class={`layout-list ${landscape ? "landscape" : "portrait"}`}>
      <label>
        <input type="radio" value="single" bind:group={layout} />
        <span>
          <Icon path={layout === "single" ? mdiRadioboxMarked : mdiRadioboxBlank} />
          Single
        </span>
        <div class="layout-preview">
          <Icon path={mdiCheckerboard} />
        </div>
      </label>
      <label>
        <input type="radio" value="double" bind:group={layout} />
        <span>
          <Icon path={layout === "double" ? mdiRadioboxMarked : mdiRadioboxBlank} />
          Double
        </span>
        <div class="layout-preview">
          <Icon path={mdiCheckerboard} />
          <Icon path={mdiCheckerboard} />
        </div>
      </label>
    </div>
  </fieldset>

  <!-- view options -->
  <fieldset>
    <Checkbox bind:checked={$settings.showCoordinates}>Show coordinates</Checkbox>
    <Checkbox bind:checked={$settings.showHistory}>Show history</Checkbox>
    <Checkbox bind:checked={$settings.showGraveyards}>Show graveyards</Checkbox>
  </fieldset>

  <!-- time control -->
  <fieldset>
    <Checkbox bind:checked={$settings.useTimeControl}>Use time control</Checkbox>
    <label class="time-presets">
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
       (minutes | increment)
    </label>

    <fieldset disabled={!$settings.useTimeControl}>
      <legend>Time per side (hours : minutes : seconds)</legend>
      <div class="time-per-side">
        <label>
          Hours
          <input
            type="number"
            min="0"
            step="1"
            bind:value={hours}
          />
        </label>
        :
        <label>
          Minutes
          <input
            type="number"
            min="0"
            step="1"
            bind:value={minutes}
          />
        </label>
        :
        <label>
          Seconds
          <input
            type="number"
            min="0"
            step="1"
            bind:value={seconds}
          />
        </label>
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
      <small>Time added to a player's clock when they have made a move.</small>
    </fieldset>
  </fieldset>

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

    &:last-child {
      border-bottom: 0 solid transparent;
    }

    background: #333;
    border-left: .15em solid #555;
  }
  select, input[type="number"] {
    font-size: inherit;
    line-height: inherit;
    padding: .25em;
    border-radius: .15em;
    background: #444;
    color: inherit;
    border: 1px solid #666;
    box-shadow: 1px 1px 3px #0003;
  }
  input[type="number"] {
    width: 5em;
    padding: .1em .3em;
    text-align: right;
  }
  :disabled {
    opacity: .5;
  }

  .layout-list {
    display: flex;
    justify-content: stretch;
    > label {
      flex: 50% 1 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      > span {
        display: flex;
        align-items: center;
        gap: .5em;
      }
    }
  }
  .layout-preview {
    .landscape & {
      width: 10em;
      aspect-ratio: 16/9;
    }
    .portrait & {
      height: 10em;
      aspect-ratio: 1/2;
    }
    box-sizing: content-box;
    margin-top: .5em;
    --icon-size: 5em;

    border: .15em solid currentColor;
    border-bottom-width: 1em;
    border-radius: .3em;

    display: flex;
    flex-wrap: wrap;
    justify-content: space-around;
    align-items: center;

    color: #ccc;
  }

  .time-presets {
    display: flex;
    align-items: center;
    gap: .5em;
  }
  .time-per-side {
    display: flex;
    align-items: end;
    gap: .25em;
    > label {
      display: flex;
      flex-direction: column;
    }
  }
</style>
