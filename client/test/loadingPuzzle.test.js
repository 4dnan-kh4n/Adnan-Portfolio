import assert from "node:assert/strict";
import test from "node:test";
import { makePuzzle } from "../src/loadingPuzzle.js";

test("creates one different symbol in a nine-cell puzzle", () => {
  const puzzle = makePuzzle(() => 0.5);
  assert.notEqual(puzzle.common, puzzle.odd);
  assert.ok(puzzle.position >= 0 && puzzle.position < 9);
});
