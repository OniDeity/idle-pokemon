/**
 * The Poké Mart: balls, evolution items (stones, Link Cables, Soothe Bells), and Pokédollar upgrades.
 * Upgrades are part of the journey and reset on entering the Hall of Fame.
 */
import { main, POKE_SNACK_PRICE } from "data/projEntry";
import { createLayer } from "game/layers";
import { persistent } from "game/persistence";
import type { MartUpgradeId, UpgradeDefinition } from "game/pokemon/balance";
import { MART_UPGRADE_LIST, upgradeCost } from "game/pokemon/balance";
import type { BallId } from "game/pokemon/items";
import { APRICORN_BALLS, BALLS, itemSprite, STONE_DESCRIPTIONS, STONES } from "game/pokemon/items";
import { zonesIn } from "game/pokemon/zones";
import { computed } from "vue";
import type { NavNode } from "../ui/nav";
import { mobileClasses, renderNav } from "../ui/nav";
import type { TabOption } from "../ui/components";
import { Button, currentTab, formatMoney, ItemIcon, Panel, renderTabs } from "../ui/components";

const id = "mart";
const layer = createLayer(id, () => {
    const name = "Poké Mart";
    const color = "#3B82F6";

    const levels = persistent<Partial<Record<MartUpgradeId, number>>>({}, false);

    function level(upgrade: MartUpgradeId) {
        return levels.value[upgrade] ?? 0;
    }

    function buyUpgrade(upgrade: UpgradeDefinition & { id: MartUpgradeId }) {
        const current = level(upgrade.id);
        if (current >= upgrade.maxLevel || main.martTier.value < upgrade.badgesRequired) return;
        if (!main.spend(upgradeCost(upgrade, current))) return;
        levels.value = { ...levels.value, [upgrade.id]: current + 1 };
    }

    const nav: NavNode = {
        id,
        letter: "$",
        label: "Mart",
        color,
        glow: computed(
            (): boolean =>
                main.starter.value !== 0 &&
                main.balls.value.pokeBall +
                    main.balls.value.greatBall +
                    main.balls.value.ultraBall ===
                    0
        ),
        enabled: computed((): boolean => true)
    };

    function renderBall(ball: BallId) {
        const def = BALLS[ball];
        const price = def.price;
        const unlocked = main.martTier.value >= def.badgesRequired;
        return (
            <div class={["pk-shop-row", unlocked ? "" : "locked"]}>
                <ItemIcon src={def.sprite} alt={def.name} />
                <div class="pk-shop-info">
                    <b>{def.name}</b> <span class="pk-muted">×{main.balls.value[ball] ?? 0}</span>
                    <div class="pk-small">
                        {unlocked
                            ? `${def.description ?? `${def.catchMultiplier}× catch rate`} · ${formatMoney(price ?? 0)} each`
                            : `Stocked after ${def.badgesRequired} badges`}
                    </div>
                </div>
                {unlocked && price != null ? (
                    <div class="pk-shop-actions">
                        {[1, 10, 100].map(n => (
                            <Button
                                kind="small"
                                disabled={main.money.value < price * n}
                                onClick={() => main.buyBalls(ball, n)}
                            >
                                +{n}
                            </Button>
                        ))}
                    </div>
                ) : null}
            </div>
        );
    }

    function renderUpgrade(upgrade: UpgradeDefinition & { id: MartUpgradeId }) {
        const current = level(upgrade.id);
        const unlocked = main.martTier.value >= upgrade.badgesRequired;
        const maxed = current >= upgrade.maxLevel;
        const cost = upgradeCost(upgrade, current);
        return (
            <div class={["pk-shop-row", unlocked ? "" : "locked"]}>
                <ItemIcon src={upgrade.sprite} alt={upgrade.name} />
                <div class="pk-shop-info">
                    <b>{upgrade.name}</b>{" "}
                    <span class="pk-muted">
                        Lv. {current}/{upgrade.maxLevel}
                    </span>
                    <div class="pk-small">
                        {unlocked
                            ? upgrade.description
                            : `Stocked after ${upgrade.badgesRequired} badge${
                                  upgrade.badgesRequired === 1 ? "" : "s"
                              }`}
                    </div>
                </div>
                {unlocked ? (
                    <Button
                        kind="primary"
                        disabled={maxed || main.money.value < cost}
                        onClick={() => buyUpgrade(upgrade)}
                    >
                        {maxed ? "Maxed" : formatMoney(cost)}
                    </Button>
                ) : null}
            </div>
        );
    }

    return {
        name,
        color,
        minWidth: 480,
        minimizable: false,
        classes: mobileClasses(id),
        levels,
        buyUpgrade,
        nav,
        display: () => {
            const snacks = zonesIn(main.region.value).some(
                z => z.pokeSpot === true && (z.mechanic == null || main.mechanicOn(z.mechanic))
            );
            const tabs: TabOption[] = [
                { id: "balls", label: "Poké Balls" },
                { id: "training", label: "Training" },
                { id: "items", label: "Evolution items" },
                { id: "snacks", label: "Poké Snacks", show: snacks }
            ];
            const page = currentTab("mart", tabs);
            return (
                <div class="pk-layer">
                    {renderNav(true)}
                    <h2 class="pk-layer-title">Poké Mart</h2>
                    <div class="pk-money-big">{formatMoney(main.money.value)}</div>
                    {renderTabs("mart", tabs)}

                    {page === "balls" ? (
                        <Panel>
                            {(["pokeBall", "greatBall", "ultraBall"] as BallId[]).map(renderBall)}
                            {main.mechanicOn("apricornBalls") ? (
                                <>
                                    <div class="pk-small pk-muted">
                                        Kurt's Apricorn Balls, stocked in every region once you've
                                        met him in Azalea Town. Smart throwing picks whichever ball
                                        works best.
                                    </div>
                                    {APRICORN_BALLS.map(renderBall)}
                                </>
                            ) : main.region.value === "johto" ? (
                                <div class="pk-small pk-muted">
                                    🔒 Kurt's Apricorn Balls: reach Azalea Town after the Hive
                                    Badge, and every region's Poké Mart stocks them from then on.
                                </div>
                            ) : null}
                            {main.balls.value.masterBall > 0 ? (
                                <div class="pk-shop-row">
                                    <ItemIcon src={BALLS.masterBall.sprite} alt="Master Ball" />
                                    <div class="pk-shop-info">
                                        <b>Master Ball</b>{" "}
                                        <span class="pk-muted">×{main.balls.value.masterBall}</span>
                                        <div class="pk-small">
                                            Never fails. Saved for legendary Pokémon.
                                        </div>
                                    </div>
                                </div>
                            ) : null}
                        </Panel>
                    ) : null}

                    {page === "snacks" ? (
                        <Panel>
                            <div class="pk-shop-row">
                                <ItemIcon src={itemSprite("honey")} alt="Poké Snacks" />
                                <div class="pk-shop-info">
                                    <b>Poké Snacks</b>{" "}
                                    <span class="pk-muted">×{main.pokeSnacks.value}</span>
                                    <div class="pk-small">
                                        Lure wild Pokémon to the Poké Spots: each encounter there
                                        eats one. {formatMoney(POKE_SNACK_PRICE)} each.
                                    </div>
                                </div>
                                <div class="pk-shop-actions">
                                    {[10, 100].map(n => (
                                        <Button
                                            kind="small"
                                            disabled={main.money.value < POKE_SNACK_PRICE * n}
                                            onClick={() => main.buyPokeSnacks(n)}
                                        >
                                            ×{n}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        </Panel>
                    ) : null}

                    {page === "training" ? (
                        <Panel>{MART_UPGRADE_LIST.map(renderUpgrade)}</Panel>
                    ) : null}

                    {page === "items" ? (
                        <Panel>
                            {Object.values(STONES).map(stone => {
                                const unlocked = main.martTier.value >= stone.badgesRequired;
                                return (
                                    <div class={["pk-shop-row", unlocked ? "" : "locked"]}>
                                        <ItemIcon src={stone.sprite} alt={stone.name} />
                                        <div class="pk-shop-info">
                                            <b>{stone.name}</b>{" "}
                                            <span class="pk-muted">
                                                ×{main.stones.value[stone.id] ?? 0}
                                            </span>
                                            <div class="pk-small">
                                                {unlocked
                                                    ? (STONE_DESCRIPTIONS[stone.id] ??
                                                      "Use from the Party screen to evolve certain Pokémon.")
                                                    : `Stocked after ${stone.badgesRequired} badge${
                                                          stone.badgesRequired === 1 ? "" : "s"
                                                      }`}
                                            </div>
                                        </div>
                                        {unlocked ? (
                                            <Button
                                                kind="primary"
                                                disabled={main.money.value < stone.price}
                                                onClick={() => main.buyStone(stone.id)}
                                            >
                                                {formatMoney(stone.price)}
                                            </Button>
                                        ) : null}
                                    </div>
                                );
                            })}
                        </Panel>
                    ) : null}
                </div>
            );
        }
    };
});

export default layer;
