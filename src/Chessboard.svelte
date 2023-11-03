<script lang="ts">
  import Utf8Piece from "./Utf8Piece.svelte";
import {
    applyMove, type Game,
    type MoveInput,
    requiresPromotion,
    type Square,
    squares } from "./chess"
  import { clsx } from "./util"

  const PIECE_TO_UTF8: Record<string, string> = {
    "K": "♚", //"♔",
    "Q": "♛", //"♕",
    "R": "♜", //"♖",
    "B": "♝", //"♗",
    "N": "♞", //"♘",
    "": "♟", //"♙",
  }

  export let game: Game

  export let flipped: boolean = false
  export let showCoordinates: boolean = true

  let selectedSquare: Square | undefined = undefined
  let draggingFromSquare: Square | undefined = undefined
  let dragTargetSquare: Square | undefined = undefined
  let cursorPosition: { x: number, y: number } = { x: -1, y: -1 }

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
      // update position first to prevent flicker
      cursorPosition = { x: evt.clientX, y: evt.clientY }
      draggingFromSquare = square
    }
  }

  const handleSquareMouseup = (square: Square) => {
    if (!draggingFromSquare) {
      return
    }
    makeMove(draggingFromSquare, square)
  }

  const handleMousemove = (evt: MouseEvent) => {
    requestAnimationFrame(() => cursorPosition = { x: evt.clientX, y: evt.clientY })
  }

  const handleMouseup = (square: Square) => {
    draggingFromSquare = undefined
  }

</script>

<svelte:document on:mousemove={draggingFromSquare && handleMousemove} on:mouseup={draggingFromSquare && handleMouseup} />

<div class="root" class:flipped>
  {#each flipped ? squares : squares.toReversed() as square, idx (`${square}${board[square] || ""}`)}
    {@const piece = board[square]}
    {@const white = (idx + ~~(idx / 8)) % 2 > 0}
    <div
      class={clsx(piece && piece[0])}
      class:white={white}
      class:black={!white}
      class:selected={selectedSquare === square}
      on:click={() => handleSquareClick(square)}
      on:mousedown={evt => handleSquareMousedown(evt, square)}
      on:mouseup={() => handleSquareMouseup(square)}
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
          style:position={draggingFromSquare === square ? "fixed" : "static"}
          style:top={draggingFromSquare === square ? `calc(${cursorPosition.y}px - .5em)` : "0"}
          style:left={draggingFromSquare === square ? `calc(${cursorPosition.x}px - .5em)` : "0"}
        >
          <Utf8Piece {piece} />
        </div>
      {/if}
    </div>
  {/each}
</div>

<style lang="scss">
  .root {
    --board-size: 75vmin;
    --square-size: calc(1 / 8 * var(--board-size));
    width: var(--board-size);
    height: var(--board-size);

    display: grid;
    grid-template-rows: repeat(8, 1fr);
    grid-template-columns: repeat(8, 1fr);
    direction: rtl;  // reverse columns for squares ordered A1, B1, C1, ..., H8

    // transform: rotate(-90deg);
    // transition: 0.67s transform;

    font-family: "Linux Libertine";
    user-select: none;

    box-shadow: 3px 3px 10px #0009, 3px 3px 40px #0009;

    > div {
      position: relative;

      display: flex;
      justify-content: center;
      align-items: center;

      overflow: visible;

      // transform: rotate(90deg);
      // transition: 0.67s transform;

      font-size: var(--square-size);
      line-height: var(--square-size);

      text-shadow: 1px 1px 5px #000c;

      &:global(.w),
      &:global(.b) {
        cursor: pointer;
      }
      &.white {
        background-color: #99dddd;
      }
      &.black {
        background-color: #226666;
      }

      &.selected {
        &.white {
          background-color: #dda;
        }
        &.black {
          background-color: #885;
        }
      }
      .file,
      .rank {
        position: absolute;
        font-size: 0.1em;
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
      .piece {
        width: 1em;
        height: 1em;
        z-index: 100;
        position: static;
        pointer-events: none;
      }
    }

    // &.flipped {
    //   transform: rotate(90deg);
    //   > div {
    //     transform: rotate(-90deg);
    //   }
    // }
  }
</style>
