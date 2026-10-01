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
                        Fan favorites from Cobblemon: Arbok hood patterns, Heart-Marked Wooper,
                        Mooshtanks, Shulker Forretress, Alola-bias Pikachu, Valencian Gloom and
                        Bellossom
                    </li>
                    <li class="feature">
                        Regions unlock in order: Kanto, the Orange Islands, then the Sevii Islands
                    </li>
                    <li class="feature">
                        Effort: experience past the level cap becomes a growing damage bonus
                    </li>
                    <li class="feature">Settings → Behaviour → "Start over…" wipes all progress</li>
                    <li class="feature">
                        PC Box search, sorting (level, strength, name) and filters (type, can
                        evolve, ready to evolve, shiny, forms, not in party, at level cap)
                    </li>
                    <li class="feature">
                        Map search, sorting and filters: new Pokémon, not in box, unlocked, anime
                        or game locations, and type; "N new" tags on each place; a "Most
                        efficient" sort with estimated XP and ₽ per minute for your party
                    </li>
                    <li class="feature">
                        Soothe Bell: evolves a friendship Pokémon right away, at any level
                    </li>
                    <li class="balancing">
                        Link Cables and Soothe Bells are used up by each evolution, like stones
                        (₽2,500 each); an old reusable Link Cable becomes three new ones
                    </li>
                    <li class="feature">
                        Held-item trade evolutions need their item too: Metal Coat (Steelix,
                        Scizor), King's Rock (Politoed, Slowking), Dragon Scale (Kingdra) and
                        Up-Grade (Porygon2)
                    </li>
                    <li class="feature">
                        Travel Planner setting "Catch 'em all": goes wherever you're likeliest to
                        find Pokémon from your Pokédex that aren't in your box this journey,
                        variants and forms included, at any level
                    </li>
                    <li class="feature">
                        Every variant in your Pokédex gives +1% shiny chance
                    </li>
                    <li class="feature">
                        Team Strategist setting: bring as many Pokémon new to the Hall of Fame to
                        the finale as the forecast says can still win, for extra Fame
                    </li>
                    <li class="feature">
                        Legendary encounters are one-of-a-kind forms: Giant Alakazam, Gengar and
                        the new Giant Jigglypuff at Pokémopolis, with their tattoo-like marks, and
                        the storm-dark Giant Dragonite at Bill's Lighthouse
                    </li>
                    <li class="feature">
                        New Island is home to 27 of Mewtwo's striped Clone Pokémon
                    </li>
                    <li class="feature">
                        The sleeping Snorlax are recolored like Pokémon Sleep's: Taupe Hollow
                        Snorlax on Route 12 and Cyan Beach Snorlax on Murcott Island
                    </li>
                    <li class="balancing">
                        Mew is no longer a Pokédex gift; find it at the Tree of Beginning
                    </li>
                    <li class="feature">Portrait layout for phones</li>
                    <li class="fix">
                        Valencian Butterfree finally appears on Valencia Island (it was turning into
                        a Brown Mooshtank every time), and Pinkan Island's Pokémon and Valencian
                        Raticate no longer turn into Magikarp, Gyarados or Snorlax
                    </li>
                    <li class="fix">
                        Map sorting: "Highest level" puts the toughest places first (it used to
                        list them lowest first, which looked just like story order); tap a sort
                        again to reverse it, and places you can't reach yet go last
                    </li>
                    <li class="fix">
                        Pokémon already at their evolution level (caught above it, or waiting at
                        the level cap) now evolve; boxed ones get an Evolve button
                    </li>
                    <li class="fix">
                        Sprites ship with the game instead of loading from GitHub, so they no
                        longer go missing
                    </li>
                    <li class="balancing">
                        Slower, steadier pacing: about a day for a first clear; rematches get
                        tougher
                    </li>
                    <li class="balancing">
                        Renown: regions you haven't cleared get tougher for each other region you've
                        conquered, so every first clear takes a similar time; Sevii quests are much
                        tougher
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
