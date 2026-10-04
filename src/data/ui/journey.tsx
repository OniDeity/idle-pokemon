/**
 * The left-hand "Journey" pane: status bar, the layer tree, the live battle scene, your party,
 * and the event log.
 */
import dex from "data/layers/dex";
import hof from "data/layers/hof";
import type { BallMode, BattleState, CatchMode, LogEntry } from "data/projEntry";
import { main } from "data/projEntry";
import player from "game/player";
import { AUTOMATIONS, ballCatchChance } from "game/pokemon/balance";
import { getSpecies, isShadow } from "game/pokemon/data";
import { SHADOW_TRAINERS } from "game/pokemon/colosseum";
import { ZONES_BY_ID } from "game/pokemon/zones";
import { POKEDEX_SIZE } from "game/pokemon/pokedex";
import type { BallId } from "game/pokemon/items";
import { APRICORN_BALLS, BALLS } from "game/pokemon/items";
import { maxHp, xpForLevel } from "game/pokemon/stats";
import type { RegionDefinition } from "game/pokemon/regions";
import { REGION_LIST, startersFor } from "game/pokemon/regions";
import { formatTime } from "util/bignum";
import {
    BadgeIcon,
    Bar,
    Button,
    formatDuration,
    formatMoney,
    ItemIcon,
    Sprite,
    TypeBadges
} from "./components";
import { openLayer, renderNav } from "./nav";

const CAVES = new Set([
    "mtMoon",
    "rockTunnel",
    "diglettsCave",
    "seafoamIslands",
    "victoryRoad",
    "ceruleanCave",
    "grampaCanyon",
    "mtEmber",
    "icefallCave",
    "lostCave",
    "alteringCave",
    "sevaultCanyon",
    "darkCave",
    "darkCaveBlackthorn",
    "unionCave",
    "slowpokeWell",
    "mtMortar",
    "icePath",
    "whirlIslands",
    "dragonsDen",
    "tohjoFalls",
    "johtoVictoryRoad",
    "mtSilver",
    "ruinsOfAlphChambers",
    "canyonEntrance",
    "navelIsland"
]);
const FORESTS = new Set([
    "viridianForest",
    "safariZone",
    "hiddenVillage",
    "berryForest",
    "patternBush",
    "pinkanIsland",
    "murcottIsland",
    "valenciaIsland",
    "ilexForest",
    "nationalPark",
    "johtoSafariZone"
]);
const BUILDINGS = new Set([
    "pokemonTower",
    "powerPlant",
    "pokemonMansion",
    "pokemonTech",
    "gringeyCity",
    "darkCity",
    "maidensPeak",
    "pokemopolis",
    "moroIsland",
    "tanobyRuins",
    "sproutTower",
    "burnedTower"
]);
const SEAS = new Set([
    "route19",
    "route20",
    "route21",
    "billsLighthouse",
    "portaVista",
    "chrysanthemumIsland",
    "fourIsland",
    "waterLabyrinth",
    "resortGorgeous",
    "treasureBeach",
    "route40",
    "route41",
    "lakeOfRage",
    "cherrygroveCity",
    "olivineCity",
    "cianwoodCity"
]);

function terrain(state: BattleState): string {
    if (state.kind === "trainer") {
        return state.legendary ? "legend" : "arena";
    }
    const zone = main.zoneId.value;
    if (state.kind === "wild" && (state.wild.kind === "surf" || state.wild.kind === "fishing")) {
        return "water";
    }
    if (CAVES.has(zone)) return "cave";
    if (FORESTS.has(zone)) return "forest";
    if (BUILDINGS.has(zone)) return "building";
    if (SEAS.has(zone)) return "water";
    return "grass";
}

