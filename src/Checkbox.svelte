<script lang="ts">
  import { mdiCheckboxBlankOutline, mdiCheckboxMarkedOutline } from "@mdi/js"

  import Icon from "./Icon.svelte"

  export let checked: boolean
</script>

<label>
  <input type="checkbox" bind:checked />
  <Icon path={checked ? mdiCheckboxMarkedOutline : mdiCheckboxBlankOutline} />
  <slot />
</label>


<style lang="scss">
  label {
    display: flex;
    gap: .5em;
  }
  input[type="checkbox"] {
    position: fixed;
    inset: -999px -999px auto auto;
  }
</style>
