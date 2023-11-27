<script lang="ts">
  import { mdiContentCopy, mdiDownload } from "@mdi/js"

  import { type Game, toFEN, toPGN } from "./chess"
  import Icon from "./Icon.svelte"
  import { saveTextAs } from "./util"

  export let game: Game

  $: pgn = toPGN(game)
  $: fen = toFEN(game)

  const copyPgn = () =>
    navigator.clipboard.writeText(pgn)

  const copyFen = () =>
    navigator.clipboard.writeText(fen)

  const downloadPgn = () =>
    saveTextAs(
      pgn,
      `${location.hostname}_${new Date().toISOString().slice(0, 10)}.pgn`,
      "application/vnd.chess-pgn",
    )
  const downloadFen = () =>
    saveTextAs(
      fen,
      `${location.hostname}_${new Date().toISOString().slice(0, 10)}.fen`,
    )
</script>


<form on:submit={evt => evt.preventDefault()}>
  <label for="fen">FEN</label>
  <textarea id="fen" readonly rows="1">{fen}</textarea>
  <div>
    <button
      on:click={copyFen}
      title="Copy Forsyth–Edwards Notation to clipboard"
    ><Icon path={mdiContentCopy} /> Copy to clipboard</button>
    <button
      on:click={downloadFen}
      title="Download Forsyth–Edwards Notation"
    ><Icon path={mdiDownload} /> Download</button>
  </div>

  <label for="pgn">PGN</label>
  <textarea id="pgn" readonly rows="11" style:resize="vertical">{pgn}</textarea>
  <div>
    <button
      on:click={copyPgn}
      title="Copy Portable Game Notation to clipboard"
    ><Icon path={mdiContentCopy} /> Copy to clipboard</button>
    <button
      on:click={downloadPgn}
      title="Download Portable Game Notation"
    ><Icon path={mdiDownload} /> Download</button>
  </div>
</form>


<style lang="sass">
  @use "common"

  form
    text-align: left

  div
    display: flex
    justify-content: end
    gap: .5em

  label
    display: block
    &:not(:first-child)
      margin-top: 1em

  textarea
    margin: .5em 0 1em
    width: 40em
    @media (max-width: 900px)
      width: 100%
    &#fen
      resize: none
      white-space: nowrap

  button
    @include common.button
</style>
