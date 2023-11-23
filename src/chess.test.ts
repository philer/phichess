import { describe, expect, test } from "vitest"

import {
  applyHistory,
  applyMove,
  type Board,
  type Game,
  getSquareColor,
  isInCheck,
  outcomeToString,
  START_BOARD,
  START_GAME,
  toFEN,
} from "./chess"
import { err, ok } from "./result"


const makeGame = (moves: string) =>
  applyHistory(START_GAME, moves.split(/\s+/)).unwrap()


test.concurrent(getSquareColor, () => {
  expect(getSquareColor("a1")).toBe("b")
  expect(getSquareColor("b1")).toBe("w")
  expect(getSquareColor("a2")).toBe("w")
  expect(getSquareColor("b2")).toBe("b")

  expect(getSquareColor("a8")).toBe("w")
  expect(getSquareColor("h1")).toBe("w")
  expect(getSquareColor("h8")).toBe("b")
})


describe.concurrent(isInCheck, () => {
  test("starting position", () => {
    expect(isInCheck("w", START_BOARD)).toBe(false)
    expect(isInCheck("b", START_BOARD)).toBe(false)
  })

  test("simple checkmate", () => {
    expect(isInCheck("b", { f5: "wK", h5: "bK", h1: "wR" })).toBe(true)
  })
})


