# Idle Pokémon: Kanto

An idle/incremental Pokémon adventure built on [Profectus](https://moddingtree.com), the
TypeScript successor to The Modding Tree.

Pick a starter, and your team battles and catches wild Pokémon on its own while you plan:
where to hunt, who's in your party, when to challenge the next Gym. Earn all 8 badges, beat
the Elite Four, fill the Pokédex, then enter the Hall of Fame to start a faster journey.

**Play:** https://onideity.github.io/idle-pokemon/
**Dev build** (upcoming changes, separate saves): https://onideity.github.io/idle-pokemon/dev/

## How it plays

- **Journeys through eight regions.** Kanto (plus 52 anime-exclusive locations from
  [Bulbapedia's list](https://bulbapedia.bulbagarden.net/wiki/List_of_animated_series-exclusive_locations),
  from Porta Vista to the Tree of Beginning), the Orange Islands (29 islands, the Orange Crew
  and Drake's Winner's Cup), and the Sevii Islands from FireRed/LeafGreen (Team Rocket, the
  Ruby & Sapphire quest and the Trainer Tower), and Johto from HeartGold/SoulSilver (eight Gyms,
  the Elite Four and Lance, with Headbutt trees and Rock Smash rocks, plus 58 anime-exclusive
  locations from Palm Hills to Mount Quena), Hoenn from Ruby/Sapphire/Emerald (Emerald's Gyms,
  Elite Four and Wallace, Dive, Feebas, the fossils, Regis, Lati@s and the weather trio, plus
  34 anime-only places from the Oldale Ruins to LaRousse City),
  Orre's two GameCube journeys, and Sinnoh from Diamond/Pearl/Platinum (Platinum's Gyms, Elite
  Four and Cynthia, Honey Trees, Pal Park and the Distortion World). Each first clear is tuned for about a day of play.
- **Johto's Gen 2 extras**: morning, day and night Pokémon all in the grass together, the
  Pokégear radio's swarms (a one-time fee adds each to its place) and Lucky Number Show, the
  Bug-Catching Contest (a one-time entry fee adds its bugs to the National Park), Kurt's seven
  Apricorn Balls, and the Day Care's Eggs.
- **Generation mechanics carry back**: a generation's new mechanic is met first in its region,
  then works in every region from then on: breeding (Johto's Day Care), Kurt's Apricorn Balls
  and Headbutt trees; Orre's Snag Machine, Relic Stone and Poké Spots; and Hoenn's Double
  Battles (a partner backs up the active Pokémon), Pokémon Contests (Pokéblocks, ribbons, Cosplay
  Pikachu) and Bring a Partner (start a journey with a Hall of Fame Pokémon); and Sinnoh's
  Underground (dig walls for stones, fossils and Arceus's Plates) and its evolutions of older
  Pokémon (Magnezone, Togekiss...).
- **Sinnoh's extras**: Honey Trees (with the Pokétch automation), the Poké Radar (a Pokédex
  reward: chain grass Pokémon for better shiny odds), Pal Park (regions cleared after Sinnoh
  migrate there), and the Distortion World's Cyrus after the League for extra Fame.
- **Johto's legends and events**: Lugia, Ho-Oh, the legendary beasts, Celebi, the Spiky-eared
  Pichu and the Lake of Rage's Red Gyarados; the Odd Egg, Bill's Eevee and the other gifts and
  trades; and Red at the summit of Mt. Silver.
- **Anime variants**: 20 Pinkan Pokémon on Pinkan Island, 7 Valencian Pokémon on Valencia
  Island, the Crystal Onix, the Pink Butterfree, and Surfing and Flying Pikachu, each with
  its own Pokédex entry.
- **Alternate forms**: all 28 Unown in the Tanoby Chambers, female forms of every species with
  visible gender differences, Partner Pikachu and Eevee starters, and Ash's Original Cap
  Pikachu. Regional forms (Alolan, Galarian, Hisuian, Paldean) and other caps are in the data
  and arrive with their regions.
- **Magikarp Jump patterns**: all 32 patterns (and their Gyarados, colored after Cobblemon's
  Gyarados Jump Patterns), hooked with the Roddy's Old Rod Fame upgrade.
- **Cobblemon fan favorites**: Arbok's hood patterns, Heart-Marked Wooper, the Mooshtanks,
  Shulker Forretress, Alola-bias Pikachu and Valencian Gloom and Bellossom, following the
  [Cobblemon wiki](https://wiki.cobblemon.com/index.php/Pok%C3%A9mon/Unique_Forms).
- **Legendary forms**: the anime's one-of-a-kind Pokémon are their own forms, never met in the
  wild: the marked giants of Pokémopolis (Alakazam, Gengar, Jigglypuff), the Giant Dragonite of
  Bill's Lighthouse, Mewtwo's striped Clone Pokémon on New Island, and the sleeping Snorlax
  recolored after Pokémon Sleep's research areas (Taupe Hollow, Cyan Beach). Johto adds the
  wild Pudgy Pidgey, Silver the young Lugia, the Unown's Entei, Dark Celebi and
  Dark Tyranitar; Hoenn adds Meta Groudon from "Jirachi: Wish Maker".
- **Orre (Colosseum)**: no wild Pokémon, only trainers and Cipher's 48 Shadow Pokémon to snag
  with the Snag Machine and purify at the Relic Stone, from Phenac City to Realgam Tower. Every
  species has a Shadow form; once unlocked, Cipher Peons roam the other regions with Shadow
  versions of their Pokémon.
- **Orre (XD)**: Cipher returns with XD001, Shadow Lugia. Eevee starts; XD's Shadow Pokémon,
  admins and Citadark Isle, plus the Poké Spots, whose snack-loving wild Pokémon come to every
  region once unlocked.
- **Regions in order**: Kanto, then the Orange Islands, then the Sevii Islands, then Johto,
  then Hoenn, then Orre (Colosseum), then Orre (XD), then Sinnoh; Johto, Hoenn, both Orre
  journeys and Sinnoh also
  need every species the regions before them offer in your Pokédex. A region you've already
  journeyed to stays open when a new one slots in before it.
- **Pacing**: each region's first clear takes about a day of active play (10-13 hours);
  trainers in regions you haven't cleared grow tougher (Renown) as you conquer others,
  and rematches in cleared regions go faster. Experience past the level cap becomes Effort, a
  growing damage bonus, so a tough trainer is never a hard wall.
- **Wild battles run automatically.** Your trainer sends out the party member with the best
  type matchup. Every win pays Pokédollars and gives XP to the whole party.
- **Catching** uses real capture rates. Catch _new_ species only, _all_ of them (extra catches
  make that species stronger), or none, and pick which ball to throw.
- **251 species.** Red/Blue and FireRed/LeafGreen encounter tables, fishing and Surf pools
  unlocked by key items, trades, gifts, Game Corner prizes, fossils, legendaries (including the
  birds, beasts, Lugia and Ho-Oh) and Mew at the Tree of Beginning.
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
| `src/game/pokemon/`              | The game engine: species data, stat/XP/damage formulas, battles, regions (`regions.ts`, `kantoAnime.ts`, `orange.ts`, `sevii.ts`, `johto.ts`, `johtoAnime.ts`), zones, trainers, gifts/trades, balance constants. Pure TypeScript, no Vue. |
| `src/data/projEntry.tsx`         | The main "Journey" layer: run state, the real-time battle loop, catching, XP and evolution.                                                                                                                   |
| `src/data/layers/`               | Map, Party & Box, Poké Mart, League, Pokédex, Hall of Fame.                                                                                                                                                   |
| `src/data/automation.ts`         | The Fame-bought automations.                                                                                                                                                                                  |
| `src/data/ui/`                   | Shared components, the battle scene, and styles.                                                                                                                                                              |
| `src/data/pokemon/*.json`        | Generated data (see below).                                                                                                                                                                                   |
| `scripts/fetchPokemonData.ts`    | Regenerates the JSON from PokeAPI's CSV dump.                                                                                                                                                                 |
| `scripts/simulateProgression.ts` | Headless balance simulator.                                                                                                                                                                                   |

## Releases

- `dev` is where changes land first. Every push deploys it to `/dev/`, a build with its own
  save slot (`scripts/prepareDevBuild.mjs`), so testing never touches players' saves.
- `main` is the public game. Merge `dev` into `main` to release; every push deploys to the site
  root. Both deploys are handled by `.github/workflows/deploy.yml`.

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
