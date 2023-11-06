<script context="module" lang="ts">
  const doubleDigit = (x: number) => Math.floor(x).toString().padStart(2, "0")
</script>

<script lang="ts">
  export let seconds: number
</script>

<div class="clock">
  {#if seconds < 10}
    {seconds.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
  {:else if seconds < 3600}
    {Math.floor(seconds / 60)}:{doubleDigit(seconds % 60)}
  {:else}
    {Math.floor(seconds / 3600)}:${doubleDigit(seconds % 3600 / 60)}:{doubleDigit(seconds % 60)}
  {/if}
</div>

<style lang="scss">
  .clock {
    display: flex;
    align-items: center;
  }
</style>
