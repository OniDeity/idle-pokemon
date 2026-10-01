"""
Generates sprites for the one-of-a-kind forms met as legendary encounters, by repainting the
game's own copies of PokeAPI's default sprites (public/sprites/pokemon):

- The giants of Pokémopolis ("The Ancient Puzzle of Pokémopolis"): Gengar, Alakazam and
  Jigglypuff, covered in tattoo-like crescent marks.
- The Giant Dragonite of Bill's lighthouse ("Mystery at the Lighthouse"): a storm-dark
  silhouette with glowing eyes.
- Mewtwo's clones ("Mewtwo Strikes Back"): marbled with darker stripes.
- The Lake of Rage's Red Gyarados: the shiny Gyarados art, in every view.
- The sleeping Snorlax that block the way: recolored like Pokémon Sleep's research-area Snorlax.
  Their shiny sprites stay the regular shiny, as in Pokémon Sleep.

The artwork is our own, following how the anime draws them.
Usage: python3 scripts/generateLegendaryForms.py  (needs Pillow)
Writes public/sprites/pokemon/{back/}{shiny/}{species}-{form}.png
"""
import colorsys
import math
import os

from PIL import Image

ROOT = os.path.join(os.path.dirname(__file__), "..", "public", "sprites", "pokemon")

GIANTS = {
    # species: (mark color, darken the body by, mark every colored pixel)
    "65": ((58, 14, 10), 1.0, True),
    "94": ((24, 10, 34), 0.72, False),
    "39": ((96, 18, 66), 1.0, False),
}

CLONES = [1, 4, 7, 3, 6, 9, 25, 52, 31, 18, 111, 27, 28, 123, 106, 87, 45, 55, 54, 117, 73, 130, 38, 37, 78, 134, 40]


def hls(rgb):
    return colorsys.rgb_to_hls(*(c / 255 for c in rgb))


def to_rgb(h, l, s):
    r, g, b = colorsys.hls_to_rgb(h, max(0.0, min(1.0, l)), max(0.0, min(1.0, s)))
    return (round(r * 255), round(g * 255), round(b * 255))


def noise(x, y, seed, scale):
    def h(ix, iy):
        n = (ix * 374761393 + iy * 668265263 + seed * 144665) & 0xFFFFFFFF
        n = ((n ^ (n >> 13)) * 1274126177) & 0xFFFFFFFF
        return ((n ^ (n >> 16)) & 0xFFFF) / 0xFFFF

    fx, fy = x / scale, y / scale
    ix, iy = math.floor(fx), math.floor(fy)
    tx, ty = fx - ix, fy - iy
    tx, ty = tx * tx * (3 - 2 * tx), ty * ty * (3 - 2 * ty)
    a = h(ix, iy) + (h(ix + 1, iy) - h(ix, iy)) * tx
    b = h(ix, iy + 1) + (h(ix + 1, iy + 1) - h(ix, iy + 1)) * tx
    return a + (b - a) * ty


def body_colors(img, bright=False):
    """The palette colors of the sprite's main body: its dominant hue, in all its shades."""
    counts = {}
    for p in img.get_flattened_data() if hasattr(img, "get_flattened_data") else img.getdata():
        if p[3] and p[:3] not in counts:
            counts[p[:3]] = 0
        if p[3]:
            counts[p[:3]] += 1
    hues = {}
    for rgb, n in counts.items():
        h, l, s = hls(rgb)
        if s > 0.18 and 0.15 < l < 0.92:
            bucket = round(h * 24) % 24
            hues[bucket] = hues.get(bucket, 0) + n
    if not hues:
        return set()
    if bright:
        # Every colored pixel, not just one hue.
        return {rgb for rgb in counts if hls(rgb)[2] > 0.12 and 0.15 < hls(rgb)[1] < 0.95}
    main = max(hues, key=hues.get) / 24
    result = set()
    for rgb in counts:
        h, l, s = hls(rgb)
        dist = min(abs(h - main), 1 - abs(h - main))
        if s > 0.12 and 0.12 < l < 0.95 and dist < 0.07:
            result.add(rgb)
    return result


def crescent(x, y):
    """Tattoo-like crescents on a staggered grid."""
    row = y // 16
    cx = (x + (row % 2) * 9) % 18 - 9
    cy = y % 16 - 7
    d = math.hypot(cx, cy)
    return abs(d - 5.5) < 1.1 and cy <= 1


