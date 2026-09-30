/**
 * Every image ships with the game in public/sprites (fetched from the PokeAPI sprites repository
 * by scripts/fetchSprites.ts, or drawn by our own sprite generators), so nothing is hotlinked.
 * A self-contained build can instead define `window.__PK_ASSETS` (path → data URI) before the
 * game loads.
 */
declare global {
    interface Window {
        __PK_ASSETS?: Record<string, string>;
    }
}

/**
 * @param path A path under public/sprites, laid out like the PokeAPI sprites repo, e.g.
 *   "items/poke-ball.png". Sprites we draw ourselves are passed as "local/…".
 */
export function assetUrl(path: string): string {
    const file = path.startsWith("local/") ? path.slice(6) : path;
    const bundled = typeof window === "undefined" ? undefined : window.__PK_ASSETS?.[file];
    return bundled ?? `./sprites/${file}`;
}
