<script lang="ts">
  import PieceIcon from "./PieceIcon.svelte";
import {
    applyMove, type Game,
    type MoveInput,
    requiresPromotion,
    type Square,
    squares } from "./chess"

  export let game: Game
  export let flipped: boolean = false
  export let showCoordinates: boolean = true

  let selectedSquare: Square | undefined = undefined
  let draggingFromSquare: Square | undefined = undefined

  /** Origin for relative mouse movement while dragging a piece */
  let draggingFromPosition: { x: number, y: number } = { x: 0, y: 0 }

  /** Current cursor drag position relative to piece's original position */
  let dragPositionOffset: { x: number, y: number } = { x: 0, y: 0 }

  $: ({ board, toMove } = game)

  const makeMove = (from: Square, to: Square) => {
    const input: MoveInput = { from, to }
    if (requiresPromotion(input, board)) {
        input.promotion = "Q"
      }
      applyMove(input, game)
        .map(updatedGame => {
          game = updatedGame
          selectedSquare = undefined
          draggingFromSquare = undefined
        })
        .mapError(console.info)
  }

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

      const {target, clientX, clientY, offsetX, offsetY} = evt;
      const squareSize = (target as HTMLElement).offsetHeight;
      draggingFromPosition = {
        x: clientX - offsetX + .5 * squareSize,
        y: clientY - offsetY + .5 * squareSize,
      }
      // update position once immediately to prevent flicker
      dragPositionOffset = {
        x: clientX - draggingFromPosition.x,
        y: clientY - draggingFromPosition.y,
      }
    }
  }

  const handleSquareMouseup = (square: Square) => {
    if (!draggingFromSquare) {
      return
    }
    makeMove(draggingFromSquare, square)
  }

  const handleMousemove = ({clientX, clientY}: MouseEvent) => {
    requestAnimationFrame(() => dragPositionOffset = {
      x: clientX - draggingFromPosition.x,
      y: clientY - draggingFromPosition.y,
    })
  }

  const handleMouseup = () => {
    draggingFromSquare = undefined
  }

</script>

<svelte:document
  on:mousemove={draggingFromSquare && handleMousemove}
  on:mouseup={draggingFromSquare && handleMouseup}
/>

<div class="board" class:flipped>
  {#each flipped ? squares : squares.toReversed() as square, idx (`${square}${board[square] || ""}`)}
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
        {#if square[1] === (flipped ? "8" : "1")}
          <div class="file">{square[0]}</div>
        {/if}
        {#if square[0] === (flipped ? "h" : "a")}
          <div class="rank">{square[1]}</div>
        {/if}
      {/if}
      {#if piece}
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
</div>

<style lang="scss">
  .board {
    width: var(--board-size);
    height: var(--board-size);
    font-size: calc(0.9 * var(--square-size));

    display: grid;
    grid-template-rows: repeat(8, 1fr);
    grid-template-columns: repeat(8, 1fr);
    direction: rtl;  // reverse columns for squares ordered A1, B1, C1, ..., H8

    // transform: rotate(-90deg);
    // transition: 0.67s transform;

    font-family: "Linux Libertine";
    user-select: none;

    box-shadow: 3px 3px 10px #0009, 3px 3px 40px #0009;

  // &.flipped {
  //   transform: rotate(90deg);
  //   > .square {
  //     transform: rotate(-90deg);
  //   }
  // }
  }

  .square {
    position: relative;
    width: var(--square-size);
    height: var(--square-size);

    overflow: visible;

    // transform: rotate(90deg);
    // transition: 0.67s transform;

    // text-shadow: 1px 1px 5px #000c;
    &.hasPiece {
      cursor: pointer;
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

</style>
