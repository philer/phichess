<script lang="ts">
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

  $: ({ board, toMove } = game)

  let selected: Square | undefined = undefined

  const handleSquareClick = (square: Square) => {
    if (board[square]?.[0] === toMove) {
      selected = square
    } else if (selected) {
      const input: MoveInput = { from: selected, to: square }
      if (requiresPromotion(input, board)) {
        input.promotion = "Q"
      }
      applyMove(input, game)
        .map(updatedGame => {
          game = updatedGame
          selected = undefined
        })
        .mapError(err => console.info)
    }
  }

  const handlePieceClick = (square: Square) => {}
</script>

<div class="root" class:flipped>
  {#each squares as square, idx (`${square}${board[square] || ""}`)}
    {@const piece = board[square]}
    {@const white = (idx + ~~(idx / 8)) % 2 > 0}
    <div
      class={clsx(piece && piece[0])}
      class:white={white}
      class:black={!white}
      class:selected={selected === square}
      on:click={() => handleSquareClick(square)}
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
        <div on:click={() => handlePieceClick(square)}>
          {PIECE_TO_UTF8[piece.slice(1)]}
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

    transform: rotate(-90deg);
    transition: 0.67s transform;

    font-family: "Linux Libertine";
    user-select: none;

    box-shadow: 3px 3px 10px #0009, 3px 3px 40px #0009;

    > div {
      position: relative;

      display: flex;
      justify-content: center;
      align-items: center;

      overflow: hidden;

      transform: rotate(90deg);
      transition: 0.67s transform;

      font-size: var(--square-size);
      line-height: var(--square-size);

      text-shadow: 1px 1px 5px #000c;

      &:global(.w),
      &:global(.b) {
        cursor: pointer;
      }
      &.white {
        background-color: #bbbfc0;
      }
      &.black {
        background-color: #555960;
      }

      &.selected {
        &.white {
          background-color: #ada;
        }
        &.black {
          background-color: #575;
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
    }

    &.flipped {
      transform: rotate(90deg);
      > div {
        transform: rotate(-90deg);
      }
    }
  }
</style>
