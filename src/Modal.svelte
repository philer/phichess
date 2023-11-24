<script lang="ts">
  import { mdiClose } from "@mdi/js"
  import { createEventDispatcher } from "svelte"
  import { fade, scale } from "svelte/transition"

  import Icon from "./Icon.svelte"

  export let open = false

  const dispatch = createEventDispatcher()

  const close = () => {
    open = false
    dispatch("close")
  }

  const handleModalBackdropClick = (evt: MouseEvent) => {
    if (evt.target === evt.currentTarget) {
      close()
    }
  }

  const handleGlobalKeydown = (evt: KeyboardEvent) => {
    if (evt.key === "Escape") {
      close()
    }
  }
</script>


<svelte:document on:keydown={handleGlobalKeydown} />

{#if open}
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div
    class="backdrop"
    on:click={handleModalBackdropClick}
    transition:fade={{ duration: 200 }}
  >
    <div class="modal" transition:scale={{ duration: 200, start: .8 }}>
      <button class="close" on:click={close}>
        <Icon path={mdiClose} />
      </button>

      {#if $$slots.title}
        <h3><slot name="title" /></h3>
      {/if}

      <div class="content">
        <slot />
        <footer>
          <button class="close" on:click={close}>Close</button>
          <slot name="actions" />
        </footer>
      </div>
    </div>
  </div>
{/if}


<style lang="sass">
  @use "common"

  .backdrop
    position: absolute
    inset: 0
    display: flex
    justify-content: center
    align-items: center
    background: #1115
    backdrop-filter: blur(3px)
    
  .modal
    position: relative
    background: #333
    border-radius: 3px
    box-shadow: 3px 3px 10px #0008
    > button.close
      position: absolute
      inset: 0 0 auto auto
      width: 2.4em
      height: 2.4em

  .content
    padding: 1em 2em 0em
    max-height: calc(90vh - 2.4em)
    max-width: 90vw
    overflow: auto
    @media (max-width: 900px)
      max-height: calc(100vh - 2.4em)
      max-width: 100vw

  h3
    font-size: 1.2em
    line-height: 2em
    padding: 0 2em
    background: #555

  footer
    padding: 1em 2em

    display: flex
    justify-content: center
    gap: .5em
    > button.close
      @include common.button

</style>
