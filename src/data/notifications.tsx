/**
 * The game's pop-up notifications and their settings: which kinds show, how long they stay,
 * where they appear and how many can stack. Settings are kept in the player's settings (all
 * saves share them) and edited on the Settings menu's Notifications tab.
 */
import Select from "components/fields/Select.vue";
import Toggle from "components/fields/Toggle.vue";
import { globalBus } from "game/events";
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

declare module "game/settings" {
    interface Settings {
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
});

let toast: ReturnType<typeof useToast> | null = null;
let appliedMax: number | null = null;

export function notificationOn(category: NotifyCategory): boolean {
    return settings.pkNotifyOff?.[category] !== true;
}

/** Shows a pop-up notification, if its kind is turned on. */
export function notify(
    text: string,
    kind: "success" | "info" | "warning" | "error",
    category: NotifyCategory
) {
    if (notificationOn(category)) showToast(text, kind);
}

/** Shows a pop-up with the player's duration, position and stacking settings. */
function showToast(text: string, kind: "success" | "info" | "warning" | "error") {
    toast ??= useToast();
    const max = settings.pkNotifyMax ?? 5;
    if (appliedMax !== max) {
        toast.updateDefaults({ maxToasts: max > 0 ? max : 1000 });
        appliedMax = max;
    }
    const seconds = settings.pkNotifyDuration ?? 4;
    toast[kind](text, {
        timeout: seconds > 0 ? seconds * 1000 : false,
        position: settings.pkNotifyPosition ?? POSITION.TOP_RIGHT
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
                    showToast("✨ A test notification!", "success");
                }}
            >
                Test notification
            </button>
        </div>
    );
}
