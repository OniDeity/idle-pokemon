<template>
    <Modal v-model="isOpen">
        <template v-slot:header>
            <h2>Changelog</h2>
        </template>
        <template v-slot:body>
            <details open>
                <summary>v2.10 Oblivia</summary>
                <ul>
                    <li class="feature">
                        Oblivia, from Pokémon Ranger: Guardian Signs, after Almia and a complete
                        Pokédex: 24 places from Dolce Island to the Sky Fortress, with the wild
                        Pokémon of the game's Browser. Start with Pichu
                    </li>
                    <li class="feature">
                        Eight missions against the Pokémon Pinchers, from Cocona Village's Celebi
                        to Zapdos's nest, then the Sky Fortress: Kasa, Hocus, Arley, Ed "the
                        Thinker" and Mewtwo, and Purple Eyes with the Golden Armor
                    </li>
                    <li class="feature">
                        New mechanic, Ranger Signs (after the Wireless Tower, then everywhere):
                        capturing Oblivia's story legendaries (the legendary beasts, Latias and
                        Latios, Ho-Oh, the legendary birds, Lugia) earns their Sign for good. Their
                        types join Poké Assist in every region
                    </li>
                    <li class="feature">
                        Oblivia's hidden Pokémon only come out for a legendary beast's Roar, and
                        its obstacles use Field Abilities like Almia's
                    </li>
                    <li class="feature">
                        Oblivia's legends: Celebi, Heatran, Shaymin, Giratina, Dialga, Palkia and
                        Arceus, plus the Manaphy Egg
                    </li>
                </ul>
            </details>
            <details>
                <summary>v2.9 Almia</summary>
                <ul>
                    <li class="feature">
                        Almia, from Pokémon Ranger: Shadows of Almia, after Fiore and a complete
                        Pokédex: 21 places from the Ranger School to Altru Tower, with the wild
                        Pokémon of the game's Browser. Start with Starly, Pachirisu or Munchlax
                    </li>
                    <li class="feature">
                        Eight missions against Team Dim Sun, from the Ranger School's graduation to
                        the three Gems, then Operation Brighton: the Sinis Trio, Blake Hall's
                        Dusknoir and Darkrai at the top of Altru Tower
                    </li>
                    <li class="feature">
                        Field Abilities: every Pokémon has one (Cut, Crush, Tackle, Burn, Soak,
                        Electrify, Recharge or Psy Power, ×1 to ×5). Some of Almia's Pokémon hide
                        behind obstacles and come out once a Pokémon in your box is strong enough
                    </li>
                    <li class="feature">
                        Almia's legends: Spiritomb, Heatran and Cresselia during the story, and
                        afterwards Darkrai, Dialga, Palkia, Shaymin, Celebi, the Regis (behind ×5
                        obstacles) and Regigigas, plus the Manaphy Egg and Kaito's Riolu
                    </li>
                </ul>
            </details>
            <details>
                <summary>v2.8 Fiore</summary>
                <ul>
                    <li class="feature">
                        Fiore, from Pokémon Ranger, after Sinnoh and a complete Pokédex: 14 places
                        from Lyra Forest to the Fiore Temple, with the wild Pokémon of the game's
                        Browser. Start with Plusle or Minun
                    </li>
                    <li class="feature">
                        No Poké Balls in Fiore: wild Pokémon are captured with the Capture Styler,
                        and beaten legendaries are captured outright
                    </li>
                    <li class="feature">
                        Eight missions against the Go-Rock Squad instead of Gyms, from escorting
                        Professor Hastings to the Aquamole, then the Go-Rock Quads, Billy and
                        Gordor's Power Styler beasts at the Fiore Temple
                    </li>
                    <li class="feature">
                        Fiore's legends: Entei in the Jungle Relic, and after the Temple Raikou,
                        Suicune, Kyogre, Groudon, Rayquaza, the Regis, Deoxys, Celebi and Mew, plus
                        the Precious Egg's Manaphy
                    </li>
                    <li class="feature">
                        New mechanic, Poké Assist (after Fiore's first mission, then everywhere): a
                        box Pokémon whose type is super effective against a wild Pokémon lends a
                        hand, for +25% damage
                    </li>
                </ul>
            </details>
            <details>
                <summary>v2.7.1 Halls of Fame</summary>
                <ul>
                    <li class="feature">
                        Each region keeps its own Hall of Fame: a Pokémon enshrined in Kanto is
                        still a new face (+5 Fame) when it clears Johto or Sinnoh
                    </li>
                    <li class="feature">
                        Choosing a region for a new journey suggests a team: the strongest Pokémon
                        it offers that aren't in its Hall of Fame yet. Partners new to that
                        region's Hall are starred and listed first
                    </li>
                    <li class="feature">
                        Fame upgrades for the Day Care (Flame Body: faster Eggs; Masuda Method:
                        shinier Eggs) and Contests (Pokéblock Kit: stronger Pokéblocks; Contest
                        Star: quicker contests and better odds), offered once each is unlocked
                    </li>
                    <li class="fix">
                        Sinnoh's trainers are 4% stronger, keeping its first clear near 11 hours
                        with the extra Fame
                    </li>
                </ul>
            </details>
            <details>
                <summary>v2.7 Sinnoh</summary>
                <ul>
                    <li class="feature">
                        Sinnoh, after Orre (XD) and a complete Pokédex: 58 places from Diamond,
                        Pearl and Platinum, Platinum's Gyms from Roark to Volkner, the Elite Four and
                        Champion Cynthia, and all 107 Gen 4 Pokémon (Pokédex now #1-493)
                    </li>
                    <li class="feature">
                        Sinnoh's gifts, trades and legends: Cynthia's Togepi, Bebe's Eevee, Riley's
                        Riolu, the Old Chateau's Rotom (and the Rotom Catalog's appliances), the
                        lake trio, Dialga, Palkia, Giratina, Heatran, Regigigas, Cresselia, the
                        roaming birds, Darkrai, Shaymin (and its Sky Forme), Arceus, Manaphy and
                        Phione
                    </li>
                    <li class="feature">
                        Honey Trees: slather Honey on Sinnoh's 21 trees and shake down what comes
                        (Combee, Burmy in its three cloaks, Cherubi, Heracross; Munchlax on the four
                        trees your Trainer ID picks). The new Pokétch automation (Fame) slathers and
                        shakes them for you
                    </li>
                    <li class="feature">
                        The Underground (a generation mechanic, unlocked past the Coal Badge): wild
                        battles uncover walls to dig for Spheres, evolution stones, fossils, Arceus's
                        Plates (each turns your Arceus into its type) and the Odd Keystone for
                        Spiritomb, in every region
                    </li>
                    <li class="feature">
                        Professor Oak's new rewards as the Pokédex grows: the Poké Radar at 250
                        (chain a grass Pokémon for better shiny odds, and find Sinnoh's radar-only
                        Pokémon), Destiny Knot, Luck Incense, Expert Belt, Azure Flute and Life Orb
                    </li>
                    <li class="feature">
                        Pal Park: once Sinnoh is cleared, every region you clear sends its Pokémon
                        there, and Kanto's and Hoenn's Game Boy Advance games add their dual-slot
                        Pokémon to Sinnoh's grass
                    </li>
                    <li class="feature">
                        The Distortion World after the League: beat Cyrus at its bottom for ×1.25
                        Fame that journey and the Griseous Orb for Giratina's Origin Forme
                    </li>
                    <li class="feature">
                        Gen 4's evolutions of older Pokémon (Magnezone, Togekiss, Electivire,
                        Weavile...) and its babies from Eggs, with later generations' easier methods
                        (stones instead of special places). They start with your first Sinnoh
                        journey, then work in every region
                    </li>
                </ul>
            </details>
            <details>
                <summary>v2.6.2 Menu pages</summary>
                <ul>
                    <li class="feature">
                        Every menu is split into pages with tabs, remembered between visits: Party
                        (Party, PC Box, Day Care, Contests), Poké Mart (Poké Balls, Training,
                        Evolution items, Poké Snacks), League (Gyms, the finale, Level caps),
                        Pokédex (Pokédex, Professor Oak's rewards), Hall of Fame (New journey, Fame
                        upgrades, Automation, Mechanics, Champions) and the Map (Routes &amp;
                        Dungeons, Gifts, Trades &amp; Legends, and Johto's Pokégear)
                    </li>
                    <li class="fix">
                        The League explains Double Battles' backup instead of calling trainer
                        battles one-on-one
                    </li>
                </ul>
            </details>
            <details>
                <summary>v2.6.1 Tidier menus</summary>
                <ul>
                    <li class="feature">
                        The Shopping List automation keeps Kurt's Apricorn Balls stocked too (10
                        of each, once they're unlocked)
                    </li>
                    <li class="feature">
                        More compact menus: tighter panels, rows and map cards, smaller Pokédex and
                        PC Box cells, three party slots to a row, and a shorter Contest Hall
                    </li>
                    <li class="fix">
                        Map cards no longer repeat their gear ("Surf or a rod or a better rod or
                        Surf…")
                    </li>
                </ul>
            </details>
            <details>
                <summary>v2.6 Hoenn's anime</summary>
                <ul>
                    <li class="feature">
                        34 anime-only Hoenn places from Advanced Generation and the Hoenn movies:
                        the Oldale Ruins, the Mirage Kingdom and Togepi Paradise, the Valley of
                        Steel, the Forbidden Forest, Muscle Island, the A-B-C Islands, Wales
                        Island's fossil Pokémon, Wailmer Island, Forina, LaRousse City and more
                    </li>
                    <li class="feature">
                        Meta Groudon, the artificial Groudon from "Jirachi: Wish Maker", rises in
                        Forina after the League: a one-of-a-kind legendary encounter with its own
                        Pokédex entry
                    </li>
                    <li class="feature">
                        Ash's Hoenn Cap Pikachu waits in Littleroot Town after the League
                    </li>
                </ul>
            </details>
            <details>
                <summary>v2.5 Contests and Double Battles</summary>
                <ul>
                    <li class="feature">
                        Double Battles, Hoenn's generation mechanic (past the Stone Badge): your
                        strongest other Pokémon still standing backs up the one sent out with half
                        its damage, in every region, without being attacked. Tate &amp; Liza send
                        out two at once
                    </li>
                    <li class="feature">
                        Pokémon Contests (Verdanturf's Contest Hall, past the Dynamo Badge): feed
                        Pokéblocks to raise Cool, Beauty, Cute, Smart and Tough, enter contests from
                        the Party screen, and win ribbons up to Master Rank. A category's first
                        Master Rank win earns its Cosplay Pikachu (Rock Star, Belle, Pop Star,
                        Ph.D., Libre)
                    </li>
                    <li class="feature">
                        Feebas evolves the later games' way: trade it holding a Prism Scale (in
                        the Poké Mart from 5 badges), with a Link Cable
                    </li>
                    <li class="feature">
                        Bring a Partner (the Cable Club, past the Dynamo Badge): start any new
                        journey with one Pokémon from your Hall of Fame beside your starter
                    </li>
                    <li class="balancing">
                        Hoenn and Orre are retuned for Double Battles
                    </li>
                </ul>
            </details>
            <details>
                <summary>v2.4 Hoenn</summary>
                <ul>
                    <li class="feature">
                        Hoenn, from Ruby, Sapphire and Emerald: 54 places from Route 101 to Victory
                        Road (sea routes with the same Pokémon are grouped), Treecko, Torchic or
                        Mudkip, Emerald's eight Gyms, and the Elite Four and Champion Wallace.
                        Unlocks after Johto, once your Pokédex has all 251
                    </li>
                    <li class="feature">
                        All 135 Hoenn Pokémon join the Pokédex: Dive (from Tate &amp; Liza) reaches
                        the seaweed under Routes 124 and 126, Feebas hides in Route 119's river,
                        and Hoenn's gifts and trades cover the rest (the fossils, Castform,
                        Wynaut and Azurill Eggs, Shedinja, Steven's Beldum)
                    </li>
                    <li class="feature">
                        Hoenn's legends: Kyogre and Groudon in the Cave of Origin, then after the
                        League Rayquaza, the three Regis, roaming Latias and Latios, Jirachi,
                        Deoxys, and Emerald's ticket islands (Mew, Lugia, Ho-Oh)
                    </li>
                    <li class="feature">
                        DeepSeaTooth and DeepSeaScale in the Poké Mart for Clamperl; Feebas
                        evolves like a friendship Pokémon for now (Contests are coming)
                    </li>
                    <li class="balancing">
                        Orre (Colosseum) now comes after Hoenn. If you've already been to Orre it
                        stays open
                    </li>
                    <li class="fix">Johto's badges are called badges again ("Zephyr Badge")</li>
                </ul>
            </details>
            <details>
                <summary>v2.3.1 Pokémon XD</summary>
                <ul>
                    <li class="feature">
                        Orre, from Pokémon XD: its own journey after Colosseum. Eevee starts; snag
                        XD's Shadow Pokémon around Gateon Port, Phenac and the Cipher Key Lair, beat
                        Lovrina, Snattle, Gorigan, Ardos and Eldes, then face XD001 (Shadow Lugia)
                        and Greevil's Shadow legendary birds on Citadark Isle
                    </li>
                    <li class="feature">
                        Poké Spots: XD's Rock, Oasis and Cave Spots lure wild Sandshrew, Gligar,
                        Trapinch, Hoppip, Phanpy, Surskit, Zubat, Aron and Wooper with Poké Snacks
                        (one per encounter, sold at the Poké Mart). Unlocked in XD, then every
                        region gets Poké Spots
                    </li>
                    <li class="feature">
                        XD's trades (Danny's Elekid, Duking's Meditite, Shuckle and Larvitar) and
                        Mt. Battle's Johto first partners after the finale
                    </li>
                    <li class="balancing">
                        Colosseum's Venus, Ein and Realgam Tower are easier now that Shadow
                        Pokémon get purified along the way (a first clear takes about 11 hours)
                    </li>
                </ul>
            </details>
            <details>
                <summary>v2.3 Orre</summary>
                <ul>
                    <li class="feature">
                        Orre, from Pokémon Colosseum: no wild Pokémon, only trainers, and Cipher's
                        Shadow Pokémon to snag with the Snag Machine. Espeon and Umbreon start
                        together; beat Miror B., Dakim, Venus and Ein, then climb Realgam Tower.
                        Unlocks after Johto, once your Pokédex has all 251
                    </li>
                    <li class="feature">
                        Shadow Pokémon: every species has a Shadow form with its own Pokédex entry.
                        Snag Colosseum's 48 Shadow Pokémon from their trainers (one each per
                        journey), and Entei, Suicune, Raikou, Metagross and Tyranitar by beating the
                        admins who hold them
                    </li>
                    <li class="feature">
                        Purification: a Shadow Pokémon's heart opens after 100 wild battles won in
                        your party; purify it at the Relic Stone and it becomes its species again
                        (the Evolution Planner automation does it for you)
                    </li>
                    <li class="feature">
                        Two new generation mechanics carry back: the Snag Machine (Cipher Peons roam
                        every other region with Shadow versions of its Pokémon, 2% of encounters)
                        and the Relic Stone (purify anywhere)
                    </li>
                    <li class="feature">
                        Orre's Hoenn Pokémon join the Pokédex: Makuhita, Meditite, Swablu, Plusle,
                        Vibrava, Absol, Tropius, Metagross and their evolutions; Duking's Plusle and
                        Mt. Battle's Ho-Oh too
                    </li>
                    <li class="feature">
                        The Lucky Number Show draws every 100 wild battles instead of once a day
                    </li>
                </ul>
            </details>
            <details>
                <summary>v2.2 Johto</summary>
                <ul>
                    <li class="feature">
                        Johto, from HeartGold and SoulSilver: 50 places from New Bark Town to Mt.
                        Silver, Falkner to Clair, and Will, Koga, Bruno, Karen and Champion Lance
                    </li>
                    <li class="feature">
                        Unlocks after the Sevii Islands, once your Pokédex has every species the
                        first three regions offer
                    </li>
                    <li class="feature">
                        58 anime-only Johto places, from Palm Hills and the Whirl Islands to the
                        Dragon Holy Land, Alto Mare and Mount Quena (where Mewtwo's clones now
                        live), each with the wild Pokémon seen in its episodes
                    </li>
                    <li class="feature">
                        The Johto anime's one-of-a-kind Pokémon: wild Pudgy Pidgey on Pudgy Pidgey
                        Isle, and Silver the young Lugia, the Unown's Entei, Dark Celebi and Dark
                        Tyranitar as legendary encounters
                    </li>
                    <li class="feature">
                        Headbutt trees and Rock Smash rocks: new kinds of encounter in Johto
                    </li>
                    <li class="feature">
                        All 28 Unown in the Ruins of Alph's chambers
                    </li>
                    <li class="feature">
                        Morning, day and night: every time of day's wild Pokémon are always in
                        Johto's grass, at their average HeartGold/SoulSilver rates
                    </li>
                    <li class="feature">
                        Pokégear: win the Radio Card in Goldenrod to tune in to Johto's seven swarms
                        (a one-time fee each adds the swarm to that place for the journey) and the
                        Lucky Number Show (drawn automatically every 100 wild battles; match its
                        last digits with your Trainer ID for prizes, up to a Master Ball)
                    </li>
                    <li class="feature">
                        Bug-Catching Contest: a one-time entry fee adds its bugs to the National
                        Park for the journey, and your first Scyther or Pinsir there wins the Sun
                        Stone
                    </li>
                    <li class="feature">
                        Kurt's Apricorn Balls: Level, Lure, Moon, Friend, Love, Fast and Heavy
                        Balls, picked automatically when they work best. Reach Kurt in Azalea Town
                        and every region's Poké Mart stocks them from then on
                    </li>
                    <li class="feature">
                        The Route 34 Day Care: leave a Pokémon and its Eggs hatch into its family's
                        first stage, baby Pokémon included
                    </li>
                    <li class="feature">
                        Generation mechanics carry back: once you reach a generation's new mechanic
                        in its region, it works in every region after: breeding (reach the Route 34
                        Day Care, and every journey has a Day Care from the start) and Kurt's
                        Apricorn Balls; see the Hall of Fame's Mechanics panel
                    </li>
                    <li class="feature">
                        Johto's legends: Lugia in the Whirl Islands, Ho-Oh on the Bell Tower,
                        Raikou, Entei and Suicune, Celebi and the Spiky-eared Pichu at the Ilex
                        Forest shrine, and the Lake of Rage's Red Gyarados (its own form)
                    </li>
                    <li class="feature">
                        Johto's gifts and trades: the Odd Egg (any baby Pokémon, often shiny),
                        Bill's Eevee, Kirk's Shuckle, Kiyo's Tyrogue, Kenya, the Dragon's Den
                        Dratini, Union Cave's Lapras, the Goldenrod Game Corner, four NPC
                        trades, and Sudowoodo on Route 36 (bring the SquirtBottle)
                    </li>
                    <li class="feature">
                        Red waits at the summit of Mt. Silver after the League: beat him for a
                        Master Ball
                    </li>
                    <li class="feature">
                        Every species can now be caught: Sudowoodo, Elekid and Celebi arrive with
                        Johto
                    </li>
                    <li class="fix">
                        The Sevii Islands now give Rock Smash, so the rocks on Kindle Road, Mt.
                        Ember and Sevault Canyon can be smashed
                    </li>
                    <li class="feature">
                        Day Care: search parents or Eggs, see what each Pokémon's Egg hatches into
                        (★ new to your Pokédex, • not in your box), filter and sort them, take
                        your Pokémon back, "Pick best", and Auto-swap to the most useful parent
                        after each Egg
                    </li>
                    <li class="feature">
                        Every panel (PC Box, Day Care, Map tiers, Mart sections…) collapses with a
                        tap on its title, and remembers it in this browser
                    </li>
                    <li class="feature">
                        Headbutt trees carry back: learn Headbutt in Johto and every journey has it,
                        with HeartGold/SoulSilver's tree Pokémon on 18 Kanto routes and Viridian
                        Forest (at each route's levels)
                    </li>
                </ul>
            </details>
            <details>
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
                        Female Magikarp can have Magikarp Jump patterns and female Wooper the heart
                        mark, so patterns are twice as common as before (30% of Magikarp)
                    </li>
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
