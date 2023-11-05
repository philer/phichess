<script context="module" lang="ts">
  import {
    applyMove, type Game,
    type MoveInput,
    requiresPromotion,
    type Square,
    squares,
    type PromotablePiece,
  } from "./chess"
  import PieceIcon from "./PieceIcon.svelte"
  import { clickOutside } from "./svelte-util"

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
  export let showCoordinates: boolean = true

  $: ({ board, toMove } = game)

  $: rotateCoordinates = rotateFns[rotate % 360]
  $: reverseRotateCoordinates = reverseRotateFns[rotate % 360]

  let promotionMove: MoveInput | undefined
  let selectedSquare: Square | undefined
  let draggingFromSquare: Square | undefined
  /** Origin for relative mouse movement while dragging a piece */
  let draggingFromPosition: Point = zero
  /** Current cursor drag position relative to piece's original position */
  let dragPositionOffset: Point = zero

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

  const handleSquareClick = (square: Square) => {
    if (board[square]?.[0] === toMove) {
      selectedSquare = square
    } else if (selectedSquare) {
      makeMove(selectedSquare, square)
    }
  }

  const handleSquareMousedown = (evt: MouseEvent, square: Square) => {
    if (board[square]?.[0] === toMove) {
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
  class:asWhite
  class:asBlack={!asWhite}
  class:whiteToMove={toMove === "w"}
  class:blackToMove={toMove === "b"}
  class:dragging={draggingFromSquare}
>
  {#each asWhite ? squares.toReversed() : squares as square, idx (`${square}${board[square] || ""}`)}
    {@const piece = board[square]}
    {@const isLight = (idx + ~~(idx / 8)) % 2 > 0}
    <div
      on:click={() => handleSquareClick(square)}
      on:keyup={evt => (evt.key === "Enter" || evt.key === "Space") && handleSquareClick(square)}
      on:mousedown={evt => handleSquareMousedown(evt, square)}
      on:mouseup={() => handleSquareMouseup(square)}
      class="square"
      class:light={isLight}
      class:dark={!isLight}
      class:hasPiece={piece}
      class:selected={selectedSquare === square}
      role="button"
      tabindex="0"
    >
      {#if showCoordinates}
        {#if square[1] === (asWhite ? "1" : "8")}
          <div class="file">{square[0]}</div>
        {/if}
        {#if square[0] === (asWhite ? "a" : "h")}
          <div class="rank">{square[1]}</div>
        {/if}
      {/if}
      {#if piece && square !== promotionMove?.from}
        <div
          class:piece
          class:dragging={draggingFromSquare === square}
          style:top={draggingFromSquare === square ? `${dragPositionOffset.y}px` : "0"}
          style:left={draggingFromSquare === square ? `${dragPositionOffset.x}px` : "0"}
        >
          <PieceIcon {piece} />
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
      <button on:click={() => promote("Q")}><PieceIcon piece={`${toMove}Q`}/></button>
      <button on:click={() => promote("N")}><PieceIcon piece={`${toMove}N`}/></button>
      <button on:click={() => promote("R")}><PieceIcon piece={`${toMove}R`}/></button>
      <button on:click={() => promote("B")}><PieceIcon piece={`${toMove}B`}/></button>
      <button on:click={() => promotionMove = undefined} class="close">✕</button>
    </div>
  {/if}
</div>

<style lang="scss">
  .board {
    position: relative;
    width: var(--board-size);
    height: var(--board-size);
    font-size: calc(0.9 * var(--square-size));

    grid-area: board;  // place self in the surrounding grid context

    display: grid;
    grid-template-rows: repeat(8, 1fr);
    grid-template-columns: repeat(8, 1fr);
    direction: rtl;  // reverse columns for squares ordered A1, B1, C1, ..., H8

    font-family: "Linux Libertine";
    user-select: none;

    box-shadow: 3px 3px 10px #0009, 3px 3px 40px #0009;
  }
  .dragging {
    cursor: grabbing;
  }

  .square {
    position: relative;
    width: var(--square-size);
    height: var(--square-size);

    overflow: visible;

    // text-shadow: 1px 1px 5px #000c;
    &.hasPiece {
      cursor: grab;
      .dragging & {
        cursor: grabbing;
      }
    }
    &.light {
      background: var(--theme-light-square-background);
    }
    &.dark {
      background: var(--theme-dark-square-background);
    }
    &.selected {
      &.light {
        background: var(--theme-selected-light-square-background);
      }
      &.dark {
        background: var(--theme-selected-dark-square-background);
      }
    }
    .file,
    .rank {
      position: absolute;
      font-size: max(1vmin, .1em);
      line-height: 1.5em;
      height: 1.5em;
      font-family: sans-serif;
      font-weight: bold;
    }
    .rank {
      inset: 0.5em auto auto 0.5em;
    }
    .file {
      inset: auto 0.5em 0.5em auto;
    }
  }

  .piece {
    width: 100%;
    height: 100%;
    pointer-events: none;
    display: flex;
    justify-content: center;
    align-items: center;
    &.dragging {
      z-index: 100;
      position: relative;
    }
  }

  .promotion {
    position: absolute;
    display: flex;
    justify-content: stretch;

    top: 0;
    flex-direction: column;
    .asWhite.blackToMove &,
    .asBlack.whiteToMove & {
      top: auto;
      bottom: 0;
      flex-direction: column-reverse;
    }

    left: calc(var(--promotion-file-offset) * var(--square-size));
    .asBlack & {
      left: calc((7 - var(--promotion-file-offset)) * var(--square-size));
    }

    background: #000c;
    .blackToMove & {
      background: #fffc;
      color: black;
    }

    box-shadow: 1px 1px .1em #0008;

    > button {
      height: var(--square-size);
      width: var(--square-size);
      display: flex;
      justify-content: center;
      align-items: center;
      &.close {
        height: calc(.5 * var(--square-size));
        font-size: .33em;
      }
    }
  }

</style>
