/**
 * Party & PC Box: choose your six, reorder them, and evolve Pokémon with stones or trades.
 */
import { main } from "data/projEntry";
import { HEART_BATTLES } from "game/pokemon/balance";
import { DAY_CARE_PLACE } from "game/pokemon/mechanics";
import {
    CATEGORY_NAMES,
    CONTEST_CATEGORIES,
    MAX_CONDITION,
    POKEBLOCK_COLORS,
    POKEBLOCK_PRICE,
    RANK_NAMES
} from "game/pokemon/contests";
import { createLayer } from "game/layers";
import { memberMultiplier, effortMultiplier } from "game/pokemon/balance";
import type { Evolution, PokemonType, StoneId } from "game/pokemon/data";
import { getSpecies, TYPE_COLORS } from "game/pokemon/data";
import { STONES } from "game/pokemon/items";
import { attacksPerSecond, maxHp, statAtLevel, xpForLevel } from "game/pokemon/stats";
import { computed, ref } from "vue";
import type { NavNode } from "../ui/nav";
import { mobileClasses, renderNav } from "../ui/nav";
import type { TabOption } from "../ui/components";
import {
    Bar,
    Button,
    currentTab,
    DexNumber,
    ItemIcon,
    Panel,
    renderTabs,
    Sprite,
    Stat,
    TypeBadge,
    TypeBadges
} from "../ui/components";
import dex from "./dex";
import hof from "./hof";

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

type DayCareSort = "useful" | "dex" | "name";
type DayCareFilter = "newDex" | "notInBox" | "shiny";

const DAY_CARE_SORTS: [DayCareSort, string][] = [
    ["useful", "Most useful"],
    ["dex", "Dex no."],
    ["name", "Name"]
];

