/**
 * @module
 * @hidden
 */
import { main } from "data/projEntry";
import speciesJson from "data/pokemon/species.json";
import type { Action } from "features/clickables/action";
import { createAction } from "features/clickables/action";
import { createClickable } from "features/clickables/clickable";
import type { Repeatable } from "features/clickables/repeatable";
import { createRepeatable } from "features/clickables/repeatable";
import { createUpgrade } from "features/clickables/upgrade";
import { createReset } from "features/reset";
import MainDisplay from "features/resources/MainDisplay.vue";
import { createResource } from "features/resources/resource";
import type { TabButtonOptions } from "features/tabs/tabFamily";
import { createTabFamily } from "features/tabs/tabFamily";
import Formula from "game/formulas/formulas";
import { createLayer } from "game/layers";
import { persistent } from "game/persistence";
import {
    computeBattlePower,
    computeGearMultiplier,
    computeXpGain,
    resolveBattle
} from "game/pokemon/battle";
import {
    computeResearchPointsGain,
    rollCatch,
    rollWildEncounter,
    type EncounterResult
} from "game/pokemon/encounters";
import { formatSpeciesName } from "game/pokemon/format";
import { recordCatch, recordSeen, zoneProgress } from "game/pokemon/pokedex";
import type { SpeciesData } from "game/pokemon/types";
import { ROUTE_1, ROUTE_2, VIRIDIAN_FOREST, ZONES, type ZoneDefinition } from "game/pokemon/zones";
import {
    createBooleanRequirement,
    createCostRequirement,
    requirementsMet
} from "game/requirements";
import type { DecimalSource } from "util/bignum";
import Decimal from "util/bignum";
import { render, renderCol } from "util/vue";
import { ref, Ref, watchEffect } from "vue";

const SPECIES = speciesJson as Record<string, SpeciesData>;

const BASE_SEARCH_DURATION = 5;

interface EncounterLogEntry extends EncounterResult {
    xpGained: number;
    timestamp: number;
}

interface ZoneRuntime {
    zone: ZoneDefinition;
    searchAction: Action;
    lastEncounter: Ref<EncounterLogEntry | null>;
    recentLog: Ref<EncounterLogEntry[]>;
}

/** Converts a small DecimalSource (e.g. a repeatable's level count) into a plain JS number. */
export function toNum(value: DecimalSource): number {
    return new Decimal(value).toNumber();
}

