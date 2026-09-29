/**
 * Navigation between layers. On wide screens the Journey stays on the left and the chosen layer
 * opens on the right; on phones only one screen shows at a time, so nothing scrolls sideways.
 */
import { main } from "data/projEntry";
import player from "game/player";
import type { ComputedRef } from "vue";
import { ref } from "vue";

/** A node in the TMT-style navigation bar that opens a layer in the right-hand pane. */
export interface NavNode {
    id: string;
    letter: string;
    label: string;
    color: string;
    /** Something to do in this layer. */
    glow: ComputedRef<boolean>;
    enabled: ComputedRef<boolean>;
}

/** Which screen is showing on phones: "main" (the Journey) or a layer id. */
export const mobileView = ref<string>("main");

/** Opens a layer: in the right-hand pane on wide screens, full-screen on phones. */
export function openLayer(id: string) {
    if (id !== "main") {
        player.tabs.splice(1, Infinity, id);
    }
    mobileView.value = id;
}

/** Layer classes that hide it on phones unless it's the screen being shown. */
export function mobileClasses(id: string) {
    return () => ({ "pk-mobile-hidden": mobileView.value !== id });
}

export function renderNav(mobile: boolean) {
    const open = mobile ? mobileView.value : player.tabs[1];
    const nodes = main.nav;
    return (
        <nav class={mobile ? "pk-nav pk-nav-mobile" : "pk-nav pk-nav-desktop"}>
            {mobile ? (
                <button
                    class={["pk-nav-node", open === "main" ? "open" : ""]}
                    style={{ "--node-color": main.regionDef.value.color }}
                    title="Journey"
                    onClick={() => openLayer("main")}
                >
                    <span class="pk-nav-letter">⚔</span>
                    <span class="pk-nav-label">Battle</span>
                </button>
            ) : null}
            {nodes.map(node => (
                <button
                    class={[
                        "pk-nav-node",
                        open === node.id ? "open" : "",
                        node.glow.value ? "glow" : ""
                    ]}
                    style={{ "--node-color": node.color }}
                    disabled={!node.enabled.value}
                    title={node.enabled.value ? node.label : "Locked"}
                    onClick={() => openLayer(node.id)}
                >
                    <span class="pk-nav-letter">{node.letter}</span>
                    <span class="pk-nav-label">{node.label}</span>
                </button>
            ))}
        </nav>
    );
}
