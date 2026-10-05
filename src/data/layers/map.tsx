/**
 * The Kanto map: choose where to search for wild Pokémon, and visit the gifts, trades,
 * Game Corner prizes and legendary Pokémon scattered around the region.
 */
import { LUCKY_DRAW_BATTLES, main } from "data/projEntry";
import { createLayer } from "game/layers";
import type { PokemonType } from "game/pokemon/data";
import type { EncounterPoolId } from "game/pokemon/data";
import { getSpecies, TYPE_COLORS } from "game/pokemon/data";
import { itemSprite, KEY_ITEMS } from "game/pokemon/items";
import type { SpecialEncounter } from "game/pokemon/specials";
import { SPECIAL_ENCOUNTERS, specialSpecies } from "game/pokemon/specials";
import type { ZoneDefinition } from "game/pokemon/zones";
import {
    allZoneSpecies,
    availableZoneSpecies,
    occasionalSpecies,
    typicalLevel,
    zonePools,
    zonesIn,
    ZONES_BY_ID
} from "game/pokemon/zones";
import { BUG_CONTEST_FEE, JOHTO_SWARMS, SWARM_PRICE } from "game/pokemon/johto";
import { REGIONS } from "game/pokemon/regions";
import {
    HONEY_BATTLES,
    HONEY_PRICE,
    HONEY_SPECIES,
    HONEY_TREES,
    munchlaxTrees
} from "game/pokemon/sinnoh";
import {
    diggable,
    MAX_WALLS,
    PLATE_TYPES,
    UNDERGROUND_BATTLES,
    UNDERGROUND_ITEMS
} from "game/pokemon/underground";
import { radarShinyMultiplier } from "game/pokemon/zones";
import type { ZoneRates } from "game/pokemon/balance";
import { zoneRates } from "game/pokemon/balance";
import { computed, ref, shallowRef, watch } from "vue";
import type { NavNode } from "../ui/nav";
import { mobileClasses, renderNav } from "../ui/nav";
import type { TabOption } from "../ui/components";
import {
    Bar,
    Button,
    currentTab,
    formatMoney,
    formatNumber,
    ItemIcon,
    Panel,
    renderTabs,
    Sprite,
    TypeBadge
} from "../ui/components";
import dex from "./dex";
import hof from "./hof";

type ZoneSort = "story" | "efficient" | "level" | "new";
type ZoneFilter = "new" | "notInBox" | "unlocked" | "anime" | "games";

const ZONE_SORTS: [ZoneSort, string][] = [
    ["story", "Story order"],
    ["efficient", "Most efficient"],
    ["level", "Highest level"],
    ["new", "Most new Pokémon"]
];

const ZONE_FILTERS: [ZoneFilter, string, string][] = [
    ["new", "New Pokémon", "Places you can go now with Pokémon you've never caught"],
    ["notInBox", "Not in box", "Has Pokémon you haven't caught this journey"],
    ["unlocked", "Unlocked", "Places you can travel to now"],
    ["anime", "Anime", "Locations from the animated series"],
    ["games", "Games", "Locations from the games"]
];

