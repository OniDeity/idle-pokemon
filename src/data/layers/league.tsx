/**
 * Gym Leaders, the Elite Four and the Champion. Every challenge shows an exact forecast,
 * because trainer battles are deterministic: what you see is what will happen.
 */
import { main } from "data/projEntry";
import { createLayer } from "game/layers";
import { assetUrl } from "game/pokemon/assets";
import type { TrainerBattleOutcome } from "game/pokemon/balance";
import { simulateTrainerBattle } from "game/pokemon/balance";
import { getSpecies } from "game/pokemon/data";
import { KEY_ITEMS } from "game/pokemon/items";
import type { TrainerDefinition } from "game/pokemon/trainers";
import { ELITE_FOUR, GYMS, LEVEL_CAPS } from "game/pokemon/trainers";
import { computed } from "vue";
import type { NavNode } from "../ui/nav";
import {
    Button,
    formatDuration,
    formatMoney,
    ItemIcon,
    Panel,
    Sprite,
    TypeBadge
} from "../ui/components";

export function badgeSprite(n: number) {
    return assetUrl(`badges/${n}.png`);
}

const id = "league";
const layer = createLayer(id, () => {
    const name = "Pokémon League";
    const color = "#A855F7";

    function forecast(trainer: TrainerDefinition): TrainerBattleOutcome {
        return simulateTrainerBattle(
            main.partyBattlers.value,
            trainer,
            main.bonuses.value.damage,
            main.bonuses.value.hp
        );
    }

    const nextGym = computed(() => GYMS[main.badges.value]);
    const nextReady = computed(() => {
        if (main.badges.value < 8) {
            return nextGym.value != null && forecast(nextGym.value).won;
        }
        return (
            !main.champion.value && [...ELITE_FOUR, main.champ.value].every(t => forecast(t).won)
        );
    });

    const nav: NavNode = {
        id,
        letter: "L",
        label: "League",
        color,
        glow: computed((): boolean => nextReady.value && !main.inTrainerBattle.value),
        enabled: computed((): boolean => true)
    };

    function renderForecast(outcome: TrainerBattleOutcome) {
        if (outcome.won) {
            return (
                <div class="pk-forecast win">
                    ✔ Forecast: <b>victory</b> in {formatDuration(outcome.time)} with{" "}
                    {Math.round(outcome.hpRemaining * 100)}% HP left
                </div>
            );
        }
        const progress = outcome.state.enemyIndex;
        return (
            <div class="pk-forecast lose">
                ✘ Forecast: <b>{outcome.reason === "timeout" ? "out of time" : "defeat"}</b> — you'd
                beat {progress} of their Pokémon
            </div>
        );
    }

    function renderTeam(trainer: TrainerDefinition, reveal: boolean) {
        return (
            <div class="pk-trainer-team">
                {trainer.team.map(p => (
                    <div class="pk-trainer-mon" title={reveal ? getSpecies(p.id).name : "???"}>
                        <Sprite id={p.id} size={48} silhouette={!reveal} />
                        <span class="pk-small">Lv. {p.level}</span>
                    </div>
                ))}
            </div>
        );
    }

    function renderTrainerHeader(trainer: TrainerDefinition, extra?: unknown) {
        return (
            <div class="pk-trainer-head">
                <div>
                    <b>{trainer.name}</b>{" "}
                    {trainer.specialty ? <TypeBadge type={trainer.specialty} small /> : null}
                    <div class="pk-small pk-muted">{trainer.title}</div>
                </div>
                {extra}
            </div>
        );
    }

    function renderGyms() {
        return GYMS.map(gym => {
            const earned = main.badges.value >= gym.badgeNumber;
            const isNext = main.badges.value === gym.badgeNumber - 1;
            const locked = main.badges.value < gym.badgeNumber - 1;
            return (
                <div
                    class={[
                        "pk-gym",
                        earned ? "earned" : "",
                        isNext ? "next" : "",
                        locked ? "locked" : ""
                    ]}
                >
                    <img
                        class={["pk-badge-img", earned ? "" : "unearned"]}
                        src={badgeSprite(gym.badgeNumber)}
                        alt={gym.badge}
                        width={40}
                        height={40}
                    />
                    <div class="pk-gym-body">
                        {renderTrainerHeader(
                            gym,
                            <span class="pk-small pk-muted">
                                {gym.town} · {gym.badge}
                            </span>
                        )}
                        {locked ? (
                            <p class="pk-small pk-muted">Earn the previous badge first.</p>
                        ) : (
                            <>
                                {renderTeam(gym, true)}
                                <p class="pk-quote">“{gym.quote}”</p>
                                <div class="pk-small">
                                    Reward: {formatMoney(gym.prizeMoney)}, level cap →{" "}
                                    {LEVEL_CAPS[gym.badgeNumber]}
                                    {gym.keyItems.length > 0
                                        ? `, ${gym.keyItems.map(k => KEY_ITEMS[k].name).join(", ")}`
                                        : ""}
                                    . {gym.rewardText}
                                </div>
                                {isNext ? (
                                    <div class="pk-challenge-row">
                                        {renderForecast(forecast(gym))}
                                        <Button
                                            kind="primary"
                                            disabled={main.inTrainerBattle.value}
                                            onClick={() => main.challengeGym(gym)}
                                        >
                                            Challenge ({formatDuration(gym.timeLimit)} limit)
                                        </Button>
                                    </div>
                                ) : null}
                            </>
                        )}
                    </div>
                </div>
            );
        });
    }

    function renderLeague() {
        const unlocked = main.badges.value >= 8;
        const trainers = [...ELITE_FOUR, main.champ.value];
        const outcomes = unlocked ? trainers.map(forecast) : [];
        const allWin = outcomes.every(o => o.won);
        return (
            <Panel title="Indigo Plateau">
                {!unlocked ? (
                    <p class="pk-muted">
                        The guards at Route 23 only let trainers with all 8 badges through.
                    </p>
                ) : (
                    <>
                        <p class="pk-small">
                            Face the Elite Four and the Champion back-to-back (your party is healed
                            between battles). Lose once and you start over.
                        </p>
                        {trainers.map((trainer, i) => (
                            <div class="pk-league-trainer">
                                {renderTrainerHeader(trainer)}
                                {renderTeam(trainer, true)}
                                {renderForecast(outcomes[i])}
                            </div>
                        ))}
                        <Button
                            kind="primary"
                            disabled={main.inTrainerBattle.value}
                            onClick={main.challengeLeague}
                        >
                            {main.champion.value
                                ? "Defend your title"
                                : "Challenge the Pokémon League"}
                            {allWin ? "" : " (forecast: defeat)"}
                        </Button>
                        {main.champion.value ? (
                            <p class="pk-small">
                                🏆 You are the Champion! The Hall of Fame is open, and Cerulean Cave
                                awaits. Level cap raised to {LEVEL_CAPS[9]}.
                            </p>
                        ) : null}
                    </>
                )}
            </Panel>
        );
    }

    return {
        name,
        color,
        minWidth: 480,
        minimizable: false,
        nav,
        display: () => (
            <div class="pk-layer">
                <h2 class="pk-layer-title">Pokémon League</h2>
                <div class="pk-badge-case">
                    {GYMS.map(gym => (
                        <img
                            class={[
                                "pk-badge-img",
                                main.badges.value >= gym.badgeNumber ? "" : "unearned"
                            ]}
                            src={badgeSprite(gym.badgeNumber)}
                            alt={gym.badge}
                            title={gym.badge}
                            width={32}
                            height={32}
                        />
                    ))}
                </div>
                <p class="pk-small pk-muted">
                    Trainer battles are one-on-one: you automatically send out your best matchup
                    against each opponent, and switch when a Pokémon faints. Party order breaks
                    ties. Every forecast is exact.
                </p>
                <Panel title="Kanto Gyms">{renderGyms()}</Panel>
                {renderLeague()}
                <Panel title="Level caps">
                    <p class="pk-small">
                        Pokémon won't grow past the level cap until you earn more badges. Current
                        cap: <b>Lv. {main.cap.value}</b>.
                    </p>
                    <div class="pk-caps">
                        {LEVEL_CAPS.map((capLevel, i) => (
                            <div class={["pk-cap", main.cap.value === capLevel ? "current" : ""]}>
                                {i === 0 ? (
                                    <span class="pk-small">Start</span>
                                ) : i === 9 ? (
                                    <span class="pk-small">🏆</span>
                                ) : (
                                    <ItemIcon src={badgeSprite(i)} size={20} />
                                )}
                                <span>{capLevel}</span>
                            </div>
                        ))}
                    </div>
                </Panel>
            </div>
        )
    };
});

export default layer;