const id = "field";
const field = createLayer(id, () => {
    const name = "Pewter Survey";
    const color = "#3B4CCA";

    const researchPoints = createResource<DecimalSource>(0, "research points");

    const unlockedZones = persistent<Record<string, boolean>>(
        Object.fromEntries(ZONES.map(zone => [zone.id, zone.unlockedByDefault]))
    );
    function unlockZone(zoneId: string) {
        if (unlockedZones.value[zoneId]) {
            return;
        }
        unlockedZones.value = { ...unlockedZones.value, [zoneId]: true };
    }

    const searchSpeed: Repeatable = createRepeatable(() => ({
        limit: 5,
        requirements: createCostRequirement(() => ({
            resource: researchPoints,
            cost: Formula.variable(searchSpeed.amount).add(1).pow(1.5).mul(10)
        })),
        display: {
            title: "Field Notebook",
            description: "Organize your notes to search 10% faster per level.",
            showAmount: true
        }
    }));

    const catchChance: Repeatable = createRepeatable(() => ({
        limit: 5,
        requirements: createCostRequirement(() => ({
            resource: researchPoints,
            cost: Formula.variable(catchChance.amount).add(1).pow(1.5).mul(15)
        })),
        display: {
            title: "Quality Traps",
            description: "Better equipment increases catch chance by 10% per level.",
            showAmount: true
        }
    }));

    const battleAttack: Repeatable = createRepeatable(() => ({
        limit: 5,
        requirements: createCostRequirement(() => ({
            resource: researchPoints,
            cost: Formula.variable(battleAttack.amount).add(1).pow(1.5).mul(20)
        })),
        display: {
            title: "Reinforced Harness",
            description:
                "Protective gear that boosts your Pokémon's battle power by 10% per level.",
            showAmount: true
        }
    }));

    const battleDefense: Repeatable = createRepeatable(() => ({
        limit: 5,
        requirements: createCostRequirement(() => ({
            resource: researchPoints,
            cost: Formula.variable(battleDefense.amount).add(1).pow(1.5).mul(25)
        })),
        display: {
            title: "Padded Vest",
            description:
                "Protective gear that boosts your Pokémon's battle power by 10% per level.",
            showAmount: true
        }
    }));

    const autoSearch = createUpgrade(() => ({
        requirements: createCostRequirement(() => ({
            resource: researchPoints,
            cost: 50
        })),
        display: {
            title: "Auto-Search Drone",
            description:
                "Automatically starts the next search on a route as soon as the current one finishes."
        }
    }));

    function createZoneRuntime(zone: ZoneDefinition): ZoneRuntime {
        const lastEncounter = ref<EncounterLogEntry | null>(null);
        const recentLog = ref<EncounterLogEntry[]>([]);

        const searchAction = createAction(() => ({
            duration: () => BASE_SEARCH_DURATION / (1 + toNum(searchSpeed.amount.value) * 0.1),
            autoStart: () => autoSearch.bought.value,
            canClick: () => unlockedZones.value[zone.id] === true && main.team.value.length > 0,
            display: {
                title: `Search ${zone.name}`,
                description: "Survey the area for wild Pokémon."
            },
            onClick() {
                const activePokemon = main.team.value[0];
                if (activePokemon == null) {
                    return;
                }
                const activeSpecies = SPECIES[activePokemon.speciesId];

                const wild = rollWildEncounter(zone, 1);
                const wildSpecies = SPECIES[wild.speciesId];

                const gearMultiplier = computeGearMultiplier(
                    toNum(battleAttack.amount.value),
                    toNum(battleDefense.amount.value)
                );
                const playerPower = computeBattlePower(
                    activeSpecies.baseStats,
                    activePokemon.level,
                    gearMultiplier
                );
                const wildPower = computeBattlePower(wildSpecies.baseStats, wild.level);
                const battleWon = resolveBattle(playerPower, wildPower);

                let caught = false;
                let xpGained = 0;
                if (battleWon) {
                    xpGained = computeXpGain(wild.level);
                    main.team.value = main.team.value.map((p, i) =>
                        i === 0 ? { ...p, xp: p.xp + xpGained } : p
                    );
                    caught = rollCatch(
                        wildSpecies.captureRate,
                        1 + toNum(catchChance.amount.value) * 0.1
                    );
                }

                recordSeen(main.pokedex, wild.speciesId);
                const isFirstCatch = caught
                    ? recordCatch(main.pokedex, wild.speciesId, wild.isShiny)
                    : false;
                const result: EncounterResult = { ...wild, battleWon, caught };
                if (caught) {
                    researchPoints.value = Decimal.add(
                        researchPoints.value,
                        computeResearchPointsGain(result, isFirstCatch)
                    );
                }
                const entry: EncounterLogEntry = { ...result, xpGained, timestamp: Date.now() };
                lastEncounter.value = entry;
                recentLog.value = [entry, ...recentLog.value].slice(0, 5);
            }
        }));

        return { zone, searchAction, lastEncounter, recentLog };
    }

    const zoneRuntimes: Record<string, ZoneRuntime> = Object.fromEntries(
        ZONES.map(zone => [zone.id, createZoneRuntime(zone)])
    );

    // Ratchet: once a zone's documentation is complete, the next one in the cluster opens up.
    // Only ever flips locks open, never re-locks (that's the badge-reset's job, via unlockedZones
    // being wiped along with the rest of this layer).
    watchEffect(() => {
        if (zoneProgress(main.pokedex, ROUTE_1).complete) {
            unlockZone(ROUTE_2.id);
        }
        if (zoneProgress(main.pokedex, ROUTE_2).complete) {
            unlockZone(VIRIDIAN_FOREST.id);
        }
    });

    function describeOutcome(entry: EncounterLogEntry): string {
        if (!entry.battleWon) {
            return "Your Pokémon lost the battle — it got away.";
        }
        if (!entry.caught) {
            return `Won the battle (+${entry.xpGained} XP), but it broke free!`;
        }
        return `Won the battle (+${entry.xpGained} XP) and caught it!`;
    }

    function renderZoneTab(runtime: ZoneRuntime) {
        if (main.team.value.length === 0) {
            return (
                <div>
                    <h3>{runtime.zone.name}</h3>
                    <p>
                        🔒 Choose your starter Pokémon in the Field Log tab before you can search.
                    </p>
                </div>
            );
        }
        if (!unlockedZones.value[runtime.zone.id]) {
            return (
                <div>
                    <h3>{runtime.zone.name}</h3>
                    <p>🔒 Locked. Keep documenting nearby routes to open this area.</p>
                </div>
            );
        }
        const progress = zoneProgress(main.pokedex, runtime.zone);
        const last = runtime.lastEncounter.value;
        return (
            <div>
                <h3>{runtime.zone.name}</h3>
                {render(runtime.searchAction)}
                {last == null ? null : (
                    <div>
                        Last encounter:{" "}
                        {formatSpeciesName(SPECIES[last.speciesId]?.name ?? last.speciesId)} Lv.
                        {last.level}
                        {last.isShiny ? " ✨ SHINY!" : ""} — {describeOutcome(last)}
                    </div>
                )}
                <div>
                    Progress: {progress.caughtCount}/{progress.totalCount} species documented
                    {progress.shinyCount > 0 ? ` (${progress.shinyCount} shiny)` : ""}
                </div>
            </div>
        );
    }

    function renderPokedexTab() {
        return (
            <div>
                <h3>Pokédex</h3>
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(90px, 1fr))",
                        gap: "8px"
                    }}
                >
                    {Object.values(SPECIES).map(species => {
                        const entry = main.pokedex.value[species.id];
                        return (
                            <div
                                key={species.id}
                                style={{
                                    textAlign: "center",
                                    border: "1px solid var(--outline, #444)",
                                    borderRadius: "8px",
                                    padding: "4px"
                                }}
                            >
                                {entry?.seen ? (
                                    <img
                                        src={
                                            entry.shinyCaught
                                                ? species.sprites.frontShiny
                                                : species.sprites.front
                                        }
                                        alt={species.name}
                                        style={{ width: "64px", height: "64px" }}
                                    />
                                ) : (
                                    <div
                                        style={{ width: "64px", height: "64px", margin: "0 auto" }}
                                    >
                                        ?
                                    </div>
                                )}
                                <div>{entry?.seen ? formatSpeciesName(species.name) : "???"}</div>
                                {entry?.caught ? <div>Caught ×{entry.timesCaught}</div> : null}
                                {entry?.shinyCaught ? <div>✨ Shiny!</div> : null}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }

    const tabs: Record<string, () => TabButtonOptions> = {};
    for (const zone of ZONES) {
        tabs[zone.id] = () => ({
            tab: () => renderZoneTab(zoneRuntimes[zone.id]),
            display: zone.name
        });
    }
    tabs.pokedex = () => ({
        tab: () => renderPokedexTab(),
        display: "Pokédex"
    });
    const tabFamily = createTabFamily(tabs);

    const reportRequirement = createBooleanRequirement(
        () => ZONES.every(zone => zoneProgress(main.pokedex, zone).complete),
        "Document every species across Route 1, Route 2, and Viridian Forest"
    );

    const reset = createReset(() => ({
        thingsToReset: (): Record<string, unknown>[] => [field],
        onReset() {
            main.badgesEarned.value += 1;
        }
    }));

    const submitReport = createClickable(() => ({
        canClick: () => requirementsMet(reportRequirement),
        display: {
            title: "Submit Report to Brock",
            description: () =>
                requirementsMet(reportRequirement)
                    ? "Your Pewter-area survey is complete. Brock reviews it and authorizes travel onward."
                    : "Document every species across Route 1, Route 2, and Viridian Forest before submitting."
        },
        onClick() {
            if (!requirementsMet(reportRequirement)) {
                return;
            }
            reset.reset();
        }
    }));

    return {
        name,
        color,
        researchPoints,
        unlockedZones,
        zoneRuntimes,
        searchSpeed,
        catchChance,
        battleAttack,
        battleDefense,
        autoSearch,
        tabFamily,
        reset,
        submitReport,
        display: () => (
            <>
                <MainDisplay resource={researchPoints} color={color} />
                {render(tabFamily)}
                <br />
                {renderCol(searchSpeed, catchChance, battleAttack, battleDefense, autoSearch)}
                <br />
                <div>
                    Pewter survey:{" "}
                    {ZONES.filter(zone => zoneProgress(main.pokedex, zone).complete).length}/
                    {ZONES.length} zones fully documented
                </div>
                {render(submitReport)}
            </>
        )
    };
});

export default field;
