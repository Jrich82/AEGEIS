# AEGIS // HERMES — Story & Systems Bible

*The single source of truth. If it's not consistent with this doc, it's a bug.*

---

## 1. The Story (the explanation)

The world died the day the wall between **soul and signal** came down. The dead stopped staying dead — they were *uploaded*, harvested, rerouted. What was meant to preserve them instead ground them into a single screaming chord.

**You are JON.** A soldier who took the oath of the **AEGIS** — living augment-armor bonded to a host at the spine. The Aegis has a persona of its own, a war-self called **RICO**; over a long enough bond, host and shield stop being two people. Riding the neural link is **HERMES**, the operating intelligence — your handler, your eyes in the dark, and (whether you like it or not) the narrator of your descent.

Beneath the surface lie the **Bone Vaults**: an ossuary-server kilometers deep, where the uploaded dead were stored and went wrong. Down there sings the **Static Choir** — a hive-mind woven from every swallowed soul, and it is still recruiting. Its conductor is the **Choirmaster**, and it wears a stolen face. The closer you get, the more you suspect the face is *yours* — from a descent you already made, and did not walk away from.

**Your goal:** reach the bottom (five seals down), silence the Choirmaster, and take back what it stole — before the Choir finishes rewriting you into one more voice.

**The tragedy engine:** every step down makes you stronger and less yourself. The game asks how much of JON you'll spend to win.

---

## 2. The Three Meters = The Engine

Nothing here is flavor. Each existing meter drives a system:

| Meter | Fiction | Mechanic |
|---|---|---|
| **ECHO** | Resonance harvested from the dead | XP **and** currency. Levels you up; spent at sanctuaries. |
| **CHROME** | Your augmentation integrity (a finite budget) | Caps which weapons you can equip. Heavier kit = more deadly, more chrome load. |
| **CORRUPTION** | How far the Choir has rewritten you | **Fuel for magic.** Casting raises it. At thresholds, HERMES frays and your ending darkens. |

---

## 3. Leveling — "Attunement" (hybrid)

Echo is XP. Cross a threshold and the Aegis **attunes** — an automatic level-up — *and* you bank Echo to spend at sanctuaries.

**Core stats**
- **VITALITY** — max HP.
- **MIGHT** — adds to melee damage.
- **FOCUS** — boosts Rite (spell) power and unlocks Rite slots.

**Auto level-up (on crossing Echo thresholds):** +4 Vitality, +1 Might every level, +1 Focus every 2nd level, full heal.

**Echo thresholds:** Lvl2 @ 100, then ~×1.6 each level (100, 260, 480, 770, 1150…). Tunable.

**Spend at sanctuaries (with Mara/Crow):** buy weapons, learn new Pacts/Rites, +2 max Vitality "chrome plating," restock Vials. Echo is shared between leveling and spending — so you choose: hoard to grow, or spend to gear.

---

## 4. Weapons (melee)

You equip **one weapon**. Damage = weapon die + MIGHT. Each weapon has a **trait** and a **Chrome load**; your Chrome stat caps total load.

| Weapon | Damage | Trait | Chrome |
|---|---|---|---|
| Rusted Knife (start) | 1d4 | — | 0 |
| Bone Cleaver | 1d8 | +crit chance | 10 |
| Rust Saber | 1d6 | cleave (hits feel through) | 8 |
| Choir-Iron Maul | 2d6 | slow but brutal | 20 |
| Veiledge | 1d6 | lifedrain (heal on hit) | 16 |

Acquired from loot, chests, Mara (Echo), and quest rewards. Equip via console: `equip cleaver`. Heavier weapons need enough Chrome or they misfire (reduced damage).

---

## 5. Magic — Pacts & Rites (Corruption-fueled)

You hold a **Pact**; it grants 2–3 castable **Rites**. Casting a Rite **raises Corruption** — the Choir lends its voice and keeps the interest. Power scales with **FOCUS**.

**Pact of the Static Choir (starting):**
- **Static Lance** — ranged bolt, dmg = Focus + 1d6. *Corruption +3.*
- **Veil** — cloak: enemies lose track of you for a few turns. *Corruption +4.*
- **Choir's Hunger** — drain: damage an adjacent foe, heal half. *Corruption +5.*

Cast via console: `cast lance`. Other Pacts (learned at sanctuaries) swap the Rite set — e.g., a **Pact of Rust** (armor/melee buffs) or **Pact of the Drowned** (control). Corruption at 60+ makes Rites stronger but starts the occult text-rot and steers you toward the darker endings.

---

## 6. The Descent Structure

`D1 → Sanctuary → D2 → D3 → Sanctuary → D4 → D5: the Choirmaster`

**Sanctuaries** (safe, between floors): rest/heal, and meet —
- **Vesh**, heretic-priest — doles out JON's origin in fragments; teaches Pacts.
- **Mara**, scavenger — vendor (weapons, vials, keys, plating).
- **Crow**, quartermaster — quests: fetch relics, bounties, rescues, hidden-secret leads.

**Depth 5 — the Choirmaster:** a real boss with phases, wearing JON's old face. How you beat it (and your Corruption) decides the ending.

---

## 7. Build Roadmap

1. **Leveling** (Echo→levels, VIT/MIGHT/FOCUS, level-up UI). *Foundation everything else hangs on.*
2. **Weapons** (equip system, weapon list, Chrome gating, damage from weapon+Might).
3. **Magic** (Pacts + Rites, `cast`, Corruption cost, Focus scaling).
4. **Story pass** (rewrite intro/fragments/epilogues to this canon; in-world stat/skill explanations).
5. **Sanctuaries + NPCs + quests** (Vesh/Mara/Crow, vendor, quest log).
6. **The Choirmaster** (Depth-5 boss + endings that read your run).

Built as small modules to stay under the save-size limit; each phase verified by simulation before moving on.

---

## 8. Files
`index.html` shell • `world.js` content/lore • `dm.js` HERMES DM • `sprites.js` pixel art •
`console.js` commands • `game.js` engine • *(coming: `rpg.js` stats/weapons/magic, `npc.js` sanctuaries)*
