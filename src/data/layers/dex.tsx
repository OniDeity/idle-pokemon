/**
 * The Pokédex. Permanent: survives Hall of Fame resets, and its milestones (and the damage
 * bonus from every species caught) carry into every future journey.
 */
import { main } from "data/projEntry";
import { createLayer } from "game/layers";
import { persistent } from "game/persistence";
import {
    DEX_MILESTONES,
    DEX_DAMAGE_BONUS_PER_SPECIES,
    memberMultiplier
} from "game/pokemon/balance";
import type { Species } from "game/pokemon/data";
import { DEX_SIZE, getSpecies, PRE_EVOLUTION, SPECIES } from "game/pokemon/data";
import { STONES } from "game/pokemon/items";
import { MEW_ID, MEW_REQUIREMENT, SPECIAL_ENCOUNTERS } from "game/pokemon/specials";
import { allZoneSpecies, ZONES } from "game/pokemon/zones";
import { computed, ref } from "vue";
import type { NavNode } from "../ui/nav";
import {
    Bar,
    Button,
    DexNumber,
    ItemIcon,
    Panel,
    Sprite,
    Stat,
    TypeBadges
} from "../ui/components";

export type DexEntry = {
    seen: boolean;
    caught: boolean;
    shiny: boolean;
    timesCaught: number;
};

const EMPTY: DexEntry = { seen: false, caught: false, shiny: false, timesCaught: 0 };

type Filter = "all" | "caught" | "missing" | "shiny";

/** Where a species can be found: wild zones, specials, or by evolving something. */
function locationsOf(id: number): string[] {
    const places: string[] = [];
    for (const zone of ZONES) {
        if (allZoneSpecies(zone.id).includes(id)) {
            places.push(zone.name);
        }
    }
    for (const special of SPECIAL_ENCOUNTERS) {
        if (special.speciesId === id) {
            const how =
                special.kind === "trade"
                    ? `trade (show a ${getSpecies(special.wants).name})`
                    : special.kind === "legendary"
                      ? "legendary encounter"
                      : special.price != null
                        ? `₽${special.price.toLocaleString("en-US")}`
                        : "gift";
            places.push(`${special.place} — ${how}`);
        }
    }
    const pre = PRE_EVOLUTION[id];
    if (pre != null) {
        const evo = getSpecies(pre).evolutions.find(e => e.into === id);
        const how =
            evo?.method === "level"
                ? `at Lv. ${evo.level}`
                : evo?.method === "stone"
                  ? `with a ${STONES[evo.stone!].name}`
                  : "by trade (Link Cable)";
        places.push(`Evolve ${getSpecies(pre).name} ${how}`);
    }
    if (id === MEW_ID) {
        places.push(`Professor Oak's reward for ${MEW_REQUIREMENT} species caught`);
    }
    if ([1, 4, 7].includes(id)) {
        places.push("Starter Pokémon");
    }
    return places;
}

