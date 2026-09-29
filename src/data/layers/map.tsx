/**
 * The Kanto map: choose where to search for wild Pokémon, and visit the gifts, trades,
 * Game Corner prizes and legendary Pokémon scattered around the region.
 */
import { main } from "data/projEntry";
import { createLayer } from "game/layers";
import { getSpecies } from "game/pokemon/data";
import { KEY_ITEMS } from "game/pokemon/items";
import type { SpecialEncounter } from "game/pokemon/specials";
import { SPECIAL_ENCOUNTERS } from "game/pokemon/specials";
import type { ZoneDefinition } from "game/pokemon/zones";
import { allZoneSpecies, availableZoneSpecies, typicalLevel, zonesIn } from "game/pokemon/zones";
import { computed, ref } from "vue";
import type { NavNode } from "../ui/nav";
import { mobileClasses, renderNav } from "../ui/nav";
import { Button, formatMoney, Panel, Sprite } from "../ui/components";
import dex from "./dex";

type Tab = "zones" | "specials";

const id = "map";
const layer = createLayer(id, () => {
    const name = "Map";
    const color = "#22C55E";
    const tab = ref<Tab>("zones");

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
        return (
            <div class={["pk-zone", current ? "current" : "", unlocked ? "" : "locked"]}>
                <div class="pk-zone-head">
                    <div>
                        <b>{zone.name}</b>{" "}
                        {zone.anime ? <span class="pk-anime-tag">Anime</span> : null}{" "}
                        <span class="pk-muted pk-small">~Lv. {level}</span>
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

    function renderZones() {
        const tiers = new Map<string, ZoneDefinition[]>();
        for (const zone of zonesIn(main.region.value)) {
            const key = tierLabel(zone.badgesRequired, zone.postGame);
            tiers.set(key, [...(tiers.get(key) ?? []), zone]);
        }
        return [...tiers.entries()].map(([label, zones]) => (
            <Panel title={label}>{zones.map(renderZone)}</Panel>
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
                        : special.kind === "legendary" && special.postGame
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
                    renderZones()
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
