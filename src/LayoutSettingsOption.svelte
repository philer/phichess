<script lang="ts">
  import { mdiChessPawn, mdiRadioboxBlank, mdiRadioboxMarked } from "@mdi/js"

  import ChessboardIcon from "./ChessboardIcon.svelte"
  import Icon from "./Icon.svelte"
  import type { LayoutPerspective } from "./settings"

  export let label: string
  export let value: string
  export let layout: Readonly<LayoutPerspective[]>
  export let group: string
  export let landscape: boolean
</script>


<label>
  <input type="radio" value={value} bind:group />
  <span>
    <Icon path={group === value ? mdiRadioboxMarked : mdiRadioboxBlank} />
    {label}
  </span>
  <div class={`layout-preview ${landscape ? "landscape" : "portrait"}`}>
    {#each layout as { asWhite, rotate, flipOpponentPieces }}
      <span class={`board ${asWhite ? "white" : "black"}`}>
        <ChessboardIcon />
        {#if flipOpponentPieces}
          <span style:transform={`rotate(${rotate}deg)`}>
            <Icon path={mdiChessPawn} />
            <Icon path={mdiChessPawn} rotate={180} />
          </span>
        {:else}
          <Icon path={mdiChessPawn} {rotate} />
        {/if}
      </span>
    {/each}
  </div>
</label>


<style lang="sass">
  label
    flex: 25% 1 1
    display: flex
    flex-direction: column
    align-items: center
    > span
      display: flex
      align-items: center
      gap: .5em
      white-space: nowrap

  .layout-preview
    &.landscape
      width: 10em
      aspect-ratio: 16/9

    &.portrait
      height: 10em
      aspect-ratio: 1/2

    box-sizing: content-box
    margin-top: .5em
    --icon-size: 4em

    border: .15em solid currentColor
    border-bottom-width: 1em
    border-radius: .3em

    display: flex
    flex-wrap: wrap
    justify-content: space-around
    align-items: center

    --fg: #ccc
    --bg: #333
    color: var(--fg)
    .board
      position: relative
      width: var(--icon-size)
      height: var(--icon-size)
      border: .2em solid currentColor
      > :global(svg), span
        position: absolute
        inset: 0
        &:nth-child(2)
          --icon-stroke: var(--bg)
          --icon-stroke-width: 2pt
          --icon-size: 3.5em
          inset: .05em

      > span
        display: flex
        flex-direction: column-reverse

      &.black > :global(svg):nth-child(2),
      & > span > :global(svg):nth-child(2)
        color: var(--bg)
        --icon-stroke: var(--fg)
</style>
