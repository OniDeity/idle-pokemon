# Idle Pokémon: Kanto

An idle/incremental Pokémon adventure built on [Profectus](https://moddingtree.com), the
TypeScript successor to The Modding Tree.

Pick a starter, and your team battles and catches wild Pokémon on its own while you plan:
where to hunt, who's in your party, when to challenge the next Gym. Earn all 8 badges, beat
the Elite Four, fill the Pokédex, then enter the Hall of Fame to start a faster journey.

## How it plays

- **Wild battles run automatically.** Your trainer sends out the party member with the best
  type matchup. Every win pays Pokédollars and gives XP to the whole party.
- **Catching** uses real capture rates. Choose to catch *new* species only, *all* of them
  (extra catches make that species stronger), or none, and which ball to throw.
- **All 151 are obtainable**: Red/Blue wild encounter tables for 36 zones, fishing and Surf
  pools unlocked by key items, in-game trades, gifts, Game Corner prizes, fossils, the
  legendary birds, Snorlax, Mewtwo, and Mew from Professor Oak.
- **Evolution**: by level (automatic, in the party), evolution stones, or trade (Link Cable).
- **Gyms & the League** are two-sided battles against the real Gen 1 teams. They're
  deterministic, so every challenge shows an **exact forecast** before you commit.
  Badges raise your level cap and unlock new zones and items.
- **Pokédex** (permanent): each species caught adds +1% damage, and Professor Oak's
  milestones give Exp. Share, Amulet Coin, auto-restocking, Lucky Egg and more.
- **Hall of Fame** (prestige): after becoming Champion, reset the journey for Fame and buy
  permanent upgrades. Your Pokédex is kept.
- Offline progress for up to 12 hours.

## Project layout

| Path | What's in it |
| --- | --- |
| `src/game/pokemon/` | The game engine: species data, stat/XP/damage formulas, battles, zones, trainers, gifts/trades, balance constants. Pure TypeScript, no Vue. |
| `src/data/projEntry.tsx` | The main "Journey" layer: run state, the real-time battle loop, catching, XP and evolution. |
| `src/data/layers/` | Kanto map, Party & Box, Poké Mart, Pokémon League, Pokédex, Hall of Fame. |
| `src/data/ui/` | Shared components, the battle scene, and styles. |
| `src/data/pokemon/*.json` | Generated data (see below). |
| `scripts/fetchPokemonData.ts` | Regenerates the JSON from PokeAPI's CSV dump. |
| `scripts/simulateProgression.ts` | Headless balance simulator. |

## Development

```
npm install
npm start               # dev server with hot reload
npm run build           # type-check and build for production
npm test                # unit tests (including the Pokémon engine)
npm run fetch:pokemon   # regenerate species/encounter/type-chart JSON
npx tsx scripts/simulateProgression.ts [starterId] [seed]   # balance check
```

The simulator plays a full run with a sensible strategy and prints when each badge and the
Championship are reached. Run it after changing anything in `src/game/pokemon/balance.ts`
or `trainers.ts`.

Pokémon data comes from [PokeAPI](https://pokeapi.co/); sprites are loaded from the
[PokeAPI sprites repository](https://github.com/PokeAPI/sprites). Pokémon is © Nintendo,
Creatures Inc. and GAME FREAK inc. This is a non-commercial fan project.