function renderHud() {
    return (
        <div class="pk-hud">
            <div class="pk-hud-money" title="Pokédollars">
                {formatMoney(main.money.value)}
            </div>
            <div class="pk-hud-badges" title={`${main.badges.value} badges`}>
                {main.regionDef.value.trials.map(gym => (
                    <BadgeIcon gym={gym} earned={main.badges.value >= gym.badgeNumber} size={18} />
                ))}
                {main.champion.value ? <span title="Champion">🏆</span> : null}
            </div>
            <div class="pk-hud-stat" title="Species caught / total">
                Dex {dex.caughtCount.value}/{POKEDEX_SIZE}
            </div>
            <div class="pk-hud-stat" title="Level cap">
                Cap Lv. {main.cap.value}
            </div>
            {hof.fame.value > 0 || hof.timesEntered.value > 0 ? (
                <div class="pk-hud-stat" title="Fame">
                    ★ {hof.fame.value}
                </div>
            ) : null}
        </div>
    );
}

/** Why a region can't be chosen yet. */
function lockedReason(region: RegionDefinition): string {
    const requires = REGION_LIST.find(x => x.id === region.requires);
    if (requires != null && hof.clearCount(requires.id) === 0) {
        return `Clear ${requires.name} first.`;
    }
    const progress = hof.pokedexProgress(region.id);
    return progress != null
        ? `Complete your Pokédex first: ${progress.caught}/${progress.needed} species from the earlier regions caught.`
        : "";
}

function renderStarterSelect() {
    const again = hof.timesEntered.value > 0;
    const region = main.regionDef.value;
    return (
        <div class="pk-starter-select">
            <h2>
                {again ? "Where will your next journey begin?" : "Welcome to the world of Pokémon!"}
            </h2>
            {again ? (
                <div class="pk-regions">
                    {REGION_LIST.map(r => {
                        const unlocked = hof.regionUnlocked(r.id);
                        const clears = hof.clearCount(r.id);
                        return (
                            <button
                                class={["pk-region", region.id === r.id ? "selected" : ""]}
                                style={{ "--region-color": r.color }}
                                disabled={!unlocked}
                                onClick={() => main.chooseRegion(r.id)}
                            >
                                <b>{r.name}</b>
                                <span class="pk-small">{unlocked ? r.blurb : lockedReason(r)}</span>
                                <span class="pk-small pk-muted">
                                    {clears > 0
                                        ? `Cleared ${clears}×`
                                        : "Never cleared (first clear ×1.5 Fame)"}{" "}
                                    · starters Lv. {r.startLevel}
                                </span>
                            </button>
                        );
                    })}
                </div>
            ) : (
                <p>
                    Professor Oak needs help completing the Pokédex. Choose your first partner.
                    You'll find the other two later on your journey.
                </p>
            )}
            <div class="pk-starters">
                {startersFor(region, hof.clearCount(region.id)).map(id => (
                    <button class="pk-starter" onClick={() => main.chooseStarter(id)}>
                        <Sprite id={id} size={96} />
                        <b>{getSpecies(id).name}</b>
                        <TypeBadges id={id} />
                    </button>
                ))}
            </div>
            {again && hof.mechanicUnlocked("partner") && main.partnerChoices.value.length > 0
                ? renderPartnerPicker()
                : null}
            {region.allStarters === true ? (
                <p class="pk-small pk-muted">
                    Both {region.starters.map(id => getSpecies(id).name).join(" and ")} join you;
                    pick who leads.
                </p>
            ) : null}
            {region.id === "kanto" ? (
                <p class="pk-small pk-muted">
                    Tip: Brock's Rock types are tough for Charmander, but Bulbasaur and Squirtle
                    make short work of them.
                </p>
            ) : null}
        </div>
    );
}

