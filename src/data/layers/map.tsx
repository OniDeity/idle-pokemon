/**
 * The Kanto map: choose where to search for wild Pokémon, and visit the gifts, trades,
 * Game Corner prizes and legendary Pokémon scattered around the region.
 */
import { main } from "data/projEntry";
import { createLayer } from "game/layers";
import type { PokemonType } from "game/pokemon/data";
import { getSpecies, TYPE_COLORS } from "game/pokemon/data";
import { KEY_ITEMS } from "game/pokemon/items";
import type { SpecialEncounter } from "game/pokemon/specials";
import { SPECIAL_ENCOUNTERS, specialSpecies } from "game/pokemon/specials";
import type { ZoneDefinition } from "game/pokemon/zones";
import {
    allZoneSpecies,
    availableZoneSpecies,
    bugContestOn,
    occasionalSpecies,
    swarmOn,
    typicalLevel,
    zonePools,
    zonesIn,
    ZONES_BY_ID
} from "game/pokemon/zones";
import type { TimeOfDay } from "game/pokemon/data";
import type { ZoneRates } from "game/pokemon/balance";
import { zoneRates } from "game/pokemon/balance";
import { computed, ref, shallowRef, watch } from "vue";
import type { NavNode } from "../ui/nav";
import { mobileClasses, renderNav } from "../ui/nav";
import { Button, formatMoney, formatNumber, Panel, Sprite, TypeBadge } from "../ui/components";
import dex from "./dex";
import hof from "./hof";

