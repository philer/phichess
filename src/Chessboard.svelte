<script context="module" lang="ts">
  import {
    applyMove,
    type Game,
    generateLegalMoves,
    type MoveInput,
    type PromotablePiece,
    requiresPromotion,
    type Square,
    squares,
  } from "./chess"
  import { settings } from "./stores"
  import { clickOutside } from "./svelte-util"
  import SvgPiece from "./SvgPiece.svelte"

  type Point = Readonly<{ x: number, y: number }>
  const zero: Point = Object.freeze({ x: 0, y: 0 })

  const rot0 = (p: Point): Point => p
  const rot90 = ({ x, y }: Point): Point => ({ x: -y, y: x })
  const rot180 = ({ x, y }: Point): Point => ({ x: -x, y: -y })
  const rot270 = ({ x, y }: Point): Point => ({ x: y, y: -x })
  const rotateFns: Record<number, (p: Point) => Point> = {
    0: rot0,
    90: rot90,
    180: rot180,
    270: rot270,
  }
  const reverseRotateFns: Record<number, (p: Point) => Point> = {
    0: rot0,
    90: rot270,
    180: rot180,
    270: rot90,
  }
</script>

<script lang="ts">
  export let game: Game
  export let asWhite: boolean = true
  export let rotate: number = 0
  export let flipOpponentPieces: boolean = false
  export let readonly: boolean = false

  $: ({ board, toMove } = game)
  $: lastMove = game.history.at(-1)

  $: rotateCoordinates = rotateFns[rotate % 360]
  $: reverseRotateCoordinates = reverseRotateFns[rotate % 360]

  let promotionMove: MoveInput | undefined
  let selectedSquare: Square | undefined
  let draggingFromSquare: Square | undefined
  /** Origin for relative mouse movement while dragging a piece */
  let draggingFromPosition: Point = zero
  /** Current cursor drag position relative to piece's original position */
  let dragPositionOffset: Point = zero

  $: legalMoves = new Set(
      $settings.showLegalMoves && (draggingFromSquare || selectedSquare)
        ? Array.from(
            generateLegalMoves((draggingFromSquare || selectedSquare)!, game),
            ({ to }) => to,
          )
        : [],
    )

  const makeMove = (from: Square, to: Square, promotion?: PromotablePiece) => {
    const input: MoveInput = { from, to, promotion }
    if (requiresPromotion(input, board) && !promotion) {
      promotionMove = input
      return
    }
    applyMove(game, input)
      .map(updatedGame => {
        game = updatedGame
        promotionMove = undefined
        selectedSquare = undefined
        draggingFromSquare = undefined
      })
      .mapError(console.info)
  }

  const promote = (piece: PromotablePiece) =>
    makeMove(promotionMove!.from, promotionMove!.to, piece)

  const handleSquareMousedown = (evt: MouseEvent, square: Square) => {
    if (selectedSquare && legalMoves.has(square)) {
      makeMove(selectedSquare, square)

    } else if (board[square]?.[0] === toMove) {
      selectedSquare = square
      draggingFromSquare = square

      const { target, clientX, clientY, offsetX, offsetY } = evt
      const squareSize = (target as HTMLElement).offsetHeight
      const { x, y } = rotateCoordinates({
        x: offsetX - .5 * squareSize,
        y: offsetY - .5 * squareSize,
      })
      draggingFromPosition = {
        x: clientX - x,
        y: clientY - y,
      }
      // update position once immediately to prevent flicker
      dragPositionOffset = reverseRotateCoordinates({
        x: clientX - draggingFromPosition.x,
        y: clientY - draggingFromPosition.y,
      })
    }
  }

  const handleSquareMouseup = (square: Square) => {
    if (!draggingFromSquare) {
      return
    }
    makeMove(draggingFromSquare, square)
  }

  const handleMousemove = ({ clientX, clientY }: MouseEvent) => {
    requestAnimationFrame(() => dragPositionOffset = reverseRotateCoordinates({
      x: clientX - draggingFromPosition.x,
      y: clientY - draggingFromPosition.y,
    }))
  }

  const handleMouseup = () => {
    draggingFromSquare = undefined
  }
</script>

<svelte:document
  on:mousemove={draggingFromSquare && handleMousemove}
  on:mouseup={draggingFromSquare && handleMouseup}
/>

<div
  class="board"
  class:readonly
  class:show-board-frame={$settings.showBoardFrame}
  class:as-white={asWhite}
  class:flip-opponent-pieces={flipOpponentPieces}
  class:as-black={!asWhite}
  class:white-to-move={toMove === "w"}
  class:black-to-move={toMove === "b"}
  class:dragging={draggingFromSquare}
  use:clickOutside
  on:click_outside={readonly ? undefined : () => selectedSquare = undefined}
