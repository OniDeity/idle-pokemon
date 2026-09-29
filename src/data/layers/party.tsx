/**
 * Party & PC Box: choose your six, reorder them, and evolve Pokémon with stones or trades.
 */
import { main } from "data/projEntry";
import { createLayer } from "game/layers";
import { memberMultiplier } from "game/pokemon/balance";
import type { Evolution } from "game/pokemon/data";
import { getSpecies } from "game/pokemon/data";
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
    TypeBadges
} from "../ui/components";
import dex from "./dex";

type Sort = "dex" | "level";

const id = "party";
const layer = createLayer(id, () => {
    const name = "Party";
    const color = "#F97316";
    const selected = ref<number | null>(null);
    const sort = ref<Sort>("dex");

    const boxIds = computed(() => {
        const ids = Object.keys(main.box.value).map(Number);
        if (sort.value === "level") {
            return ids.sort((a, b) => main.box.value[b].level - main.box.value[a].level || a - b);
        }
        return ids.sort((a, b) => a - b);
    });

    /** Evolutions the player could trigger right now from the box. */
    function manualEvolutions(speciesId: number): Evolution[] {
        return getSpecies(speciesId).evolutions.filter(e => e.method !== "level");
    }

    const evolutionReady = computed(() =>
        boxIds.value.some(sid =>
            manualEvolutions(sid).some(
                e =>
                    !main.owns(e.into) &&
                    ((e.method === "stone" && (main.stones.value[e.stone!] ?? 0) > 0) ||
                        (e.method === "trade" && main.keyItems.value.linkCable === true))
            )
        )
    );

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
                    const into = getSpecies(evo.into);
                    const done = main.owns(evo.into);
                    let action;
                    if (done) {
                        action = <span class="pk-small pk-done">✔ Owned</span>;
                    } else if (evo.method === "level") {
                        action = (
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
                        const hasCable = main.keyItems.value.linkCable === true;
                        action = (
                            <Button
                                kind="primary"
                                disabled={!hasCable || main.inTrainerBattle.value}
                                onClick={() => main.evolveByTrade(speciesId)}
                                title={hasCable ? "" : "Buy a Link Cable at the Poké Mart"}
                            >
                                {hasCable ? "Trade-evolve" : "Needs Link Cable"}
                            </Button>
                        );
                    }
                    return (
                        <div class="pk-evolution">
                            <Sprite
                                id={evo.into}
                                size={40}
                                silhouette={!dex.entry(evo.into).seen}
                            />
                            <span>{dex.entry(evo.into).seen ? into.name : "???"}</span>
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
                    <Panel title={`PC Box (${boxIds.value.length})`}>
                        <div class="pk-filter-row">
                            <span class="pk-small pk-muted">Sort:</span>
                            <Button
                                kind={sort.value === "dex" ? "primary" : "ghost"}
                                onClick={() => (sort.value = "dex")}
                            >
                                Dex no.
                            </Button>
                            <Button
                                kind={sort.value === "level" ? "primary" : "ghost"}
                                onClick={() => (sort.value = "level")}
                            >
                                Level
                            </Button>
                        </div>
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