def paint_giant(img, mark, darken, bright):
    px = img.load()
    body = body_colors(img, bright)
    w, h = img.size
    for y in range(h):
        for x in range(w):
            p = px[x, y]
            if not p[3] or p[:3] not in body:
                continue
            hh, l, s = hls(p[:3])
            if crescent(x, y):
                # On the body's own dark shades, the marks go darker still.
                shade = 0.55 if bright and l < 0.45 else 1.0
                px[x, y] = (*(round(c * shade) for c in mark), p[3])
            elif darken != 1.0:
                px[x, y] = (*to_rgb(hh, l * darken, s), p[3])
    return img


def paint_dragonite(img):
    """A storm-dark silhouette; the brightest pixels in the head glow like its eyes."""
    px = img.load()
    w, h = img.size
    ys = [y for y in range(h) for x in range(w) if px[x, y][3]]
    top, bottom = min(ys), max(ys)
    for y in range(h):
        for x in range(w):
            p = px[x, y]
            if not p[3]:
                continue
            _, l, _ = hls(p[:3])
            if l > 0.9 and y < top + (bottom - top) * 0.3:
                px[x, y] = (250, 226, 110, p[3])
            else:
                px[x, y] = (*to_rgb(0.6, 0.1 + 0.42 * l, 0.28), p[3])
    return img


def paint_clone(img, species):
    """Marbled, darker stripes across the body."""
    px = img.load()
    body = body_colors(img)
    w, h = img.size
    for y in range(h):
        for x in range(w):
            p = px[x, y]
            if not p[3] or p[:3] not in body:
                continue
            wave = (x * 0.55 + y + 7 * noise(x, y, species, 9)) % 9
            if wave < 2.4:
                hh, l, s = hls(p[:3])
                px[x, y] = (*to_rgb(hh - 0.02, l * 0.62, min(1.0, s * 1.2)), p[3])
    return img


# Pokémon Sleep research areas: body (hue, saturation, lightness), sampled from the game's art.
SLEEP_AREAS = {
    "cyan": (0.35, 0.42, 0.40),  # Cyan Beach: leafy green
    "taupe": (0.50, 0.21, 0.34),  # Taupe Hollow: slate gray
}


def paint_sleep(img, area, shiny):
    """Swaps Snorlax's blue-teal body for a research area's color, keeping the shading."""
    if shiny:
        return img
    th, ts, tl = SLEEP_AREAS[area]
    # Snorlax's main body shade is (49, 90, 123): lightness 0.34, saturation 0.43.
    px = img.load()
    w, h = img.size
    for y in range(h):
        for x in range(w):
            p = px[x, y]
            if not p[3]:
                continue
            hh, l, s = hls(p[:3])
            if 0.48 < hh < 0.62 and s > 0.2:
                px[x, y] = (*to_rgb(th, l * tl / 0.34, s * ts / 0.43), p[3])
    return img


def forms():
    for species, (mark, darken, bright) in GIANTS.items():
        yield species, f"{species}-giant", lambda img, m=mark, d=darken, b=bright: paint_giant(img, m, d, b)
    yield "149", "149-giant", paint_dragonite
    for species in CLONES:
        yield str(species), f"{species}-clone", lambda img, s=species: paint_clone(img, s)
    for area in SLEEP_AREAS:
        yield "143", f"143-sleep-{area}", lambda img, a=area, shiny=False: paint_sleep(img, a, shiny)


def red_gyarados():
    """The Lake of Rage's red Gyarados is the shiny Gyarados, in every view (its shiny too)."""
    for folder in ("", "back", "shiny", os.path.join("back", "shiny")):
        source = os.path.join(ROOT, "back" if folder.startswith("back") else "", "shiny", "130.png")
        Image.open(source).save(os.path.join(ROOT, folder, "130-red.png"), optimize=True)


def main():
    red_gyarados()
    count = 0
    for species, key, paint in forms():
        for folder in ("", "back", "shiny", os.path.join("back", "shiny")):
            base = os.path.join(ROOT, folder, f"{species}.png")
            img = Image.open(base).convert("RGBA")
            img = img if "sleep" in key and "shiny" in folder else paint(img)
            img.save(os.path.join(ROOT, folder, f"{key}.png"), optimize=True)
        count += 1
    print(f"Wrote {count} forms to {ROOT}")


if __name__ == "__main__":
    main()
