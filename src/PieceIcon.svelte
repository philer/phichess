<script context="module" lang="ts">
  import {
    mdiChessBishop,
    mdiChessKing,
    mdiChessKnight,
    mdiChessPawn,
    mdiChessQueen,
    mdiChessRook,
  } from "@mdi/js"

  import Icon from "./Icon.svelte"

  const paths: Record<string, string> = {
    "": mdiChessPawn,
    "N": mdiChessKnight,
    "B": mdiChessBishop,
    "R": mdiChessRook,
    "Q": mdiChessQueen,
    "K": mdiChessKing,
  }
</script>

<script lang="ts">
  export let piece: string
  export let size: string | undefined = undefined
  export let flip: "horizontal" | "vertical" | undefined = undefined
  export let rotate: number = 0

  const path = paths[piece]
</script>


{#if path}
  <Icon {path} {size} {flip} {rotate} />
{:else}
  {piece}
{/if}
