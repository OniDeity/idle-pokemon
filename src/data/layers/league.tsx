/**
 * The current region's trials (Gyms or quests) and its finale. Every challenge shows an exact
 * forecast, because trainer battles are deterministic: what you see is what will happen.
 */
import { main } from "data/projEntry";
import { createLayer } from "game/layers";
import type { TrainerBattleOutcome } from "game/pokemon/balance";
import { simulateTrainerBattle } from "game/pokemon/balance";
import { getSpecies } from "game/pokemon/data";
import { KEY_ITEMS } from "game/pokemon/items";
import type { GymDefinition, TrainerDefinition } from "game/pokemon/trainers";
import { computed } from "vue";
import {
    BadgeIcon,
    Button,
    formatDuration,
    formatMoney,
    Panel,
    Sprite,
    TypeBadge
} from "../ui/components";
import type { NavNode } from "../ui/nav";
import { mobileClasses, renderNav } from "../ui/nav";

const id = "league";
const layer = createLayer(id, () => {
    const name = "League";
    const color = "#A855F7";

    function forecast(trainer: TrainerDefinition): TrainerBattleOutcome {
        return simulateTrainerBattle(
            main.partyBattlers.value,
            trainer,
            main.bonuses.value.damage,
            main.bonuses.value.hp
        );
    }

    const nextReady = computed(() => {
        const trainers = main.nextTrainers.value;
        return trainers.length > 0 && trainers.every(t => forecast(t).won);
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
        return (
            <div class="pk-forecast lose">
                ✘ Forecast: <b>{outcome.reason === "timeout" ? "out of time" : "defeat"}</b>. You'd
                beat {outcome.state.enemyIndex} of their Pokémon.
            </div>
        );
    }

    function renderTeam(trainer: TrainerDefinition) {
        return (
            <div class="pk-trainer-team">
                {trainer.team.map(p => (
                    <div class="pk-trainer-mon" title={getSpecies(p.id).name}>
                        <Sprite id={p.id} size={48} />
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

    function renderTrial(gym: GymDefinition) {
        const region = main.regionDef.value;
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
                <BadgeIcon gym={gym} earned={earned} size={40} />
                <div class="pk-gym-body">
                    {renderTrainerHeader(
                        gym,
                        <span class="pk-small pk-muted">
                            {gym.town} · {gym.badge}
                        </span>
                    )}
                    {locked ? (
                        <p class="pk-small pk-muted">Complete the previous one first.</p>
                    ) : (
                        <>
                            {renderTeam(gym)}
                            <p class="pk-quote">“{gym.quote}”</p>
                            <div class="pk-small">
                                Reward: {formatMoney(gym.prizeMoney)}, level cap →{" "}
                                {region.levelCaps[gym.badgeNumber]}
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
    }

    function renderFinale() {
        const region = main.regionDef.value;
        const unlocked = main.badges.value >= region.trials.length;
        const trainers = main.finale.value;
        const outcomes = unlocked ? trainers.map(forecast) : [];
        const allWin = outcomes.every(o => o.won);
        return (
            <Panel title={region.finaleName}>
                {!unlocked ? (
                    <p class="pk-muted">
                        Complete all {region.trials.length} {region.trialNoun} to take on the{" "}
                        {region.finaleName}.
                    </p>
                ) : (
                    <>
                        <p class="pk-small">{region.finaleBlurb} Lose once and you start over.</p>
                        {trainers.map((trainer, i) => (
                            <div class="pk-league-trainer">
                                {renderTrainerHeader(trainer)}
                                {renderTeam(trainer)}
                                {renderForecast(outcomes[i])}
                            </div>
                        ))}
                        <Button
                            kind="primary"
                            disabled={main.inTrainerBattle.value}
                            onClick={main.challengeFinale}
                        >
                            {main.champion.value
                                ? "Defend your title"
                                : `Challenge the ${region.finaleName}`}
                            {allWin ? "" : " (forecast: defeat)"}
                        </Button>
                        {main.champion.value ? (
                            <p class="pk-small">
                                🏆 {region.name} cleared! The Hall of Fame is open and post-game
                                areas are unlocked. Level cap raised to{" "}
                                {region.levelCaps[region.levelCaps.length - 1]}.
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
        classes: mobileClasses(id),
        nav,
        display: () => {
            const region = main.regionDef.value;
            return (
                <div class="pk-layer">
                    {renderNav(true)}
                    <h2 class="pk-layer-title">{region.name} League</h2>
                    <div class="pk-badge-case">
                        {main.trials.value.map(gym => (
                            <BadgeIcon
                                gym={gym}
                                earned={main.badges.value >= gym.badgeNumber}
                                size={32}
                            />
                        ))}
                    </div>
                    {main.rematch.value > 1 ? (
                        <p class="pk-warning">
                            Rematch: you've cleared {region.name} before, so every trainer here is{" "}
                            {Math.round((main.rematch.value - 1) * 100)}% stronger, and the Hall of
                            Fame pays ×{main.rematch.value.toFixed(1)} Fame.
                        </p>
                    ) : null}
                    <p class="pk-small pk-muted">
                        Trainer battles are one-on-one: you automatically send out your best matchup
                        against each opponent, and switch when a Pokémon faints. Party order breaks
                        ties. Every forecast is exact.
                    </p>
                    <Panel title={`${region.name} ${region.trialNoun}`}>
                        {main.trials.value.map(renderTrial)}
                    </Panel>
                    {renderFinale()}
                    <Panel title="Level caps">
                        <p class="pk-small">
                            Pokémon won't grow past the level cap until you make more progress.
                            Current cap: <b>Lv. {main.cap.value}</b>.
                        </p>
                        <div class="pk-caps">
                            {region.levelCaps.map((capLevel, i) => (
                                <div
                                    class={["pk-cap", main.cap.value === capLevel ? "current" : ""]}
                                >
                                    {i === 0 ? (
                                        <span class="pk-small">Start</span>
                                    ) : i === region.levelCaps.length - 1 ? (
                                        <span class="pk-small">🏆</span>
                                    ) : (
                                        <BadgeIcon gym={region.trials[i - 1]} earned size={20} />
                                    )}
                                    <span>{capLevel}</span>
                                </div>
                            ))}
                        </div>
                    </Panel>
                </div>
            );
        }
    };
});

export default layer;
