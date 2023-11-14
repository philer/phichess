<script lang="ts">
  import { mdiChessPawn, mdiRadioboxBlank, mdiRadioboxMarked } from "@mdi/js"

  import ChessboardIcon from "./ChessboardIcon.svelte"
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
</script>


<svelte:window on:resize={handleResize} />

<div class={`layout-list ${landscape ? "landscape" : "portrait"}`}>
  <label>
    <input type="radio" value="single" bind:group={layout} />
    <span>
      <Icon path={layout === "single" ? mdiRadioboxMarked : mdiRadioboxBlank} />
      Single
    </span>
    <div class="layout-preview">
      <span class="board">
        <ChessboardIcon />
        <Icon path={mdiChessPawn} />
      </span>
    </div>
  </label>

  <label>
    <input type="radio" value="double" bind:group={layout} />
    <span>
      <Icon path={layout === "double" ? mdiRadioboxMarked : mdiRadioboxBlank} />
      Double
    </span>
    <div class="layout-preview">
      <span class="board black">
        <ChessboardIcon />
        <Icon path={mdiChessPawn} />
      </span>
      <span class="board">
        <ChessboardIcon />
        <Icon path={mdiChessPawn} />
      </span>
    </div>
  </label>
</div>


<style lang="scss">
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
    --icon-size: 4em;

    border: .15em solid currentColor;
    border-bottom-width: 1em;
    border-radius: .3em;

    display: flex;
    flex-wrap: wrap;
    justify-content: space-around;
    align-items: center;

    --fg: #ccc;
    --bg: #333;
    color: var(--fg);
    .board {
      position: relative;
      width: var(--icon-size);
      height: var(--icon-size);
      border: .2em solid currentColor;
      > :global(svg) {
        position: absolute;
        inset: 0;
        &:nth-child(2) {
          --icon-stroke: var(--bg);
          --icon-stroke-width: 2pt;
          --icon-size: 3.5em;
          inset: .05em;
        }
      }
      &.black > :global(svg):nth-child(2) {
        color: var(--bg);
        --icon-stroke: var(--fg);
      }
    }
  }

</style>
