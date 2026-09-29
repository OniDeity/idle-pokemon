/**
 * The Hall of Fame: the prestige layer. After becoming Champion, the player can enshrine their
 * team and start a new journey, trading their run for Fame and permanent upgrades.
 * The Pokédex is kept.
 */
import { main, openLayer } from "data/projEntry";
import { createReset } from "features/reset";
import { createLayer } from "game/layers";
import { persistent } from "game/persistence";
import type { HofUpgradeId, UpgradeDefinition } from "game/pokemon/balance";
import { fameGain, HOF_UPGRADE_LIST, upgradeCost } from "game/pokemon/balance";
import { getSpecies } from "game/pokemon/data";
import { computed } from "vue";
import type { NavNode } from "../ui/nav";
import { Button, formatDuration, formatNumber, ItemIcon, Panel, Sprite } from "../ui/components";
import dex from "./dex";
import mart from "./mart";

export type HallOfFameEntry = {
    run: number;
    time: number;
    dexCaught: number;
    team: { id: number; level: number; shiny: boolean }[];
};

const id = "hof";
const layer = createLayer(id, () => {
    const name = "Hall of Fame";
    const color = "#EAB308";

    const fame = persistent<number>(0);
    const levels = persistent<Partial<Record<HofUpgradeId, number>>>({}, false);
    const entries = persistent<HallOfFameEntry[]>([], false);
    const timesEntered = persistent<number>(0);

    function level(upgrade: HofUpgradeId) {
        return levels.value[upgrade] ?? 0;
    }

    const pendingFame = computed(() =>
        fameGain(dex.caughtCount.value, dex.shinyCount.value, timesEntered.value)
    );

    function recordChampionTeam(team: { id: number; level: number; shiny: boolean }[]) {
        entries.value = [
            ...entries.value,
            {
                run: timesEntered.value + 1,
                time: main.runTime.value,
                dexCaught: dex.caughtCount.value,
                team: team.map(({ id, level, shiny }) => ({ id, level, shiny }))
            }
        ];
    }

    const reset = createReset(() => ({
        thingsToReset: (): Record<string, unknown>[] => [main, mart]
    }));

    function enterHallOfFame() {
        if (!main.champion.value) return;
        const gain = pendingFame.value;
        fame.value += gain;
        timesEntered.value++;
        reset.reset();
        main.resetTransient();
        main.addLog({
            kind: "badge",
            text: `Your team was enshrined in the Hall of Fame (+${gain} Fame). A new journey begins!`
        });
        openLayer("map");
    }

    function buyUpgrade(upgrade: UpgradeDefinition & { id: HofUpgradeId }) {
        const current = level(upgrade.id);
        const cost = upgradeCost(upgrade, current);
        if (current >= upgrade.maxLevel || fame.value < cost) return;
        fame.value -= cost;
        levels.value = { ...levels.value, [upgrade.id]: current + 1 };
    }

    const nav: NavNode = {
        id,
        letter: "H",
        label: "Fame",
        color,
        glow: computed((): boolean => main.champion.value),
        enabled: computed((): boolean => main.champion.value || timesEntered.value > 0)
    };

    return {
        name,
        color,
        minWidth: 480,
        minimizable: false,
        fame,
        levels,
        entries,
        timesEntered,
        pendingFame,
        recordChampionTeam,
        reset,
        nav,
        display: () => (
            <div class="pk-layer">
                <h2 class="pk-layer-title">Hall of Fame</h2>
                <div class="pk-money-big">{formatNumber(fame.value)} Fame</div>

                <Panel title="Enter the Hall of Fame">
                    <p>
                        Enshrine your champion team and begin a <b>new journey</b> from Pallet Town.
                        You'll pick a new starter and lose your money, badges, Pokémon, items and
                        Poké Mart upgrades — but{" "}
                        <b>your Pokédex, its rewards, and Fame upgrades stay</b>, so every journey
                        is faster than the last.
                    </p>
                    <Button
                        kind="primary"
                        disabled={!main.champion.value}
                        onClick={enterHallOfFame}
                    >
                        {main.champion.value
                            ? `Enter the Hall of Fame (+${pendingFame.value} Fame)`
                            : "Become Champion to enter"}
                    </Button>
                    <p class="pk-small pk-muted">
                        Fame earned: 3 + 1 per 5 species caught + 2 per shiny species
                        {timesEntered.value === 0 ? " (×1.5 for your first time)" : ""}.
                    </p>
                </Panel>

                <Panel title="Fame upgrades">
                    {HOF_UPGRADE_LIST.map(upgrade => {
                        const current = level(upgrade.id);
                        const cost = upgradeCost(upgrade, current);
                        const maxed = current >= upgrade.maxLevel;
                        return (
                            <div class="pk-shop-row">
                                <ItemIcon src={upgrade.sprite} alt={upgrade.name} />
                                <div class="pk-shop-info">
                                    <b>{upgrade.name}</b>{" "}
                                    <span class="pk-muted">
                                        Lv. {current}/{upgrade.maxLevel}
                                    </span>
                                    <div class="pk-small">{upgrade.description}</div>
                                </div>
                                <Button
                                    kind="primary"
                                    disabled={maxed || fame.value < cost}
                                    onClick={() => buyUpgrade(upgrade)}
                                >
                                    {maxed ? "Maxed" : `${formatNumber(cost)} Fame`}
                                </Button>
                            </div>
                        );
                    })}
                </Panel>

                <Panel title="Champions">
                    {entries.value.length === 0 ? (
                        <p class="pk-muted">No one has been enshrined yet.</p>
                    ) : (
                        [...entries.value].reverse().map(entry => (
                            <div class="pk-hof-entry">
                                <div class="pk-hof-entry-head">
                                    <b>Journey #{entry.run}</b>
                                    <span class="pk-muted">
                                        {formatDuration(entry.time)} · {entry.dexCaught} species
                                    </span>
                                </div>
                                <div class="pk-hof-team">
                                    {entry.team.map(p => (
                                        <div class="pk-hof-mon" title={getSpecies(p.id).name}>
                                            <Sprite id={p.id} shiny={p.shiny} size={48} />
                                            <span class="pk-small">Lv. {p.level}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))
                    )}
                </Panel>
            </div>
        )
    };
});

export default layer;
