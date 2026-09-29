/**
 * Wiping all progress, offered in the Settings modal. Profectus's own hard reset starts a new
 * save slot and keeps the old one; this also deletes the old one so nothing is left behind.
 */
import player from "game/player";
import settings from "game/settings";
import { hardReset } from "util/save";
import { ref } from "vue";
import { Button } from "./components";

/** Two-step confirmation for wiping the save. */
const confirmingReset = ref(false);

/** Starts a brand-new save and deletes the old one, so nothing is left behind. */
async function startOver() {
    confirmingReset.value = false;
    const oldId = player.id;
    await hardReset();
    localStorage.removeItem(oldId);
    settings.saves = settings.saves.filter(id => id !== oldId);
}

/** "Start over" for the Settings modal (Behaviour tab). */
export function ResetProgress() {
    return (
        <div class="pk-settings-section pk-reset">
            <span class="option-title">
                Start over
                <desc>Erase all progress and begin a brand-new game.</desc>
            </span>
            {confirmingReset.value ? (
                <>
                    <p class="pk-warning">
                        Start over from scratch? This erases everything: your journey, the Pokédex,
                        Fame, upgrades and the Hall of Fame. It can't be undone.
                    </p>
                    <div class="pk-reset-actions">
                        <Button kind="danger" onClick={() => void startOver()}>
                            Erase everything
                        </Button>
                        <Button kind="ghost" onClick={() => (confirmingReset.value = false)}>
                            Keep playing
                        </Button>
                    </div>
                </>
            ) : (
                <Button kind="ghost" onClick={() => (confirmingReset.value = true)}>
                    Start over…
                </Button>
            )}
        </div>
    );
}
