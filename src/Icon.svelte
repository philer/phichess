<script lang="ts">
  import { isTruthy } from "./util"

  export let path: string
  export let size: string | undefined = undefined
  export let flip: "horizontal" | "vertical" | undefined = undefined
  export let rotate: number = 0
</script>

<svg
  viewBox="0 0 24 24"
  style:width={size}
  style:height={size}
  style:transform={
    [
      flip ? flip === "horizontal" ? "scale(-1, 1)" : "scale(1, -1)" : false,
      rotate ? `rotate(${rotate})` : false,
    ]
      .filter(isTruthy)
      .join(" ")
  }
><path fill="currentColor" d={path} /></svg>

<style lang="scss">
  svg {
    width: var(--icon-size);
    height: var(--icon-size);
    vertical-align: var(--icon-vertical-align, -.1em);
  }
  path {
    paint-order: stroke;
    stroke-width: 2pt;
    stroke: var(--icon-stroke, none);
  }
</style>
