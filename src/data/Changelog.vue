<template>
    <Modal v-model="isOpen">
        <template v-slot:header>
            <h2>Changelog</h2>
        </template>
        <template v-slot:body>
            <details open>
                <summary>v2.1 Islands &amp; Legends</summary>
                <ul>
                    <li class="feature">
                        Orange Islands and Sevii Islands journeys, each with their own trials and
                        finale
                    </li>
                    <li class="feature">
                        52 anime-exclusive Kanto locations, 29 Orange Islands, giant-Pokémon boss
                        fights and Mew at the Tree of Beginning
                    </li>
                    <li class="feature">
                        Pokédex expanded to 251, with Johto Pokémon, Lugia, Ho-Oh and the legendary
                        beasts
                    </li>
                    <li class="feature">
                        Choose your region after each Hall of Fame; new Pokémon in the Hall earn
                        extra Fame
                    </li>
                    <li class="feature">
                        Automation: shopping, gifts, evolution, party building, travel and
                        challenges
                    </li>
                    <li class="feature">
                        Pinkan and Valencian variants, the Crystal Onix and the Pink Butterfree
                    </li>
                    <li class="feature">
                        Alternate forms: all 28 Unown, female forms, Partner Pikachu and Eevee,
                        Original Cap Pikachu, and Surfing and Flying Pikachu
                    </li>
                    <li class="feature">
                        Magikarp Jump patterns and their Gyarados, fished up with the Roddy's Old
                        Rod Fame upgrade
                    </li>
                    <li class="feature">
                        Effort: experience past the level cap becomes a growing damage bonus
                    </li>
                    <li class="feature">Portrait layout for phones</li>
                    <li class="balancing">
                        Slower, steadier pacing: about a day for a first clear; rematches get
                        tougher
                    </li>
                    <li class="balancing">
                        Renown: regions you haven't cleared get tougher for each other region
                        you've conquered, so every first clear takes a similar time; Sevii quests
                        are much tougher
                    </li>
                </ul>
            </details>
            <details>
                <summary>v2.0 Kanto Reborn</summary>
                A ground-up rebuild of the game.
                <ul>
                    <li class="feature">
                        All 151 Pokémon, 36 zones, fishing, Surf, gifts, trades and legendaries
                    </li>
                    <li class="feature">Live battle scene with automatic best-matchup switching</li>
                    <li class="feature">
                        8 Gyms, the Elite Four and the Champion, with exact battle forecasts
                    </li>
                    <li class="feature">
                        Evolution by level, stone and trade; a six-Pokémon party and PC box
                    </li>
                    <li class="feature">Pokédex milestones and the Hall of Fame prestige layer</li>
                    <li class="breaking">Saves from v0.1 are not carried over</li>
                </ul>
            </details>
            <details>
                <summary>v0.1 Route 1</summary>
                Route 1 to Brock vertical slice.
            </details>
        </template>
    </Modal>
</template>

<script setup lang="ts">
import Modal from "components/modals/Modal.vue";
import { ref } from "vue";

const isOpen = ref(false);

defineExpose({
    open() {
        isOpen.value = true;
    }
});
</script>

<style scoped>
details {
    margin: 10px 0;
    padding-left: 18px;
}

summary {
    cursor: pointer;
    margin-bottom: 10px;
    margin-left: -18px;
}

ul {
    margin: var(--feature-margin) 0;
    background: var(--raised-background);
    border: 2px solid rgba(0, 0, 0, 0.125);
    padding: 5px 5px 5px 15px;
    list-style: inside;
}

li {
    margin: 8px 0;
}

li::before {
    padding: 2px 8px;
    margin-right: 8px;
    border-radius: var(--border-radius);
}

.feature::before {
    content: "Feature";
    background: var(--accent1);
}

.fix::before {
    content: "Fix";
    background: var(--accent2);
}

.balancing::before {
    content: "Balancing";
    background: var(--accent3);
}

.breaking::before {
    content: "Breaking";
    background: var(--danger);
}
</style>
