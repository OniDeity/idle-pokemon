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
import { SPECIAL_ENCOUNTERS } from "game/pokemon/specials";
import type { ZoneDefinition } from "game/pokemon/zones";
import { allZoneSpecies, availableZoneSpecies, typicalLevel, zonesIn } from "game/pokemon/zones";
import { computed, ref } from "vue";
import type { NavNode } from "../ui/nav";
import { mobileClasses, renderNav } from "../ui/nav";
import { Button, formatMoney, Panel, Sprite, TypeBadge } from "../ui/components";
import dex from "./dex";

type Tab = "zones" | "specials";
type ZoneSort = "story" | "level" | "new";
type ZoneFilter = "new" | "notInBox" | "unlocked" | "anime" | "games";

const ZONE_SORTS: [ZoneSort, string][] = [
    ["story", "Story order"],
    ["level", "Level"],
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
    const zoneSearch = ref("");
    const zoneFilters = ref<ZoneFilter[]>([]);
    const zoneTypes = ref<PokemonType[]>([]);
    const showZoneControls = ref(false);

    /** Species you can meet in a zone right now (with your current fishing gear and Surf). */
    function reachable(zone: ZoneDefinition): number[] {
        return availableZoneSpecies(zone.id, main.keyItems.value);
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
        if (zoneSort.value === "level") {
            return [...zones].sort((a, b) => typicalLevel(a.id) - typicalLevel(b.id));
        }
        if (zoneSort.value === "new") {
            const counts = new Map(
                zones.map(zone => [
                    zone.id,
                    main.zoneUnlocked(zone.id) ? newSpecies(zone).length : -1
                ])
            );
            return [...zones].sort((a, b) => counts.get(b.id)! - counts.get(a.id)!);
        }
        return zones;
    });

    /** How many sort/filter options differ from the defaults, shown on the Filters button. */
    const activeZoneControls = computed(
        () =>
            zoneFilters.value.length + zoneTypes.value.length + (zoneSort.value === "story" ? 0 : 1)
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

    function renderZone(zone: ZoneDefinition) {
        const unlocked = main.zoneUnlocked(zone.id);
        const current = main.zoneId.value === zone.id;
        const all = allZoneSpecies(zone.id);
        const available = new Set(availableZoneSpecies(zone.id, main.keyItems.value));
        const caughtHere = all.filter(s => dex.entry(s).caught).length;
        const ownedHere = all.filter(s => main.owns(s)).length;
        const hidden = all.filter(s => !available.has(s)).length;
        const level = Math.round(typicalLevel(zone.id));
        const fresh = unlocked ? newSpecies(zone).length : 0;
        return (
            <div class={["pk-zone", current ? "current" : "", unlocked ? "" : "locked"]}>
                <div class="pk-zone-head">
                    <div>
                        <b>{zone.name}</b>{" "}
                        {zone.anime ? <span class="pk-anime-tag">Anime</span> : null}{" "}
                        <span class="pk-muted pk-small">~Lv. {level}</span>{" "}
                        {fresh > 0 ? <span class="pk-new-tag">{fresh} new</span> : null}
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
                                return (
                                    <span
                                        class={[
                                            "pk-zone-mon",
                                            main.owns(s) ? "owned" : entry.caught ? "caught" : "",
                                            reachable ? "" : "unreachable"
                                        ]}
                                        title={
                                            entry.seen
                                                ? `${getSpecies(s).name}${
                                                      reachable
                                                          ? ""
                                                          : " (needs better fishing gear or Surf)"
                                                  }`
                                                : "???"
                                        }
                                    >
                                        <Sprite id={s} size={40} silhouette={!entry.seen} />
                                    </span>
                                );
                            })}
                        </div>
                        <div class="pk-small pk-muted">
                            {ownedHere}/{all.length} in your box this journey · {caughtHere}/
                            {all.length} in Pokédex
                            {hidden > 0 ? ` · ${hidden} more with fishing gear/Surf` : ""}
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
                            {ZONE_SORTS.map(([value, label]) => (
                                <Button
                                    kind={zoneSort.value === value ? "primary" : "ghost"}
                                    onClick={() => (zoneSort.value = value)}
                                >
                                    {label}
                                </Button>
                            ))}
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
        const owned = main.owns(special.speciesId);
        const claimed = main.claimedSpecials.value[special.id] === true;
        const seen = dex.entry(special.speciesId).seen || available;

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
        } else if (claimed || (owned && special.kind !== "legendary")) {
            action = (
                <span class="pk-small pk-done">
                    ✔ {special.kind === "legendary" ? "Caught" : owned ? "In your box" : "Done"}
                </span>
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
                    <b>{seen ? species.name : "???"}</b>{" "}
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
