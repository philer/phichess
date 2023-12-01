<script lang="ts">
  import { mdiFileOutline } from "@mdi/js"
  import { createEventDispatcher } from "svelte"

  import { type Game, parsePGN } from "./chess"
  import Icon from "./Icon.svelte"
  import Modal from "./Modal.svelte"
  import { readFile } from "./util"

  export let open = false

  let pgn: string = ""
  let files: FileList | null | undefined = undefined

  $: files && readFile(files[0]).then(text => pgn = text)

  const dispatch = createEventDispatcher<{ import: Game }>()

  const handleSubmit = async (evt: SubmitEvent) => {
    evt.preventDefault()
    parsePGN(pgn)
      .mapError(console.error)
      .map(imported => {
        dispatch("import", imported)
        open = false
      })
  }

  const reset = () => {
    pgn = ""
    files = undefined
  }
</script>


<Modal bind:open>
  <svelte:fragment slot="title">Import PGN</svelte:fragment>

  <form on:submit={handleSubmit} id="import">
    <textarea
      bind:value={pgn}
      id="pgn"
      rows="11"
      style:resize="vertical"
      placeholder={"[...]\n\n1..."}
    ></textarea>

    <label>
      <Icon path={mdiFileOutline} />
      {#if files}File: <code>{files[0].name}</code>{:else}Select a file…{/if}
      <input
        type="file"
        accept="text/plain, application/vnd.chess-pgn"
        bind:files
      />
    </label>
  </form>

  <svelte:fragment slot="actions">
    <button type="reset" form="import" on:click={reset}>Reset</button>
    <button type="submit" form="import" >Import</button>
  </svelte:fragment>
</Modal>



<style lang="sass">
  @use "common"

  form
    flex-direction: column
    text-align: left

  textarea, label
    display: block
    width: 40em
    @media (max-width: 900px)
      width: 100%

  input[type="file"]
    position: fixed
    inset: -9999px -9999px 0 0
    width: 0
    height: 0
    opacity: 0

  label
    margin: 1em auto 0
    white-space: nowrap
    overflow: hidden
    text-overflow: ellipsis

  button, label
    @include common.button
    cursor: pointer
</style>