>
  {#each asWhite ? squares.toReversed() : squares as square, idx (`${square}${board[square] || ""}`)}
    {@const piece = board[square]}
    {@const isLight = (idx + ~~(idx / 8)) % 2 > 0}
    <div
      on:mousedown={readonly ? undefined : evt => handleSquareMousedown(evt, square)}
      on:mouseup={readonly ? undefined : () => handleSquareMouseup(square)}
      role="button"
      tabindex="-1"
      class="square"
      class:light={isLight}
      class:dark={!isLight}
      class:has-piece={piece}
      class:legal-move={legalMoves.has(square)}
      class:selected={selectedSquare === square}
      class:last-move={square === lastMove?.from || square === lastMove?.to}
      class:check={lastMove?.check && piece === `${toMove}K`}
    >
      {#if $settings.showCoordinates}
        {#if square[1] === (asWhite ? "1" : "8")}
          <div class="file">{square[0]}</div>
        {/if}
        {#if square[0] === (asWhite ? "a" : "h")}
          <div class="rank">{square[1]}</div>
        {/if}
      {/if}
      {#if piece && square !== promotionMove?.from}
        <div
          class={piece[0]}
          class:piece
          class:dragging={draggingFromSquare === square}
          style:top={draggingFromSquare === square ? `${dragPositionOffset.y}px` : "0"}
          style:left={draggingFromSquare === square ? `${dragPositionOffset.x}px` : "0"}
        >
          <SvgPiece {piece} />
        </div>
      {/if}
    </div>
  {/each}
  {#if promotionMove}
    {@const fileOffset = promotionMove.to.charCodeAt(0) - 97}
    <div
      use:clickOutside
      on:click_outside={() => promotionMove = undefined}
      class="promotion"
      style:--promotion-file-offset={fileOffset}
    >
      <button on:click={() => promote("Q")}><SvgPiece piece={`${toMove}Q`}/></button>
      <button on:click={() => promote("N")}><SvgPiece piece={`${toMove}N`}/></button>
      <button on:click={() => promote("R")}><SvgPiece piece={`${toMove}R`}/></button>
      <button on:click={() => promote("B")}><SvgPiece piece={`${toMove}B`}/></button>
      <button on:click={() => promotionMove = undefined} class="close">✕</button>
    </div>
  {/if}
</div>

<style lang="sass">
  .board
    --default-board-size: 200px
    --square-size: calc(var(--board-size, var(--default-board-size)) / 8)

    position: relative
    width: var(--board-size, var(--default-board-size))
    height: var(--board-size, var(--default-board-size))
    font-size: calc(0.9 * var(--square-size))

    grid-area: board  // place self in the surrounding grid context

    display: grid
    grid-template-rows: repeat(8, 1fr)
    grid-template-columns: repeat(8, 1fr)
    direction: rtl  // reverse columns for squares ordered A1, B1, C1, ..., H8

    font-family: "Linux Libertine"
    user-select: none

    &.readonly div
      pointer-events: none
      cursor: default !important

    .show-board-frame
      box-shadow: 3px 3px 10px #0006, 3px 3px 40px #0006

  .flip-opponent-pieces
    &.as-white :global(.b), &:not(.as-white) :global(.w)
      transform: rotate(90deg)

  .dragging
    cursor: grabbing

  .square
    position: relative
    width: var(--square-size)
    height: var(--square-size)

    overflow: visible

    &.legal-move::before
      content: ""
      position: absolute
      inset: calc(.333 * var(--square-size))
      border-radius: var(--square-size)
      background-color: #0003
    &.legal-move.has-piece::before
      background-color: transparent
      inset: 0
      border: calc(.1 * var(--square-size)) solid #0003

    &.has-piece
      cursor: grab
      .dragging &
        cursor: grabbing

    @each $color, $opposite in "dark" "light", "light" "dark"
      &.#{$color}
        background: var(--theme-#{$color}-square-background)
        .file, .rank
          color: var(--theme-#{$opposite}-square-background)
        @each $mode in "check", "last-move", "selected"
          &.#{$mode}
            background: var(--theme-#{$mode}-#{$color}-square-background)
            .file, .rank
              color: var(--theme-#{$mode}-#{$opposite}-square-background)

    .file,
    .rank
      position: absolute
      font-size: .15em
      line-height: 1.5em
      height: 1.5em
      font-family: var(--font-family)
      font-weight: bold
      text-shadow: none

    .rank
      inset: 0.5em auto auto 0.5em

    .file
      inset: auto 0.5em 0.5em auto

  .piece
    z-index: 1
    position: relative
    width: 100%
    height: 100%
    pointer-events: none
    display: flex
    justify-content: center
    align-items: center
    &.dragging
      z-index: 100

  .promotion
    position: absolute
    display: flex
    justify-content: stretch

    box-shadow: 1px 1px .1em #0008

    top: 0
    flex-direction: column
    .as-white.black-to-move &,
    .as-black.white-to-move &
      top: auto
      bottom: 0
      flex-direction: column-reverse


    left: calc(var(--promotion-file-offset) * var(--square-size))
    .as-black &
      left: calc((7 - var(--promotion-file-offset)) * var(--square-size))


    background: #000c
    .black-to-move &
      background: #fffc
      color: black

    > button
      height: var(--square-size)
      width: var(--square-size)
      display: flex
      justify-content: center
      align-items: center
      &.close
        height: calc(.5 * var(--square-size))
        font-size: .33em
</style>
