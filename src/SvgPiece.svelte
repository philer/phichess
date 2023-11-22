<script lang="ts">
  import type { ColorPiece } from "./chess"
  import { settings } from "./stores"

  export let piece: ColorPiece
  export let glow: boolean = false

  const { pieces } = $settings.theme
</script>

<img
  src={`pieces/${pieces.name}/${piece}.svg`}
  alt={piece}
  class={piece[0]}
  class:glow
  style:font-size={`${pieces.scale}em`}
/>

<style lang="sass">
  img
    height: 1em
    &.glow
      &:global(.w)
        filter: drop-shadow(0 0 1px black)
      &:global(.b)
        filter: drop-shadow(0 0 1px white)


</style>
