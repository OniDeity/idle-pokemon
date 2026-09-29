/**
 * Turns the checkout into the dev build: its own save id (so testing never touches the public
 * version's saves, which share the same origin) and a "(Dev)" title. Used by the deploy workflow
 * for the dev branch; don't commit the result.
 */
import { readFileSync, writeFileSync } from "fs";

const path = new URL("../src/data/projInfo.json", import.meta.url);
const info = JSON.parse(readFileSync(path, "utf8"));
info.id = `${info.id}-dev`;
info.title = `${info.title} (Dev)`;
writeFileSync(path, JSON.stringify(info, null, 4) + "\n");
console.log(`Dev build: save id ${info.id}, title "${info.title}"`);
