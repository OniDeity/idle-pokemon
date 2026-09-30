/**
 * Party & PC Box: choose your six, reorder them, and evolve Pokémon with stones or trades.
 */
import { main } from "data/projEntry";
import { createLayer } from "game/layers";
import { memberMultiplier, effortMultiplier } from "game/pokemon/balance";
import type { Evolution, PokemonType, StoneId } from "game/pokemon/data";
import { getSpecies, TYPE_COLORS } from "game/pokemon/data";
import { STONES } from "game/pokemon/items";
import { attacksPerSecond, maxHp, statAtLevel, xpForLevel } from "game/pokemon/stats";
import { computed, ref } from "vue";
import type { NavNode } from "../ui/nav";
import { mobileClasses, renderNav } from "../ui/nav";
import {
    Bar,
    Button,
    DexNumber,
    ItemIcon,
    Panel,
    Sprite,
    Stat,
    TypeBadge,
    TypeBadges
} from "../ui/components";
import dex from "./dex";

type Sort = "dex" | "level" | "strongest" | "name";
type QuickFilter = "canEvolve" | "ready" | "shiny" | "forms" | "boxed" | "capped";

const SORTS: [Sort, string][] = [
    ["dex", "Dex no."],
    ["level", "Level"],
    ["strongest", "Strongest"],
    ["name", "Name"]
];

const QUICK_FILTERS: [QuickFilter, string, string][] = [
    ["canEvolve", "Can evolve", "Has an evolution you don't own yet"],
    [
        "ready",
        "Ready to evolve",
        "Can evolve right now: level reached, stone in the bag, or Link Cable"
    ],
    ["shiny", "Shiny", "Shiny Pokémon"],
    ["forms", "Forms", "Variants, regional forms, female forms and patterns"],
    ["boxed", "Not in party", "Pokémon waiting in the box"],
    ["capped", "At level cap", "Can't gain levels until the next badge"]
];

