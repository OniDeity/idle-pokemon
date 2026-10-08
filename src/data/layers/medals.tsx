/**
 * The Medal Box (Black 2 and White 2's Medal Rally): achievements kept for good. Lifetime counts
 * live here; medals that read what the Pokédex and Hall of Fame keep (species caught, regions
 * cleared) are earned from those. Every tier earned pays Fame.
 */
import { createLayer } from "game/layers";
import { persistent } from "game/persistence";
import type { MedalCategory, MedalContext, MedalDefinition, MedalStat } from "game/pokemon/medals";
import {
    MEDAL_CATEGORY_NAMES,
    MEDALS,
    medalRank,
    newMedals,
    tierFame,
    tierName,
    tierReached
} from "game/pokemon/medals";
import { itemSprite } from "game/pokemon/items";
import { REGION_LIST } from "game/pokemon/regions";
import { notify } from "data/notifications";
import { main } from "data/projEntry";
import { computed, ref } from "vue";
import type { TabOption } from "../ui/components";
import { Bar, currentTab, formatNumber, ItemIcon, Panel, renderTabs } from "../ui/components";
import type { NavNode } from "../ui/nav";
import { mobileClasses, renderNav } from "../ui/nav";
import dex from "./dex";
import hof from "./hof";

/** Seconds between medal checks. */
const CHECK_INTERVAL = 1;

const TIER_ICONS = ["🥉", "🥈", "🥇", "💎"];

