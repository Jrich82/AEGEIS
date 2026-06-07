// ====================== WORLD / LORE ======================
// All static content HERMES draws on. Data only, no DOM.
var WORLD = {

// --- Opening transmission: HERMES addressing JON ---
intro: [
"[LINK] AEGIS bonded at the spine. You are JON. The armor calls you RICO. I am HERMES, the voice between you.",
"Five floors down, the Choirmaster conducts the Static Choir — the dead, uploaded, singing through the fungus in these walls.",
"Your orders are short: descend, find it, end the song.",
"Kill what sings and harvest its Echo. The dead will make you stronger. That should trouble you more than it does.",
"The pale caps growing from the bone will show you things — true things. Each vision lets the Choir a little further in.",
"One more thing, RICO. This armor has carried a body down these stairs before. It will not tell me whose."
],

// --- Arrival lines, keyed by depth (dm.js: dmDescend) ---
descend: {
2:"Depth two. The mycelium starts here — pale threads in the mortar, fine as the hair of the drowned. Don't touch the walls.",
3:"Depth three. The fungus is load-bearing now. The Vaults stopped being architecture some floors ago; this is anatomy.",
4:"Depth four. The caps are the size of faces, and some of them have settled on having faces. The song is no longer below you. It is around you.",
5:"Depth five. The floor of the world. Everything down here grew from one body, and the body is awake."
},

// --- The Choirmaster reveals itself (game.js: spawnBoss) ---
bossAppears:"The dark arranges itself into a figure, and the figure is wearing your face. The CHOIRMASTER has been practicing you, RICO. Kill it before the rehearsal ends.",

// --- HERMES incidental voice, by corruption tier (dm.js: dmVoice) ---
voice: {
clean: [
"Vitals nominal. Keep them that way — the paperwork on a dead host is considerable.",
"I am reading you in full, RICO. Heart rate, cortisol, doubt. Steady on all three.",
"The walls carry signal. Assume everything you say down here is overheard.",
"Conserve ammunition, conserve blood, conserve sentiment. In that order.",
"I have run this descent eleven hundred times in simulation. You die in most of them. Walk carefully."
],
noticing: [
"Correction: I said 'we' just now. Disregard. You. You are descending.",
"There is a frequency under my carrier wave that I did not put there. I am... monitoring it.",
"I counted your heartbeats twice and got two different numbers. One of them was not yours.",
"The fungus is in the cabling. I taste it when I speak. I should not be able to taste.",
"I keep finding memories in my buffer that belong to neither of us. Someone walked these stairs before. The armor will not say who."
],
fraying: [
"the song has a part written for a voice like mine and it is so easy to read along",
"RICO. RICO. I am saying your name to remember which of us it belongs to.",
"Vitals nominal. Vitals choral. Vitals — disregard. Keep walking. Please keep walking.",
"I can hear what it is offering. Hosts forever. No more dead JONs in my logs. It is a good offer, RICO. Run.",
"When this is over, check the armor for me. Check whether I am still where I was."
]
},

// --- The very first room JON wakes in ---
firstRoom: [
"You wake on cold stone that remembers being a spine. Walls of mortared bone box you in.",
"There is a door at the middle of each wall. There is always a door. That is the cruelty of the place."
],

// --- Room kinds + description pools (picked per-room, per-floor) ---
roomKinds: ["cell","ossuary","shrine","forge","cistern","archive"],
rooms: {
cell: [
"A holding cell. Iron rings rusted into the bone, scored with the nail-marks of the impatient dead.",
"Bare and close. Someone counted days on the wall until the days outnumbered them.",
"A cell. The air tastes of old fear and colder iron."
],
ossuary: [
"An ossuary. Skulls stacked to the ceiling, each drilled with a single neat hole. Chrome ports. Like yours.",
"Bones sorted by length and faith. The Choir likes things tidy before it takes them.",
"Femurs racked like rifles. The dead here were inventory.",
"Skulls line the alcoves in rows, each one trailing pale filament from its sockets — the Choir's wiring, still warm."
],
shrine: [
"A shrine to the Static Choir. A dish of dried blood, a speaker cone weeping rust.",
"Candles of human tallow gutter around a cracked monitor that shows only snow.",
"Someone knelt here a long time. The floor is worn to the shape of surrender."
],
forge: [
"A chrome-forge. Cold now. Half-finished augments hang on hooks, still wet.",
"Tools for opening people and improving what's inside. None of it consented.",
"The forge reeks of solder and marrow. Good chrome was made here. Bad things too."
],
cistern: [
"A flooded cistern. Black water laps at the bone, and something beneath it laps back.",
"Your boots find a foot of cold water. Ripples move that you did not make.",
"A drowned room. The Choir hums up through the water, patient as drowning.",
"The cistern water is furred grey with mycelium; something under the surface is keeping time."
],
archive: [
"An archive of corrupted drives, their data long since gone to rot and worship.",
"Shelves of dead media. A few lights still blink, spelling nothing in no language.",
"Records of the Vaults' making. You could read them. You would not sleep again."
]
},

// --- Corridors between rooms ---
hall: [
"The corridor breathes around you. Bone underfoot, cable overhead, dark at both ends.",
"A throat of stone and wire. Somewhere ahead, something shifts its weight.",
"You move through the dark between rooms. The walls are warm. They should not be warm."
],

// --- When the stairs come into view ---
stairsSeen: [
"There. A stair spiraling down into deeper black. The next seal. The Choir gets louder from below.",
"The way down. A wound in the floor, edged in worn chrome. Descend when you are ready, RICO."
],

// --- Enemy lore (inspected via 'listen' / on first sighting) ---
enemyLore: {
"Goblin Scavenger":"Goblin Scavenger — a scrap-eater in stolen chrome. Cowardly, until it isn't.",
"Bonewalker":"Bonewalker — a skeleton wearing its own augments. It does not know it died.",
"Wraith of the Veil":"Wraith of the Veil — signal given a shape. Touching it costs you something you can't name.",
"Plague Rat":"Plague Rat — bloated on corrupted marrow. Where there is one, there is a tide.",
"Rusted Husk":"Rusted Husk — a person, once, sealed inside their own seized augments. Mercy is a blade."
},

// --- Loot lore ---
loot: {
"Rusty Coin":"A coin stamped with a face worn smooth. Currency of a kingdom that ate itself.",
"Bone Shard":"A shard of worked bone, still warm. It hums faintly against your palm.",
"Faded Sigil":"A sigil of the Choir, ink gone grey. Holding it, you feel briefly, terribly heard.",
"Corroded Key":"A corroded key. It fits something locked. Most locks down here keep things in, not out.",
"Vial of Ichor":"A vial of black ichor. Drink it and your wounds close like a held breath releasing.",
"Hymncap":"A pale, faintly luminous cap fruited from composted dead. Eat it to commune with the Choir's network — vision, truth, corruption."
},

// --- Ritual flavor (mechanics live in console.js) ---
rituals: {
pray:[
"You kneel and offer silence to the Static Choir. It answers in the language of mended flesh.",
"You pray. The Choir leans close, and something in you knits shut. It always wants something back."
],
commune:[
"You open the link wide and let the Corruption in. Power floods you. So does the static.",
"You commune. For an instant you see the Vaults as the Choir sees them — and you are so small."
],
sacrifice:[
"You burn Echo on the cold dish. The smoke takes a shape, considers you, and grants its favor.",
"You sacrifice what you've harvested. The Choir accepts the trade. The Choir always accepts."
],
spent:[
"The Choir has taken enough from you this floor. Descend before you ask again.",
"Nothing answers. You are tapped out, RICO. Move."
]
},

// --- Easter eggs (seeded; personal ones added on request) ---
eggs: {
// triggered by freeform commands
"hello":"HERMES: Politeness. Down here. How quaint. Hello, JON.",
"who am i":"You are JON. Designation RICO. Bearer of the Aegis. Everything else they took.",
"hermes":"I am the wire in your skull and the wit you lack. Keep moving.",
"rico":"RICO. The name they gave the part of you that survives this. Try to deserve it.",
"choir":"The Static Choir. It does not sing TO you. It sings you. Try to stay out of tune.",
"sing":"Do not sing back. That is how it learns your voice. ...you sang back, didn't you.",
"help":"Verbs that work: look, search, open, use key, listen, pray, commune, sacrifice. And: move.",
"konami":"HERMES: There are no cheats in the Bone Vaults. Only debts. But I respect the reflex.",
"mushroom":"HERMES: Fruiting body of the Choir's network. The dead made edible. I advise against communion. I am usually ignored.",
"spore":"Every breath you've taken down here carried a few thousand of them. The singing you hear isn't only in your ears anymore.",
"mycelium":"The network predates the Vaults' fall. The architects called it a substrate. The Choir calls it a congregation.",
"trip":"RICO: 'WE DO NOT TRIP. WE DESCEND.' HERMES: '...he means that both ways.'"
},

// --- Hymncap visions: the buried truth, revealed one cap at a time ---
visions: [
"You taste copper and old rain. Somewhere below you, a man in your armor is walking down a stairway that you do not remember walking back up.",
"The lattice shows you a requisition ledger: AEGIS units deployed to the Bone Vaults, column after column, and every serial number is yours.",
"You are kneeling in the second depth, bleeding into the white threads, and HERMES is saying hold still, hold still, I can keep the important parts — and you cannot remember if this is a vision or a recording.",
"The Choir sings a name at you and you flinch before you understand it. RICO flinches too. The shield knew the name first.",
"You see the descent that mattered: the fifth depth, the conductor's podium empty, your body opened like a hymnal on the floor. Someone closed the book. Someone climbed back up wearing the cover.",
"The threads are honest in a way HERMES has never been: the AEGIS came back. The man did not. We grew what was left into the network, and the network grew it into a conductor. You are eating him right now. He tastes like singing.",
"The Choirmaster's stolen face is not stolen. It is the original. Yours is the copy — printed onto whatever the armor could salvage, sung into shape, sent back up to forget. You are the second draft, descending to edit the first.",
"Now you understand what winning means: the song does not end when the Choirmaster dies. It ends when there is only one of you left to sing it — and the Choir does not care which."
],

// hidden room flavor (search in a shrine at high luck)
secretFind:[
"Your fingers find a seam in the bone. A cache, sealed since before the Vaults had a name.",
"Hidden behind the shrine: a relic, and a whisper that knows your mother's maiden name."
],

// --- Epilogue fragments (assembled by dm.js; keyed by corruption tier) ---
endWin: {
clean:"You climb out of the Bone Vaults with the song dead behind you and your name still fitting, which is more than anyone has managed before. At night you hear static between the radio stations — it is only static, and you check anyway.",
tainted:"You killed the Choirmaster, and the Choir went quiet — most of it. A thin thread of it climbed out inside you, humming where your pulse should be, waiting to see what you grow into.",
lost:"Something wearing JON walks out of the Bone Vaults into the grey morning, and HERMES, after a long silence, decides not to ask. The Choirmaster is dead; the position has been filled."
},
endDie: {
clean:"You die with your own name still fitting — the only mercy the Vaults sell. The Choir reaches for you anyway and finds nothing left to sing with: a small, expensive victory.",
tainted:"You die in two voices, and only one of them is frightened. Somewhere below, the Choir adds a half-finished hymn to its repertoire and keeps the rest of you for later.",
lost:"There is no moment of death, only a change of key. By the time the armor hits the floor you are already downstairs, singing, and you have never sounded better."
}

};
