# AEGIS // HERMES — The Bone Vaults

A dark cyberpunk-occult roguelike that runs entirely in your browser. No install, no
build step, no dependencies — open `index.html` and descend.

You are **JON**, bonded to living armor (**RICO**), narrated by the machine-voice
**HERMES**. Five floors below sings the **Static Choir** — the uploaded dead,
propagating through the fungus in the walls. Kill what conducts them. Try to still
be yourself when you do.

## Play

Open `index.html` in any modern browser. Sound starts after your first keypress.

- **WASD / arrows** — move (walk into enemies to attack)
- **1–7** — cast Rites & mutation powers · **1–3** answers level-up choices
- **Q** drink a vial · **E / Space** interact · **V** force a lock · **Z/X/C** rituals · **R** re-link after death
- **Click** anything — spells, items, level-up choices. Typing to HERMES is optional (try `mushroom`, `sing`, `legacy`, `daily`).

## What's inside

- Tactical turn-based combat with **telegraphed enemy intents** — red tiles are next turn's attacks; step out of them
- **Procedural floors** (always fully connected), elites, and a boss who wears a familiar face
- Qud-style builds: **attributes**, **mutations** (grown at level-up, paid in Corruption) and **cybernetics** (found and installed, budgeted by Chrome), plus weapons with traits, armor, trinkets
- A living floor: **water conducts your static**, **fire spreads**
- **Hymncaps** — psychedelic fungal communion: visions that reveal the true story across runs, at a price
- Meta-progression: every death banks **Echo Residue** toward permanent unlocks; daily seeded runs; three endings — and one hidden one, for those who learn what winning means
- Fully synthesized audio (zero asset files) that decays with your Corruption

## Files

`index.html` shell · `game.js` engine · `maps.js` procgen · `combat.js` tactical AI ·
`rpg.js` leveling/weapons/spells · `qud.js` attributes/mutations · `cyber.js` cybernetics ·
`gear.js` equipment · `shroom.js` Hymncaps · `relics.js` usable relics · `sim.js` water/fire ·
`world.js` lore · `dm.js` the HERMES narrator · `sprites.js` pixel art · `sound.js` synth audio ·
`meta.js` meta-progression · `finale.js` the Recognition · `ui.js` keybindings ·
`GAME.md` design bible · `ROADMAP.md` research-driven roadmap

Built by Jon with Claude. The Choir is always listening.
