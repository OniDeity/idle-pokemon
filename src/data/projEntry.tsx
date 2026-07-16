import speciesJson from "data/pokemon/species.json";
import { createClickable } from "features/clickables/clickable";
import type { Layer } from "game/layers";
import { createLayer } from "game/layers";
import { persistent } from "game/persistence";
import type { Player } from "game/player";
import { computeBattlePower, computeGearMultiplier, computeXpToLevel } from "game/pokemon/battle";
import { formatSpeciesName } from "game/pokemon/format";
import { recordCatch, recordSeen } from "game/pokemon/pokedex";
import type { PlayerPokemonState, PokedexEntry, SpeciesData } from "game/pokemon/types";
import { render } from "util/vue";
import { computed } from "vue";
import field, { toNum } from "./layers/field";

const SPECIES = speciesJson as Record<string, SpeciesData>;
const STARTER_IDS = ["1", "4", "7"]; // Bulbasaur, Charmander, Squirtle

/**
 * @hidden
 */
export const main = createLayer("main", () => {
    // Permanent, cluster-spanning progress. Never included in any layer's `thingsToReset` -
    // this is what "surviving a badge-reset" means for the player.
    const pokedex = persistent<Record<string, PokedexEntry>>({});
    const badgesEarned = persistent<number>(0);
    const team = persistent<PlayerPokemonState[]>([]);
    const partyLimit = persistent<number>(1);

    const seenCount = computed(() => Object.values(pokedex.value).filter(e => e.seen).length);
    const caughtCount = computed(() => Object.values(pokedex.value).filter(e => e.caught).length);
    const shinyCount = computed(
        () => Object.values(pokedex.value).filter(e => e.shinyCaught).length
    );

    function pickStarter(speciesId: string) {
        if (team.value.length > 0) {
            return;
        }
        team.value = [{ speciesId, level: 5, xp: 0, isShiny: false }];
        recordSeen(pokedex, speciesId);
        recordCatch(pokedex, speciesId, false);
    }

    function createStarterClickable(speciesId: string) {
        const species = SPECIES[speciesId];
        return createClickable(() => ({
            canClick: () => team.value.length === 0,
            display: {
                title: formatSpeciesName(species.name),
                description: () => (
                    <>
                        <img
                            src={species.sprites.front}
                            alt={species.name}
                            style={{ width: "96px", height: "96px" }}
                        />
                        <div>{species.types.map(formatSpeciesName).join(" / ")}</div>
                    </>
                )
            },
            onClick() {
                pickStarter(speciesId);
            }
        }));
    }
    const starterChoices = STARTER_IDS.map(createStarterClickable);

    const levelUp = createClickable(() => ({
        canClick: () =>
            team.value.length > 0 && team.value[0].xp >= computeXpToLevel(team.value[0].level),
        display: {
            title: "Level Up",
            description: () => {
                if (team.value.length === 0) {
                    return "";
                }
                const pokemon = team.value[0];
                const cost = computeXpToLevel(pokemon.level);
                return `Spend ${cost} XP to reach level ${pokemon.level + 1}. (Have ${pokemon.xp})`;
            }
        },
        onClick() {
            if (team.value.length === 0) {
                return;
            }
            const pokemon = team.value[0];
            const cost = computeXpToLevel(pokemon.level);
            if (pokemon.xp < cost) {
                return;
            }
            team.value = team.value.map((p, i) =>
                i === 0 ? { ...p, xp: p.xp - cost, level: p.level + 1 } : p
            );
        }
    }));

    function renderStarterSelect() {
        return (
            <div>
                <h2>Choose Your Starter</h2>
                <p>Professor Oak is waiting. Pick the Pokémon you'll raise across Kanto.</p>
                <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
                    {starterChoices.map(clickable => render(clickable))}
                </div>
            </div>
        );
    }

    function renderTeamPanel() {
        const pokemon = team.value[0];
        const species = SPECIES[pokemon.speciesId];
        const cost = computeXpToLevel(pokemon.level);
        const xpPct = Math.min(100, (pokemon.xp / cost) * 100);
        const gearMultiplier = computeGearMultiplier(
            toNum(field.battleAttack.amount.value),
            toNum(field.battleDefense.amount.value)
        );
        const power = computeBattlePower(species.baseStats, pokemon.level, gearMultiplier);
        return (
            <div>
                <h3>Your Pokémon</h3>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <img
                        src={pokemon.isShiny ? species.sprites.frontShiny : species.sprites.front}
                        alt={species.name}
                        style={{ width: "72px", height: "72px" }}
                    />
                    <div>
                        <div>
                            {formatSpeciesName(species.name)} — Lv. {pokemon.level}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <div
                                style={{
                                    width: "150px",
                                    height: "10px",
                                    border: "1px solid var(--outline, #444)",
                                    borderRadius: "5px",
                                    overflow: "hidden"
                                }}
                            >
                                <div
                                    style={{
                                        width: `${xpPct}%`,
                                        height: "100%",
                                        background: "var(--accent2, #8FBCBB)"
                                    }}
                                />
                            </div>
                            <span>
                                {pokemon.xp} / {cost} XP
                            </span>
                        </div>
                        <div>Battle Power: {power}</div>
                    </div>
                </div>
                {render(levelUp)}
            </div>
        );
    }

    return {
        name: "Field Log",
        pokedex,
        badgesEarned,
        team,
        partyLimit,
        starterChoices,
        levelUp,
        display: () => {
            if (team.value.length === 0) {
                return renderStarterSelect();
            }
            return (
                <>
                    <h2>Kanto Field Survey</h2>
                    <div>Research authorizations: {badgesEarned.value}</div>
                    <div>Species documented: {seenCount.value}</div>
                    <div>Species caught: {caughtCount.value}</div>
                    <div>Shiny specimens: {shinyCount.value}</div>
                    <br />
                    {renderTeamPanel()}
                </>
            );
        }
    };
});

/**
 * Given a player save data object being loaded, return a list of layers that should currently be enabled.
 * If your project does not use dynamic layers, this should just return all layers.
 */
export const getInitialLayers = (
    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    player: Partial<Player>
): Array<Layer> => [main, field];

/**
 * A computed ref whose value is true whenever the game is over.
 */
export const hasWon = computed(() => {
    return false;
});

/**
 * Given a player save data object being loaded with a different version, update the save data object to match the structure of the current version.
 * @param oldVersion The version of the save being loaded in
 * @param player The save data being loaded in
 */
/* eslint-disable @typescript-eslint/no-unused-vars */
export function fixOldSave(
    oldVersion: string | undefined,
    player: Partial<Player>
    // eslint-disable-next-line @typescript-eslint/no-empty-function
): void {}
/* eslint-enable @typescript-eslint/no-unused-vars */