const DAY_CARE_FILTERS: [DayCareFilter, string, string][] = [
    ["newDex", "New for Pokédex", "Its Egg hatches a Pokémon your Pokédex doesn't have"],
    ["notInBox", "Not in box", "Its Egg hatches a Pokémon you don't have this journey"],
    ["shiny", "Shiny parents", "Shiny Pokémon, whose Eggs are shiny 1 time in 64"]
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

    const dayCareSearch = ref("");
    const dayCareFilters = ref<DayCareFilter[]>([]);
    const dayCareSort = ref<DayCareSort>("useful");

    /** Every Pokémon in the box, unfiltered. */
    const allIds = computed(() => Object.keys(main.box.value).map(Number));

    /** Evolutions whose result the player doesn't own yet. */
    function pendingEvolutions(speciesId: number): Evolution[] {
        return main
            .evolutionsOf(speciesId)
            .filter(e => !main.owns(main.evolutionTarget(speciesId, e.into)));
    }

    /** Can evolve right now: level reached (it evolves on its next level-up in the party), a
     * stone in the bag, or the Link Cable. */
    function readyToEvolve(speciesId: number): boolean {
        const level = main.box.value[speciesId]?.level ?? 0;
        const have = (item: StoneId) => (main.stones.value[item] ?? 0) > 0;
        return pendingEvolutions(speciesId).some(e =>
            e.method === "level"
                ? level >= (e.level ?? Infinity) ||
                  (e.friendship === true &&
                      (have("sootheBell") || main.box.value[speciesId]?.friend === true))
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

    /** Pokémon that could go to the Day Care, filtered and sorted for its picker. */
    const dayCareIds = computed(() => {
        const query = dayCareSearch.value.trim().toLowerCase();
        const ids = allIds.value.filter(sid => {
            if (!main.canBreed(sid) || main.partyIds.value.includes(sid)) return false;
            const egg = main.eggSpeciesOf(sid);
            if (
                query !== "" &&
                !getSpecies(sid).name.toLowerCase().includes(query) &&
                !getSpecies(egg).name.toLowerCase().includes(query)
            ) {
                return false;
            }
            const value = main.eggValue(sid);
            return dayCareFilters.value.every(filter =>
                filter === "newDex"
                    ? value === 2
                    : filter === "notInBox"
                      ? value >= 1
                      : main.box.value[sid]?.shiny === true
            );
        });
        const dexOrder = (sid: number) => (getSpecies(sid).baseSpecies ?? sid) * 100000 + sid;
        switch (dayCareSort.value) {
            case "name":
                return ids.sort((a, b) => getSpecies(a).name.localeCompare(getSpecies(b).name));
            case "dex":
                return ids.sort((a, b) => dexOrder(a) - dexOrder(b));
            default:
                return ids.sort(
                    (a, b) => main.eggValue(b) - main.eggValue(a) || dexOrder(a) - dexOrder(b)
                );
        }
    });

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
        const evolutions = main.evolutionsOf(speciesId);
        if (evolutions.length === 0) {
            return (
                <div class="pk-small pk-muted">
                    {getSpecies(speciesId).evolutions.length > 0
                        ? "Its evolution is from Sinnoh: start a Sinnoh journey to unlock it."
                        : "Does not evolve."}
                </div>
            );
        }
        return (
            <div class="pk-evolutions">
                {evolutions.map(evo => {
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
                        ) : evo.friendship === true &&
                          main.box.value[speciesId]?.friend === true ? (
                            <Button
                                kind="primary"
                                disabled={main.inTrainerBattle.value}
                                onClick={() => main.evolveWithSootheBell(speciesId, evo.into)}
                                title="Caught in a Friend Ball: friendly enough to evolve now"
                            >
                                💛 Evolve (friendship)
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
                {entry.heart != null ? (
                    <div class="pk-small">
                        <b>🟣 Shadow Pokémon</b>:{" "}
                        {entry.heart > 0
                            ? `its heart opens after ${entry.heart} more wild battles won in your party.`
                            : main.canPurify(speciesId)
                              ? "its heart is open: purify it at the Relic Stone."
                              : "its heart is open. Reach the Relic Stone in Agate Village (Orre) to purify it."}
                        <Bar
                            value={HEART_BATTLES - entry.heart}
                            max={HEART_BATTLES}
                            kind="progress"
                        />
                        {main.canPurify(speciesId) ? (
                            <Button
                                kind="primary"
                                disabled={main.inTrainerBattle.value}
                                onClick={() => main.purify(speciesId)}
                            >
                                Purify
                            </Button>
                        ) : null}
                    </div>
                ) : null}
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
                            disabled={
                                main.partyIds.value.length >= main.maxParty.value ||
                                !main.canJoinParty(speciesId) ||
                                main.inTrainerBattle.value
                            }
                            onClick={() => main.addToParty(speciesId)}
                        >
                            {!main.canJoinParty(speciesId)
                                ? "Not allowed (challenge)"
                                : main.partyIds.value.length >= main.maxParty.value
                                  ? "Party full"
                                  : "Add to party"}
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
                <Sprite id={speciesId} size={44} shiny={entry.shiny} />
                <div class="pk-party-info">
                    <div class="pk-party-name" title={`${species.name} Lv. ${entry.level}`}>
                        <b>{species.name}</b>
                        <span class="pk-muted">Lv. {entry.level}</span>
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

    function renderBox(detailId: number | undefined) {
        return (
            <Panel>
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
                                <Sprite id={sid} size={42} shiny={entry.shiny} />
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
        );
    }

    /** The Day Care: leave a Pokémon, and its Eggs hatch into its family's first stage. */
    /** Pokémon Contests: the selected Pokémon's conditions, Pokéblocks and contests to enter. */
    function renderContestHall(id: number) {
        const running = main.contest.value;
        const ribbons = hof.ribbons.value[id] ?? {};
        return (
            <Panel>
                <p class="pk-small pk-muted">
                    Pokéblocks: ₽{POKEBLOCK_PRICE}, +{main.pokeblockGain.value} condition. Score =
                    condition + type appeal (up to 30) + half the level. A category's first Master
                    Rank win earns a Cosplay Pikachu.
                </p>
                {running.speciesId !== 0 ? (
                    <div class="pk-contest-running pk-small">
                        <Sprite id={running.speciesId} size={40} />
                        <span>
                            {getSpecies(running.speciesId).name}: {CATEGORY_NAMES[running.category]}{" "}
                            Contest, {RANK_NAMES[running.rank]}
                        </span>
                        <Bar
                            value={main.contestSeconds(running.rank) - running.remaining}
                            max={main.contestSeconds(running.rank)}
                            kind="progress"
                        />
                    </div>
                ) : null}
                {CONTEST_CATEGORIES.map(category => {
                    const condition = main.conditionOf(id, category);
                    const rank = main.contestRankFor(id, category);
                    const score = main.contestScoreOf(id, category);
                    const won = ribbons[category];
                    return (
                        <div class="pk-shop-row">
                            <div class="pk-shop-info">
                                <b>
                                    {CATEGORY_NAMES[category]}
                                    {won != null ? ` 🎀 ${RANK_NAMES[won]}` : ""}
                                </b>
                                <Bar value={condition} max={MAX_CONDITION} kind="progress" />
                                <span class="pk-small pk-muted">
                                    Condition {condition}/{MAX_CONDITION} · score{" "}
                                    {Math.round(score)}
                                    {rank != null
                                        ? ` · ${Math.round(main.contestWinChance(id, category, rank) * 100)}% to win ${RANK_NAMES[rank]}`
                                        : " · every rank won"}
                                </span>
                            </div>
                            <Button
                                kind="ghost"
                                disabled={
                                    condition >= MAX_CONDITION || main.money.value < POKEBLOCK_PRICE
                                }
                                onClick={() => main.feedPokeblock(id, category)}
                                title={`${POKEBLOCK_COLORS[category]} Pokéblock`}
                            >
                                {POKEBLOCK_COLORS[category]} Pokéblock
                            </Button>
                            <Button
                                kind="primary"
                                disabled={rank == null || running.speciesId !== 0}
                                onClick={() => main.enterContest(id, category)}
                            >
                                Enter
                            </Button>
                        </div>
                    );
                })}
            </Panel>
        );
    }

    function renderDayCare() {
        const id = main.dayCareId.value;
        const inParty = id !== 0 && main.partyIds.value.includes(id);
        const candidates = dayCareIds.value;
        const egg = id !== 0 ? main.eggSpeciesOf(id) : 0;
        return (
            <Panel>
                <p class="pk-small pk-muted">
                    Leave a Pokémon from your box and the Day Care couple finds an Egg every{" "}
                    {main.eggBattles.value} wild battles you win. Eggs hatch into the first stage of
                    its family, babies included (Pikachu → Pichu, Electabuzz → Elekid). A shiny
                    parent passes its colors on{" "}
                    {main.eggShinyMultiplier.value > 1
                        ? `${main.eggShinyMultiplier.value} times in 64 (Masuda Method)`
                        : "1 time in 64"}
                    .
                </p>
                {id !== 0 ? (
                    <div class="pk-daycare-current">
                        <Sprite id={id} size={56} shiny={main.box.value[id]?.shiny} />
                        <span class="pk-muted">→ 🥚 →</span>
                        <Sprite id={egg} size={56} silhouette={!dex.entry(egg).seen} />
                        <div class="pk-daycare-info pk-small">
                            <div>
                                <b>{getSpecies(id).name}</b> → {getSpecies(egg).name} Egg{" "}
                                {eggTag(id)}
                            </div>
                            {inParty ? (
                                <div class="pk-warning">
                                    {getSpecies(id).name} is in your party, so it isn't at the Day
                                    Care right now.
                                </div>
                            ) : (
                                <div>
                                    Next Egg in{" "}
                                    {Math.max(
                                        0,
                                        main.eggBattles.value - main.dayCareProgress.value
                                    )}{" "}
                                    battles
                                </div>
                            )}
                            <Bar
                                value={main.dayCareProgress.value}
                                max={main.eggBattles.value}
                                kind="progress"
                            />
                        </div>
                        <Button kind="ghost" onClick={() => main.leaveAtDayCare(0)}>
                            Take back
                        </Button>
                    </div>
                ) : (
                    <p class="pk-small">Nobody is at the Day Care. Pick a Pokémon below.</p>
                )}
                <div class="pk-filter-row pk-small">
                    <Button
                        kind={hof.dayCareRotate.value ? "primary" : "ghost"}
                        title="After each Egg, leave whichever Pokémon's Egg would be new to your Pokédex (or to your box this journey) instead"
                        onClick={() => (hof.dayCareRotate.value = !hof.dayCareRotate.value)}
                    >
                        Auto-swap: {hof.dayCareRotate.value ? "On" : "Off"}
                    </Button>
                    <Button
                        kind="ghost"
                        disabled={main.bestDayCareParent() == null}
                        title="Leave the Pokémon whose Egg is most useful right now"
                        onClick={() => {
                            const best = main.bestDayCareParent();
                            if (best != null) main.leaveAtDayCare(best);
                        }}
                    >
                        Pick best
                    </Button>
                    <span class="pk-muted">
                        {main.eggsHatched.value} Egg{main.eggsHatched.value === 1 ? "" : "s"} this
                        journey
                    </span>
                </div>
                <div class="pk-filter-row">
                    <input
                        class="pk-search"
                        type="search"
                        placeholder="Search parents or Eggs…"
                        value={dayCareSearch.value}
                        onInput={(e: Event) =>
                            (dayCareSearch.value = (e.target as HTMLInputElement).value)
                        }
                    />
                </div>
                <div class="pk-filter-row">
                    <span class="pk-small pk-muted">Show:</span>
                    {DAY_CARE_FILTERS.map(([value, label, title]) => (
                        <Button
                            kind={dayCareFilters.value.includes(value) ? "primary" : "ghost"}
                            title={title}
                            onClick={() => toggle(dayCareFilters, value)}
                        >
                            {label}
                        </Button>
                    ))}
                </div>
                <div class="pk-filter-row">
                    <span class="pk-small pk-muted">Sort:</span>
                    {DAY_CARE_SORTS.map(([value, label]) => (
                        <Button
                            kind={dayCareSort.value === value ? "primary" : "ghost"}
                            onClick={() => (dayCareSort.value = value)}
                        >
                            {label}
                        </Button>
                    ))}
                </div>
                {candidates.length === 0 ? (
                    <p class="pk-muted pk-small">No Pokémon in your box match.</p>
                ) : null}
                <div class="pk-box-grid">
                    {candidates.map(sid => {
                        const eggId = main.eggSpeciesOf(sid);
                        const value = main.eggValue(sid);
                        return (
                            <button
                                class={["pk-box-cell", id === sid ? "selected" : ""]}
                                title={`${getSpecies(sid).name} → ${getSpecies(eggId).name} Egg${
                                    value === 2
                                        ? " (new to your Pokédex!)"
                                        : value === 1
                                          ? " (not in your box this journey)"
                                          : ""
                                }`}
                                onClick={() => main.leaveAtDayCare(sid)}
                            >
                                <Sprite id={sid} size={48} shiny={main.box.value[sid]?.shiny} />
                                <span class="pk-daycare-egg">
                                    <Sprite
                                        id={eggId}
                                        size={24}
                                        silhouette={!dex.entry(eggId).seen}
                                    />
                                </span>
                                {value > 0 ? (
                                    <span class={["pk-daycare-mark", value === 2 ? "new" : ""]}>
                                        {value === 2 ? "★" : "•"}
                                    </span>
                                ) : null}
                            </button>
                        );
                    })}
                </div>
            </Panel>
        );
    }

    /** A tag for how useful a parent's Egg is. */
    function eggTag(parentId: number) {
        const value = main.eggValue(parentId);
        return value === 2 ? (
            <span class="pk-new-tag">New</span>
        ) : value === 1 ? (
            <span class="pk-new-tag">Not in box</span>
        ) : null;
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
            const tabs: TabOption[] = [
                { id: "party", label: "Party" },
                { id: "box", label: `PC Box (${allIds.value.length})` },
                {
                    id: "daycare",
                    label:
                        DAY_CARE_PLACE[main.region.value] != null
                            ? `Day Care (${DAY_CARE_PLACE[main.region.value]})`
                            : "Day Care",
                    show: main.dayCareOpen.value
                },
                { id: "contests", label: "Contests", show: main.mechanicOn("contests") }
            ];
            const page = currentTab("party", tabs);
            return (
                <div class="pk-layer">
                    {renderNav(true)}
                    <h2 class="pk-layer-title">Party</h2>
                    {main.inTrainerBattle.value ? (
                        <p class="pk-warning">
                            You can't change your party in the middle of a battle.
                        </p>
                    ) : null}
                    {renderTabs("party", tabs)}
                    {page === "party" ? (
                        <>
                            <div class="pk-party-grid">
                                {main.partyIds.value.map(renderPartySlot)}
                            </div>
                            {renderDetail(detailId)}
                        </>
                    ) : page === "box" ? (
                        <>
                            {renderDetail(detailId)}
                            {renderBox(detailId)}
                        </>
                    ) : page === "daycare" ? (
                        renderDayCare()
                    ) : (
                        <>
                            <div class="pk-party-grid">
                                {main.partyIds.value.map(renderPartySlot)}
                            </div>
                            {detailId != null ? renderContestHall(detailId) : null}
                        </>
                    )}
                </div>
            );
        }
    };
});

export default layer;