const id = "dex";
const layer = createLayer(id, () => {
    const name = "Pokédex";
    const color = "#DC0A2D";

    const entries = persistent<Record<string, DexEntry>>({}, false);
    const filter = ref<Filter>("all");
    const selected = ref<number>(1);

    const list = computed(() => Object.values(entries.value));
    const seenCount = computed(() => list.value.filter(e => e.seen).length);
    const caughtCount = computed(() => list.value.filter(e => e.caught).length);
    const shinyCount = computed(() => list.value.filter(e => e.shiny).length);

    function entry(speciesId: number): DexEntry {
        return entries.value[speciesId] ?? EMPTY;
    }

    function markSeen(speciesId: number) {
        const e = entry(speciesId);
        if (e.seen) return;
        entries.value = { ...entries.value, [speciesId]: { ...e, seen: true } };
    }

    /** Registers a catch. Returns true the first time a species is ever caught. */
    function markCaught(speciesId: number, shiny: boolean, countsAsCatch = true) {
        const e = entry(speciesId);
        entries.value = {
            ...entries.value,
            [speciesId]: {
                seen: true,
                caught: true,
                shiny: e.shiny || shiny,
                timesCaught: e.timesCaught + (countsAsCatch || !e.caught ? 1 : 0)
            }
        };
        return !e.caught;
    }

    function timesCaught(speciesId: number) {
        return entry(speciesId).timesCaught;
    }

    const mewAvailable = computed(
        (): boolean =>
            caughtCount.value >= MEW_REQUIREMENT && main.starter.value !== 0 && !main.owns(MEW_ID)
    );
    function claimMew() {
        if (!mewAvailable.value) return;
        main.receivePokemon(MEW_ID, 30, false);
        main.addLog({
            kind: "catch",
            text: "Professor Oak entrusted you with Mew!",
            speciesId: MEW_ID
        });
    }

    const nav: NavNode = {
        id,
        letter: "D",
        label: "Dex",
        color,
        glow: computed((): boolean => mewAvailable.value),
        enabled: computed((): boolean => true)
    };

    const visibleSpecies = computed(() =>
        SPECIES.filter(s => {
            const e = entry(s.id);
            switch (filter.value) {
                case "caught":
                    return e.caught;
                case "missing":
                    return !e.caught;
                case "shiny":
                    return e.shiny;
                default:
                    return true;
            }
        })
    );

    function renderDetail(species: Species) {
        const e = entry(species.id);
        if (!e.seen) {
            return (
                <Panel extraClass="pk-dex-detail">
                    <div class="pk-dex-detail-head">
                        <Sprite id={species.id} size={96} silhouette />
                        <div>
                            <DexNumber id={species.id} />
                            <h3>???</h3>
                            <p class="pk-muted">Not yet seen.</p>
                        </div>
                    </div>
                    <div class="pk-muted">Where to look:</div>
                    <ul class="pk-where">
                        {locationsOf(species.id).map(place => (
                            <li>{place}</li>
                        ))}
                    </ul>
                </Panel>
            );
        }
        const [hp, atk, def, spa, spd, spe] = species.baseStats;
        const bonus = memberMultiplier(false, e.timesCaught);
        return (
            <Panel extraClass="pk-dex-detail">
                <div class="pk-dex-detail-head">
                    <Sprite id={species.id} size={96} shiny={e.shiny} />
                    <div>
                        <DexNumber id={species.id} />
                        <h3>
                            {species.name} {e.shiny ? <span title="Shiny caught">✨</span> : null}
                        </h3>
                        <TypeBadges id={species.id} />
                    </div>
                </div>
                <div class="pk-stat-grid">
                    <Stat label="HP" value={hp} />
                    <Stat label="Attack" value={atk} />
                    <Stat label="Defense" value={def} />
                    <Stat label="Sp. Atk" value={spa} />
                    <Stat label="Sp. Def" value={spd} />
                    <Stat label="Speed" value={spe} />
                    <Stat label="Catch rate" value={species.captureRate} />
                    <Stat label="Times caught" value={e.timesCaught} />
                </div>
                {e.caught ? (
                    <p class="pk-muted">
                        Extra catches make {species.name} hit harder: currently ×{bonus.toFixed(2)}.
                    </p>
                ) : null}
                <div class="pk-muted">Found at:</div>
                <ul class="pk-where">
                    {locationsOf(species.id).map(place => (
                        <li>{place}</li>
                    ))}
                </ul>
            </Panel>
        );
    }

    const filters: [Filter, string][] = [
        ["all", "All"],
        ["caught", "Caught"],
        ["missing", "Missing"],
        ["shiny", "Shiny"]
    ];

    return {
        name,
        color,
        minWidth: 480,
        minimizable: false,
        entries,
        seenCount,
        caughtCount,
        shinyCount,
        markSeen,
        markCaught,
        timesCaught,
        entry,
        mewAvailable,
        nav,
        display: () => (
            <div class="pk-layer">
                <h2 class="pk-layer-title">Pokédex</h2>
                <div class="pk-dex-summary">
                    <div>
                        Seen <b>{seenCount.value}</b> · Caught <b>{caughtCount.value}</b> /{" "}
                        {DEX_SIZE} · Shiny <b>{shinyCount.value}</b>
                    </div>
                    <Bar value={caughtCount.value} max={DEX_SIZE} kind="progress" />
                    <div class="pk-muted">
                        Every species caught gives +{DEX_DAMAGE_BONUS_PER_SPECIES * 100}% damage
                        (now +{Math.round(caughtCount.value * DEX_DAMAGE_BONUS_PER_SPECIES * 100)}
                        %). The Pokédex is never reset.
                    </div>
                </div>

                <Panel title="Professor Oak's rewards">
                    <div class="pk-milestones">
                        {DEX_MILESTONES.map(m => {
                            const earned = caughtCount.value >= m.caught;
                            return (
                                <div class={["pk-milestone", earned ? "earned" : ""]}>
                                    <ItemIcon src={m.sprite} alt={m.name} />
                                    <div>
                                        <b>{m.name}</b>{" "}
                                        <span class="pk-muted">({m.caught} caught)</span>
                                        <div class="pk-small">{m.description}</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    {mewAvailable.value ? (
                        <Button kind="primary" onClick={claimMew}>
                            Receive Mew from Professor Oak
                        </Button>
                    ) : null}
                </Panel>

                <div class="pk-filter-row">
                    {filters.map(([value, label]) => (
                        <Button
                            kind={filter.value === value ? "primary" : "ghost"}
                            onClick={() => (filter.value = value)}
                        >
                            {label}
                        </Button>
                    ))}
                </div>

                <div class="pk-dex-layout">
                    <div class="pk-dex-grid">
                        {visibleSpecies.value.map(species => {
                            const e = entry(species.id);
                            return (
                                <button
                                    class={[
                                        "pk-dex-cell",
                                        e.caught ? "caught" : e.seen ? "seen" : "unseen",
                                        selected.value === species.id ? "selected" : ""
                                    ]}
                                    title={e.seen ? species.name : "???"}
                                    onClick={() => (selected.value = species.id)}
                                >
                                    <Sprite
                                        id={species.id}
                                        size={48}
                                        shiny={e.shiny}
                                        silhouette={!e.seen}
                                    />
                                    <span class="pk-dex-cell-num">{species.id}</span>
                                    {e.shiny ? <span class="pk-dex-cell-shiny">✨</span> : null}
                                </button>
                            );
                        })}
                    </div>
                    {renderDetail(getSpecies(selected.value))}
                </div>
            </div>
        )
    };
});

export default layer;
