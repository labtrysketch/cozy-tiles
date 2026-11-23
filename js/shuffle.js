/* Solvable sliding-puzzle shuffles.
   A board is an array of tile numbers; 0 is the gap.
   Odd grids are solvable when the inversion count is even.
   Even grids also depend on the gap's row, counted from the bottom. */
(function (root) {
  "use strict";

  function solvedState(grid) {
    const tiles = [];
    const total = grid * grid;
    for (let n = 1; n < total; n += 1) tiles.push(n);
    tiles.push(0);
    return tiles;
  }

  function countInversions(arr) {
    let inv = 0;
    for (let i = 0; i < arr.length; i += 1) {
      if (!arr[i]) continue;
      for (let j = i + 1; j < arr.length; j += 1) {
        if (arr[j] && arr[i] > arr[j]) inv += 1;
      }
    }
    return inv;
  }

  function isSolvable(arr, grid) {
    const inv = countInversions(arr);
    if (grid % 2 === 1) return inv % 2 === 0;
    const emptyRow = Math.floor(arr.indexOf(0) / grid);
    const fromBottom = grid - emptyRow;
    return (inv % 2 === 0) === (fromBottom % 2 === 1);
  }

  function isSolved(arr) {
    for (let i = 0; i < arr.length - 1; i += 1) {
      if (arr[i] !== i + 1) return false;
    }
    return arr[arr.length - 1] === 0;
  }

  function shuffleTiles(grid) {
    let tiles;
    do {
      tiles = solvedState(grid);
      for (let i = tiles.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        const tmp = tiles[i];
        tiles[i] = tiles[j];
        tiles[j] = tmp;
      }
    } while (!isSolvable(tiles, grid) || isSolved(tiles));
    return tiles;
  }

  root.CozyShuffle = { solvedState, isSolvable, isSolved, shuffleTiles };
})(typeof globalThis !== "undefined" ? globalThis : this);
