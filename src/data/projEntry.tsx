import type { Layer } from "game/layers";
import { createLayer } from "game/layers";
import { persistent } from "game/persistence";
import type { Player } from "game/player";
import type { PokedexEntry } from "game/pokemon/types";
import { computed } from "vue";
import field from "./layers/field";

/**
 * @hidden
 */
export const main = createLayer("main", () => {
    // Permanent, cluster-spanning progress. Never included in any layer's `thingsToReset` -
    // this is what "surviving a badge-reset" means for the player.
    const pokedex = persistent<Record<string, PokedexEntry>>({});
    const badgesEarned = persistent<number>(0);

    const seenCount = computed(() => Object.values(pokedex.value).filter(e => e.seen).length);
    const caughtCount = computed(() => Object.values(pokedex.value).filter(e => e.caught).length);
    const shinyCount = computed(
        () => Object.values(pokedex.value).filter(e => e.shinyCaught).length
    );

    return {
        name: "Field Log",
        pokedex,
        badgesEarned,
        display: () => (
            <>
                <h2>Kanto Field Survey</h2>
                <div>Research authorizations: {badgesEarned.value}</div>
                <div>Species documented: {seenCount.value}</div>
                <div>Species caught: {caughtCount.value}</div>
                <div>Shiny specimens: {shinyCount.value}</div>
            </>
        )
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