/** Bring a Partner: one Hall of Fame Pokémon to start the journey beside the starter. */
function renderPartnerPicker() {
    const chosen = main.journeyPartner.value;
    return (
        <div class="pk-partner-picker">
            <p class="pk-small">
                <b>Bring a partner</b> from your Hall of Fame (joins at the starters' level):
            </p>
            <div class="pk-partner-choices">
                <button
                    class={["pk-partner-choice", chosen === 0 ? "selected" : ""]}
                    onClick={() => (main.journeyPartner.value = 0)}
                    title="No partner"
                >
                    —
                </button>
                {main.partnerChoices.value.map(p => (
                    <button
                        class={["pk-partner-choice", chosen === p.id ? "selected" : ""]}
                        onClick={() => (main.journeyPartner.value = p.id)}
                        title={`${getSpecies(p.id).name}${p.shiny ? " ✨" : ""}`}
                    >
                        <Sprite id={p.id} shiny={p.shiny} size={40} />
                    </button>
                ))}
            </div>
        </div>
    );
}

function infoBox(
    name: string,
    level: number,
    hp: number,
    max: number,
    shiny: boolean,
    extra?: unknown
) {
    return (
        <div class="pk-infobox">
            <div class="pk-infobox-name">
                <span>
                    {name}
                    {shiny ? " ✨" : ""}
                </span>
                <span>Lv{level}</span>
            </div>
            <Bar value={hp} max={max} kind="hp" />
            {extra}
        </div>
    );
}

function renderScene() {
    const state = main.battle.value;
    const flash = main.flash.value;
    let foe = null;
    let ally = null;
    /** In double battles, the party member fighting beside the active one. */
    let partnerId: number | undefined;
    let banner: string;
    let balls = null;

    if (state.kind === "search") {
        banner = `Searching ${main.zone.value.name}…`;
        const leadId = main.partyIds.value[0];
        if (leadId != null) {
            const entry = main.box.value[leadId];
            ally = { id: leadId, level: entry.level, shiny: entry.shiny, hp: 1, max: 1 };
        }
    } else if (state.kind === "wild") {
        const species = getSpecies(state.wild.speciesId);
        const where =
            state.wild.kind === "fishing"
                ? "hooked"
                : state.wild.kind === "surf"
                  ? "surfaced"
                  : state.wild.kind === "headbutt"
                    ? "fell out of the tree"
                    : state.wild.kind === "rockSmash"
                      ? "was under the rock"
                      : state.wild.kind === "dive"
                        ? "swam out of the seaweed"
                        : "appeared";
        const shadow = isShadow(state.wild.speciesId);
        const trainerBattle = ZONES_BY_ID[main.zoneId.value]?.trainerBattles === true;
        banner = shadow
            ? `${SHADOW_TRAINERS[state.wild.speciesId] ?? "A Cipher Peon"} sent out ${species.name}!`
            : trainerBattle
              ? `A Trainer sent out ${species.name}!`
              : `A wild ${species.name} ${where}!`;
        foe = {
            id: state.wild.speciesId,
            level: state.wild.level,
            shiny: state.wild.shiny,
            hp: state.wild.hp,
            max: state.wild.maxHp
        };
        const activeId = main.partyIds.value[Math.max(0, state.active)];
        if (activeId != null) {
            const entry = main.box.value[activeId];
            ally = { id: activeId, level: entry.level, shiny: entry.shiny, hp: 1, max: 1 };
        }
        partnerId = main.partyIds.value[state.partner ?? -1];
    } else {
        const trainer = state.trainers[state.index];
        const enemy = state.enemies[Math.min(state.state.enemyIndex, state.enemies.length - 1)];
        banner = state.legendary
            ? `${state.label}! (${formatDuration(Math.max(0, trainer.timeLimit - state.state.elapsed))} left)`
            : `${trainer.name}: ${formatDuration(Math.max(0, trainer.timeLimit - state.state.elapsed))} left`;
        foe = {
            id: enemy.species.id,
            level: enemy.level,
            shiny: false,
            hp: Math.max(0, state.state.enemyHp),
            max: maxHp(enemy)
        };
        const activeIndex =
            state.state.active === -1
                ? state.state.partyHp.findIndex(h => h > 0)
                : state.state.active;
        const activeId = state.partyIds[Math.max(0, activeIndex)];
        const entry = main.box.value[activeId];
        if (entry != null) {
            const max = Math.round(
                maxHp(state.party[Math.max(0, activeIndex)]) * main.bonuses.value.hp
            );
            ally = {
                id: activeId,
                level: state.party[Math.max(0, activeIndex)].level,
                shiny: entry.shiny,
                hp: Math.max(0, state.state.partyHp[Math.max(0, activeIndex)] ?? 0),
                max
            };
        }
        partnerId = state.partyIds[state.state.partner ?? -1];
        balls = (
            <div class="pk-scene-trainerballs">
                {state.enemies.map((_, i) => (
                    <span class={["pk-pip", i < state.state.enemyIndex ? "fainted" : ""]} />
                ))}
            </div>
        );
    }

    const showFlash = flash != null && flash.until > Date.now();
    const allySpecies = ally ? getSpecies(ally.id) : null;
    const allyEntry = ally ? main.box.value[ally.id] : null;
    let xpExtra = null;
    if (ally && allySpecies && allyEntry && state.kind !== "trainer") {
        const thisXp = xpForLevel(allySpecies.growthRate, allyEntry.level);
        const nextXp = xpForLevel(allySpecies.growthRate, allyEntry.level + 1);
        const capped = allyEntry.level >= main.cap.value;
        xpExtra = (
            <Bar
                value={capped ? 1 : allyEntry.xp - thisXp}
                max={capped ? 1 : nextXp - thisXp}
                kind="xp"
            />
        );
    }

    return (
        <div class={["pk-scene", `pk-terrain-${terrain(state)}`]}>
            <div class="pk-scene-banner">{banner}</div>
            {balls}
            {foe ? (
                <div class="pk-foe" key={`foe-${foe.id}-${foe.level}`}>
                    {infoBox(getSpecies(foe.id).name, foe.level, foe.hp, foe.max, foe.shiny)}
                    <div class="pk-platform pk-platform-foe">
                        <Sprite
                            id={foe.id}
                            shiny={foe.shiny}
                            size={112}
                            extraClass="pk-foe-sprite"
                        />
                    </div>
                </div>
            ) : (
                <div class="pk-foe pk-searching">
                    <div class="pk-rustle">
                        <span />
                        <span />
                        <span />
                    </div>
                    {state.kind === "search" ? (
                        <Bar value={state.total - state.remaining} max={state.total} kind="time" />
                    ) : null}
                </div>
            )}
            {ally ? (
                <div class="pk-ally">
                    <div class="pk-platform pk-platform-ally">
                        {partnerId != null && main.box.value[partnerId] != null ? (
                            <Sprite
                                id={partnerId}
                                shiny={main.box.value[partnerId].shiny}
                                back
                                size={96}
                                extraClass="pk-partner-sprite"
                            />
                        ) : null}
                        <Sprite
                            id={ally.id}
                            shiny={ally.shiny}
                            back
                            size={128}
                            extraClass="pk-ally-sprite"
                        />
                    </div>
                    {infoBox(allySpecies!.name, ally.level, ally.hp, ally.max, ally.shiny, xpExtra)}
                </div>
            ) : null}
            {showFlash ? (
                <div class={["pk-flash", `pk-flash-${flash!.kind}`]} key={flash!.until}>
                    {flash!.text}
                </div>
            ) : null}
        </div>
    );
}

function renderPartyStrip() {
    const state = main.battle.value;
    const trainerHp = state.kind === "trainer" ? state.state.partyHp : null;
    const activeIndex =
        state.kind === "wild" ? state.active : state.kind === "trainer" ? state.state.active : -1;
    const partnerIndex =
        state.kind === "wild"
            ? (state.partner ?? -1)
            : state.kind === "trainer"
              ? (state.state.partner ?? -1)
              : -1;
    return (
        <div class="pk-strip">
            {main.partyIds.value.map((id, i) => {
                const entry = main.box.value[id];
                if (entry == null) return null;
                const species = getSpecies(id);
                const thisXp = xpForLevel(species.growthRate, entry.level);
                const nextXp = xpForLevel(species.growthRate, entry.level + 1);
                const capped = entry.level >= main.cap.value;
                const fainted = trainerHp != null && (trainerHp[i] ?? 1) <= 0;
                return (
                    <button
                        class={[
                            "pk-strip-mon",
                            i === activeIndex ? "active" : "",
                            i === partnerIndex ? "partner" : "",
                            fainted ? "fainted" : ""
                        ]}
                        title={`${species.name} Lv. ${entry.level}${capped ? " (level cap)" : ""}`}
                        onClick={() => openLayer("party")}
                    >
                        <Sprite id={id} shiny={entry.shiny} size={40} />
                        <span class="pk-strip-level">{entry.level}</span>
                        {trainerHp != null && state.kind === "trainer" ? (
                            <Bar
                                value={Math.max(0, trainerHp[i] ?? 0)}
                                max={Math.round(maxHp(state.party[i]) * main.bonuses.value.hp)}
                                kind="hp"
                            />
                        ) : (
                            <Bar
                                value={capped ? 1 : entry.xp - thisXp}
                                max={capped ? 1 : nextXp - thisXp}
                                kind="xp"
                            />
                        )}
                    </button>
                );
            })}
        </div>
    );
}

const CATCH_MODES: [CatchMode, string, string][] = [
    ["new", "New", "Throw balls at species not in your box yet, and at shinies"],
    ["all", "All", "Throw balls at everything — extra catches make that species stronger"],
    ["off", "Off", "Don't throw balls"]
];

function renderControls() {
    const state = main.battle.value;
    const ballOptions: [BallMode, string][] = [
        ["smart", "Smart"],
        ...(["pokeBall", "greatBall", "ultraBall"] as BallId[])
            .filter(id => main.badges.value >= BALLS[id].badgesRequired || main.balls.value[id] > 0)
            .map((id): [BallMode, string] => [id, BALLS[id].name]),
        // Apricorn Balls you're carrying.
        ...APRICORN_BALLS.filter(id => (main.balls.value[id] ?? 0) > 0).map(
            (id): [BallMode, string] => [id, BALLS[id].name]
        )
    ];
    let chance = null;
    if (state.kind === "wild") {
        const ball = main.ballMode.value === "smart" ? "pokeBall" : main.ballMode.value;
        chance = ballCatchChance(ball, main.ballContext(state.wild), main.bonuses.value.catch);
    }
    return (
        <div class="pk-controls">
            <div class="pk-control-row">
                <span class="pk-control-label">Location</span>
                <Button kind="ghost" onClick={() => openLayer("map")}>
                    📍 {main.zone.value.name}
                </Button>
                {state.kind === "trainer" ? (
                    <Button kind="danger" onClick={main.forfeit}>
                        Withdraw
                    </Button>
                ) : null}
            </div>
            <div class="pk-control-row">
                <span class="pk-control-label">Catch</span>
                {CATCH_MODES.map(([mode, label, title]) => (
                    <Button
                        kind={main.catchMode.value === mode ? "primary" : "ghost"}
                        title={title}
                        onClick={() => (main.catchMode.value = mode)}
                    >
                        {label}
                    </Button>
                ))}
            </div>
            <div class="pk-control-row">
                <span class="pk-control-label">Ball</span>
                {ballOptions.map(([mode, label]) => (
                    <Button
                        kind={main.ballMode.value === mode ? "primary" : "ghost"}
                        title={
                            mode === "smart"
                                ? "Uses the cheapest ball with a good chance, else your best ball"
                                : ""
                        }
                        onClick={() => (main.ballMode.value = mode)}
                    >
                        {label}
                    </Button>
                ))}
            </div>
            <div class="pk-ball-counts">
                {(
                    [
                        "pokeBall",
                        "greatBall",
                        "ultraBall",
                        "masterBall",
                        ...APRICORN_BALLS
                    ] as BallId[]
                )
                    .filter(id => (main.balls.value[id] ?? 0) > 0 || id === "pokeBall")
                    .map(id => (
                        <span
                            class={["pk-ball-count", main.balls.value[id] === 0 ? "empty" : ""]}
                            title={BALLS[id].name}
                        >
                            <ItemIcon src={BALLS[id].sprite} size={24} alt={BALLS[id].name} />
                            {main.balls.value[id] ?? 0}
                        </span>
                    ))}
                <Button kind="small" onClick={() => openLayer("mart")}>
                    Buy
                </Button>
                {chance != null && main.ballMode.value !== "smart" ? (
                    <span class="pk-small pk-muted">{Math.round(chance * 100)}% catch</span>
                ) : null}
            </div>
            {AUTOMATIONS.some(a => hof.automationsOwned.value[a.id]) ? (
                <div class="pk-control-row">
                    <span class="pk-control-label">Auto</span>
                    {AUTOMATIONS.filter(a => hof.automationsOwned.value[a.id]).map(a => (
                        <Button
                            kind={hof.automationsOn.value[a.id] ? "primary" : "ghost"}
                            title={a.description}
                            onClick={() => hof.toggleAutomation(a.id)}
                        >
                            {a.name}
                        </Button>
                    ))}
                </div>
            ) : null}
            {main.balls.value.masterBall > 0 ? (
                <label class="pk-small pk-check">
                    <input
                        type="checkbox"
                        checked={main.useMasterBallOnLegendaries.value}
                        onChange={(e: Event) =>
                            (main.useMasterBallOnLegendaries.value = (
                                e.target as HTMLInputElement
                            ).checked)
                        }
                    />{" "}
                    Use the Master Ball on legendary Pokémon
                </label>
            ) : null}
        </div>
    );
}

const LOG_ICONS: Record<LogEntry["kind"], string> = {
    catch: "●",
    shiny: "✨",
    evolve: "⬆",
    badge: "🏅",
    fail: "✘",
    info: "›",
    levelup: "★"
};

function renderLog() {
    return (
        <div class="pk-log">
            {main.log.value.length === 0 ? (
                <div class="pk-muted pk-small">Your adventure log is empty.</div>
            ) : (
                main.log.value.map(entry => (
                    <div class={["pk-log-entry", `pk-log-${entry.kind}`]} key={entry.id}>
                        <span class="pk-log-icon">{LOG_ICONS[entry.kind]}</span>
                        {entry.speciesId != null ? (
                            <Sprite id={entry.speciesId} shiny={entry.shiny} size={28} />
                        ) : null}
                        <span>{entry.text}</span>
                    </div>
                ))
            )}
        </div>
    );
}

function renderStatus() {
    const notices = [];
    if (player.devSpeed === 0) notices.push("Game paused");
    if (player.devSpeed != null && player.devSpeed !== 0 && player.devSpeed !== 1) {
        notices.push(`Dev speed ${player.devSpeed}×`);
    }
    if (player.offlineTime != null && player.offlineTime > 0) {
        notices.push(`Catching up on offline time: ${formatTime(player.offlineTime)}`);
    }
    return notices.length > 0 ? <div class="pk-notice">{notices.join(" · ")}</div> : null;
}

export function renderJourney() {
    return (
        <div class="pk-journey">
            {renderNav(true)}
            {renderHud()}
            {renderStatus()}
            {renderNav(false)}
            {main.starter.value === 0 ? (
                renderStarterSelect()
            ) : (
                <>
                    {renderScene()}
                    {renderPartyStrip()}
                    {renderControls()}
                    <div class="pk-run-stats pk-small pk-muted">
                        Journey time {formatDuration(main.runTime.value)} ·{" "}
                        {main.battlesWon.value.toLocaleString("en-US")} battles won
                    </div>
                    {renderLog()}
                </>
            )}
        </div>
    );
}