const id = "party";
const layer = createLayer(id, () => {
    const name = "Party";
    const color = "#F97316";
    const selected = ref<number | null>(null);
    const sort = ref<Sort>("dex");
    const search = ref("");
    const quickFilters = ref<QuickFilter[]>([]);
    const typeFilters = ref<PokemonType[]>([]);

    /** Every Pokémon in the box, unfiltered. */
    const allIds = computed(() => Object.keys(main.box.value).map(Number));

    /** Evolutions whose result the player doesn't own yet. */
    function pendingEvolutions(speciesId: number): Evolution[] {
        return getSpecies(speciesId).evolutions.filter(
            e => !main.owns(main.evolutionTarget(speciesId, e.into))
        );
    }

    /** Can evolve right now: level reached (it evolves on its next level-up in the party), a
     * stone in the bag, or the Link Cable. */
    function readyToEvolve(speciesId: number): boolean {
        const level = main.box.value[speciesId]?.level ?? 0;
        const have = (item: StoneId) => (main.stones.value[item] ?? 0) > 0;
        return pendingEvolutions(speciesId).some(e =>
            e.method === "level"
                ? level >= (e.level ?? Infinity) || (e.friendship === true && have("sootheBell"))
                : e.method === "stone"
                  ? have(e.stone!)
                  : have("linkCable") && (e.heldItem == null || have(e.heldItem))
        );
    }

    /** Rough battle strength: best attacking stat, attack speed and damage bonuses. */
    function strength(speciesId: number): number {
        const species = getSpecies(speciesId);
        const level = main.box.value[speciesId]?.level ?? 1;
        const [, atk, , spa] = species.baseStats;
        return (
            statAtLevel(Math.max(atk, spa), level) *
            attacksPerSecond(species) *
            main.battlerFor(speciesId).multiplier
        );
    }

    function matchesQuickFilter(speciesId: number, filter: QuickFilter): boolean {
        switch (filter) {
            case "canEvolve":
                return pendingEvolutions(speciesId).length > 0;
            case "ready":
                return readyToEvolve(speciesId);
            case "shiny":
                return main.box.value[speciesId]?.shiny === true;
            case "forms":
                return getSpecies(speciesId).variant != null;
            case "boxed":
                return !main.partyIds.value.includes(speciesId);
            case "capped":
                return (main.box.value[speciesId]?.level ?? 0) >= main.cap.value;
        }
    }

    /** Types present in the box, in type-chart order, for the type filter. */
    const boxTypes = computed(() => {
        const present = new Set(allIds.value.flatMap(sid => getSpecies(sid).types));
        return (Object.keys(TYPE_COLORS) as PokemonType[]).filter(type => present.has(type));
    });

    const boxIds = computed(() => {
        const query = search.value.trim().toLowerCase();
        const ids = allIds.value.filter(sid => {
            const species = getSpecies(sid);
            if (query !== "" && !species.name.toLowerCase().includes(query)) return false;
            if (!quickFilters.value.every(filter => matchesQuickFilter(sid, filter))) {
                return false;
            }
            if (
                typeFilters.value.length > 0 &&
                !species.types.some(type => typeFilters.value.includes(type))
            ) {
                return false;
            }
            return true;
        });
        const dexOrder = (sid: number) => (getSpecies(sid).baseSpecies ?? sid) * 100000 + sid;
        const level = (sid: number) => main.box.value[sid].level;
        switch (sort.value) {
            case "level":
                return ids.sort((a, b) => level(b) - level(a) || dexOrder(a) - dexOrder(b));
            case "strongest": {
                const scores = new Map(ids.map(sid => [sid, strength(sid)]));
                return ids.sort((a, b) => scores.get(b)! - scores.get(a)!);
            }
            case "name":
                return ids.sort((a, b) => getSpecies(a).name.localeCompare(getSpecies(b).name));
            default:
                return ids.sort((a, b) => dexOrder(a) - dexOrder(b));
        }
    });

    const filtering = computed(
        () =>
            search.value.trim() !== "" ||
            quickFilters.value.length > 0 ||
            typeFilters.value.length > 0
    );

    function toggle<T>(list: { value: T[] }, item: T) {
        list.value = list.value.includes(item)
            ? list.value.filter(x => x !== item)
            : [...list.value, item];
    }

    function clearFilters() {
        search.value = "";
        quickFilters.value = [];
        typeFilters.value = [];
    }

    /** Something in the box can evolve right now; lights up the Party button. */
    const evolutionReady = computed(() => allIds.value.some(readyToEvolve));

    const nav: NavNode = {
        id,
        letter: "P",
        label: "Party",
        color,
        glow: computed((): boolean => evolutionReady.value),
        enabled: computed((): boolean => true)
    };

    function renderEvolutions(speciesId: number) {
        const species = getSpecies(speciesId);
        if (species.evolutions.length === 0) {
            return <div class="pk-small pk-muted">Does not evolve.</div>;
        }
        return (
            <div class="pk-evolutions">
                {species.evolutions.map(evo => {
                    const into = getSpecies(main.evolutionTarget(speciesId, evo.into));
                    const done = main.owns(into.id);
                    let action;
                    if (done) {
                        action = <span class="pk-small pk-done">✔ Owned</span>;
                    } else if (evo.method === "level") {
                        const reached =
                            (main.box.value[speciesId]?.level ?? 0) >= (evo.level ?? Infinity);
                        const bells = main.stones.value.sootheBell ?? 0;
                        action = reached ? (
                            <Button
                                kind="primary"
                                disabled={main.inTrainerBattle.value}
                                onClick={() => main.evolveByLevel(speciesId, evo.into)}
                            >
                                Evolve (Lv. {evo.level})
                            </Button>
                        ) : evo.friendship === true ? (
                            <Button
                                kind="primary"
                                disabled={bells <= 0 || main.inTrainerBattle.value}
                                onClick={() => main.evolveWithSootheBell(speciesId, evo.into)}
                                title={
                                    bells <= 0
                                        ? `Buy a Soothe Bell at the Poké Mart, or reach Lv. ${evo.level}`
                                        : `Evolves by itself at Lv. ${evo.level}`
                                }
                            >
                                <ItemIcon src={STONES.sootheBell.sprite} size={20} /> Use Soothe
                                Bell ({bells})
                            </Button>
                        ) : (
                            <span class="pk-small pk-muted">
                                Evolves at Lv. {evo.level} while in your party
                            </span>
                        );
                    } else if (evo.method === "stone") {
                        const stone = STONES[evo.stone!];
                        const have = main.stones.value[stone.id] ?? 0;
                        action = (
                            <Button
                                kind="primary"
                                disabled={have <= 0 || main.inTrainerBattle.value}
                                onClick={() => main.evolveWithStone(speciesId, stone.id)}
                                title={have <= 0 ? `Buy a ${stone.name} at the Poké Mart` : ""}
                            >
                                <ItemIcon src={stone.sprite} size={20} /> Use {stone.name} ({have})
                            </Button>
                        );
                    } else {
                        const cables = main.stones.value.linkCable ?? 0;
                        const held = evo.heldItem != null ? STONES[evo.heldItem] : null;
                        const heldCount = held != null ? (main.stones.value[held.id] ?? 0) : 1;
                        const missing = [
                            cables <= 0 ? "a Link Cable" : null,
                            held != null && heldCount <= 0 ? `a ${held.name}` : null
                        ].filter(x => x != null);
                        action = (
                            <Button
                                kind="primary"
                                disabled={missing.length > 0 || main.inTrainerBattle.value}
                                onClick={() => main.evolveByTrade(speciesId)}
                                title={
                                    missing.length > 0
                                        ? `Buy ${missing.join(" and ")} at the Poké Mart`
                                        : ""
                                }
                            >
                                <ItemIcon src={STONES.linkCable.sprite} size={20} /> Link Cable (
                                {cables})
                                {held != null ? (
                                    <>
                                        {" + "}
                                        <ItemIcon src={held.sprite} size={20} /> {held.name} (
                                        {heldCount})
                                    </>
                                ) : null}
                            </Button>
                        );
                    }
                    return (
                        <div class="pk-evolution">
                            <Sprite id={into.id} size={40} silhouette={!dex.entry(into.id).seen} />
                            <span>{dex.entry(into.id).seen ? into.name : "???"}</span>
                            {action}
                        </div>
                    );
                })}
            </div>
        );
    }

    function renderDetail(speciesId: number) {
        const entry = main.box.value[speciesId];
        if (entry == null) return null;
        const species = getSpecies(speciesId);
        const inParty = main.partyIds.value.includes(speciesId);
        const battler = main.battlerFor(speciesId);
        const [, atk, def, spa, spd, spe] = species.baseStats;
        const nextXp = xpForLevel(species.growthRate, entry.level + 1);
        const thisXp = xpForLevel(species.growthRate, entry.level);
        const capped = entry.level >= main.cap.value;
        return (
            <Panel extraClass="pk-detail">
                <div class="pk-dex-detail-head">
                    <Sprite id={speciesId} size={96} shiny={entry.shiny} />
                    <div>
                        <DexNumber id={speciesId} />
                        <h3>
                            {species.name} {entry.shiny ? "✨" : ""}
                        </h3>
                        <TypeBadges id={speciesId} />
                        <div>Lv. {entry.level}</div>
                    </div>
                </div>
                <Bar
                    value={capped ? 1 : entry.xp - thisXp}
                    max={capped ? 1 : nextXp - thisXp}
                    kind="xp"
                    label={
                        capped
                            ? `Level cap (${main.cap.value})`
                            : `${Math.floor(entry.xp - thisXp)} / ${nextXp - thisXp} XP`
                    }
                />
                <div class="pk-stat-grid">
                    <Stat label="HP" value={Math.round(maxHp(battler) * main.bonuses.value.hp)} />
                    <Stat label="Attack" value={statAtLevel(atk, entry.level)} />
                    <Stat label="Defense" value={statAtLevel(def, entry.level)} />
                    <Stat label="Sp. Atk" value={statAtLevel(spa, entry.level)} />
                    <Stat label="Sp. Def" value={statAtLevel(spd, entry.level)} />
                    <Stat label="Speed" value={statAtLevel(spe, entry.level)} />
                    <Stat label="Attacks/sec" value={attacksPerSecond(species).toFixed(2)} />
                    <Stat
                        label="Bonus"
                        value={`×${memberMultiplier(entry.shiny, dex.timesCaught(speciesId)).toFixed(2)}`}
                    />
                    <Stat
                        label="Effort"
                        value={`+${Math.round(
                            (effortMultiplier(species.growthRate, entry.level, entry.effort ?? 0) -
                                1) *
                                100
                        )}%`}
                    />
                </div>
                <div class="pk-detail-actions">
                    {inParty ? (
                        <>
                            <Button
                                kind="ghost"
                                disabled={main.inTrainerBattle.value}
                                onClick={() => main.moveInParty(speciesId, -1)}
                            >
                                ▲ Move up
                            </Button>
                            <Button
                                kind="ghost"
                                disabled={main.inTrainerBattle.value}
                                onClick={() => main.moveInParty(speciesId, 1)}
                            >
                                ▼ Move down
                            </Button>
                            <Button
                                kind="danger"
                                disabled={
                                    main.partyIds.value.length <= 1 || main.inTrainerBattle.value
                                }
                                onClick={() => main.removeFromParty(speciesId)}
                            >
                                Send to box
                            </Button>
                        </>
                    ) : (
                        <Button
                            kind="primary"
                            disabled={main.partyIds.value.length >= 6 || main.inTrainerBattle.value}
                            onClick={() => main.addToParty(speciesId)}
                        >
                            {main.partyIds.value.length >= 6 ? "Party full" : "Add to party"}
                        </Button>
                    )}
                </div>
                <h4>Evolution</h4>
                {renderEvolutions(speciesId)}
            </Panel>
        );
    }

    function renderPartySlot(speciesId: number, index: number) {
        const entry = main.box.value[speciesId];
        if (entry == null) return null;
        const species = getSpecies(speciesId);
        const thisXp = xpForLevel(species.growthRate, entry.level);
        const nextXp = xpForLevel(species.growthRate, entry.level + 1);
        const capped = entry.level >= main.cap.value;
        return (
            <button
                class={["pk-party-slot", selected.value === speciesId ? "selected" : ""]}
                onClick={() => (selected.value = speciesId)}
            >
                <span class="pk-party-index">{index + 1}</span>
                <Sprite id={speciesId} size={56} shiny={entry.shiny} />
                <div class="pk-party-info">
                    <div>
                        <b>{species.name}</b> <span class="pk-muted">Lv. {entry.level}</span>
                    </div>
                    <TypeBadges id={speciesId} small />
                    <Bar
                        value={capped ? 1 : entry.xp - thisXp}
                        max={capped ? 1 : nextXp - thisXp}
                        kind="xp"
                    />
                </div>
            </button>
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
            if (main.starter.value === 0) {
                return (
                    <div class="pk-layer">
                        {renderNav(true)}
                        <h2 class="pk-layer-title">Party</h2>
                        <p class="pk-muted">Choose your starter first!</p>
                    </div>
                );
            }
            const detailId =
                selected.value != null && main.owns(selected.value)
                    ? selected.value
                    : main.partyIds.value[0];
            return (
                <div class="pk-layer">
                    {renderNav(true)}
                    <h2 class="pk-layer-title">Party</h2>
                    {main.inTrainerBattle.value ? (
                        <p class="pk-warning">
                            You can't change your party in the middle of a battle.
                        </p>
                    ) : null}
                    <div class="pk-party-grid">{main.partyIds.value.map(renderPartySlot)}</div>
                    {renderDetail(detailId)}
                    <Panel title={`PC Box (${allIds.value.length})`}>
                        <div class="pk-filter-row">
                            <input
                                class="pk-search"
                                type="search"
                                placeholder="Search by name…"
                                value={search.value}
                                onInput={(e: Event) =>
                                    (search.value = (e.target as HTMLInputElement).value)
                                }
                            />
                        </div>
                        <div class="pk-filter-row">
                            <span class="pk-small pk-muted">Sort:</span>
                            {SORTS.map(([value, label]) => (
                                <Button
                                    kind={sort.value === value ? "primary" : "ghost"}
                                    onClick={() => (sort.value = value)}
                                >
                                    {label}
                                </Button>
                            ))}
                        </div>
                        <div class="pk-filter-row">
                            <span class="pk-small pk-muted">Show:</span>
                            {QUICK_FILTERS.map(([value, label, title]) => (
                                <Button
                                    kind={quickFilters.value.includes(value) ? "primary" : "ghost"}
                                    title={title}
                                    onClick={() => toggle(quickFilters, value)}
                                >
                                    {label}
                                </Button>
                            ))}
                        </div>
                        <div class="pk-filter-row">
                            <span class="pk-small pk-muted">Type:</span>
                            {boxTypes.value.map(type => (
                                <button
                                    class={[
                                        "pk-type-toggle",
                                        typeFilters.value.includes(type) ? "active" : ""
                                    ]}
                                    onClick={() => toggle(typeFilters, type)}
                                >
                                    <TypeBadge type={type} small />
                                </button>
                            ))}
                        </div>
                        {filtering.value ? (
                            <div class="pk-filter-row pk-small pk-muted">
                                Showing {boxIds.value.length} of {allIds.value.length}
                                <Button kind="ghost" onClick={clearFilters}>
                                    Clear filters
                                </Button>
                            </div>
                        ) : null}
                        {boxIds.value.length === 0 ? (
                            <p class="pk-muted">No Pokémon match these filters.</p>
                        ) : null}
                        <div class="pk-box-grid">
                            {boxIds.value.map(sid => {
                                const entry = main.box.value[sid];
                                const inParty = main.partyIds.value.includes(sid);
                                return (
                                    <button
                                        class={[
                                            "pk-box-cell",
                                            inParty ? "in-party" : "",
                                            detailId === sid ? "selected" : ""
                                        ]}
                                        title={`${getSpecies(sid).name} Lv. ${entry.level}`}
                                        onClick={() => (selected.value = sid)}
                                    >
                                        <Sprite id={sid} size={48} shiny={entry.shiny} />
                                        <span class="pk-box-level">{entry.level}</span>
                                        {readyToEvolve(sid) ? (
                                            <span class="pk-box-ready" title="Ready to evolve">
                                                ▲
                                            </span>
                                        ) : null}
                                    </button>
                                );
                            })}
                        </div>
                    </Panel>
                </div>
            );
        }
    };
});

export default layer;
