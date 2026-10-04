# Idle Pokémon: project memory

An idle Pokémon game on Profectus 0.7 (Vue 3 TSX). Journeys through regions (Kanto → Orange
Islands → Sevii Islands → Johto), Gyms/trials and a finale per region, a Hall of Fame prestige
layer (Fame upgrades, automation), and a Pokédex kept across journeys.

## Workflow (how the owner wants changes shipped)

- Develop on the session's feature branch, open a PR into `dev`, merge when CI is green.
  `dev` deploys to https://onideity.github.io/idle-pokemon/dev/.
- `dev` exists so a save-breaking bug never reaches public. Before releasing, build `origin/main`
  and the new code locally, start a game on the main build, then load that save in the new build
  (same origin) and check it loads with no page errors and keeps its progress. If it does,
  release without waiting to be asked: PR `dev` → `main`, merge when green, confirm
  https://onideity.github.io/idle-pokemon/ serves the new bundle.
- Never put model identifiers in commits, PRs or code.
- Don't scrape or work around protections on other sites (Bulbapedia is Cloudflare-blocked; the
  Pokémon Fandom wiki's API and Serebii pages are fine). Sprites are our own copies/recolors.

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
  files `kantoAnime.ts`, `orange.ts`, `sevii.ts`, `johto.ts`, `johtoAnime.ts`.
- `src/data/projEntry.tsx`: main layer state and game loop. Layers in `src/data/layers/`
  (party, map, mart, dex, hof); `src/data/automation.ts`; UI kit in `src/data/ui/components.tsx`.
- Data: `scripts/fetchPokemonData.ts` (PokeAPI CSV → `src/data/pokemon/*.json`), sprite
  generators `scripts/generate*.py`, `scripts/fetchSprites.ts`.
- Tests: `tests/pokemon/engine.test.ts`.

## Conventions and gotchas

- Variant ids: 1000+ Pinkan, 2000+ Valencian, 3xxx one-of-a-kind (3016 Pudgy Pidgey,
  3244 Unown Entei, 3248 Dark Tyranitar, 3249 Silver, 3251 Dark Celebi), 4000–4027 Unown, 4028
  Spiky-eared Pichu, 5000+ female, 6000+/6100+ Magikarp/Gyarados patterns, 7001+ cosmetic,
  7150–7153 giants, 7200+base clones.
- Local sprites need literal `itemSprite("slug")` calls (fetchSprites scans for them).
- Zone ids must be unique across regions (Johto's Silver Town is `johtoSilverTown`).
- Every encounter pool's key item must be obtainable in its region (a test enforces it).
- Generation mechanics (`mechanics.ts`): met first in their own region, then unlocked for good
  (in `hof.mechanics`) and on in every region. Gate features with `main.mechanicOn(id)`.
- Johto ignores the real clock: time-of-day tables use average weights, and nothing is
  weekday-only. Swarms (₽3,000 each, Radio Card) and the Bug-Catching Contest (₽2,000) are
  one-time purchases per journey that add a third to that place's pool. The Lucky Number Show is
  still once per real day.
- UI panels collapse by title, remembered in localStorage (`pk-collapsed-panels`).

## Done (v2.2 "Johto")

- Johto: 50 HG/SS places, Gyms, Elite Four and Lance (unlocks after Sevii plus a complete Pokédex
  of the earlier regions), Headbutt/Rock Smash, Unown chambers, Pokégear, contest, Apricorn
  Balls, Day Care, legends/gifts/trades, Red on Mt. Silver, 58 anime-only places and the anime's
  one-of-a-kind Pokémon.
- Mechanics carry back: breeding (Day Care) and Apricorn Balls.
- Day Care: search, Egg previews (★ new to Pokédex, • not in box), filters, Pick best, Auto-swap.
- Sevii journeys get Rock Smash; collapsible panels.

## Plans and ideas

- Orre comes after Johto (Shadow Pokémon); nothing is implemented for it yet. Hoenn is the next
  main-series region.
- Future generation mechanics go in `mechanics.ts` with their regions: double battles (Hoenn),
  Mega Evolution (Kalos), etc.
- Gen 3 anime Pokémon wait for Hoenn: Latios/Latias (Alto Mare already exists in Johto).
- Ideas offered but not picked up yet:
  - Headbutt trees carried back to earlier regions.
  - Better shiny breeding odds the more a species is bred.
  - A repeatable contest with prizes on a battle-count cooldown.
  - The Lucky Number Show on a battle count instead of real days.
