/**
 * Every image comes from the PokeAPI sprites repository. A self-contained build can ship the
 * images itself by defining `window.__PK_ASSETS` (path → data URI) before the game loads.
 */
const SPRITES_BASE = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites";

declare global {
    interface Window {
        __PK_ASSETS?: Record<string, string>;
    }
}

/** @param path A path inside the sprites repo, e.g. "items/poke-ball.png". */
export function assetUrl(path: string): string {
    return window.__PK_ASSETS?.[path] ?? `${SPRITES_BASE}/${path}`;
}
