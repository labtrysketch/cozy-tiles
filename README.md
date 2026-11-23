# Cozy Tiles

A cosy sliding-tile puzzle. Shuffle a picture, slide the tiles, and tuck it back together.

Open `index.html` in a browser, or host this folder as a static site. There is no build step.

## Play

- **Play this scene** starts tonight's puzzle. The scene changes with the day of the year.
- **All scenes** and **Moods** let you pick any picture.
- Tap a tile next to the gap, swipe toward the gap, or use the arrow keys.
- **Easy 3×3** and **Classic 4×4** change the grid. **Shuffle** and **Play again** restart the same scene.
- **Hint** glows the tiles that are already home. **Hold Peek** to see the whole picture. **Show numbers** labels each tile.
- Shuffles are always solvable. The gap and the tile order follow the usual sliding-puzzle parity rule, so a board is never dealt in a state that cannot be solved.

## Swap in your own pictures

Everything the game shows lives in two places: the `images/` folder, and the `PUZZLES` list at the top of `js/puzzles.js`.

1. Add a square picture to `images/`. PNG, JPG, and SVG all work. 800×800 or larger is a good size. Keep the filename simple, with no spaces.
2. Add one object to the `PUZZLES` array:

```js
{
  id: "rainy-window",          // unique, also used for personal bests
  title: "Rainy Window",       // name on the card and during play
  mood: "fireside",            // fireside, sips, or snow — or a new mood below
  place: "The window seat",    // short line under the title
  caption: "Rain on the glass, a blanket, and nowhere to be.",
  image: "./images/rainy-window.png"
}
```

3. Save the file and refresh. The new scene shows up in All scenes, and it can be chosen as tonight's scene.

Remove an object from the list to take a scene out. Leave the image file in place or delete it; the game only loads paths that are listed.

To add a group of your own, add an object to `MOODS` in the same file:

```js
{
  id: "rainy",
  title: "Rainy day",
  caption: "Windows, puddles, and a pot of tea.",
  icon: ""
}
```

`icon` is a small inline SVG. You can leave it as an empty string. Point a puzzle's `mood` at `"rainy"` and it will show up in that group.

Pictures with a clear subject and different colours in each corner stay readable once they are cut into tiles.

## Host it

**GitHub Pages.** In the repo settings, set Pages to deploy from the branch root. The site is the files as they are.

**Vercel.** Import the repo. Framework preset: Other. Leave the build command empty. Output directory: `.`

## Credits

The pictures in `images/` are original illustrations made for this game. Replace any of them whenever you like.

Quicksand is bundled under the [SIL Open Font License](fonts/OFL.txt).
