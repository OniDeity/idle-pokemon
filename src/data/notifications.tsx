/**
 * The game's pop-up notifications and their settings: which kinds show, how long they stay,
 * where they appear and how many can be on screen. Settings are kept in the player's settings
 * (all saves share them) and edited on the Settings menu's Notifications tab.
 *
 * Repeats stack: a notification that comes again while the last one is still up updates it with
 * a count ("Found 128 shiny Golbat ♀!") instead of opening another. Progress made offline is
 * summarized once the catch-up is done, so coming back doesn't bring minutes of pop-ups.
 */
import Select from "components/fields/Select.vue";
import Toggle from "components/fields/Toggle.vue";
import { globalBus } from "game/events";
import player from "game/player";
import settings from "game/settings";
import { POSITION, useToast } from "vue-toastification";

export type NotifyCategory =
    | "evolutions"
    | "shinies"
    | "captures"
    | "trials"
    | "prizes"
    | "defeats";

export const NOTIFY_CATEGORIES: [NotifyCategory, string, string][] = [
    ["evolutions", "Evolutions", "When one of your Pokémon evolves"],
    ["shinies", "Shiny Pokémon", "When a shiny Pokémon appears"],
    [
        "captures",
        "Legendary captures",
        "Legendary Pokémon caught or captured, and Shadow Pokémon snagged"
    ],
    [
        "trials",
        "Badges and championships",
        "Badges, trials and missions cleared, finales won, post-game bosses beaten"
    ],
    ["prizes", "Prizes", "Bug-Catching Contest wins and Lucky Number Show prizes"],
    ["defeats", "Lost battles", "When your party is defeated or runs out of time"]
];

/** Seconds a notification stays up; 0 keeps it until it's dismissed. */
const DURATIONS: [number, string][] = [
    [2, "2 seconds"],
    [4, "4 seconds"],
    [8, "8 seconds"],
    [15, "15 seconds"],
    [0, "Until dismissed"]
];

const POSITIONS: [POSITION, string][] = [
    [POSITION.TOP_RIGHT, "Top right"],
    [POSITION.TOP_CENTER, "Top center"],
    [POSITION.TOP_LEFT, "Top left"],
    [POSITION.BOTTOM_RIGHT, "Bottom right"],
    [POSITION.BOTTOM_CENTER, "Bottom center"],
    [POSITION.BOTTOM_LEFT, "Bottom left"]
];

/** How many notifications can be on screen at once; 0 is no limit. */
const STACKS: [number, string][] = [
    [1, "1"],
    [3, "3"],
    [5, "5"],
    [10, "10"],
    [0, "No limit"]
];

/** Notifications from offline progress: summed up afterwards, shown as they come, or hidden. */
export type OfflineNotify = "summary" | "each" | "off";

const OFFLINE_MODES: [OfflineNotify, string][] = [
    ["summary", "Summarize when I'm back"],
    ["each", "Show as they happen"],
    ["off", "Hide"]
];

/** Offline summaries show at most this many groups; the rest are counted in one line. */
const SUMMARY_GROUPS = 5;

declare module "game/settings" {
    interface Settings {
        /** Repeats of a notification still on screen add to its count instead of a new pop-up. */
        pkNotifyStack: boolean;
        pkNotifyOffline: OfflineNotify;
        /** Kinds of notification turned off (all are on by default). */
        pkNotifyOff: Partial<Record<NotifyCategory, boolean>>;
        pkNotifyDuration: number;
        pkNotifyPosition: POSITION;
        pkNotifyMax: number;
        /** The big text over the battle scene (evolutions, catches, badges). */
        pkBattleBanners: boolean;
    }
}

globalBus.on("loadSettings", s => {
    s.pkNotifyOff ??= {};
    s.pkNotifyDuration ??= 4;
    s.pkNotifyPosition ??= POSITION.TOP_RIGHT;
    s.pkNotifyMax ??= 5;
    s.pkBattleBanners ??= true;
    s.pkNotifyStack ??= true;
    s.pkNotifyOffline ??= "summary";
});

let toast: ReturnType<typeof useToast> | null = null;
let appliedMax: number | null = null;

export function notificationOn(category: NotifyCategory): boolean {
    return settings.pkNotifyOff?.[category] !== true;
}

type ToastKind = "success" | "info" | "warning" | "error";

/** How a notification stacks: repeats with the same key are counted together. */
export interface NotifyStack {
    key: string;
    /** The text for several at once, e.g. n => `Found ${n} shiny Golbat!`. */
    many: (count: number) => string;
}

interface Group {
    text: string;
    kind: ToastKind;
    count: number;
    many: (count: number) => string;
}

/** Stacks on screen now, by key, with the toast showing them. */
const onScreen = new Map<string, Group & { id: string | number }>();
/** What happened during the current offline catch-up, by key, in order. */
const awayGroups = new Map<string, Group>();

function catchingUp(): boolean {
    return player.offlineTime != null && player.offlineTime > 0;
}

/**
 * Shows a pop-up notification, if its kind is turned on. Repeats (the same text, or the same
 * `stack.key`) add to the one already up, and offline progress waits for a summary.
 */
export function notify(
    text: string,
    kind: ToastKind,
    category: NotifyCategory,
    stack?: NotifyStack
) {
    if (!notificationOn(category)) return;
    const key = stack?.key ?? text;
    const many = stack?.many ?? ((count: number) => `${text} (×${count})`);
    if (catchingUp()) {
        const mode = settings.pkNotifyOffline ?? "summary";
        if (mode === "off") return;
        if (mode === "summary") {
            const group = awayGroups.get(key);
            if (group) group.count++;
            else awayGroups.set(key, { text, kind, count: 1, many });
            return;
        }
    }
    show({ text, kind, count: 1, many }, key);
}

