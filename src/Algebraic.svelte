<script context="module" lang="ts">
  import {
    mdiChessBishop,
    mdiChessKing,
    mdiChessKnight,
    mdiChessQueen,
    mdiChessRook,
  } from "@mdi/js"

  import type { Move } from "./chess"
  import Icon from "./Icon.svelte"
</script>

<script lang="ts">
  export let move: Move | undefined = undefined
</script>

{#if move?.algebraic}
  {#each move.algebraic as character, idx (`${idx}${character}`)}
    {#if character === "N"}
      <Icon path={mdiChessKnight} />
    {:else if character === "B"}
      <Icon path={mdiChessBishop} />
    {:else if character === "R"}
      <Icon path={mdiChessRook} />
    {:else if character === "Q"}
      <Icon path={mdiChessQueen} />
    {:else if character === "K"}
      <Icon path={mdiChessKing} />
    {:else}
      {character}
    {/if}
  {/each}
{/if}
