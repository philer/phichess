<script lang="ts">
  import { mdiFileOutline, mdiHelp } from "@mdi/js"
  import { createEventDispatcher } from "svelte"

  import { type Game, parsePGN } from "./chess"
  import Chessboard from "./Chessboard.svelte"
  import ChessboardIcon from "./ChessboardIcon.svelte"
  import Icon from "./Icon.svelte"
  import Modal from "./Modal.svelte"
  import { readFile } from "./util"

  export let open = false

  let pgn: string = ""
  let files: FileList | null | undefined = undefined
  let game: Game | undefined = undefined
  let error: string | undefined = undefined

  const reset = () => {
    pgn = ""
    files = undefined
  }

  $: files && readFile(files[0]).then(text => pgn = text)
  $: if (pgn.trim()) {
      parsePGN(pgn)
        .mapError(msg => {
          game = undefined
          error = msg
        })
        .map(parsed => {
          game = parsed
          error = undefined
        })
    } else {
      game = undefined
      error = undefined
    }

  const dispatch = createEventDispatcher<{ import: Game }>()

  const handleSubmit = async (evt: SubmitEvent) => {
    evt.preventDefault()
    if (game) {
      dispatch("import", game)
      open = false
    }
  }

</script>


<Modal bind:open>
  <svelte:fragment slot="title">Import Portable Game Notation (PGN)</svelte:fragment>

  <form on:submit={handleSubmit} id="import">
    <textarea
      bind:value={pgn}
      placeholder={"[...]\n\n1..."}
      id="pgn"
      spellcheck="false"
      autocorrect="off"
      rows="11"
      style:resize="vertical"
      class:has-error={error}
    ></textarea>
    {#if error}
      <small class="error">Failed to parse PGN: {error}</small>
    {/if}

    <label>
      <Icon path={mdiFileOutline} />
      {#if files}File: <code>{files[0].name}</code>{:else}Select a file…{/if}
      <input
        type="file"
        accept="text/plain, application/vnd.chess-pgn"
        bind:files
      />
    </label>

    <div class="preview">
      {#if game}
        <Chessboard {game} readonly />
      {:else}
        <div class="placeholder">
          <ChessboardIcon size="250px" />
          <Icon path={mdiHelp} size="50px" />
        </div>
      {/if}
    </div>
  </form>

  <svelte:fragment slot="actions">
    <button type="reset" form="import" on:click={reset}>Reset</button>
    {#if game}
      <button type="submit" form="import" class="confirm">Import</button>
    {:else}
      <button type="submit" form="import" class="confirm" disabled>Import</button>
    {/if}
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

  textarea.has-error
    border-color: #e55
  small.error
    color: #e55

  .preview
    --board-size: 250px
    margin: 1em
    display: flex
    justify-content: center
    position: relative
    .placeholder
      position: relative
      width: var(--board-size)
      height: var(--board-size)
      background: #444
      display: flex
      justify-content: center
      align-items: center
      > :global(svg)
        color: #888
        position: absolute
        &:first-child
          inset: 0
          color: #666

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

  button.confirm:not(:disabled)
    @include common.start-button
</style>
