/* Cozy Tiles — scene list
   This is the only file to edit when you add, remove, or rename a puzzle.
   Drop the picture in images/, then add one object to PUZZLES below.
   See the README for the full steps.

   Classic script on purpose (var, not let) so index.html can load it
   with a plain script tag and no build step. */

var MOODS = [
  {
    id: "fireside",
    title: "Fireside",
    caption: "Warm rooms, soft blankets, and a glow in the grate.",
    icon:
      '<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M32 6c6 12 4 18 1 24 8-2 14 4 14 14 0 10-8 16-16 16S14 54 14 44c0-8 5-13 9-20 3 7 6 9 8 8-1-10 1-18 1-26z" fill="#FFB15A" stroke="#4E5D80" stroke-width="3" stroke-linejoin="round"/><path d="M32 28c3 6 2 10 0 14 4 0 7 3 7 7 0 5-4 8-7 8s-7-3-7-8c0-4 2-6 4-9 1 3 2 4 3 4 0-5 0-10 0-16z" fill="#FFE08A"/></svg>'
  },
  {
    id: "sips",
    title: "Warm sips",
    caption: "Cocoa, tea, and steam shaped like little hearts.",
    icon:
      '<svg viewBox="0 0 64 64" aria-hidden="true"><rect x="12" y="22" width="30" height="26" rx="8" fill="#FFF8F1" stroke="#4E5D80" stroke-width="3"/><path d="M42 28c8 1 10 12 0 14" fill="none" stroke="#4E5D80" stroke-width="3" stroke-linecap="round"/><ellipse cx="27" cy="24" rx="12" ry="4" fill="#C4845A" stroke="#4E5D80" stroke-width="3"/><path d="M22 16c-2-6 6-8 4-14" fill="none" stroke="#7FD0EA" stroke-width="3" stroke-linecap="round"/></svg>'
  },
  {
    id: "snow",
    title: "Snow day",
    caption: "Scarves, snow friends, and a quiet white world.",
    icon:
      '<svg viewBox="0 0 64 64" aria-hidden="true"><g fill="none" stroke="#5C8DEF" stroke-width="3" stroke-linecap="round"><path d="M32 8v48M14 18l36 28M14 46l36-28"/><path d="M32 14l-4 6M32 14l4 6M32 50l-4-6M32 50l4-6M20 22l6 2M18 26l8-2M44 40l6 2M42 44l8-2M20 42l6-2M18 38l8 2M44 24l6-2M42 20l8 2"/></g></svg>'
  }
];

var PUZZLES = [
  {
    id: "sleepy-cat",
    title: "Fireplace Nap",
    mood: "fireside",
    place: "By the hearth",
    caption: "A sleepy cat curled where the fire is warmest.",
    image: "./images/sleepy-cat.svg"
  },
  {
    id: "cabin-snow",
    title: "Cabin Glow",
    mood: "fireside",
    place: "The snowy pines",
    caption: "A little cabin, windows lit like honey.",
    image: "./images/cabin-snow.svg"
  },
  {
    id: "snug-bear",
    title: "Blanket Bear",
    mood: "fireside",
    place: "The starry blanket",
    caption: "A bear tucked in under a quilt of stars.",
    image: "./images/snug-bear.svg"
  },
  {
    id: "cocoa-mug",
    title: "Cocoa Cloud",
    mood: "sips",
    place: "The kitchen table",
    caption: "A mug of cocoa with clouds of cream.",
    image: "./images/cocoa-mug.svg"
  },
  {
    id: "teacup",
    title: "Steamy Cup",
    mood: "sips",
    place: "The saucer",
    caption: "A round teacup sending up soft curls of steam.",
    image: "./images/teacup.svg"
  },
  {
    id: "snowman",
    title: "Snow Friend",
    mood: "snow",
    place: "The front garden",
    caption: "A round snow friend in a cobalt scarf.",
    image: "./images/snowman.svg"
  },
  {
    id: "bunny-scarf",
    title: "Scarf Bunny",
    mood: "snow",
    place: "The snowdrift",
    caption: "A bunny bundled up, ears and all.",
    image: "./images/bunny-scarf.svg"
  },
  {
    id: "knit-mittens",
    title: "Mitten Pair",
    mood: "snow",
    place: "By the door",
    caption: "Two mittens on a string, waiting for a walk.",
    image: "./images/knit-mittens.svg"
  }
];
