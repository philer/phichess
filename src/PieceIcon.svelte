<script lang="ts">
  import {
    mdiChessBishop,
    mdiChessKing,
    mdiChessKnight,
    mdiChessPawn,
    mdiChessQueen,
    mdiChessRook,
  } from "@mdi/js"

  import Icon from "./Icon.svelte"

  export let piece: string
  export let size: string = "1em"
  export let flip: "horizontal" | "vertical" | undefined = undefined
  export let rotate: number = 0
</script>

{#if piece === ""}
  <Icon path={mdiChessPawn} {size} {flip} {rotate} />
{:else if piece === "N"}
  <Icon path={mdiChessKnight} {size} {flip} {rotate} />
{:else if piece === "B"}
  <Icon path={mdiChessBishop} {size} {flip} {rotate} />
{:else if piece === "R"}
  <Icon path={mdiChessRook} {size} {flip} {rotate} />
{:else if piece === "Q"}
  <Icon path={mdiChessQueen} {size} {flip} {rotate} />
{:else if piece === "K"}
  <Icon path={mdiChessKing} {size} {flip} {rotate} />
{:else}
  {piece}
{/if}
