<script context="module" lang="ts">
  import { getContext } from "svelte"

  import type { ColorPiece } from "./chess"
  import type { Theme } from "./theme"
</script>

<script lang="ts">
  export let piece: ColorPiece
  export let glow: boolean = false
  const { pieces } = getContext<Theme>("theme")
</script>

<img
  src={`/pieces/${pieces.name}/${piece}.svg`}
  alt={piece}
  class={piece[0]}
  class:glow
  style:font-size={`${pieces.scale}em`}
/>

<style lang="scss">
  img {
    height: 1em;
    &.glow {
      &:global(.w) { filter: drop-shadow(0 0 1px black); }
      &:global(.b) { filter: drop-shadow(0 0 1px white); }
    }
  }
</style>
