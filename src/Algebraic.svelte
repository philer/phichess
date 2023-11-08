<script lang="ts">
  import type { Move } from "./chess"
  import PieceIcon from "./PieceIcon.svelte"

  export let move: Move | undefined = undefined
</script>

{#if move?.algebraic}
  {#each move.algebraic as character, idx (`${idx}${character}`)}
    <PieceIcon piece={character} />
  {/each}
{/if}