const id = "map";
const layer = createLayer(id, () => {
    const name = "Map";
    const color = "#22C55E";
    const zoneSort = ref<ZoneSort>("story");
    /** Tapping the active sort again flips it (lowest level first, least efficient first...). */
    const zoneSortReversed = ref(false);
    const zoneSearch = ref("");
    const zoneFilters = ref<ZoneFilter[]>([]);
    const zoneTypes = ref<PokemonType[]>([]);
    const showZoneControls = ref(false);

    /** Species you can meet in a zone right now (with your current fishing gear and Surf). */
    function reachable(zone: ZoneDefinition): number[] {
        return availableZoneSpecies(zone.id, main.keyItems.value, main.zoneExtras.value);
    }

    /**
     * The Pokégear: the Bug-Catching Contest's entry, and with the Radio Card, the swarm report
     * (tune in to a place's swarm to add it to that place's pool) and the Lucky Number Show.
     */
    function renderPokegear() {
        const radio = main.keyItems.value.radioCard === true;
        const nextDraw = LUCKY_DRAW_BATTLES - (main.battlesWon.value % LUCKY_DRAW_BATTLES);
        const last = main.lastLuckyNumber.value;
        const parkOpen = main.zoneUnlocked("nationalPark");
        return (
            <Panel>
                <div class="pk-small pk-filter-row">
                    <span>
                        🐛 Bug-Catching Contest:{" "}
                        {main.contestEntered.value
                            ? main.contestWon.value
                                ? "you won the Sun Stone! Its bugs roam the National Park."
                                : "entered! Its bugs roam the National Park; catch a Scyther or Pinsir there to win a Sun Stone."
                            : parkOpen
                              ? "pay the entry fee once and its bugs join the National Park's grass for this journey."
                              : "held in the National Park."}
                    </span>
                    {!main.contestEntered.value && parkOpen ? (
                        <Button
                            kind="small"
                            disabled={main.money.value < BUG_CONTEST_FEE}
                            onClick={main.enterBugContest}
                        >
                            Enter ({formatMoney(BUG_CONTEST_FEE)})
                        </Button>
                    ) : null}
                </div>
                {radio ? (
                    <>
                        <div class="pk-small">
                            📻 Swarm report: tune in to a swarm and its Pokémon join that place's
                            pool for the rest of this journey.
                        </div>
                        {JOHTO_SWARMS.map(swarm => {
                            const place = ZONES_BY_ID[swarm.zoneId];
                            const joined = main.swarmsJoined.value[swarm.zoneId] === true;
                            const open = main.zoneUnlocked(swarm.zoneId);
                            return (
                                <div class="pk-small pk-filter-row">
                                    <span>
                                        <b>{getSpecies(swarm.speciesId).name}</b> at {place?.name}
                                        {joined ? " · swarming" : open ? "" : " · 🔒"}
                                    </span>
                                    {joined ? (
                                        main.zoneId.value !== swarm.zoneId ? (
                                            <Button
                                                kind="small"
                                                onClick={() => main.travel(swarm.zoneId)}
                                            >
                                                Go
                                            </Button>
                                        ) : null
                                    ) : open ? (
                                        <Button
                                            kind="small"
                                            disabled={main.money.value < SWARM_PRICE}
                                            onClick={() => main.joinSwarm(swarm.zoneId)}
                                        >
                                            Tune in ({formatMoney(SWARM_PRICE)})
                                        </Button>
                                    ) : null}
                                </div>
                            );
                        })}
                        <div class="pk-small">
                            🎟️ Lucky Number Show: a number is drawn every {LUCKY_DRAW_BATTLES} wild
                            battles you win; match its last digits with your Trainer ID (
                            {hof.trainerId.value > 0
                                ? String(hof.trainerId.value).padStart(5, "0")
                                : "given at the first draw"}
                            ) for a prize. Next draw in {nextDraw} battles
                            {last >= 0 ? `, last number ${String(last).padStart(5, "0")}` : ""}.
                        </div>
                    </>
                ) : (
                    <div class="pk-small pk-muted">
                        📻 Win the Radio Card in Goldenrod (after the Plain Badge) for the swarm
                        report and the Lucky Number Show.
                    </div>
                )}
            </Panel>
        );
    }

    /**
     * Sinnoh's Honey Trees: slather Honey on a tree, and after some wild battles a Pokémon is on
     * it, waiting to be shaken down. A few trees (by your Trainer ID) are Munchlax trees.
     */
    function renderHoneyTrees() {
        const munchlax =
            hof.trainerId.value > 0 ? munchlaxTrees(hof.trainerId.value) : ([] as string[]);
        return (
            <Panel>
                <p class="pk-small pk-muted">
                    Slather Honey ({formatMoney(HONEY_PRICE)}) on a tree, and after {HONEY_BATTLES}{" "}
                    wild battles won a Pokémon comes to it: shake it down to battle it. Combee,
                    Burmy, Cherubi, Aipom, Wurmple and, rarely, Heracross come to every tree; four
                    trees, decided by your Trainer ID, sometimes draw a Munchlax.
                </p>
                <div class="pk-zone-species">
                    {HONEY_SPECIES.map(s => (
                        <span
                            class={[
                                "pk-zone-mon",
                                main.owns(s) ? "owned" : dex.entry(s).caught ? "caught" : ""
                            ]}
                            title={dex.entry(s).seen ? getSpecies(s).name : "???"}
                        >
                            <Sprite id={s} size={34} silhouette={!dex.entry(s).seen} />
                        </span>
                    ))}
                </div>
                {HONEY_TREES.map(tree => {
                    const open = main.honeyTreeOpen(tree);
                    const state = main.honeyTrees.value[tree.id];
                    const ready = main.honeyTreeReady(tree.id);
                    const left = state != null ? state.readyAt - main.battlesWon.value : 0;
                    return (
                        <div class={["pk-special", open ? "" : "locked"]}>
                            {ready ? (
                                <Sprite id={state!.speciesId} size={40} />
                            ) : (
                                <ItemIcon src={itemSprite("honey")} alt="Honey" />
                            )}
                            <div class="pk-special-body">
                                <b>{tree.name}</b>{" "}
                                {munchlax.includes(tree.id) ? (
                                    <span class="pk-new-tag" title="Munchlax sometimes comes here">
                                        Munchlax tree
                                    </span>
                                ) : null}
                                <div class="pk-small">
                                    {!open
                                        ? `Opens after ${tree.badgesRequired} badge${tree.badgesRequired === 1 ? "" : "s"}${
                                              tree.zoneId != null
                                                  ? `, with ${ZONES_BY_ID[tree.zoneId]?.name}`
                                                  : ""
                                          }.`
                                        : ready
                                          ? `The tree is shaking! A ${getSpecies(state!.speciesId).name} (Lv. ${state!.level}) is on it.`
                                          : state != null
                                            ? `Slathered. Something comes in ${left} more wild battle${left === 1 ? "" : "s"}.`
                                            : "A sweet-smelling tree, waiting for Honey."}
                                </div>
                            </div>
                            {!open ? (
                                <span class="pk-small pk-muted">🔒</span>
                            ) : ready ? (
                                <Button
                                    kind="danger"
                                    disabled={main.inTrainerBattle.value}
                                    onClick={() => main.shakeHoneyTree(tree.id)}
                                >
                                    Shake
                                </Button>
                            ) : state == null ? (
                                <Button
                                    kind="primary"
                                    disabled={main.money.value < HONEY_PRICE}
                                    onClick={() => main.slatherHoney(tree.id)}
                                >
                                    Honey ({formatMoney(HONEY_PRICE)})
                                </Button>
                            ) : null}
                        </div>
                    );
                })}
            </Panel>
        );
    }

    /** What the Underground's walls can hold right now, with how likely each is per treasure. */
    function undergroundOdds(): [string, number][] {
        const table = diggable(Math.max(1, hof.trainerId.value), main.undergroundPostGame.value);
        const total = table.reduce((sum, [, w]) => sum + w, 0);
        return table.map(([item, w]) => [item.id, w / total]);
    }

    /**
     * The Underground (Sinnoh's mechanic): wild battles uncover fresh walls; dig them for
     * Spheres, stones, fossils, Plates and the Odd Keystone.
     */
    function renderUnderground() {
        const walls = main.undergroundWalls.value;
        const odds = new Map(undergroundOdds());
        const platesFound = PLATE_TYPES.filter(type => hof.plates.value[type] === true).length;
        return (
            <Panel>
                <p class="pk-small pk-muted">
                    Every {UNDERGROUND_BATTLES} wild battles you win uncover a fresh wall in the
                    Underground (up to {MAX_WALLS} at a time). Each holds two to four treasures:
                    Spheres and shards sell, stones go in your bag, fossils are revived on the spot,
                    and Plates stay with you for good. Most fossils only turn up once Sinnoh has
                    been cleared.
                </p>
                <div class="pk-filter-row">
                    <span>
                        ⛏️ <b>{walls}</b> / {MAX_WALLS} walls ready
                    </span>
                    <Button kind="primary" disabled={walls === 0} onClick={main.digUnderground}>
                        Dig
                    </Button>
                </div>
                {walls < MAX_WALLS ? (
                    <Bar
                        value={main.undergroundProgress.value}
                        max={UNDERGROUND_BATTLES}
                        kind="progress"
                    />
                ) : null}
                <div class="pk-small">
                    Arceus's Plates: {platesFound}/{PLATE_TYPES.length}
                    {platesFound > 0 ? " (each turns your Arceus into its type)" : ""}
                </div>
                <div class="pk-underground-items">
                    {UNDERGROUND_ITEMS.map(item => {
                        const chance = odds.get(item.id);
                        const plateFound = item.plate != null && hof.plates.value[item.plate];
                        return (
                            <span
                                class={[
                                    "pk-underground-item",
                                    chance == null ? "unavailable" : "",
                                    plateFound ? "found" : ""
                                ]}
                                title={`${item.name}${
                                    chance != null
                                        ? ` · ${(chance * 100).toFixed(chance < 0.01 ? 1 : 0)}% per treasure`
                                        : item.trainerId != null
                                          ? " · not with your Trainer ID"
                                          : " · after Sinnoh is cleared"
                                }`}
                            >
                                <ItemIcon src={item.sprite} alt={item.name} />
                            </span>
                        );
                    })}
                </div>
            </Panel>
        );
    }

    /** The Poké Radar's chain in the current place. */
    function renderRadar(zone: ZoneDefinition) {
        const chain = main.radarChain.value;
        const active = chain.zoneId === zone.id && chain.speciesId !== 0;
        return (
            <div class="pk-small pk-filter-row">
                <span>
                    📡 Poké Radar:{" "}
                    {active
                        ? `chaining ${getSpecies(chain.speciesId).name} ×${chain.count} (shiny odds ×${radarShinyMultiplier(chain.count)})`
                        : "locks on to the next grass Pokémon you meet here."}
                </span>
                {active ? (
                    <Button kind="small" onClick={main.breakRadarChain}>
                        Break chain
                    </Button>
                ) : null}
            </div>
        );
    }

    /** Pal Park: which regions' Pokémon have migrated. */
    function renderPalPark() {
        const regions = hof.palParkRegions.value;
        return (
            <div class="pk-small">
                {regions.length > 0
                    ? `Migrated: ${regions.map(r => REGIONS[r].name).join(", ")}. Their Game Boy Advance games also bring Pokémon to Sinnoh's grass.`
                    : "No Pokémon have migrated yet: clear another region now that you've cleared Sinnoh."}
            </div>
        );
    }

    /** Species in a zone that you've never caught, and can reach now. */
    function newSpecies(zone: ZoneDefinition): number[] {
        return reachable(zone).filter(s => !dex.entry(s).caught);
    }

    function matchesZoneFilter(zone: ZoneDefinition, filter: ZoneFilter): boolean {
        switch (filter) {
            case "new":
                return main.zoneUnlocked(zone.id) && newSpecies(zone).length > 0;
            case "notInBox":
                return reachable(zone).some(s => !main.owns(s));
            case "unlocked":
                return main.zoneUnlocked(zone.id);
            case "anime":
                return zone.anime === true;
            case "games":
                return zone.anime !== true;
        }
    }

    /** Types of the Pokémon found in this region, for the type filter. */
    const regionTypes = computed(() => {
        const present = new Set(
            zonesIn(main.region.value).flatMap(zone =>
                allZoneSpecies(zone.id).flatMap(s => getSpecies(s).types)
            )
        );
        return (Object.keys(TYPE_COLORS) as PokemonType[]).filter(type => present.has(type));
    });

    /**
     * Only what changes the estimates: every battle adds XP to the party, but rates only move
     * when the party, its levels, the bonuses, the gear or the unlocked zones change.
     */
    const rateInputs = computed(() =>
        zoneSort.value !== "efficient"
            ? ""
            : JSON.stringify([
                  main.region.value,
                  main.badges.value,
                  main.champion.value,
                  main.partyIds.value.map(id => [id, main.box.value[id]?.level]),
                  main.keyItems.value,
                  main.bonuses.value
              ])
    );

    /** XP and ₽ per minute in each unlocked zone for your current party and bonuses. */
    const rates = shallowRef(new Map<string, ZoneRates>());
    watch(
        rateInputs,
        inputs => {
            const result = new Map<string, ZoneRates>();
            if (inputs !== "") {
                for (const zone of zonesIn(main.region.value)) {
                    if (!main.zoneUnlocked(zone.id)) continue;
                    result.set(
                        zone.id,
                        zoneRates(
                            zone.id,
                            main.keyItems.value,
                            main.partyBattlers.value,
                            main.bonuses.value
                        )
                    );
                }
            }
            rates.value = result;
        },
        { immediate: true }
    );

    /** Efficiency score: XP and ₽ rates, each relative to the best zone, weighted equally. */
    const efficiency = computed(() => {
        const all = [...rates.value.values()];
        const bestXp = Math.max(1, ...all.map(r => r.xpPerMinute));
        const bestMoney = Math.max(1, ...all.map(r => r.moneyPerMinute));
        return new Map(
            [...rates.value.entries()].map(([zoneId, r]) => [
                zoneId,
                r.xpPerMinute / bestXp + r.moneyPerMinute / bestMoney
            ])
        );
    });

    const visibleZones = computed(() => {
        const query = zoneSearch.value.trim().toLowerCase();
        const zones = zonesIn(main.region.value).filter(zone => {
            // Places a mechanic brings (other regions' Poké Spots) appear once it's unlocked.
            if (zone.mechanic != null && !main.mechanicOn(zone.mechanic)) return false;
            if (query !== "") {
                // Match the place, or any Pokémon you've seen there ("where's Pikachu?").
                const named =
                    zone.name.toLowerCase().includes(query) ||
                    allZoneSpecies(zone.id).some(
                        s => dex.entry(s).seen && getSpecies(s).name.toLowerCase().includes(query)
                    );
                if (!named) return false;
            }
            if (!zoneFilters.value.every(filter => matchesZoneFilter(zone, filter))) return false;
            if (
                zoneTypes.value.length > 0 &&
                !reachable(zone).some(s =>
                    getSpecies(s).types.some(type => zoneTypes.value.includes(type))
                )
            ) {
                return false;
            }
            return true;
        });
        // Each sort puts the best first: most efficient, highest level, most new Pokémon.
        let sorted = zones;
        if (zoneSort.value === "efficient") {
            const score = (zone: ZoneDefinition) => efficiency.value.get(zone.id) ?? -1;
            sorted = [...zones].sort((a, b) => score(b) - score(a));
        } else if (zoneSort.value === "level") {
            sorted = [...zones].sort((a, b) => typicalLevel(b.id) - typicalLevel(a.id));
        } else if (zoneSort.value === "new") {
            const counts = new Map(
                zones.map(zone => [
                    zone.id,
                    main.zoneUnlocked(zone.id) ? newSpecies(zone).length : -1
                ])
            );
            sorted = [...zones].sort((a, b) => counts.get(b.id)! - counts.get(a.id)!);
        }
        if (zoneSortReversed.value) sorted = [...sorted].reverse();
        // Places you can't reach yet go last, except in story order.
        return zoneSort.value === "story"
            ? sorted
            : [
                  ...sorted.filter(zone => main.zoneUnlocked(zone.id)),
                  ...sorted.filter(zone => !main.zoneUnlocked(zone.id))
              ];
    });

    function chooseZoneSort(sort: ZoneSort) {
        zoneSortReversed.value = zoneSort.value === sort && !zoneSortReversed.value;
        zoneSort.value = sort;
    }

    /** How many sort/filter options differ from the defaults, shown on the Filters button. */
    const activeZoneControls = computed(
        () =>
            zoneFilters.value.length +
            zoneTypes.value.length +
            (zoneSort.value === "story" && !zoneSortReversed.value ? 0 : 1)
    );

    const filteringZones = computed(
        () =>
            zoneSearch.value.trim() !== "" ||
            zoneFilters.value.length > 0 ||
            zoneTypes.value.length > 0
    );

    function toggle<T>(list: { value: T[] }, item: T) {
        list.value = list.value.includes(item)
            ? list.value.filter(x => x !== item)
            : [...list.value, item];
    }

    function clearZoneFilters() {
        zoneSearch.value = "";
        zoneFilters.value = [];
        zoneTypes.value = [];
    }

    const claimableSpecials = computed(() =>
        regionSpecials().filter(
            s =>
                main.specialAvailable(s) &&
                !main.claimedSpecials.value[s.id] &&
                !main.owns(s.speciesId) &&
                (s.kind !== "trade" || main.owns(s.wants)) &&
                (s.kind !== "gift" || s.price == null || main.money.value >= s.price)
        )
    );

    const nav: NavNode = {
        id,
        letter: "M",
        label: "Map",
        color,
        glow: computed((): boolean => claimableSpecials.value.length > 0),
        enabled: computed((): boolean => true)
    };

    function regionSpecials() {
        return SPECIAL_ENCOUNTERS.filter(s => s.region === main.region.value);
    }

    function tierLabel(badges: number, postGame?: boolean) {
        const region = main.regionDef.value;
        if (postGame) return `After the ${region.finaleName}`;
        if (badges === 0) return "Starting area";
        const noun = region.trialNoun.replace(/s$/, "");
        return `After ${badges} ${badges === 1 ? noun : region.trialNoun}`;
    }

    /** What hidden encounters need: Johto adds Headbutt trees and Rock Smash rocks. */
    const POOL_GEAR: Record<Exclude<EncounterPoolId, "walk">, string> = {
        surf: "Surf",
        oldRod: "a rod",
        goodRod: "a better rod",
        superRod: "a better rod",
        headbutt: "Headbutt",
        rockSmash: "Rock Smash",
        dive: "Dive"
    };

    /** What a Pokémon in a zone is waiting on: the gear for the pools it's in. */
    function gearList(zoneId: string, speciesId: number): string[] {
        const gear = new Set<string>();
        for (const [pool, entries] of Object.entries(zonePools(zoneId)) as [
            EncounterPoolId,
            { id: number }[]
        ][]) {
            if (pool === "walk" || !entries.some(e => e.id === speciesId)) continue;
            gear.add(
                pool === "headbutt" && !main.mechanicOn("headbutt")
                    ? "Headbutt (unlocked in Johto)"
                    : POOL_GEAR[pool]
            );
        }
        return [...gear];
    }

    /** The gear a set of hidden species waits on, each named once ("Surf or rods"). */
    function describeGear(gear: string[]): string {
        const set = new Set(gear);
        if (set.has("a rod") && set.has("a better rod")) {
            set.delete("a rod");
            set.delete("a better rod");
            set.add("rods");
        }
        return set.size > 0 ? [...set].join(" or ") : "better gear";
    }

    function gearNeeded(zoneId: string, speciesId: number) {
        return describeGear(gearList(zoneId, speciesId));
    }

    function renderZone(zone: ZoneDefinition) {
        const unlocked = main.zoneUnlocked(zone.id);
        const current = main.zoneId.value === zone.id;
        const all = allZoneSpecies(zone.id);
        const available = new Set(
            availableZoneSpecies(zone.id, main.keyItems.value, main.zoneExtras.value)
        );
        const withoutExtras = new Set(availableZoneSpecies(zone.id, main.keyItems.value));
        const caughtHere = all.filter(s => dex.entry(s).caught).length;
        const ownedHere = all.filter(s => main.owns(s)).length;
        const hiddenIds = all.filter(
            s =>
                !withoutExtras.has(s) &&
                !occasionalSpecies(zone.id).swarm.includes(s) &&
                !occasionalSpecies(zone.id).contest.includes(s)
        );
        const hidden = hiddenIds.length;
        const hiddenGear = describeGear(hiddenIds.flatMap(s => gearList(zone.id, s)));
        const swarm = JOHTO_SWARMS.find(sw => sw.zoneId === zone.id);
        const swarming =
            swarm != null && main.swarmsJoined.value[zone.id] === true
                ? getSpecies(swarm.speciesId).name
                : null;
        const contest = zone.id === "nationalPark" && main.contestEntered.value;
        const occasional = occasionalSpecies(zone.id);
        const level = Math.round(typicalLevel(zone.id));
        const fresh = unlocked ? newSpecies(zone).length : 0;
        const zoneRate = rates.value.get(zone.id);
        return (
            <div class={["pk-zone", current ? "current" : "", unlocked ? "" : "locked"]}>
                <div class="pk-zone-head">
                    <div>
                        <b>{zone.name}</b>{" "}
                        {zone.anime ? <span class="pk-anime-tag">Anime</span> : null}{" "}
                        <span class="pk-muted pk-small">~Lv. {level}</span>{" "}
                        {fresh > 0 ? <span class="pk-new-tag">{fresh} new</span> : null}
                        {swarming != null ? (
                            <span class="pk-new-tag">📻 {swarming} swarm</span>
                        ) : null}
                        {contest ? <span class="pk-new-tag">🐛 Contest</span> : null}
                        {zoneRate != null ? (
                            <div class="pk-small pk-zone-rates">
                                ≈ {formatNumber(zoneRate.xpPerMinute)} XP/min ·{" "}
                                {formatMoney(Math.round(zoneRate.moneyPerMinute))}/min
                            </div>
                        ) : null}
                        {zoneSort.value !== "story" ? (
                            <div class="pk-small pk-muted">
                                {tierLabel(zone.badgesRequired, zone.postGame)}
                            </div>
                        ) : null}
                        <div class="pk-small pk-muted">{zone.blurb}</div>
                        {zone.palPark === true ? renderPalPark() : null}
                        {current && main.hasPokeRadar.value && zonePools(zone.id).walk != null
                            ? renderRadar(zone)
                            : null}
                    </div>
                    {unlocked ? (
                        <Button
                            kind={current ? "ghost" : "primary"}
                            disabled={current}
                            onClick={() => main.travel(zone.id)}
                        >
                            {current ? "Here" : "Travel"}
                        </Button>
                    ) : (
                        <span class="pk-small pk-muted">🔒</span>
                    )}
                </div>
                {unlocked ? (
                    <>
                        <div class="pk-zone-species">
                            {all.map(s => {
                                const entry = dex.entry(s);
                                const reachable = available.has(s);
                                const why =
                                    occasional.swarm.includes(s) && !reachable
                                        ? " (swarm: tune in on the Pokégear radio)"
                                        : occasional.contest.includes(s) && !reachable
                                          ? " (enter the Bug-Catching Contest on the Pokégear)"
                                          : !reachable
                                            ? ` (needs ${gearNeeded(zone.id, s)})`
                                            : "";
                                return (
                                    <span
                                        class={[
                                            "pk-zone-mon",
                                            main.owns(s) ? "owned" : entry.caught ? "caught" : "",
                                            reachable ? "" : "unreachable"
                                        ]}
                                        title={entry.seen ? `${getSpecies(s).name}${why}` : "???"}
                                    >
                                        <Sprite id={s} size={34} silhouette={!entry.seen} />
                                    </span>
                                );
                            })}
                        </div>
                        <div class="pk-small pk-muted">
                            {ownedHere}/{all.length} in your box this journey · {caughtHere}/
                            {all.length} in Pokédex
                            {hidden > 0 ? ` · ${hidden} more with ${hiddenGear}` : ""}
                        </div>
                    </>
                ) : null}
            </div>
        );
    }

    function renderZoneControls() {
        return (
            <Panel>
                <div class="pk-filter-row">
                    <input
                        class="pk-search"
                        type="search"
                        placeholder="Search places or Pokémon…"
                        value={zoneSearch.value}
                        onInput={(e: Event) =>
                            (zoneSearch.value = (e.target as HTMLInputElement).value)
                        }
                    />
                    <Button
                        kind={showZoneControls.value ? "primary" : "ghost"}
                        onClick={() => (showZoneControls.value = !showZoneControls.value)}
                    >
                        Filters
                        {activeZoneControls.value > 0 ? ` (${activeZoneControls.value})` : ""}{" "}
                        {showZoneControls.value ? "▴" : "▾"}
                    </Button>
                </div>
                {showZoneControls.value ? (
                    <>
                        <div class="pk-filter-row">
                            <span class="pk-small pk-muted">Sort:</span>
                            {ZONE_SORTS.map(([value, label]) => {
                                const active = zoneSort.value === value;
                                return (
                                    <Button
                                        kind={active ? "primary" : "ghost"}
                                        title={active ? "Tap again to reverse" : undefined}
                                        onClick={() => chooseZoneSort(value)}
                                    >
                                        {label}
                                        {active ? (zoneSortReversed.value ? " ↑" : " ↓") : ""}
                                    </Button>
                                );
                            })}
                        </div>
                        <div class="pk-filter-row">
                            <span class="pk-small pk-muted">Show:</span>
                            {ZONE_FILTERS.map(([value, label, title]) => (
                                <Button
                                    kind={zoneFilters.value.includes(value) ? "primary" : "ghost"}
                                    title={title}
                                    onClick={() => toggle(zoneFilters, value)}
                                >
                                    {label}
                                </Button>
                            ))}
                        </div>
                        <div class="pk-filter-row">
                            <span class="pk-small pk-muted">Type:</span>
                            {regionTypes.value.map(type => (
                                <button
                                    class={[
                                        "pk-type-toggle",
                                        zoneTypes.value.includes(type) ? "active" : ""
                                    ]}
                                    onClick={() => toggle(zoneTypes, type)}
                                >
                                    <TypeBadge type={type} small />
                                </button>
                            ))}
                        </div>
                    </>
                ) : null}
                {zoneSort.value === "efficient" ? (
                    <p class="pk-small pk-muted">
                        Estimated for your current party, bonuses and fishing gear. XP is per party
                        member; past the level cap it becomes Effort.
                    </p>
                ) : null}
                {filteringZones.value ? (
                    <div class="pk-filter-row pk-small pk-muted">
                        Showing {visibleZones.value.length} of {zonesIn(main.region.value).length}
                        <Button kind="ghost" onClick={clearZoneFilters}>
                            Clear filters
                        </Button>
                    </div>
                ) : null}
            </Panel>
        );
    }

    function renderZones() {
        const zones = visibleZones.value;
        if (zones.length === 0) {
            return <p class="pk-muted">No places match these filters.</p>;
        }
        if (zoneSort.value !== "story") {
            return <Panel>{zones.map(renderZone)}</Panel>;
        }
        const tiers = new Map<string, ZoneDefinition[]>();
        for (const zone of zones) {
            const key = tierLabel(zone.badgesRequired, zone.postGame);
            tiers.set(key, [...(tiers.get(key) ?? []), zone]);
        }
        return [...tiers.entries()].map(([label, tierZones]) => (
            <Panel title={label}>{tierZones.map(renderZone)}</Panel>
        ));
    }

    function renderSpecial(special: SpecialEncounter) {
        const species = getSpecies(special.speciesId);
        const available = main.specialAvailable(special);
        const isBoss = special.kind === "boss";
        // An Egg counts as "owned" once you have every Pokémon it can hatch into; a boss never is.
        const owned =
            !isBoss &&
            specialSpecies(special).every(id => main.owns(id)) &&
            special.kind !== "legendary";
        const claimed = main.claimedSpecials.value[special.id] === true;
        const seen = isBoss || dex.entry(special.speciesId).seen || available;

        let action;
        if (!available) {
            const missingItem =
                special.kind === "legendary" &&
                special.keyItem != null &&
                main.badges.value >= special.badgesRequired &&
                !main.keyItems.value[special.keyItem];
            action = (
                <span class="pk-small pk-muted">
                    🔒{" "}
                    {missingItem && special.kind === "legendary"
                        ? `Needs the ${KEY_ITEMS[special.keyItem!].name}`
                        : special.postGame === true
                          ? `After the ${main.regionDef.value.finaleName}`
                          : `${special.badgesRequired} ${main.regionDef.value.trialNoun}`}
                </span>
            );
        } else if (claimed || owned) {
            action = (
                <span class="pk-small pk-done">
                    ✔{" "}
                    {special.kind === "legendary"
                        ? "Caught"
                        : isBoss
                          ? "Defeated"
                          : owned
                            ? "In your box"
                            : "Done"}
                </span>
            );
        } else if (special.kind === "boss") {
            action = (
                <Button
                    kind="danger"
                    disabled={main.inTrainerBattle.value}
                    onClick={() => main.claimSpecial(special)}
                >
                    Challenge (Lv. {special.level})
                </Button>
            );
        } else if (special.kind === "trade") {
            const has = main.owns(special.wants);
            action = (
                <Button kind="primary" disabled={!has} onClick={() => main.claimSpecial(special)}>
                    {has ? "Trade" : `Needs ${getSpecies(special.wants).name}`}
                </Button>
            );
        } else if (special.kind === "legendary") {
            action = (
                <Button
                    kind="danger"
                    disabled={main.inTrainerBattle.value}
                    onClick={() => main.claimSpecial(special)}
                >
                    Battle (Lv. {special.level})
                </Button>
            );
        } else {
            action = (
                <Button
                    kind="primary"
                    disabled={special.price != null && main.money.value < special.price}
                    onClick={() => main.claimSpecial(special)}
                >
                    {special.price != null ? formatMoney(special.price) : "Receive"}
                </Button>
            );
        }

        return (
            <div class={["pk-special", available ? "" : "locked"]}>
                <Sprite id={special.speciesId} size={44} silhouette={!seen} />
                <div class="pk-special-body">
                    <b>
                        {isBoss
                            ? special.trainer.name
                            : special.kind === "gift" && special.pool != null
                              ? "Odd Egg"
                              : seen
                                ? species.name
                                : "???"}
                    </b>{" "}
                    <span class="pk-muted pk-small">
                        {special.place} · Lv. {special.level}
                    </span>
                    <div class="pk-small">
                        {available ? special.text : "Something waits here..."}
                    </div>
                </div>
                {action}
            </div>
        );
    }

    return {
        name,
        color,
        minWidth: 480,
        minimizable: false,
        classes: mobileClasses(id),
        nav,
        display: () => {
            const tabs: TabOption[] = [
                { id: "zones", label: "Routes & Dungeons" },
                {
                    id: "specials",
                    label: `Gifts, Trades & Legends${
                        claimableSpecials.value.length > 0
                            ? ` (${claimableSpecials.value.length})`
                            : ""
                    }`
                },
                { id: "pokegear", label: "Pokégear", show: main.region.value === "johto" },
                { id: "honey", label: "Honey Trees", show: main.region.value === "sinnoh" },
                {
                    id: "underground",
                    label: `Underground${
                        main.undergroundWalls.value > 0 ? ` (${main.undergroundWalls.value})` : ""
                    }`,
                    show: main.mechanicOn("underground")
                }
            ];
            const page = currentTab("map", tabs);
            return (
                <div class="pk-layer">
                    {renderNav(true)}
                    <h2 class="pk-layer-title">{main.regionDef.value.name}</h2>
                    {renderTabs("map", tabs)}
                    {page === "zones" ? (
                        <>
                            {renderZoneControls()}
                            {renderZones()}
                        </>
                    ) : page === "pokegear" ? (
                        renderPokegear()
                    ) : page === "honey" ? (
                        renderHoneyTrees()
                    ) : page === "underground" ? (
                        renderUnderground()
                    ) : (
                        <Panel>
                            <p class="pk-small pk-muted">
                                Some Pokémon never appear in the wild. Trades only require showing
                                the requested Pokémon — you keep yours.
                            </p>
                            {regionSpecials().map(renderSpecial)}
                        </Panel>
                    )}
                </div>
            );
        }
    };
});

export default layer;