describe.concurrent(applyMove, () => {
  test("algebraic e4", () => {
    const board: Mutable<Board> = { ...START_BOARD }
    delete board["e2"]
    board["e4"] = "w"

    expect(applyMove(START_GAME, "e4"))
      .toEqual(ok({
        board,
        toMove: "b",
        history: [{
          algebraic: "e4",
          from: "e2",
          to: "e4",
          check: false,
          mate: false,
          capture: undefined,
          promotion: undefined,
        }],
        graveyard: [],
        fiftyMoveCounter: 0,
        repetitions: expect.any(Object),
        outcome: undefined,
        termination: undefined,
      } satisfies Game))
  })

  test("input e4", () => {
    const board: Mutable<Board> = { ...START_BOARD }
    delete board["e2"]
    board["e4"] = "w"

    expect(applyMove(START_GAME, { from: "e2", to: "e4" }))
      .toEqual(ok({
        board,
        toMove: "b",
        history: [{
          algebraic: "e4",
          from: "e2",
          to: "e4",
          check: false,
          mate: false,
          capture: undefined,
          promotion: undefined,
        }],
        graveyard: [],
        fiftyMoveCounter: 0,
        repetitions: expect.any(Object),
        outcome: undefined,
        termination: undefined,
      } satisfies Game))
  })

  describe("castling", () => {
    test("castling king side as white", () => {
      const game = makeGame("Nf3 Nf6 g3 g6 Bg2 Bg7")
      const expected = ok(expect.objectContaining({
        board: expect.objectContaining({ g1: "wK", f1: "wR" }),
      }))
      expect(applyMove(game, "O-O")).toEqual(expected)
      expect(applyMove(game, "0-0")).toEqual(expected)
      expect(applyMove(game, { from: "e1", to: "g1" })).toEqual(expected)
    })

    test("castling king side as black", () => {
      const game = makeGame("Nf3 Nf6 g3 g6 Bg2 Bg7 O-O")
      const expected = ok(expect.objectContaining({
        board: expect.objectContaining({ g8: "bK", f8: "bR" }),
      }))
      expect(applyMove(game, "O-O")).toEqual(expected)
      expect(applyMove(game, "0-0")).toEqual(expected)
      expect(applyMove(game, { from: "e8", to: "g8" })).toEqual(expected)
    })

    test("castling queen side as white", () => {
      const game = makeGame("Nc3 Nc6 b3 b6 Bb2 Bb7 d4 d5 Qd2 Qd7")
      const expected = ok(expect.objectContaining({
        board: expect.objectContaining({ c1: "wK", d1: "wR" }),
      }))
      expect(applyMove(game, "O-O-O")).toEqual(expected)
      expect(applyMove(game, "0-0-0")).toEqual(expected)
      expect(applyMove(game, { from: "e1", to: "c1" })).toEqual(expected)
    })

    test("castling queen side as black", () => {
      const game = makeGame("Nc3 Nc6 b3 b6 Bb2 Bb7 d4 d5 Qd2 Qd7 O-O-O")
      const expected = ok(expect.objectContaining({
        board: expect.objectContaining({ c8: "bK", d8: "bR" }),
      }))
      expect(applyMove(game, "O-O-O")).toEqual(expected)
      expect(applyMove(game, "0-0-0")).toEqual(expected)
      expect(applyMove(game, { from: "e8", to: "c8" })).toEqual(expected)
    })

    test("castling blocked by piece", () => {
      const game = makeGame("Nf3 Nf6 Nc3 Nc6 b3 b6 Bb2 Bb7")
      expect(applyMove(game, "O-O")).toEqual(err(expect.any(String)))
      expect(applyMove(game, { from: "e1", to: "g1" })).toEqual(err(expect.any(String)))
      expect(applyMove(game, "O-O-O")).toEqual(err(expect.any(String)))
      expect(applyMove(game, { from: "e1", to: "c1" })).toEqual(err(expect.any(String)))
    })

    test("castling rights forfit by king move (white king side)", () => {
      const game = makeGame("Nf3 Nf6 g3 g6 Bg2 Bg7  Kf1 Kf8 Ke1 Ke8")
      expect(applyMove(game, "O-O")).toEqual(err(expect.any(String)))
    })
    test("castling rights forfit by king move (black king side)", () => {
      const game = makeGame("Nf3 Nf6 g3 g6 Bg2 Bg7  Kf1 Kf8 Ke1 Ke8 Kf1")
      expect(applyMove(game, "O-O")).toEqual(err(expect.any(String)))
    })
    test("castling rights forfit by king move (white queen side)", () => {
      const game = makeGame("d4 d5 b3 b6 Bb2 Bb7 Nc3 Nc6 Qd2 Qd7  Kd1 Kd8 Ke1 Ke8")
      expect(applyMove(game, "O-O-O")).toEqual(err(expect.any(String)))
    })
    test("castling rights forfit by king move (black queen side)", () => {
      const game = makeGame("d4 d5 b3 b6 Bb2 Bb7 Nc3 Nc6 Qd2 Qd7  Kd1 Kd8 Ke1 Ke8 Kd1")
      expect(applyMove(game, "O-O-O")).toEqual(err(expect.any(String)))
    })

    test("castling rights forfit by rook move (white king side)", () => {
      const game = makeGame("Nf3 Nf6 g3 g6 Bg2 Bg7  Rg1 Rg8 Rh1 Rh8")
      expect(applyMove(game, "O-O")).toEqual(err(expect.any(String)))
    })
    test("castling rights forfit by rook move (black king side)", () => {
      const game = makeGame("Nf3 Nf6 g3 g6 Bg2 Bg7  Rg1 Rg8 Rh1 Rh8 Rg1")
      expect(applyMove(game, "O-O")).toEqual(err(expect.any(String)))
    })
    test("castling rights forfit by rook move (white queen side)", () => {
      const game = makeGame("d4 d5 b3 b6 Bb2 Bb7 Nc3 Nc6 Qd2 Qd7  Rb1 Rb8 Ra1 Ra8")
      expect(applyMove(game, "O-O-O")).toEqual(err(expect.any(String)))
    })
    test("castling rights forfit by rook move (black queen side)", () => {
      const game = makeGame("d4 d5 b3 b6 Bb2 Bb7 Nc3 Nc6 Qd2 Qd7  Rb1 Rb8 Ra1 Ra8 Rb1")
      expect(applyMove(game, "O-O-O")).toEqual(err(expect.any(String)))
    })
  })

  test("detect checkmate", () => {
    const board: Board = { f5: "wK", h5: "bK", a1: "wR" }

    expect(applyMove({ ...START_GAME, board }, { from: "a1", to: "h1" }))
      .toEqual(ok(expect.objectContaining({
        board: { f5: "wK", h5: "bK", h1: "wR" },
        toMove: "b",
        history: [expect.objectContaining({
          algebraic: "Rh1#",
          check: true,
          mate: true,
        })],
        outcome: "w",
        termination: "checkmate",
      })))
  })

  test("detect smothered mate", () => {
    const board: Board = { a1: "wK", b1: "wR", a2: "w", b2: "w", d4: "bN", h8: "bK" }

    expect(applyMove({ ...START_GAME, toMove: "b", board }, "Nc2"))
      .toEqual(ok(expect.objectContaining({
        board: { a1: "wK", b1: "wR", a2: "w", b2: "w", c2: "bN", h8: "bK" },
        toMove: "w",
        history: [expect.objectContaining({
          algebraic: "Nc2#",
          check: true,
          mate: true,
        })],
        outcome: "b",
        termination: "checkmate",
      })))
  })

  test("detect stalemate", () => {
    const board: Board = { a1: "bK", h8: "wK", h2: "wQ" }

    expect(applyMove({ ...START_GAME, board }, "Qc2"))
      .toEqual(ok(expect.objectContaining({
        board: { a1: "bK", h8: "wK", c2: "wQ" },
        toMove: "b",
        history: [expect.objectContaining({
          algebraic: "Qc2",
          check: false,
          mate: false,
        })],
        outcome: "draw",
        termination: "stalemate",
      })))
  })

  test("detect threefold repetition", () => {
    let game = START_GAME
    for (const move of "Nc3 Nc6 Nb1 Nb8 Nc3 Nc6 Nb1 Nb8".split(" ")) {
      game = applyMove(game, move).unwrap()
      expect(game).toMatchObject({ outcome: undefined, termination: undefined })
    }
    expect(applyMove(game, "Nc3"))
      .toEqual(ok(expect.objectContaining({
        outcome: "draw",
        termination: "repetition",
      })))
  })

  test("detect fifty-move rule", () => {
    // Karpov vs. Kasparov, 1991
    // Draw by fifty moves could have been claimed after 113. Ng5
    // 63. Kxh4 {124; last capture} Rg8 {125}
    // ...
    // 112. Ne7+ {222} Kh8 {223}
    // 113. Ng5 {224; 50th move} Ra6+ {225}
    // 114. Kf7 Rf6+
    const moves =
      `d4 Nf6 c4 g6 Nc3 Bg7 e4 d6 Nf3 O-O Be2 e5 O-O Nc6 d5 Ne7 Nd2 a5 Rb1 Nd7
       a3 f5 b4 Kh8 f3 Ng8 Qc2 Ngf6 Nb5 axb4 axb4 Nh5 g3 Ndf6 c5 Bd7 Rb3 Nxg3
       hxg3 Nh5 f4 exf4 c6 bxc6 dxc6 Nxg3 Rxg3 fxg3 cxd7 g2 Rf3 Qxd7 Bb2 fxe4
       Rxf8+ Rxf8 Bxg7+ Qxg7 Qxe4 Qf6 Nf3 Qf4 Qe7 Rf7 Qe6 Rf6 Qe8+ Rf8 Qe7 Rf7
       Qe6 Rf6 Qb3 g5 Nxc7 g4 Nd5 Qc1+ Qd1 Qxd1+ Bxd1 Rf5 Ne3 Rf4 Ne1 Rxb4 Bxg4
       h5 Bf3 d5 N3xg2 h4 Nd3 Ra4 Ngf4 Kg7 Kg2 Kf6 Bxd5 Ra5 Bc6 Ra6 Bb7 Ra3 Be4
       Ra4 Bd5 Ra5 Bc6 Ra6 Bf3 Kg5 Bb7 Ra1 Bc8 Ra4 Kf3 Rc4 Bd7 Kf6 Kg4 Rd4 Bc6
       Rd8 Kxh4 Rg8 Be4 Rg1 Nh5+ Ke6 Ng3 Kf6 Kg4 Ra1 Bd5 Ra5 Bf3 Ra1 Kf4 Ke6
       Nc5+ Kd6 Nge4+ Ke7 Ke5 Rf1 Bg4 Rg1 Be6 Re1 Bc8 Rc1 Kd4 Rd1+ Nd3 Kf7 Ke3
       Ra1 Kf4 Ke7 Nb4 Rc1 Nd5+ Kf7 Bd7 Rf1+ Ke5 Ra1 Ng5+ Kg6 Nf3 Kg7 Bg4 Kg6
       Nf4+ Kg7 Nd4 Re1+ Kf5 Rc1 Be2 Re1 Bh5 Ra1 Nfe6+ Kh6 Be8 Ra8 Bc6 Ra1 Kf6
       Kh7 Ng5+ Kh8 Nde6 Ra6 Be8 Ra8 Bh5 Ra1 Bg6 Rf1+ Ke7 Ra1 Nf7+ Kg8 Nh6+ Kh8
       Nf5 Ra7+ Kf6 Ra1 Ne3 Re1 Nd5 Rg1 Bf5 Rf1 Ndf4 Ra1 Ng6+ Kg8 Ne7+ Kh8 Ng5
       Ra6+ Kf7`.split(/\s+/)

    let game = applyHistory(START_GAME, moves.slice(0, 125)).unwrap()
    expect(game.fiftyMoveCounter).toBe(0)
    expect(game.outcome).toBe(undefined)
    expect(game.termination).toBe(undefined)

    for (let i = 125 ; i < 224 ; ++i) {
      game = applyMove(game, moves[i]).unwrap()
      expect(game.fiftyMoveCounter).toBe(i - 125 + 1)
      expect(game.outcome).toBe(undefined)
      expect(game.termination).toBe(undefined)
    }

    game = applyMove(game, moves[224]).unwrap()

    expect(game.outcome).toBe("draw")
    expect(game.termination).toBe("fifty-moves")
  })

  describe.concurrent("detect insufficient material", () => {
    test("King vs. King", () => {
      expect(applyMove(
        { ...START_GAME, board: { a1: "wK", h8: "bK", b1: "bQ" } },
        "Kxb1",
      )).toEqual(ok(expect.objectContaining({
        outcome: "draw",
        termination: "insufficient",
      })))
    })

    test("King & Bishop vs. King", () => {
      expect(applyMove(
        { ...START_GAME, board: { a1: "wK", h8: "bK", b1: "bQ", a8: "bB" } },
        "Kxb1",
      )).toEqual(ok(expect.objectContaining({
        outcome: "draw",
        termination: "insufficient",
      })))
    })

    test("King & Knight vs. King", () => {
      expect(applyMove(
        { ...START_GAME, board: { a1: "wK", h8: "bK", b1: "bQ", a8: "wN" } },
        "Kxb1",
      )).toEqual(ok(expect.objectContaining({
        outcome: "draw",
        termination: "insufficient",
      })))
    })
  })
})


