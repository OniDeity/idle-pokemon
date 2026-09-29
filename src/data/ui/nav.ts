import type { ComputedRef } from "vue";

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
