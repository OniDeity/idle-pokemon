/**
 * The Pokédex. Permanent: survives Hall of Fame resets, and its milestones (and the damage
 * bonus from every species caught) carry into every future journey.
 */
import { CATEGORY_NAMES, CONTEST_CATEGORIES, CONTEST_PIKACHU } from "game/pokemon/contests";
import { createLayer } from "game/layers";
import { persistent } from "game/persistence";
import {
    DEX_MILESTONES,
    DEX_DAMAGE_BONUS_PER_SPECIES,
    memberMultiplier,
    SHINY_BONUS_PER_VARIANT
} from "game/pokemon/balance";
import type { Species } from "game/pokemon/data";
import { POKEDEX_SET, POKEDEX_SIZE } from "game/pokemon/pokedex";
import {
    ALTERNATE_EVOLUTIONS,
    getSpecies,
    isVariant,
    PRE_EVOLUTION,
    shadowOf,
    SPECIES,
    VARIANT_SPECIES,
    WILD_VARIANTS
} from "game/pokemon/data";
import { STONES } from "game/pokemon/items";
import { REGION_LIST, REGIONS } from "game/pokemon/regions";
import { SPECIAL_ENCOUNTERS, specialSpecies } from "game/pokemon/specials";
import type { RegionId } from "game/pokemon/zones";
import { allZoneSpecies, ZONES } from "game/pokemon/zones";
import { SHADOW_TRAINERS } from "game/pokemon/colosseum";
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
    TypeBadges
} from "../ui/components";

export type DexEntry = {
    seen: boolean;
    caught: boolean;
    shiny: boolean;
    timesCaught: number;
};

const EMPTY: DexEntry = { seen: false, caught: false, shiny: false, timesCaught: 0 };

type Filter = "all" | "caught" | "missing" | "shiny" | "kanto" | "johto" | "hoenn" | "variants";

