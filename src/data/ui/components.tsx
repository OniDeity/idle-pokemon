/**
 * Small presentational components shared by every layer.
 * All of them set `inheritAttrs = false` so passed props (like onClick) aren't also
 * applied to the root element by Vue's attribute fallthrough.
 */
import { assetUrl } from "game/pokemon/assets";
import type { PokemonType } from "game/pokemon/data";
import { formatDexNumber, getSpecies, spriteUrl, TYPE_COLORS } from "game/pokemon/data";
import { format } from "util/bignum";
import type { GymDefinition } from "game/pokemon/trainers";
import type { FunctionalComponent } from "vue";
import "./pokemon.css";

export function formatMoney(amount: number): string {
    return "₽" + formatNumber(amount);
}

export function formatNumber(amount: number): string {
    return amount < 1e9 ? Math.floor(amount).toLocaleString("en-US") : format(amount, 2);
}

export function formatDuration(seconds: number): string {
    if (!Number.isFinite(seconds)) {
        return "∞";
    }
    if (seconds < 60) {
        return `${seconds.toFixed(seconds < 10 ? 1 : 0)}s`;
    }
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    if (m < 60) {
        return `${m}m ${s}s`;
    }
    return `${Math.floor(m / 60)}h ${m % 60}m`;
}

function component<P>(fn: FunctionalComponent<P>): FunctionalComponent<P> {
    fn.inheritAttrs = false;
    return fn;
}

export const Sprite = component<{
    id: number;
    shiny?: boolean;
    back?: boolean;
    size?: number;
    silhouette?: boolean;
    extraClass?: string;
}>(props => {
    const size = props.size ?? 64;
    const url = spriteUrl(props.id, props.shiny, props.back);
    return (
        <img
            class={["pk-sprite", props.silhouette ? "pk-silhouette" : "", props.extraClass ?? ""]}
            src={url}
            alt={props.silhouette ? "Unknown Pokémon" : getSpecies(props.id).name}
            width={size}
            height={size}
            loading="lazy"
            draggable={false}
        />
    );
});

export const ItemIcon = component<{ src: string; size?: number; alt?: string }>(props => {
    const size = props.size ?? 30;
    return (
        <img
            class="pk-item-icon"
            src={props.src}
            alt={props.alt ?? ""}
            width={size}
            height={size}
            loading="lazy"
            draggable={false}
        />
    );
});

export const TypeBadge = component<{ type: PokemonType; small?: boolean }>(props => (
    <span
        class={["pk-type", props.small ? "small" : ""]}
        style={{ background: TYPE_COLORS[props.type] }}
    >
        {props.type}
    </span>
));

export const TypeBadges = component<{ id: number; small?: boolean }>(props => (
    <span class="pk-types">
        {getSpecies(props.id).types.map(type => (
            <TypeBadge type={type} small={props.small} />
        ))}
    </span>
));

export const Bar = component<{
    value: number;
    max: number;
    kind: "hp" | "xp" | "time" | "progress";
    label?: string;
}>(props => {
    const pct = props.max > 0 ? Math.max(0, Math.min(100, (props.value / props.max) * 100)) : 0;
    let color: string | undefined;
    if (props.kind === "hp") {
        color = pct > 50 ? "var(--pk-hp-high)" : pct > 20 ? "var(--pk-hp-mid)" : "var(--pk-hp-low)";
    }
    return (
        <div class={["pk-bar", `pk-bar-${props.kind}`]}>
            <div class="pk-bar-fill" style={{ width: `${pct}%`, background: color }} />
            {props.label != null ? <span class="pk-bar-label">{props.label}</span> : null}
        </div>
    );
});

export const DexNumber = component<{ id: number }>(props => (
    <span class="pk-dexnum">{formatDexNumber(props.id)}</span>
));

export const Button = component<{
    onClick: () => void;
    disabled?: boolean;
    kind?: "primary" | "danger" | "ghost" | "small";
    title?: string;
    extraClass?: string;
}>((props, { slots }) => (
    <button
        class={["pk-btn", props.kind ? `pk-btn-${props.kind}` : "", props.extraClass ?? ""]}
        disabled={props.disabled}
        title={props.title}
        onClick={(e: MouseEvent) => {
            e.stopPropagation();
            if (!props.disabled) {
                props.onClick();
            }
        }}
    >
        {slots.default?.()}
    </button>
));

export const Panel = component<{ title?: string; extraClass?: string }>((props, { slots }) => (
    <section class={["pk-panel", props.extraClass ?? ""]}>
        {props.title != null ? <h3 class="pk-panel-title">{props.title}</h3> : null}
        {slots.default?.()}
    </section>
));

/** A labeled key/value row used in stat blocks. */
export const Stat = component<{ label: string; value: string | number }>(props => (
    <div class="pk-stat">
        <span class="pk-stat-label">{props.label}</span>
        <span class="pk-stat-value">{props.value}</span>
    </div>
));

/** A trial's badge: the real sprite for Kanto, a colored emblem everywhere else. */
export const BadgeIcon = component<{ gym: GymDefinition; earned: boolean; size?: number }>(
    props => {
        const size = props.size ?? 32;
        const { gym } = props;
        if (gym.badgeIcon != null) {
            return (
                <img
                    class={["pk-badge-img", props.earned ? "" : "unearned"]}
                    src={assetUrl(gym.badgeIcon)}
                    alt={gym.badge}
                    title={gym.badge}
                    width={size}
                    height={size}
                />
            );
        }
        const color = gym.specialty != null ? TYPE_COLORS[gym.specialty] : "#94a3b8";
        return (
            <span
                class={["pk-emblem", props.earned ? "" : "unearned"]}
                title={gym.badge}
                style={{
                    width: `${size}px`,
                    height: `${size}px`,
                    "--emblem": color,
                    fontSize: `${size * 0.45}px`
                }}
            >
                {gym.badge
                    .split(/[\s-]+/)
                    .map(word => word[0])
                    .join("")
                    .slice(0, 2)}
            </span>
        );
    }
);
