/**
 * Join Avenue (Black 2 and White 2's mechanic): an arcade on Route 4 whose shops grow with the
 * visitors you welcome. Here a visitor arrives every VISITOR_BATTLES wild battles once the
 * mechanic is unlocked, in every region; each wants a kind of shop, which opens or goes up a rank
 * (to MAX_SHOP_RANK). Ranks are kept for good, and each shop's perk grows with its rank. The
 * eight shops are the games' (Fandom's Join Avenue page); their perks are this game's take on
 * what each sells.
 */
export type ShopId =
    | "raffle"
    | "market"
    | "dojo"
    | "salon"
    | "nursery"
    | "florist"
    | "antiques"
    | "cafe";

export interface ShopDefinition {
    id: ShopId;
    name: string;
    icon: string;
    /** What the shop does at this rank. */
    perk: (rank: number) => string;
}

export const MAX_SHOP_RANK = 10;
/** Wild battles between visitors. */
export const VISITOR_BATTLES = 50;

/** The Raffle's Master Ball chance per visitor, per rank. */
export const RAFFLE_MASTER_CHANCE = 0.005;
/** The Antique Shop's chance per visitor, per rank, of an evolution item. */
export const ANTIQUE_CHANCE = 0.05;

export const SHOPS: Record<ShopId, ShopDefinition> = {
    raffle: {
        id: "raffle",
        name: "Raffle Shop",
        icon: "🎟",
        perk: r =>
            `each visitor draws ${r} Great Ball${r === 1 ? "" : "s"}, with a ${(RAFFLE_MASTER_CHANCE * r * 100).toFixed(1)}% chance of a Master Ball instead`
    },
    market: {
        id: "market",
        name: "Market",
        icon: "🛒",
        perk: r => `-${r}% Poké Mart prices`
    },
    dojo: {
        id: "dojo",
        name: "Dojo",
        icon: "🥋",
        perk: r =>
            `each visitor trains your lowest-level Pokémon ${r} level${r === 1 ? "" : "s"} (up to the level cap)`
    },
    salon: {
        id: "salon",
        name: "Beauty Salon",
        icon: "💇",
        perk: r =>
            `each visitor pampers ${r} box Pokémon: they become friendly, and friendship evolutions need no Soothe Bell`
    },
    nursery: {
        id: "nursery",
        name: "Nursery",
        icon: "🥚",
        perk: r => `Day Care Eggs come in ${r * 3}% fewer wild battles`
    },
    florist: {
        id: "florist",
        name: "Flower Shop",
        icon: "🌷",
        perk: r => `Berries for the road: +${r}% party HP`
    },
    antiques: {
        id: "antiques",
        name: "Antique Shop",
        icon: "🏺",
        perk: r =>
            `each visitor has a ${Math.round(ANTIQUE_CHANCE * r * 100)}% chance to bring an evolution item one of your Pokémon needs`
    },
    cafe: {
        id: "cafe",
        name: "Café",
        icon: "☕",
        perk: r => `the café's meals: +${r}% experience`
    }
};

export const SHOP_LIST: ShopDefinition[] = Object.values(SHOPS);

export type Avenue = Partial<Record<ShopId, number>>;

/** A shop's rank (0 until a visitor opens it). */
export function shopRank(avenue: Avenue, id: ShopId): number {
    return Math.min(MAX_SHOP_RANK, avenue[id] ?? 0);
}

/**
 * What the next visitor wants (from a random number in [0, 1)): any kind of shop not yet at the
 * top rank, so the avenue keeps growing until every shop is maxed.
 */
export function visitorWish(avenue: Avenue, roll: number): ShopId | undefined {
    const open = SHOP_LIST.filter(s => shopRank(avenue, s.id) < MAX_SHOP_RANK);
    if (open.length === 0) return undefined;
    return open[Math.min(open.length - 1, Math.floor(roll * open.length))].id;
}

/** The avenue after a visitor's shop opens or goes up a rank. */
export function welcome(avenue: Avenue, wish: ShopId): Avenue {
    return { ...avenue, [wish]: Math.min(MAX_SHOP_RANK, shopRank(avenue, wish) + 1) };
}

/** Passive perks: multipliers for Poké Mart prices, Egg battles, party HP and experience. */
export function avenuePerks(avenue: Avenue) {
    return {
        martPrice: 1 - 0.01 * shopRank(avenue, "market"),
        eggBattles: 1 - 0.03 * shopRank(avenue, "nursery"),
        hp: 1 + 0.01 * shopRank(avenue, "florist"),
        xp: 1 + 0.01 * shopRank(avenue, "cafe")
    };
}
