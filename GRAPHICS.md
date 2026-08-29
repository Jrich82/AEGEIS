# Canvas vault (branch `feat/canvas-vault`)

Main is untouched. This branch swaps the CSS-grid dungeon for a pixel canvas and tightens the HUD.

## What changed

- `canvas.js` — new renderer. 21×21 vault drawn to `<canvas id="vault">` with depth palettes, FOV vignette, water/fire, threat pulse, HP pips, hover targeting.
- `sprites.js` — same 8×8 entities, plus wall/floor/vein/fungus/water/fire tiles and a distinct Signal Wraith. `sprCanvas()` feeds the canvas; `spr()` SVG fallback remains.
- `index.html` — three-column layout (Aegis / vault / inventory+HERMES). Grid tiles removed. Looking-at pane added.

Combat, procgen, sim, meta, and HERMES are the same systems. `paintHazards()` is a no-op here because the canvas draws water/fire itself.

## Try it

Open `index.html` from this branch. Click adjacent tiles or WASD as before.

If something feels off, leave a note on the PR — do not merge until you’ve walked a floor or two.
