/**
 * Pokémon Musicals (Black and White's mechanic, at Nimbasa City's Musical Theater): a Pokémon
 * dressed in props performs in a show with a theme, and props of that theme please the audience.
 * Here a show starts every MUSICAL_BATTLES wild battles once the mechanic is unlocked; your
 * strongest party Pokémon performs wearing up to MAX_WORN props of the show's theme, each one a
 * better chance to win. The audience throws a prop (of the show's theme first) to a winner, and
 * sometimes to the others. Props are kept for good. Props and themes are Serebii's Musical page;
 * Serebii doesn't give Stardom's theme, so it takes Cool, the one the other shows leave.
 */
export type MusicalTheme = "cool" | "cute" | "elegant" | "unique";

export const THEME_NAMES: Record<MusicalTheme, string> = {
    cool: "Cool",
    cute: "Cute",
    elegant: "Elegant",
    unique: "Unique"
};

export const SHOWS: { name: string; theme: MusicalTheme }[] = [
    { name: "Stardom", theme: "cool" },
    { name: "Forest Stroll", theme: "cute" },
    { name: "A Sweet Soirée", theme: "elegant" },
    { name: "Exciting Nimbasa", theme: "unique" }
];

const C: MusicalTheme = "cool";
const Q: MusicalTheme = "cute";
const E: MusicalTheme = "elegant";
const U: MusicalTheme = "unique";

/** Every prop and its theme (two different props share each of "Headband" and "Frilly Apron"). */
export const PROPS: [string, MusicalTheme][] = [
    ["Scarlet Hat", U],
    ["Wig", C],
    ["Witchy Hat", U],
    ["Big Barrette", Q],
    ["Pirate Hat", C],
    ["Cowboy Hat", C],
    ["Headband (cute)", Q],
    ["Laurel Wreath", E],
    ["Crown", E],
    ["Chef's Hat", C],
    ["Lace Cap", E],
    ["Gentleman's Hat", E],
    ["Fedora", Q],
    ["Horn Helmet", C],
    ["Tiara", E],
    ["Bib", U],
    ["Professor Hat", U],
    ["Headband (elegant)", E],
    ["Helmet", U],
    ["Beret", U],
    ["Straw Hat", U],
    ["Jester's Cap", U],
    ["Decorative Ribbon", Q],
    ["Red Nose", U],
    ["Germ Mask", U],
    ["Googly Specs", U],
    ["Gorgeous Specs", E],
    ["Square Glasses", E],
    ["White Domino Mask", C],
    ["Smiley-Face Mask", U],
    ["Fluffy Beard", E],
    ["Monocle", E],
    ["Blue Flower", Q],
    ["Red Flower", Q],
    ["Striped Barrette", Q],
    ["Small Barrette", Q],
    ["Gorgeous Flower", E],
    ["Pink Barrette", Q],
    ["Blue Barrette", Q],
    ["Red Barrette", Q],
    ["Green Barrette", U],
    ["Snow Crystal", E],
    ["Red Parasol", Q],
    ["Whisk", Q],
    ["Lonely Flower", E],
    ["Paint Brush", U],
    ["Electric Guitar", C],
    ["Big Bag", U],
    ["Wind Up Key", Q],
    ["Toy Fishing Rod", C],
    ["Toy Cutlass", C],
    ["Toy Sword", C],
    ["Rigid Shield", C],
    ["Mallet", U],
    ["Colorful Parasol", Q],
    ["Candy", Q],
    ["White Pompom", Q],
    ["Shuriken", C],
    ["Cane", E],
    ["Standing Mike", C],
    ["Wrench", U],
    ["Tambourine", Q],
    ["Pocket Watch", E],
    ["Lantern", C],
    ["Purse", Q],
    ["Rose", E],
    ["Microphone", C],
    ["Ladle", C],
    ["Thick Book", U],
    ["Bouquet", E],
    ["Frying Pan", C],
    ["Pennant", U],
    ["Gift Box", Q],
    ["Football", C],
    ["Trident", C],
    ["Fake Bone", U],
    ["Magic Wand", U],
    ["Maraca", U],
    ["Round Mushroom", U],
    ["Racket", C],
    ["Trumpet", E],
    ["Toy Cake", U],
    ["Crimson Scarf", Q],
    ["Scarlet Cape", C],
    ["Black Wings", C],
    ["Black Tie", E],
    ["Black Cape", E],
    ["White Wings", Q],
    ["White Cape", E],
    ["Bowtie", E],
    ["Dressy Tie", E],
    ["Striped Tie", C],
    ["Necklace", E],
    ["Frilly Apron (cute)", Q],
    ["Round Button", Q],
    ["Tie", C],
    ["Fake Belly Button", U],
    ["Umber Belt", C],
    ["Frilly Apron (elegant)", E],
    ["Hula Skirt", U],
    ["Winner's Belt", C]
];

export const PROP_THEME: Record<string, MusicalTheme> = Object.fromEntries(PROPS);

/** Wild battles between shows. */
export const MUSICAL_BATTLES = 80;
/** Props a performer can wear that count (head, face, body and hand, roughly). */
export const MAX_WORN = 4;
/** Prize money for a win, per prop worn plus one. */
export const MUSICAL_PRIZE = 800;
/** Chance the audience throws a prop to a performer who didn't win. */
export const RUNNER_UP_PROP_CHANCE = 0.3;

/** Props a show starts you with: the first of each theme. */
export const STARTER_PROPS: string[] = (["cool", "cute", "elegant", "unique"] as const).map(
    theme => PROPS.find(([, t]) => t === theme)![0]
);

/** Props owned of a theme, as many as can be worn. */
export function propsWorn(owned: Partial<Record<string, boolean>>, theme: MusicalTheme): number {
    return Math.min(MAX_WORN, PROPS.filter(([name, t]) => t === theme && owned[name]).length);
}

/** The chance to win a show: one in four bare, up to 85% with a full outfit of its theme. */
export function musicalWinChance(worn: number): number {
    return Math.min(0.85, 0.25 + 0.15 * worn);
}

/**
 * The prop the audience throws (from a random number in [0, 1)): one not owned yet, of the
 * show's theme while any are left, or undefined once every prop is owned.
 */
export function thrownProp(
    owned: Partial<Record<string, boolean>>,
    theme: MusicalTheme,
    roll: number
): string | undefined {
    const missing = PROPS.filter(([name]) => !owned[name]);
    const themed = missing.filter(([, t]) => t === theme);
    const pool = themed.length > 0 ? themed : missing;
    if (pool.length === 0) return undefined;
    return pool[Math.min(pool.length - 1, Math.floor(roll * pool.length))][0];
}