describe(applyHistory, () => {
  test("empty history", () => {
    expect(applyHistory(START_GAME, []))
      .toEqual(ok(START_GAME))
  })

  test("single algebraic move", () => {
    const board: Mutable<Board> = { ...START_BOARD }
    delete board["e2"]
    board["e4"] = "w"

    expect(applyHistory(START_GAME, ["e4"]))
      .toEqual(ok({
        board,
        toMove: "b",
        history: [{
          algebraic: "e4",
          from: "e2",
          to: "e4",
          check: false,
          mate: false,
          capture: undefined,
          promotion: undefined,
        }],
        graveyard: [],
        fiftyMoveCounter: 0,
        repetitions: expect.any(Object),
        outcome: undefined,
        termination: undefined,
      } satisfies Game))
  })

  test("single input move", () => {
    const board: Mutable<Board> = { ...START_BOARD }
    delete board["e2"]
    board["e4"] = "w"

    expect(applyHistory(START_GAME, [{ from: "e2", to: "e4" }]))
      .toEqual(ok({
        board,
        toMove: "b",
        history: [{
          algebraic: "e4",
          from: "e2",
          to: "e4",
          check: false,
          mate: false,
          capture: undefined,
          promotion: undefined,
        }],
        graveyard: [],
        fiftyMoveCounter: 0,
        repetitions: expect.any(Object),
        outcome: undefined,
        termination: undefined,
      } satisfies Game))
  })

  test("fools mate", () => {
    expect(applyHistory(START_GAME, ["f3", "e5", "g4", "Qh4"]))
      .toEqual(ok(expect.objectContaining({
        toMove: "w",
        history: [
          expect.any(Object),
          expect.any(Object),
          expect.any(Object),
          expect.objectContaining({
            algebraic: "Qh4#",
            check: true,
            mate: true,
          }),
        ],
        outcome: "b",
        termination: "checkmate",
      })))
  })
})


test.concurrent(outcomeToString, () => {
  expect(outcomeToString("w", "checkmate")).toBe("White wins by checkmate.")
  expect(outcomeToString("w", "time")).toBe("White wins on time.")
  expect(outcomeToString("draw", "stalemate")).toBe("Draw by stalemate")
  expect(outcomeToString("draw", "agreement")).toBe("Draw by agreement")

  expect(outcomeToString(undefined, "stalemate")).toBe("unterminated")
  expect(outcomeToString("w")).toBe("White wins")
  expect(outcomeToString("draw")).toBe("Draw")
})


describe.concurrent(toFEN, () => {
  // @see https://en.wikipedia.org/wiki/Forsyth%E2%80%93Edwards_Notation#Examples

  test("starting position", () => {
    expect(toFEN(START_GAME))
      .toEqual("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1")
  })

  test("en passant square", () => {
    expect(toFEN(makeGame("e4")))
      .toEqual("rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1")

    expect(toFEN(makeGame("e4 c5")))
      .toEqual("rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w KQkq c6 0 2")
  })

  test("piece moved", () => {
    expect(toFEN(makeGame("e4 c5 Nf3")))
      .toEqual("rnbqkbnr/pp1ppppp/8/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2")
  })
})
