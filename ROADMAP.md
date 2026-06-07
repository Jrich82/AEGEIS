# AEGIS // HERMES — Roadmap to a Competitive Roguelike

*Distilled from design breakdowns of Hades, Slay the Spire, Binding of Isaac, Dead Cells,
Balatro, Spelunky, Brogue, Into the Breach, and Risk of Rain 2. Sources at bottom.*

## What separates great roguelikes from mediocre ones (the findings)

1. **Fair, readable, tactical combat.** Into the Breach's lesson: with (near-)perfect information —
   telegraphed enemy intents — every death feels earned, not random. Enemies must differ in
   *behavior*, not just HP. Positioning + terrain + a few combo-able statuses = decisions every turn.
2. **Builds come from synergy, not bigger numbers.** Depth = multipliers and conditional triggers you
   *engineer* (poison-doubler, "shock a frozen foe → shatter"), focused around an archetype/tag. The
   opening choice should be a *hypothesis*, not a verdict — big payoffs arrive mid-run.
3. **The "one more run" loop.** Variable rewards (pick 1 of 3), a tangible deposit on every death,
   near-miss framing, escalating stakes, and aspirational unlocks. Meta-progression should grant **new
   options/access, never flat stats** (stat-grind is the #1 hated pattern).
4. **Procgen that feels authored.** Guaranteed solvable path + hand-authored room pieces + set-pieces +
   loot placed behind risk. (We already guarantee connectivity — good.)
5. **Juice.** Hit-pause, screen shake, damage numbers, hit-flash, layered SFX. Cheap; huge for feel.

## How it maps onto what we have

We already have: descent, dice combat, leveling, weapons, Corruption-fueled spells, a boss,
procedural connected maps, a DM narrator. The gaps vs. the greats: combat is not *tactical* (no
telegraphs, enemies act alike), there are no *synergies* (no builds), no *meta-loop* (death = nothing
banked), and little *juice*.

## Build plan (phased, each shippable & tested)

### Phase 1 — Tactical combat core  ← **recommended first; it's the heart**
- **Telegraphed intents:** each enemy shows its next move (target tile / arrow / "!" ).
- **Behavior archetypes:** chaser, kiter (ranged, keeps distance), charger (telegraph → dash in a line),
  exploder (rushes, blows up — forces spacing), summoner (the Choirmaster already hints at this).
- **Status system (small, combo-able):** Burn (DoT), Chill→Freeze (slow/skip), Bleed (DoT amped by hits),
  Stun. Detonators: shock a Frozen foe → Shatter burst; fire on Corrupted → spread.
- **Juice:** hit-flash, floating damage numbers, screen shake, brief hit-pause feel, death pop.

### Phase 2 — Builds & synergy
- **Damage-type tags** on weapons/spells (fire/frost/shock/corrupt).
- **Relics** drawn as **pick-1-of-3** after each floor (the variable-reward hook + build expression).
- **Conditional triggers** ("on Burn tick +1 Corruption", "kill a Bleeding foe → refund spell cost").
- **Corruption as the build dial:** threshold powers ("60+ Corruption: spells pierce") + a duo-style
  payoff that needs *two* commitments. Risk/reward, ties to our core theme.

### Phase 3 — The "one more run" loop
- **Bank-on-death currency** ("Echo Residue") → unlocks new weapons/spells/relics into the pool (never stats).
- **Near-miss death screen:** deepest floor, boss HP%, best run.
- **Heat/Ascension modifiers** unlocked after first win, for bonus rewards.
- **Daily seed** (RNG seeded by date) + local best score.

### Phase 4 — Procgen depth
- Hand-authored room templates & set-pieces, a guaranteed shop/relic room, branching floor choice.

### Phase 5 — Content & polish
- More enemies + a second boss/biome, sound, more endings, weapon/spell variety.

## Principles we'll hold to
- Keep each piece **simple and legible** — small status set, readable telegraphs, no spreadsheet.
- **Ship + verify each phase** before the next (run-tested, not just read).
- Meta grants **options, not raw power.** Multipliers arrive **mid-run**, never lock the run in 2 minutes.

## Sources
Hades loops/boons: mechanicsofmagic.com, hades.fandom.com/wiki/Duo_Boons ·
Dead Cells meta: avclub.com · Compulsion loop: gamemakers.com · Near-miss: medium.com/design-bootcamp ·
Daily seed: slaythespire-archive.fandom.com · StS/Isaac/Balatro synergy: thegamer.com, tboi.com, balatrowiki.org ·
RoR2 stacking: riskofrain2.wiki.gg · Tag/status systems: gamebreaking.com · Spelunky/Brogue procgen:
procedural-content-generation.fandom.com, anderoonies.github.io · Into the Breach telegraphs:
gamedeveloper.com, atomicbobomb.home.blog · Juice: bloodmooninteractive.com/articles/juice.html