/** Where a species can be found: wild zones, specials, or by evolving something. */
function locationsOf(id: number): string[] {
    const places: string[] = [];
    const species = getSpecies(id);
    // Female forms turn up wherever their species does.
    const wildId = species.variant === "female" ? species.baseSpecies! : id;
    for (const zone of ZONES) {
        if (allZoneSpecies(zone.id).includes(wildId)) {
            const owner = SHADOW_TRAINERS[id];
            places.push(
                `${REGIONS[zone.region].name}: ${zone.name}${zone.anime ? " (anime)" : ""}${
                    owner != null ? ` (snag from ${owner})` : ""
                }`
            );
        }
    }
    if (species.variant === "shadow") {
        for (const [region, trainer] of shadowSnagTrainers(species.baseSpecies!)) {
            places.push(`${REGIONS[region].name}: snag from ${trainer} after beating them`);
        }
        places.push(
            "Cipher Peons in every region outside Orre, once the Snag Machine is unlocked (2% of encounters)"
        );
    } else if (!isVariant(id) && shadowInOrre(id)) {
        places.push("Purify its Shadow form, snagged in Orre, at the Relic Stone");
    }
    for (const category of CONTEST_CATEGORIES) {
        if (CONTEST_PIKACHU[category] === id) {
            places.push(
                `Contest Hall: your first ${CATEGORY_NAMES[category]} Master Rank win (Pokémon Contests, unlocked in Hoenn)`
            );
        }
    }
    for (const special of SPECIAL_ENCOUNTERS) {
        if (special.kind !== "boss" && specialSpecies(special).includes(id)) {
            const how =
                special.kind === "trade"
                    ? `trade (show a ${getSpecies(special.wants).name})`
                    : special.kind === "legendary"
                      ? "legendary encounter"
                      : special.pool != null
                        ? "Egg"
                        : special.price != null
                          ? `₽${special.price.toLocaleString("en-US")}`
                          : "gift";
            places.push(`${REGIONS[special.region].name}: ${special.place} (${how})`);
        }
    }
    for (const [base, { chance, variants }] of Object.entries(WILD_VARIANTS)) {
        if (variants.some(([variantId]) => variantId === id)) {
            const share = variants.find(([v]) => v === id)![1];
            const total = variants.reduce((sum, [, w]) => sum + w, 0);
            const percent = Math.max(1, Math.round(chance * (share / total) * 100));
            places.push(
                `About ${percent}% of wild ${getSpecies(Number(base)).name} look like this`
            );
        }
    }
    for (const [into, alternates] of Object.entries(ALTERNATE_EVOLUTIONS)) {
        const pre = PRE_EVOLUTION[Number(into)];
        if (alternates.includes(id) && pre != null) {
            places.push(
                `Evolve a second ${getSpecies(pre).name} once you own ${getSpecies(Number(into)).name}`
            );
        }
    }
    if (species.rodTier != null && species.baseSpecies === 129) {
        places.push(
            `Any Magikarp you meet, once Roddy's Old Rod (Hall of Fame) reaches level ${species.rodTier}`
        );
    }
    if (species.variant === "female" && PRE_EVOLUTION[id] == null) {
        const pre = PRE_EVOLUTION[wildId];
        if (pre != null) {
            places.push(
                `Evolve a second ${getSpecies(pre).name} once you own ${species.name.replace(" ♀", "")}`
            );
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
                  : evo?.heldItem != null
                    ? `by trade (Link Cable, holding a ${STONES[evo.heldItem].name})`
                    : "by trade (Link Cable)";
        places.push(`Evolve ${getSpecies(pre).name} ${how}`);
    }
    for (const region of REGION_LIST) {
        if (region.starters.includes(id)) {
            places.push(`Starter Pokémon for a ${region.name} journey`);
        }
        if (region.partnerStarters?.includes(id)) {
            places.push(`Partner starter for a ${region.name} journey, once you've cleared it`);
        }
    }
    if (places.length === 0) {
        places.push(
            species.nativeRegion != null && !(species.nativeRegion in REGIONS)
                ? `Arrives with the ${species.nativeRegion[0].toUpperCase()}${species.nativeRegion.slice(1)} region.`
                : "Not found in any region yet."
        );
    }
    return places;
}

/** The trainers whose Shadow Pokémon of this species are snagged by beating them. */
function shadowSnagTrainers(baseSpecies: number): [RegionId, string][] {
    return REGION_LIST.flatMap(region =>
        [...region.trials, ...region.finale(region.starters[0])]
            .filter(t => t.snag?.includes(baseSpecies))
            .map((t): [RegionId, string] => [region.id, `${t.title} ${t.name}`])
    );
}

/** Whether a species' Shadow form is met in Orre (to snag, then purify). */
function shadowInOrre(id: number): boolean {
    const shadow = shadowOf(id);
    return (
        ZONES.some(zone => zone.trainerBattles && allZoneSpecies(zone.id).includes(shadow)) ||
        shadowSnagTrainers(id).length > 0
    );
}

/** Whether a form can be obtained in the regions that exist so far. */
function obtainable(id: number, depth = 0): boolean {
    if (depth > 4) return false;
    const species = getSpecies(id);
    // Shadow forms: Orre's, and Cipher Peons' Shadow versions of anything obtainable.
    if (species.variant === "shadow") {
        return shadowInOrre(species.baseSpecies!) || obtainable(species.baseSpecies!, depth + 1);
    }
    const wildId = species.variant === "female" ? species.baseSpecies! : id;
    if (species.rodTier != null && species.baseSpecies === 129) return true;
    if (Object.values(CONTEST_PIKACHU).includes(id)) return true;
    for (const [base, { variants }] of Object.entries(WILD_VARIANTS)) {
        if (variants.some(([v]) => v === id)) return obtainable(Number(base), depth + 1);
    }
    for (const [into, alternates] of Object.entries(ALTERNATE_EVOLUTIONS)) {
        if (alternates.includes(id)) return obtainable(Number(into), depth + 1);
    }
    if (
        ZONES.some(zone => allZoneSpecies(zone.id).includes(wildId)) ||
        SPECIAL_ENCOUNTERS.some(s => specialSpecies(s).includes(id)) ||
        REGION_LIST.some(r => r.starters.includes(id) || r.partnerStarters?.includes(id))
    ) {
        return true;
    }
    const pre =
        PRE_EVOLUTION[id] ?? (species.variant === "female" ? PRE_EVOLUTION[wildId] : undefined);
    return pre != null && obtainable(pre, depth + 1);
}

/** Forms placed in the game so far; the rest arrive with their regions. */
const PLACED_VARIANTS = VARIANT_SPECIES.filter(v => obtainable(v.id));
const FUTURE_VARIANTS = VARIANT_SPECIES.length - PLACED_VARIANTS.length;

const id = "dex";
const layer = createLayer(id, () => {
    const name = "Pokédex";
    const color = "#DC0A2D";

    const entries = persistent<Record<string, DexEntry>>({}, false);
    const filter = ref<Filter>("all");
    const selected = ref<number>(1);

    /** Regular species only; variants are counted separately. */
    const list = computed(() =>
        Object.entries(entries.value)
            .filter(([key]) => !isVariant(Number(key)))
            .map(([, e]) => e)
    );
    const seenCount = computed(() => list.value.filter(e => e.seen).length);
    const caughtCount = computed(() => list.value.filter(e => e.caught).length);
    const shinyCount = computed(() => list.value.filter(e => e.shiny).length);
    const variantCaught = computed(
        () => PLACED_VARIANTS.filter(v => entries.value[v.id]?.caught === true).length
    );

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
        // A form also fills in its species' entry: a Pinkan Pikachu is still a Pikachu.
        const base = getSpecies(speciesId).baseSpecies;
        if (base != null && !entry(base).caught) {
            const b = entry(base);
            entries.value = {
                ...entries.value,
                [base]: { ...b, seen: true, caught: true, shiny: b.shiny || shiny }
            };
        }
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

    const nav: NavNode = {
        id,
        letter: "D",
        label: "Dex",
        color,
        glow: computed((): boolean => false),
        enabled: computed((): boolean => true)
    };

    const visibleSpecies = computed(() =>
        (filter.value === "variants"
            ? PLACED_VARIANTS
            : SPECIES.filter(s => POKEDEX_SET.has(s.id))
        ).filter(s => {
            const e = entry(s.id);
            switch (filter.value) {
                case "caught":
                    return e.caught;
                case "missing":
                    return !e.caught;
                case "shiny":
                    return e.shiny;
                case "kanto":
                    return s.id <= 151;
                case "variants":
                    return true;
                case "johto":
                    return s.id > 151 && s.id <= 251;
                case "hoenn":
                    return s.id > 251 && s.id <= 386;
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
        ["shiny", "Shiny"],
        ["kanto", "#1–151"],
        ["johto", "#152–251"],
        ...(POKEDEX_SIZE > 251 ? [["hoenn", "#252–386"] as [Filter, string]] : []),
        ["variants", "Variants"]
    ];

    return {
        name,
        color,
        minWidth: 480,
        minimizable: false,
        classes: mobileClasses(id),
        entries,
        seenCount,
        caughtCount,
        variantCaught,
        shinyCount,
        markSeen,
        markCaught,
        timesCaught,
        entry,
        nav,
        display: () => (
            <div class="pk-layer">
                {renderNav(true)}
                <h2 class="pk-layer-title">Pokédex</h2>
                <div class="pk-dex-summary">
                    <div>
                        Seen <b>{seenCount.value}</b> · Caught <b>{caughtCount.value}</b> /{" "}
                        {POKEDEX_SIZE} · Shiny <b>{shinyCount.value}</b> · Variants{" "}
                        <b>{variantCaught.value}</b> / {PLACED_VARIANTS.length}
                    </div>
                    <Bar value={caughtCount.value} max={POKEDEX_SIZE} kind="progress" />
                    <div class="pk-muted">
                        Every species caught gives +{DEX_DAMAGE_BONUS_PER_SPECIES * 100}% damage
                        (now +{Math.round(caughtCount.value * DEX_DAMAGE_BONUS_PER_SPECIES * 100)}
                        %); every variant gives +{SHINY_BONUS_PER_VARIANT * 100}% shiny chance (now
                        +{Math.round(variantCaught.value * SHINY_BONUS_PER_VARIANT * 100)}%). The
                        Pokédex is never reset.
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

                {filter.value === "variants" ? (
                    <p class="pk-small pk-muted">
                        Anime variants, legendary giants and clones, regional and official forms,
                        female forms, Magikarp Jump patterns and fan favorites from Cobblemon.{" "}
                        {FUTURE_VARIANTS} more forms arrive with regions still to come.
                    </p>
                ) : null}
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
                                    <span class="pk-dex-cell-num">
                                        {species.baseSpecies ?? species.id}
                                    </span>
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
