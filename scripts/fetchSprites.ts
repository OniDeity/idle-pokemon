/**
 * Downloads every sprite the game can show from the PokeAPI sprites repository into
 * public/sprites/, so the game serves its own images instead of hotlinking GitHub (whose raw
 * file server rate-limits bursts of requests and is blocked on some networks).
 *
 * Usage: npm run fetch:sprites   (from the repo root; skips files that are already there)
 * Run it after adding species, forms or items; commit the new files.
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { ALL_SPECIES, spriteKey } from "../src/game/pokemon/data";
import { REGION_LIST } from "../src/game/pokemon/regions";

const BASE = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites";
// Run from the repository root (as npm scripts and the tests do).
const ROOT = process.cwd();
const OUT = join(ROOT, "public", "sprites");

/** Every PokeAPI path the game uses: Pokémon in four views, items and badges. */
export function requiredSpritePaths(): string[] {
    const paths = new Set<string>();
    for (const species of ALL_SPECIES) {
        // Sprites drawn by our own generators already live in public/sprites.
        if (species.localSprite === true) continue;
        for (const view of ["", "back/", "shiny/", "back/shiny/"]) {
            paths.add(`pokemon/${view}${spriteKey(species.id)}.png`);
        }
    }
    for (const region of REGION_LIST) {
        for (const trial of region.trials) {
            if (trial.badgeIcon != null) paths.add(trial.badgeIcon);
        }
    }
    // Item icons are referenced as itemSprite("slug") throughout the source.
    const walk = (dir: string): string[] =>
        readdirSync(dir).flatMap(name => {
            const full = join(dir, name);
            return statSync(full).isDirectory() ? walk(full) : [full];
        });
    for (const file of walk(join(ROOT, "src"))) {
        if (!/\.tsx?$/.test(file)) continue;
        for (const match of readFileSync(file, "utf8").matchAll(/itemSprite\("([a-z0-9-]+)"\)/g)) {
            paths.add(`items/${match[1]}.png`);
        }
    }
    return [...paths].sort();
}

async function download(path: string): Promise<void> {
    for (let attempt = 1; ; attempt++) {
        const response = await fetch(`${BASE}/${path}`);
        if (response.ok) {
            const file = join(OUT, path);
            mkdirSync(dirname(file), { recursive: true });
            writeFileSync(file, Buffer.from(await response.arrayBuffer()));
            return;
        }
        if (response.status === 404 || attempt >= 4) {
            throw new Error(`${response.status} for ${path}`);
        }
        await new Promise(resolve => setTimeout(resolve, 1000 * 2 ** attempt));
    }
}

async function main() {
    const missing = requiredSpritePaths().filter(path => !existsSync(join(OUT, path)));
    console.log(`${missing.length} sprites to download`);
    const failures: string[] = [];
    // A few at a time, to stay polite to GitHub.
    for (let i = 0; i < missing.length; i += 8) {
        await Promise.all(
            missing
                .slice(i, i + 8)
                .map(path => download(path).catch((error: Error) => failures.push(error.message)))
        );
    }
    if (failures.length > 0) {
        console.error(`Failed:\n${failures.join("\n")}`);
        process.exit(1);
    }
    console.log("All sprites present.");
}

if (process.argv[1]?.endsWith("fetchSprites.ts") === true) {
    void main();
}
