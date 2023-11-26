<script lang="ts">
  import { mdiCheckboxBlankOutline, mdiCheckboxMarkedOutline } from "@mdi/js"

  import Icon from "./Icon.svelte"

  export let checked: boolean
  export let disabled: boolean = false
  export let help: string | undefined = undefined
</script>

<label class:disabled>
  <input type="checkbox" bind:checked {disabled} />
  <Icon path={checked ? mdiCheckboxMarkedOutline : mdiCheckboxBlankOutline} />
  <slot />
  {#if help}
    <small>({help})</small>
  {/if}
</label>


<style lang="sass">
  label
    display: flex
    flex-wrap: wrap
    gap: 0 .5em
    &.disabled
      opacity: .5
      cursor: default

  input[type="checkbox"]
    position: fixed
    inset: -999px -999px auto auto

  small
    flex: 100% 0 0
</style>