function show(group: Group, key: string) {
    const current = settings.pkNotifyStack !== false ? onScreen.get(key) : undefined;
    if (current) {
        current.count += group.count;
        toast ??= useToast();
        toast.update(current.id, {
            content: current.many(current.count),
            options: { timeout: timeout() }
        });
        return;
    }
    const text = group.count > 1 ? group.many(group.count) : group.text;
    const id = showToast(text, group.kind, () => {
        if (onScreen.get(key)?.id === id) onScreen.delete(key);
    });
    onScreen.set(key, { ...group, id });
}

/** Once an offline catch-up is done, shows what happened while the player was away. */
function flushAway() {
    if (awayGroups.size === 0) return;
    // The biggest groups first.
    const groups = [...awayGroups.entries()].sort(([, a], [, b]) => b.count - a.count);
    awayGroups.clear();
    groups.slice(0, SUMMARY_GROUPS).forEach(([key, group]) => show(group, key));
    const rest = groups.slice(SUMMARY_GROUPS).reduce((sum, [, group]) => sum + group.count, 0);
    if (rest > 0) {
        showToast(
            `…and ${rest} more notification${rest === 1 ? "" : "s"} while you were away (see the log).`,
            "info"
        );
    }
}

let wasCatchingUp = false;
globalBus.on("update", () => {
    const now = catchingUp();
    if (wasCatchingUp && !now) flushAway();
    wasCatchingUp = now;
});

function timeout(): number | false {
    const seconds = settings.pkNotifyDuration ?? 4;
    return seconds > 0 ? seconds * 1000 : false;
}

/** Shows a pop-up with the player's duration, position and on-screen limit. */
function showToast(text: string, kind: ToastKind, onClose?: () => void): string | number {
    toast ??= useToast();
    const max = settings.pkNotifyMax ?? 5;
    if (appliedMax !== max) {
        toast.updateDefaults({ maxToasts: max > 0 ? max : 1000 });
        appliedMax = max;
    }
    return toast[kind](text, {
        timeout: timeout(),
        position: settings.pkNotifyPosition ?? POSITION.TOP_RIGHT,
        onClose
    });
}

/** The Settings menu's Notifications tab. */
export function NotificationSettings() {
    const options = <T,>(list: [T, string][]) => list.map(([value, label]) => ({ value, label }));
    return (
        <div>
            {NOTIFY_CATEGORIES.map(([id, label, description]) => (
                <Toggle
                    title={
                        <span class="option-title">
                            {label}
                            <desc>{description}</desc>
                        </span>
                    }
                    modelValue={notificationOn(id)}
                    onUpdate:modelValue={(on: boolean) =>
                        (settings.pkNotifyOff = { ...settings.pkNotifyOff, [id]: !on })
                    }
                />
            ))}
            <Select
                title={
                    <span class="option-title">
                        Show for
                        <desc>How long each notification stays up.</desc>
                    </span>
                }
                options={options(DURATIONS)}
                modelValue={settings.pkNotifyDuration ?? 4}
                onUpdate:modelValue={value => (settings.pkNotifyDuration = value as number)}
            />
            <Select
                title={
                    <span class="option-title">
                        Position
                        <desc>Where notifications appear on the screen.</desc>
                    </span>
                }
                options={options(POSITIONS)}
                modelValue={settings.pkNotifyPosition ?? POSITION.TOP_RIGHT}
                onUpdate:modelValue={value => (settings.pkNotifyPosition = value as POSITION)}
            />
            <Select
                title={
                    <span class="option-title">
                        At most on screen
                        <desc>Older notifications close to make room for new ones.</desc>
                    </span>
                }
                options={options(STACKS)}
                modelValue={settings.pkNotifyMax ?? 5}
                onUpdate:modelValue={value => (settings.pkNotifyMax = value as number)}
            />
            <Toggle
                title={
                    <span class="option-title">
                        Stack repeats
                        <desc>
                            A notification that comes again while it's still on screen adds to its
                            count ("Found 128 shiny Golbat") instead of opening another.
                        </desc>
                    </span>
                }
                modelValue={settings.pkNotifyStack !== false}
                onUpdate:modelValue={(on: boolean) => (settings.pkNotifyStack = on)}
            />
            <Select
                title={
                    <span class="option-title">
                        Offline progress
                        <desc>Notifications for what happened while you were away.</desc>
                    </span>
                }
                options={options(OFFLINE_MODES)}
                modelValue={settings.pkNotifyOffline ?? "summary"}
                onUpdate:modelValue={value => (settings.pkNotifyOffline = value as OfflineNotify)}
            />
            <Toggle
                title={
                    <span class="option-title">
                        Battle banners
                        <desc>
                            The big text over the battle scene for catches, evolutions and badges.
                        </desc>
                    </span>
                }
                modelValue={settings.pkBattleBanners !== false}
                onUpdate:modelValue={(on: boolean) => (settings.pkBattleBanners = on)}
            />
            <button
                class="button"
                onClick={() => {
                    toast ??= useToast();
                    toast.clear();
                    onScreen.clear();
                    // Three at once, to show how repeats stack.
                    for (let i = 0; i < 3; i++) {
                        show(
                            {
                                text: "✨ A test notification!",
                                kind: "success",
                                count: 1,
                                many: n => `✨ ${n} test notifications!`
                            },
                            "test"
                        );
                    }
                }}
            >
                Test notification
            </button>
        </div>
    );
}