type Tab = "zones" | "specials";
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
    const tab = ref<Tab>("zones");
    const zoneSort = ref<ZoneSort>("story");
    /** Tapping the active sort again flips it (lowest level first, least efficient first...). */
    const zoneSortReversed = ref(false);
    const zoneSearch = ref("");
    const zoneFilters = ref<ZoneFilter[]>([]);
    const zoneTypes = ref<PokemonType[]>([]);
    const showZoneControls = ref(false);

    /** Species you can meet in a zone right now (with your current fishing gear and Surf). */
    function reachable(zone: ZoneDefinition): number[] {
        return availableZoneSpecies(zone.id, main.keyItems.value, main.moment.value);
    }

    const TIME_LABELS: Record<TimeOfDay, string> = {
        morning: "🌅 Morning",
        day: "☀️ Day",
        night: "🌙 Night"
    };

    /** When a species can be met in a zone, if only at some times of day. */
    function timesFor(zoneId: string, speciesId: number): TimeOfDay[] | undefined {
        const times = new Set<TimeOfDay>();
        for (const entries of Object.values(zonePools(zoneId))) {
            for (const e of entries ?? []) {
                if (e.id !== speciesId) continue;
                if (e.byTime == null) return undefined;
                (Object.keys(e.byTime) as TimeOfDay[])
                    .filter(t => e.byTime![t] > 0)
                    .forEach(t => times.add(t));
            }
        }
        return times.size === 3 || times.size === 0 ? undefined : [...times];
    }

    /** The Pokégear: Johto's clock, the radio's swarm report and Lucky Number, the contest. */
    function renderPokegear() {
        const moment = main.moment.value;
        const radio = main.keyItems.value.radioCard === true;
        const swarm = swarmOn(moment.day);
        const swarmZone = ZONES_BY_ID[swarm.zoneId];
        const contest = bugContestOn(moment);
        const drawn = hof.luckyNumberDay.value === moment.day;
        return (
            <Panel title="Pokégear">
                <div class="pk-small">
                    <b>{TIME_LABELS[moment.time]}</b> · Johto's wild Pokémon change with your clock
                    (morning 4-10, day 10-20, night 20-4).
                </div>
                <div class="pk-small">
                    🐛 Bug-Catching Contest:{" "}
                    {contest
                        ? "today in the National Park! Free Sport Balls; a Scyther or Pinsir wins the Sun Stone."
                        : "Tuesdays, Thursdays and Saturdays in the National Park."}
                </div>
                {radio ? (
                    <>
                        <div class="pk-small pk-filter-row">
                            <span>
                                📻 Swarm report: lots of <b>{getSpecies(swarm.speciesId).name}</b>{" "}
                                at {swarmZone?.name} today.
                            </span>
                            {main.zoneUnlocked(swarm.zoneId) &&
                            main.zoneId.value !== swarm.zoneId ? (
                                <Button kind="small" onClick={() => main.travel(swarm.zoneId)}>
                                    Go
                                </Button>
                            ) : null}
                        </div>
                        <div class="pk-small pk-filter-row">
                            <span>
                                🎟️ Lucky Number Show:{" "}
                                {drawn
                                    ? `today's number was ${String(main.luckyNumberOn(moment.day)).padStart(5, "0")}. Come back tomorrow!`
                                    : "match today's number with your Trainer ID for a prize."}
                            </span>
                            <Button kind="small" disabled={drawn} onClick={main.drawLuckyNumber}>
                                Draw
                            </Button>
                        </div>
                    </>
                ) : (
                    <div class="pk-small pk-muted">
                        📻 Win the Radio Card in Goldenrod (after the Plain Badge) for daily swarm
                        reports and the Lucky Number Show.
                    </div>
                )}
            </Panel>
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
    function gearNeeded() {
        return main.region.value === "johto"
            ? "rods, Surf, Headbutt or Rock Smash"
            : "better fishing gear or Surf";
    }

    function renderZone(zone: ZoneDefinition) {
        const unlocked = main.zoneUnlocked(zone.id);
        const current = main.zoneId.value === zone.id;
        const all = allZoneSpecies(zone.id);
        const available = new Set(
            availableZoneSpecies(zone.id, main.keyItems.value, main.moment.value)
        );
        const anyTime = new Set(availableZoneSpecies(zone.id, main.keyItems.value));
        const caughtHere = all.filter(s => dex.entry(s).caught).length;
        const ownedHere = all.filter(s => main.owns(s)).length;
        const hidden = all.filter(
            s =>
                !anyTime.has(s) &&
                !occasionalSpecies(zone.id).swarm.includes(s) &&
                !occasionalSpecies(zone.id).contest.includes(s)
        ).length;
        const swarming =
            main.keyItems.value.radioCard === true &&
            swarmOn(main.moment.value.day).zoneId === zone.id
                ? getSpecies(swarmOn(main.moment.value.day).speciesId).name
                : null;
        const contest = zone.id === "nationalPark" && bugContestOn(main.moment.value);
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
                        {contest ? <span class="pk-new-tag">🐛 Contest today</span> : null}
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
                                const times = timesFor(zone.id, s);
                                const why =
                                    occasional.swarm.includes(s) && !reachable
                                        ? " (swarms here some days; check the Pokégear radio)"
                                        : occasional.contest.includes(s) && !reachable
                                          ? " (Bug-Catching Contest days)"
                                          : !anyTime.has(s)
                                            ? ` (needs ${gearNeeded()})`
                                            : !reachable && times != null
                                              ? ` (only at ${times.map(t => (t === "day" ? "daytime" : t)).join(" and ")})`
                                              : times != null
                                                ? ` (${times.map(t => (t === "day" ? "daytime" : t)).join(" and ")} only)`
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
                                        <Sprite id={s} size={40} silhouette={!entry.seen} />
                                    </span>
                                );
                            })}
                        </div>
                        <div class="pk-small pk-muted">
                            {ownedHere}/{all.length} in your box this journey · {caughtHere}/
                            {all.length} in Pokédex
                            {hidden > 0 ? ` · ${hidden} more with ${gearNeeded()}` : ""}
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

    const WEEKDAYS = [
        "Sundays",
        "Mondays",
        "Tuesdays",
        "Wednesdays",
        "Thursdays",
        "Fridays",
        "Saturdays"
    ];

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
        const weekdayLocked =
            (special.kind === "legendary" || special.kind === "gift") &&
            special.weekdays != null &&
            main.badges.value >= special.badgesRequired &&
            !special.weekdays.includes(main.moment.value.weekday);

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
                        : weekdayLocked && (special.kind === "legendary" || special.kind === "gift")
                          ? `Only on ${special.weekdays!.map(d => WEEKDAYS[d]).join(" and ")}`
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
                <Sprite id={special.speciesId} size={56} silhouette={!seen} />
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
        display: () => (
            <div class="pk-layer">
                {renderNav(true)}
                <h2 class="pk-layer-title">{main.regionDef.value.name}</h2>
                <div class="pk-filter-row">
                    <Button
                        kind={tab.value === "zones" ? "primary" : "ghost"}
                        onClick={() => (tab.value = "zones")}
                    >
                        Routes & Dungeons
                    </Button>
                    <Button
                        kind={tab.value === "specials" ? "primary" : "ghost"}
                        onClick={() => (tab.value = "specials")}
                    >
                        Gifts, Trades & Legends
                        {claimableSpecials.value.length > 0
                            ? ` (${claimableSpecials.value.length})`
                            : ""}
                    </Button>
                </div>
                {tab.value === "zones" ? (
                    <>
                        {main.region.value === "johto" ? renderPokegear() : null}
                        {renderZoneControls()}
                        {renderZones()}
                    </>
                ) : (
                    <Panel>
                        <p class="pk-small pk-muted">
                            Some Pokémon never appear in the wild. Trades only require showing the
                            requested Pokémon — you keep yours.
                        </p>
                        {regionSpecials().map(renderSpecial)}
                    </Panel>
                )}
            </div>
        )
    };
});

export default layer;
