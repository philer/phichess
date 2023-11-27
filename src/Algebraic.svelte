<script lang="ts">
  import type { Move } from "./chess"
  import PieceIcon from "./PieceIcon.svelte"
  import { settings } from "./stores"

  export let move: Move | undefined = undefined
</script>

{#if move?.algebraic}
  {#if $settings.notation === "algebraic"}
    {move.algebraic}
  {:else}
    {#each move.algebraic as character, idx (`${idx}${character}`)}
      <PieceIcon piece={character} />
    {/each}
  {/if}
{/if}