const id = "medals";
const layer = createLayer(id, () => {
    const name = "Medals";
    const color = "#B45309";

    /** Lifetime counts, never reset. */
    const stats = persistent<Partial<Record<MedalStat, number>>>({}, false);
    /** Medal id → tiers earned (1 Bronze ... 4 Platinum). */
    const earned = persistent<Partial<Record<string, number>>>({}, false);
    /** Fame medals have paid in all. */
    const fameEarned = persistent<number>(0);
    /** Medal tiers earned since the Medal Box was last opened. */
    const unseen = ref(0);

    function count(stat: MedalStat, amount = 1) {
        if (amount <= 0) return;
        stats.value = { ...stats.value, [stat]: (stats.value[stat] ?? 0) + amount };
    }

    /** Keeps a record's best (the longest Poké Radar chain). */
    function record(stat: MedalStat, value: number) {
        if (value > (stats.value[stat] ?? 0)) stats.value = { ...stats.value, [stat]: value };
    }

    const context = computed(
        (): MedalContext => ({
            stats: stats.value,
            dexCaught: dex.caughtCount.value,
            shinySpecies: dex.shinyCount.value,
            variantsCaught: dex.variantCaught.value,
            clears: Object.fromEntries(REGION_LIST.map(r => [r.id, hof.clearCount(r.id)])),
            mechanicsUnlocked: Object.values(hof.mechanics.value).filter(on => on === true).length,
            platesFound: Object.values(hof.plates.value).filter(on => on === true).length,
            rangerSigns: hof.rangerSignSpecies.value.length,
            ribbons: Object.values(hof.ribbons.value).reduce(
                (sum, categories) => sum + Object.keys(categories).length,
                0
            ),
            journeys: hof.entries.value
                .filter(e => e.fame != null)
                .map(e => ({ time: e.time, challenges: e.challenges ?? [] }))
        })
    );

    const tiersEarned = computed(() =>
        Object.values(earned.value).reduce((sum: number, n) => sum + (n ?? 0), 0)
    );
    const tiersTotal = MEDALS.reduce((sum, m) => sum + m.goals.length, 0);

    /** Awards every medal tier newly reached, with its Fame. */
    function checkMedals() {
        const found = newMedals(context.value, earned.value);
        if (found.length === 0) return;
        const next = { ...earned.value };
        let fame = 0;
        for (const { medal, tier } of found) {
            next[medal.id] = Math.max(next[medal.id] ?? 0, tier);
            fame += tierFame(medal, tier);
            const text = `${TIER_ICONS[medal.goals.length === 1 ? 2 : tier - 1]} ${tierName(medal, tier)} ${medal.name} medal! (+${tierFame(medal, tier)} Fame)`;
            main.addLog({ kind: "badge", text });
            notify(text, "success", "medals", {
                key: "medal",
                many: n => `🏅 ${n} new medals!`
            });
        }
        earned.value = next;
        hof.fame.value += fame;
        fameEarned.value += fame;
        unseen.value += found.length;
    }

    let timer = 0;
    layer.on("update", diff => {
        if (main.starter.value !== 0 && main.partyIds.value.length > 0) count("playTime", diff);
        timer -= diff;
        if (timer > 0) return;
        timer = CHECK_INTERVAL;
        checkMedals();
    });

    const nav: NavNode = {
        id,
        letter: "★",
        label: "Medals",
        color,
        glow: computed((): boolean => unseen.value > 0),
        enabled: computed((): boolean => true)
    };

    function goalText(medal: MedalDefinition, goal: number) {
        const shown = medal.format?.(goal) ?? formatNumber(goal);
        return medal.description.replace("{n}", shown);
    }

    function renderMedal(medal: MedalDefinition) {
        const value = medal.value(context.value);
        const tiers = earned.value[medal.id] ?? 0;
        const reached = tierReached(medal, value);
        const next = medal.goals[Math.max(tiers, reached)];
        const done = tiers >= medal.goals.length;
        const icon = tiers > 0 ? TIER_ICONS[medal.goals.length === 1 ? 2 : tiers - 1] : "⬜";
        const shownValue = Number.isFinite(value)
            ? (medal.format?.(Math.floor(value)) ?? formatNumber(Math.floor(value)))
            : "—";
        return (
            <div class={["pk-medal", tiers > 0 ? "earned" : ""]}>
                <span class="pk-medal-icon">{icon}</span>
                <div class="pk-medal-info">
                    <b>{medal.name}</b>{" "}
                    <span class="pk-muted pk-small">
                        {tiers > 0
                            ? `${tierName(medal, tiers)}${medal.goals.length > 1 ? ` (${tiers}/${medal.goals.length})` : ""}`
                            : "Not yet"}
                    </span>
                    <div class="pk-small">
                        {done
                            ? goalText(medal, medal.goals[medal.goals.length - 1])
                            : goalText(medal, next)}
                    </div>
                    {!done && medal.goals.length > 1 && !medal.lowerIsBetter ? (
                        <>
                            <Bar value={Math.min(value, next)} max={next} kind="progress" />
                            <div class="pk-small pk-muted">
                                {shownValue} / {medal.format?.(next) ?? formatNumber(next)} · next
                                tier +{tierFame(medal, tiers + 1)} Fame
                            </div>
                        </>
                    ) : !done ? (
                        <div class="pk-small pk-muted">
                            {medal.lowerIsBetter ? `Best: ${shownValue} · ` : ""}+
                            {tierFame(medal, tiers + 1)} Fame
                        </div>
                    ) : null}
                </div>
            </div>
        );
    }

    return {
        name,
        color,
        minWidth: 480,
        minimizable: false,
        classes: mobileClasses(id),
        stats,
        earned,
        fameEarned,
        tiersEarned,
        count,
        record,
        checkMedals,
        nav,
        display: () => {
            const categories = Object.keys(MEDAL_CATEGORY_NAMES) as MedalCategory[];
            const tabs: TabOption[] = categories.map(category => {
                const medals = MEDALS.filter(m => m.category === category);
                const got = medals.filter(m => (earned.value[m.id] ?? 0) > 0).length;
                return {
                    id: category,
                    label: `${MEDAL_CATEGORY_NAMES[category]} (${got}/${medals.length})`
                };
            });
            const page = currentTab("medals", tabs);
            unseen.value = 0;
            return (
                <div class="pk-layer">
                    {renderNav(true)}
                    <h2 class="pk-layer-title">Medal Box</h2>
                    <Panel>
                        <div class="pk-filter-row">
                            <ItemIcon src={itemSprite("medal-box")} alt="Medal Box" />
                            <span>
                                Medal Rally rank: <b>{medalRank(tiersEarned.value)}</b> ·{" "}
                                {tiersEarned.value}/{tiersTotal} medal tiers · +
                                {formatNumber(fameEarned.value)} Fame from medals
                            </span>
                        </div>
                        <p class="pk-small pk-muted">
                            Mr. Medal hands out medals for everything you do, on every journey. Each
                            tier (🥉 Bronze, 🥈 Silver, 🥇 Gold, 💎 Platinum) pays Fame the moment
                            you reach it, and medals are kept for good.
                        </p>
                    </Panel>
                    {renderTabs("medals", tabs)}
                    <Panel>{MEDALS.filter(m => m.category === page).map(renderMedal)}</Panel>
                </div>
            );
        }
    };
});

export default layer;
