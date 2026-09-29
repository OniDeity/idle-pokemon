# Idle Pokémon: Kanto

An idle/incremental Pokémon adventure built on [Profectus](https://moddingtree.com), the
TypeScript successor to The Modding Tree.

Pick a starter, and your team battles and catches wild Pokémon on its own while you plan:
where to hunt, who's in your party, when to challenge the next Gym. Earn all 8 badges, beat
the Elite Four, fill the Pokédex, then enter the Hall of Fame to start a faster journey.

## How it plays

- **Journeys through three regions.** Kanto (with 10 anime-exclusive locations like Porta
  Vista, Maiden's Peak and Pokémopolis), the Orange Islands from the anime (the Orange Crew and
  Drake's Winner's Cup), and the Sevii Islands from FireRed/LeafGreen (Team Rocket, the
  Ruby & Sapphire quest and the Trainer Tower). Each first clear is tuned for about a day of play.
- **Wild battles run automatically.** Your trainer sends out the party member with the best
  type matchup. Every win pays Pokédollars and gives XP to the whole party.
- **Catching** uses real capture rates. Catch _new_ species only, _all_ of them (extra catches
  make that species stronger), or none, and pick which ball to throw.
- **251 species.** Red/Blue and FireRed/LeafGreen encounter tables, fishing and Surf pools
  unlocked by key items, trades, gifts, Game Corner prizes, fossils, legendaries (including the
  birds, beasts, Lugia and Ho-Oh) and Mew from Professor Oak.
- **Evolution** by level (automatic, in the party), evolution stones, or trade (Link Cable).
- **Trainer battles** are two-sided and deterministic, so every Gym, quest and finale shows an
  **exact forecast** before you commit. Progress raises your level cap.
- **Pokédex** (permanent): every species caught adds damage, and Professor Oak's milestones give
  Exp. Share, Amulet Coin, auto-restocking, Lucky Egg and more.
- **Hall of Fame** (prestige): after clearing a region's finale, enshrine your team for Fame and
  start a new journey in any unlocked region. Pokémon never enshrined before earn extra Fame.
  Trainers come back stronger in rematches (and pay more), and Fame buys permanent upgrades and
  **automation**: shopping, gifts, evolution, party building, travel and challenges.
- Works in portrait on phones: one screen at a time, no sideways scrolling.
- Offline progress for up to 12 hours.

## Project layout

| Path                             | What's in it                                                                                                                                                                                                  |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/game/pokemon/`              | The game engine: species data, stat/XP/damage formulas, battles, regions (`regions.ts`, `kantoAnime.ts`, `orange.ts`, `sevii.ts`), zones, trainers, gifts/trades, balance constants. Pure TypeScript, no Vue. |
| `src/data/projEntry.tsx`         | The main "Journey" layer: run state, the real-time battle loop, catching, XP and evolution.                                                                                                                   |
| `src/data/layers/`               | Map, Party & Box, Poké Mart, League, Pokédex, Hall of Fame.                                                                                                                                                   |
| `src/data/automation.ts`         | The Fame-bought automations.                                                                                                                                                                                  |
| `src/data/ui/`                   | Shared components, the battle scene, and styles.                                                                                                                                                              |
| `src/data/pokemon/*.json`        | Generated data (see below).                                                                                                                                                                                   |
| `scripts/fetchPokemonData.ts`    | Regenerates the JSON from PokeAPI's CSV dump.                                                                                                                                                                 |
| `scripts/simulateProgression.ts` | Headless balance simulator.                                                                                                                                                                                   |

## Development

```
npm install
npm start               # dev server with hot reload
npm run build           # type-check and build for production
npm test                # unit tests (including the Pokémon engine)
npm run fetch:pokemon   # regenerate species/encounter/type-chart JSON
npx tsx scripts/simulateProgression.ts kanto,orange,sevii [seed]   # balance check
```

The simulator plays a campaign of journeys with a sensible strategy, carrying the Pokédex and
Fame upgrades between them, and prints when each trial and finale is cleared. Run it after
changing anything in `src/game/pokemon/balance.ts`, `trainers.ts` or a region file.

Pokémon data comes from [PokeAPI](https://pokeapi.co/); sprites are loaded from the
[PokeAPI sprites repository](https://github.com/PokeAPI/sprites). Pokémon is © Nintendo,
Creatures Inc. and GAME FREAK inc. This is a non-commercial fan project.
