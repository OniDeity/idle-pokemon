# Idle Pokémon: project memory

An idle Pokémon game on Profectus 0.7 (Vue 3 TSX). Journeys through regions (Kanto → Orange
Islands → Sevii Islands → Johto → Hoenn → Orre (Colosseum) → Orre (XD) → Sinnoh → Fiore), Gyms/trials and a
finale per region, a Hall of Fame prestige layer (Fame upgrades, automation), and a Pokédex kept
across journeys.

## Workflow (how the owner wants changes shipped)

- Develop on the session's feature branch, open a PR into `dev`, merge when CI is green.
  `dev` deploys to https://onideity.github.io/idle-pokemon/dev/.
- `dev` exists so a save-breaking bug never reaches public. Before releasing, build `origin/main`
  and the new code locally, start a game on the main build, then load that save in the new build
  (same origin) and check it loads with no page errors and keeps its progress. If it does,
  release without waiting to be asked: PR `dev` → `main`, merge when green, confirm
  https://onideity.github.io/idle-pokemon/ serves the new bundle.
- Never put model identifiers in commits, PRs or code.
- References: Bulbapedia and Serebii first (the owner's choice), with PokeAPI for data. Don't
  scrape or work around protections: Bulbapedia is Cloudflare-blocked from the sandbox, so use
  Serebii (e.g. serebii.net/platinum/*.shtml) and the Pokémon Fandom wiki's API there. Sprites
  are our own copies/recolors (`scripts/generateSpheres.py` draws the Underground's Spheres).

## Checks (what CI runs)

- `npx eslint src --max-warnings 0`, `npx vue-tsc --noEmit`, `npx vitest run`, `npx vite build`.
- Format with `node_modules/.bin/prettier` (3.3.3). Never run Prettier on `src/data/Changelog.vue`;
  edit it by hand.
- Pacing: `scripts/simulateProgression.ts` (knobs `GYMS_<region>`, `SCALE_<region>`,
  `FINALE_<region>`). Each region's first clear is tuned to roughly 10–12 h of play.
- `vite.config.ts` uses `base: "./"`: serve builds from the server root (`vite preview`), not
  `/idle-pokemon/`, or sprites 404.

## Layout

- `src/game/pokemon/`: pure engine. `data.ts` (species, forms, variant ids), `zones.ts`
  (encounters, `ZoneExtras`), `regions.ts`, `trainers.ts`, `specials.ts` (gifts/trades/legendaries/
  bosses), `balance.ts`, `items.ts`, `mechanics.ts` (generation mechanics), `pokedex.ts`, and region
  files `kantoAnime.ts`, `orange.ts`, `sevii.ts`, `johto.ts`, `johtoAnime.ts`, `hoenn.ts`,
  `hoennAnime.ts`, `colosseum.ts`, `xd.ts`, `sinnoh.ts` (+ `underground.ts`), `fiore.ts`.
- `src/data/projEntry.tsx`: main layer state and game loop. Layers in `src/data/layers/`
  (party, map, mart, dex, hof); `src/data/automation.ts`; UI kit in `src/data/ui/components.tsx`.
- Data: `scripts/fetchPokemonData.ts` (PokeAPI CSV → `src/data/pokemon/*.json`, plus
  `sinnohExtras.json` for Sinnoh's radar/swarm/dual-slot/Honey Tree tables), sprite
  generators `scripts/generate*.py`, `scripts/fetchSprites.ts`.
- Tests: `tests/pokemon/engine.test.ts`.

## Conventions and gotchas

- Variant ids: 1000+ Pinkan, 2000+ Valencian, 3xxx one-of-a-kind (3016 Pudgy Pidgey,
  3244 Unown Entei, 3248 Dark Tyranitar, 3249 Silver, 3251 Dark Celebi, 3383 Meta Groudon), 4000–4027 Unown, 4028
  Spiky-eared Pichu, 5000+ female, 6000+/6100+ Magikarp/Gyarados patterns, 7001+ cosmetic,
  7150–7153 giants, 7200+base clones.
- Local sprites need literal `itemSprite("slug")` calls (fetchSprites scans for them).
- Zone ids must be unique across regions (Johto's Silver Town is `johtoSilverTown`).
- Every encounter pool's key item must be obtainable in its region (a test enforces it).
- Generation mechanics (`mechanics.ts`): met first in their own region, then unlocked for good
  (in `hof.mechanics`) and on in every region. Gate features with `main.mechanicOn(id)`.
- Johto ignores the real clock: time-of-day tables use average weights, and nothing is
  weekday-only. Swarms (₽3,000 each, Radio Card) and the Bug-Catching Contest (₽2,000) are
  one-time purchases per journey that add a third to that place's pool. The Lucky Number Show
  draws automatically every 100 wild battles (`LUCKY_DRAW_BATTLES`); nothing uses the real clock.
- UI panels collapse by title, remembered in localStorage (`pk-collapsed-panels`). Menus are split
  into pages with `renderTabs(menu, tabs)` / `currentTab(menu, tabs)` (components.tsx; the open
  page per menu is remembered in `pk-menu-tabs`; a tab with `show: false` is hidden). Panels that
  fill a whole page have no title (the tab names them). Shortcuts call `openTab` before
  `openLayer` to land on the right page.
- Gen 3: species data covers #1-386, but the Pokédex (`POKEDEX_IDS`) only lists species some
  region offers; `isReleased()` gates the rest (Day Care Eggs stop at released species).
- Orre (`colosseum.ts`): places have `trainerBattles` (trainers' Pokémon can't be caught; only
  Shadow forms, `8000 + species`, can be snagged, once each per journey via `ZoneExtras.snagged`).
  Admins' `snag` lists hand over their Shadow Pokémon when beaten. Shadow box entries have a
  `heart` (100 wild battles in the party), then `purify()` at the Relic Stone turns them into
  their species. Mechanics `snagMachine` (Cipher Peons: `CIPHER_PEON_CHANCE` of encounters
  elsewhere are Shadow) and `relicStone` carry back.
- Orre (XD) (`xd.ts`, region `orreXd`): same trainer-battle places; Poké Spot zones
  (`pokeSpot`) use one Poké Snack per encounter. The `pokeSpots` mechanic adds a Poké Spots
  zone to every other region (`CARRIED_POKE_SPOTS`, `mechanic: "pokeSpots"`); zones with a
  `mechanic` stay hidden and don't count toward Pokédex requirements until it's unlocked.
- Hoenn (`hoenn.ts`): RSE encounters (the fetch script allows #252-386 only in Hoenn zones;
  sea routes with identical tables are grouped), Emerald's Gyms/E4/Wallace, the Dive pool
  (`dive` key item, PokeAPI's "seaweed" method), Feebas on Route 119 (`EXTRA_ENCOUNTERS`).
  Evolutions use later generations' easier methods where they replaced one (the owner's call):
  Feebas trades holding a Prism Scale, not Gen 3's Beauty (the fetch skips Beauty rows).
- Region order changed once (Orre moved after Hoenn): `hof.regionUnlocked` keeps a region open if
  it was ever cleared or is the current journey, so a new region slotting in never locks a save
  out.
- Hoenn mechanics (v2.5): `doubleBattles` (balance.ts `battlePartner`, `PARTNER_DAMAGE` = 0.5;
  the partner isn't attacked; `TrainerDefinition.doubles` makes the trainer's next Pokémon attack
  too; stepping stays exact), `partner` (`main.journeyPartner`, picked from Hall of Fame teams on
  the starter screen), `contests` (`contests.ts`; conditions on `BoxEntry.condition`, ribbons by
  species in `hof.ribbons`, first Master win per category gives Cosplay Pikachu 10080-10084). A full 2× partner made Hoenn 3.7 h
  and Orre 2.5 h in the sim, hence the half-damage partner.
- The simulator purifies Shadow Pokémon (party only, like the game); scoring a member at the
  level cap instead of its level was tried and is wrong: wild XP is tiny next to a level's worth.

- Sinnoh (`sinnoh.ts`, v2.7): DPPt encounters (species to #493 in Sinnoh zones only), Platinum's
  Gyms/E4/Cynthia; East Sea Shellos via `eastSea()`; Honey Trees (journey state in
  `main.honeyTrees`, Munchlax trees from the Trainer ID); Pal Park (`palPark` zone, filled by
  `hof.palPark`: regions cleared after a Sinnoh clear; they also add their GBA games' dual-slot
  Pokémon via `ZoneExtras.palPark`); the Distortion World is a post-game `boss` special with
  `fameBonus` (×1.25) and `keyItem` (Griseous Orb). Mechanics: `underground` (walls every
  `UNDERGROUND_BATTLES`; fossils, stones, Plates in `hof.plates` → Arceus forms) and
  `sinnohEvolutions`. The Pokétch automation slathers/shakes trees and digs.
- Later generations' evolutions of older species (Electivire) and babies (Munchlax) are gated
  by `main.generationOpen()`/`evolutionsOf()`: only in regions whose `newestSpecies` covers them,
  or once the `sinnohEvolutions` mechanic is unlocked. Without this, Johto's pacing swung from
  16.6 h to 7.5-20 h. The Pokédex requirement likewise ignores them (`newestSpecies`).
- Gen 4 forms in `forms.json` are appended with looks-only ids from 4200 (Burmy/Shellos/Arceus);
  never renumber the earlier ones. Gender-locked evolutions (`Evolution.gender`) only split species
  with a female form (Combee ♀ → Vespiquen); others keep both branches.
- Hall of Fame is per region (v2.7.1): `hof.isEnshrined(id, region)` reads the Champions entries
  (each records its region), so a Pokémon is a new face (+5 Fame) once in every region. The
  starter screen suggests a team (strongest non-legendary final forms the region offers, not yet
  in its Hall) and stars partners new there. The simulator keys enshrinement by region too.
- Fame upgrades with a `mechanic` (Day Care: `flameBody`, `masudaMethod`; Contests:
  `pokeblockKit`, `contestStar`) show once it's unlocked; the simulator never buys them.
- Poké Radar (a Pokédex milestone at 250): chains build automatically, so the shiny multiplier
  is capped at ×6 (`radarShinyMultiplier`), not the games' ×41.
- `vite preview` answers missing files with index.html, and the service worker caches that for
  sprites: after adding sprites, clear the browser's `sprites` cache when checking locally.

- Fiore (`fiore.ts`, v2.8, Pokémon Ranger): `RegionDefinition.styler` means no Poké Balls: wild
  Pokémon are captured with the Capture Styler (`STYLER_POWER` as the ball multiplier; the
  Poké Balls tab is hidden) and beaten legendaries are captured outright. Trials are
  `missions` (`trialNoun`), each a boss capture; the finale is the Go-Rock Quads, Billy and
  Gordor's Power Styler beasts. Ranger has no levels, so place levels follow the story. Wild
  pools come from Serebii's Browser list (10/6/3 weights by evolution stage). Mechanic
  `pokeAssist`: a box Pokémon (not in the party) super effective against the wild Pokémon adds
  `POKE_ASSIST_BONUS` damage.

## Done (v2.2 "Johto")

- Johto: 50 HG/SS places, Gyms, Elite Four and Lance (unlocks after Sevii plus a complete Pokédex
  of the earlier regions), Headbutt/Rock Smash, Unown chambers, Pokégear, contest, Apricorn
  Balls, Day Care, legends/gifts/trades, Red on Mt. Silver, 58 anime-only places and the anime's
  one-of-a-kind Pokémon.
- Mechanics carry back: breeding (Day Care), Apricorn Balls, and Headbutt trees (Kanto's
  trees use HGSS's Kanto Headbutt tables at each zone's grass levels; Orange and Sevii have
  no Headbutt data in any game). A mechanic's `keyItem` is granted on every journey, and the
  Pokédex requirement only counts pools whose key item the earlier regions give.
- Day Care: search, Egg previews (★ new to Pokédex, • not in box), filters, Pick best, Auto-swap.
- Sevii journeys get Rock Smash; collapsible panels.

## Plans and ideas

- Hoenn's anime (v2.6, `hoennAnime.ts`): 34 places from Fandom's "Anime locations" ∩ "Hoenn
  locations" categories (Bulbapedia is blocked), Meta Groudon (3383, Forina, post-League), Hoenn
  Cap Pikachu (Littleroot gift). Alto Mare's Latios/Latias stay in Johto's anime places.
- Next: the other two Pokémon Ranger games as separate regions after Fiore: Almia (Shadows of
  Almia, Serebii's /ranger2/; idea: Field Move gates) and Oblivia (Guardian Signs, /ranger3/;
  idea: Ranger Signs).
- Later: Pokémon Conquest with Gen 5 (Unova); Mystery Dungeon after Gen 7 (the owner plans other
  games and romhacks as a "multiverse"). Not wanted: Pokéwalker, Pokéathlon. Not done yet:
  Sinnoh's swarms (PokeAPI's tables are in `sinnohExtras.json`), Sinnoh anime places.
- Future generation mechanics go in `mechanics.ts` with their regions: double battles (Hoenn),
  Mega Evolution (Kalos), etc.
- Ideas offered but not picked up yet:
  - Better shiny breeding odds the more a species is bred.
