"""
Generates sprites for the fan-favorite variants documented on the Cobblemon wiki
(https://wiki.cobblemon.com/index.php/Pokémon/Unique_Forms) for Pokémon #1-251, by repainting
PokeAPI's default sprites: Arbok's hood patterns, Heart-Marked Wooper, the Mooshtanks, Shulker
Forretress and Alola-bias Pikachu. The artwork here is our own; only the designs follow the
wiki's descriptions.

Usage: python3 scripts/generateCobblemonVariants.py  (needs Pillow; downloads the base sprites)
Writes public/sprites/pokemon/{back/}{shiny/}{species}-{variant}.png
"""
import io
import math
import os
import urllib.request

from PIL import Image

BASE = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon"
OUT = os.path.join(os.path.dirname(__file__), "..", "public", "sprites", "pokemon")

K = (16, 16, 16)
Y = (238, 230, 82)
O = (246, 115, 74)
R = (197, 65, 24)
DR = (156, 16, 0)
W = (255, 255, 255)


def fetch(path):
    with urllib.request.urlopen(f"{BASE}/{path}") as response:
        return Image.open(io.BytesIO(response.read())).convert("RGBA")


def lum(rgb):
    return (0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2]) / 255


# ---------------------------------------------------------------------------------------------
# Arbok hood patterns. The hood face on the front sprite sits in an oval centered at (51, 41);
# it's cleared to plain hood color and a new face is drawn in pixel offsets from the center.
# ---------------------------------------------------------------------------------------------
HOOD_CENTER = (51, 41)
HOOD_RADII = (17, 12)


def almond(dx, dy, cx, cy, half_width, half_height, slant):
    """An almond-shaped eye centered at (cx, cy), tilted by `slant` pixels per pixel."""
    t = (dx - cx) / half_width
    if abs(t) > 1:
        return False
    return abs(dy - cy - slant * (dx - cx)) <= half_height * (1 - t * t) + 0.35


def circle(dx, dy, cx, cy, r):
    return (dx - cx) ** 2 + (dy - cy) ** 2 <= r * r


def line(dx, dy, x0, y0, x1, y1, width=0.6):
    """A thick line segment."""
    vx, vy = x1 - x0, y1 - y0
    t = max(0.0, min(1.0, ((dx - x0) * vx + (dy - y0) * vy) / (vx * vx + vy * vy)))
    return math.hypot(dx - x0 - t * vx, dy - y0 - t * vy) <= width


def heart(dx, dy, cx, cy, size):
    x = (dx - cx) / size
    y = -(dy - cy) / size + 0.25
    return (x * x + y * y - 1) ** 3 - x * x * y ** 3 <= 0


# Each design is a list of (shape, color, outlined) painted in order; outlined shapes get a
# black edge. Shapes take pixel offsets (dx, dy) from the hood's center.
def both(fn):
    return lambda dx, dy: fn(dx, dy, 1) or fn(dx, dy, -1)


ARBOK_DESIGNS = {
    # Ruby/Sapphire/Emerald's belly pattern: round eyes, eyebrows, lashes, a red mouth, two fangs.
    "legacy": [
        (both(lambda dx, dy, s: circle(dx, dy, 8 * s, -2, 3.6)), Y, True),
        (both(lambda dx, dy, s: circle(dx, dy, 8 * s, -2, 1.2)), K, False),
        (both(lambda dx, dy, s: line(dx, dy, 4 * s, -8, 12 * s, -7)), K, False),
        (both(lambda dx, dy, s: line(dx, dy, 12 * s, -3, 14 * s, -5, 0.5)), K, False),
        (lambda dx, dy: ((dx / 6) ** 2 + ((dy - 6) / 3) ** 2) <= 1, R, True),
        (both(lambda dx, dy, s: dx == 2 * s and 4 <= dy <= 6), W, False),
    ],
    # Pokémon Adventures' Attack pattern: slanted eyes and a diamond above the mouth.
    "attack": [
        (both(lambda dx, dy, s: almond(dx, dy, 8 * s, -3, 5, 2.4, 0.35 * s)), Y, True),
        (both(lambda dx, dy, s: circle(dx, dy, 8 * s, -2.6, 1)), K, False),
        (lambda dx, dy: abs(dx) + abs(dy - 1) <= 2.5, R, True),
        (lambda dx, dy: 5 + 0.08 * dx * dx <= dy <= 7 + 0.05 * dx * dx and abs(dx) <= 8, K, False),
    ],
    # Elusive: a grinning face with black eyes ringed in yellow.
    "elusive": [
        (both(lambda dx, dy, s: line(dx, dy, 4 * s, -8, 12 * s, -9)), K, False),
        (both(lambda dx, dy, s: circle(dx, dy, 8 * s, -3, 3.3)), Y, False),
        (both(lambda dx, dy, s: circle(dx, dy, 8 * s, -3, 2.2)), K, False),
        (lambda dx, dy: 2 + 0.04 * dx * dx <= dy <= 6 + 0.01 * dx * dx and abs(dx) <= 10, K, False),
        (lambda dx, dy: 3 + 0.04 * dx * dx <= dy <= 4 + 0.03 * dx * dx and abs(dx) <= 7, W, False),
    ],
    # Speed: a ring above the eyes, red eyebrows, round eyes with slit pupils, a "^" mouth.
    "speed": [
        (lambda dx, dy: 1.3 <= math.hypot(dx, dy + 8) <= 2.6, K, False),
        (both(lambda dx, dy, s: line(dx, dy, 4 * s, -6, 12 * s, -8, 0.8)), R, False),
        (both(lambda dx, dy, s: circle(dx, dy, 8 * s, -1, 3.4)), Y, True),
        (both(lambda dx, dy, s: line(dx, dy, 8 * s - s, -3, 8 * s + s, 1, 0.5)), K, False),
        (lambda dx, dy: abs(dy - (8 - 0.6 * abs(dx))) <= 0.6 and abs(dx) <= 6, K, False),
    ],
    # Sound: the CD-case pattern, slanted eyes, a red mouth and two side marks.
    "sound": [
        (both(lambda dx, dy, s: almond(dx, dy, 8 * s, -3, 5, 2.2, -0.3 * s)), Y, True),
        (both(lambda dx, dy, s: circle(dx, dy, 8 * s, -3, 1)), K, False),
        (lambda dx, dy: ((dx / 7) ** 2 + ((dy - 6) / 2.4) ** 2) <= 1, R, True),
        (both(lambda dx, dy, s: dx == 14 * s and -4 <= dy <= 4), K, False),
    ],
    # Dark Arbok's card: a red mask, yellow-rimmed eyes and a toothy red grin.
    "dark": [
        (lambda dx, dy: -7 <= dy <= 0 and abs(dx) <= 15, DR, False),
        (both(lambda dx, dy, s: almond(dx, dy, 8 * s, -3, 4.5, 2, 0.4 * s)), Y, False),
        (both(lambda dx, dy, s: almond(dx, dy, 8 * s, -3, 3.4, 1.1, 0.4 * s)), K, False),
        (lambda dx, dy: 3 + 0.03 * dx * dx <= dy <= 8 and abs(dx) <= 9, K, False),
        (lambda dx, dy: 4 + 0.03 * dx * dx <= dy <= 5 + (abs(dx) % 3 == 0) * 2 and abs(dx) <= 8, R, False),
    ],
    # "A Chansey Operation": a big heart.
    "heart": [
        (lambda dx, dy: heart(dx, dy, 0, 0, 7.5), R, True),
        (lambda dx, dy: circle(dx, dy, -3, -3, 1.3), O, False),
    ],
}


def paint_arbok(img, design):
    px = img.load()
    cx, cy = HOOD_CENTER
    rx, ry = HOOD_RADII
    light, dark = px[36, 44], px[66, 40]
    inside = {}
    for y in range(cy - ry, cy + ry + 1):
        for x in range(cx - rx, cx + rx + 1):
            if ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 > 1 or not px[x, y][3]:
                continue
            if y < 32 and x < 48:
                continue  # Arbok's real mouth
            inside[(x, y)] = None
            px[x, y] = dark if x > cx + 10 else light
    # Clear what's left of the original pattern around the oval (but not the real mouth).
    pattern_colors = [px[x, y][:3] for x, y in ((37, 35), (35, 33), (38, 37))]
    for y in range(31, cy + ry + 1):
        for x in range(cx - rx - 4, cx + rx + 4):
            if px[x, y][3] and px[x, y][:3] in pattern_colors and (x, y) not in inside:
                px[x, y] = light
    outlined = set()
    for shape, color, outline in ARBOK_DESIGNS[design]:
        for (x, y) in inside:
            if shape(x - cx, y - cy):
                px[x, y] = (*color, 255)
                if outline:
                    outlined.add((x, y))
                else:
                    outlined.discard((x, y))
    for (x, y) in inside:
        if (x, y) in outlined:
            continue
        if any((x + ox, y + oy) in outlined for ox, oy in ((1, 0), (-1, 0), (0, 1), (0, -1))):
            if px[x, y][:3] in (light[:3], dark[:3]):
                px[x, y] = (*K, 255)
    return img


# ---------------------------------------------------------------------------------------------
# Other variants
# ---------------------------------------------------------------------------------------------
def draw(img, x0, y0, rows, colors):
    px = img.load()
    for j, row in enumerate(rows):
        for i, ch in enumerate(row):
            if ch != ".":
                px[x0 + i, y0 + j] = (*colors[ch], 255)


def paint_wooper(img, shiny, back, normal):
    """Heart-Marked Wooper (Olesia's, "No Big Woop!"): a heart in place of the top chest mark."""
    if back:
        return img
    px = img.load()
    body = px[45, 56]
    for y in range(54, 59):
        for x in range(42, 51):
            if px[x, y][3] and lum(px[x, y][:3]) < 0.3 and px[x + 1, y][3] and px[x - 1, y][3]:
                px[x, y] = body
    # Pink like its gills, so the heart reads at sprite size.
    mark = (238, 115, 230)
    draw(img, 44, 55, [".H.H.", "HHHHH", ".HHH.", "..H.."], {"H": mark})
    return img


MOOSHTANK = {
    # (body main, light, dark, outline) for the pink parts, then what the black patches become.
    ("red", False): ((176, 32, 32), (214, 70, 60), (120, 18, 24), (72, 10, 12), (236, 232, 226), (190, 184, 178)),
    ("brown", False): ((150, 102, 64), (186, 138, 96), (108, 70, 42), (64, 40, 22), (236, 232, 226), (190, 184, 178)),
    # Shiny Mooshtanks resemble the Nether's crimson and warped fungi.
    ("red", True): ((128, 22, 44), (170, 40, 60), (90, 14, 30), (52, 8, 18), (232, 120, 50), (180, 80, 36)),
    ("brown", True): ((24, 124, 116), (46, 170, 156), (16, 88, 84), (10, 52, 50), (232, 120, 50), (180, 80, 36)),
}
MILTANK_PINK = {(213, 139, 131): 0, (246, 180, 164): 1, (156, 98, 106): 2, (106, 65, 65): 3}
MILTANK_BLACK = {(49, 49, 49): 4, (90, 90, 98): 5}
MUSHROOMS = {
    ("red", False): {"C": (204, 30, 30), "D": (255, 255, 255), "S": (232, 222, 200)},
    ("brown", False): {"C": (152, 104, 66), "D": (184, 136, 96), "S": (232, 222, 200)},
    ("red", True): {"C": (180, 20, 40), "D": (240, 140, 40), "S": (120, 40, 50)},
    ("brown", True): {"C": (30, 150, 140), "D": (240, 140, 40), "S": (60, 90, 110)},
}


def paint_miltank(img, color, shiny, back, normal):
    """Mooshtanks, after Minecraft's red and brown mooshrooms, with a mushroom on the head."""
    palette = MOOSHTANK[(color, shiny)]
    px = img.load()
    w, h = img.size
    base = dict(MILTANK_PINK)
    base.update(MILTANK_BLACK)
    npx = normal.load()
    for y in range(h):
        for x in range(w):
            p = npx[x, y]
            if p[3] and p[:3] in base:
                px[x, y] = (*palette[base[p[:3]]], p[3])
    cap = [".CCC.", "CDCDC", "CCCCC", "..S..", "..S.."] if color == "red" else [".CCC.", "CCDCC", "..S..", "..S.."]
    x0, y0 = (60, 30 - len(cap)) if back else (51, 29 - len(cap))
    draw(img, x0, y0, cap, MUSHROOMS[(color, shiny)])
    return img


SHULKER = {
    False: {"shell": [(154, 106, 162), (190, 148, 196), (112, 72, 124), (70, 44, 82)], "inside": [(222, 222, 162), (240, 240, 190), (176, 176, 120)]},
    True: {"shell": [(46, 44, 58), (74, 72, 90), (30, 28, 40), (16, 16, 22)], "inside": [(240, 212, 60), (252, 236, 120), (190, 160, 30)]},
}
FORRETRESS_SHELL = [(197, 164, 222), (230, 205, 246), (131, 123, 156), (82, 65, 98)]
FORRETRESS_INSIDE = [(189, 41, 65), (246, 98, 115), (131, 16, 49)]


def paint_forretress(img, shiny, back, normal):
    """Shulker Forretress: a purple Shulker shell around an End Stone interior."""
    px = img.load()
    npx = normal.load()
    w, h = img.size
    colors = SHULKER[shiny]
    for y in range(h):
        for x in range(w):
            p = npx[x, y]
            if not p[3]:
                continue
            rgb = p[:3]
            if rgb in FORRETRESS_INSIDE:
                px[x, y] = (*colors["inside"][FORRETRESS_INSIDE.index(rgb)], p[3])
            elif rgb in FORRETRESS_SHELL:
                px[x, y] = (*colors["shell"][FORRETRESS_SHELL.index(rgb)], p[3])
    return img


def paint_pikachu(img, shiny, back, normal):
    """Alola-bias Pikachu (Puka): blue eyes and brown ear tips."""
    px = img.load()
    w, h = img.size
    browns = {(41, 41, 41): (112, 66, 30), (65, 65, 74): (146, 92, 46)}
    for y in range(h):
        for x in range(w):
            p = px[x, y]
            if p[3] and p[:3] in browns:
                px[x, y] = (*browns[p[:3]], p[3])
    if not back:
        blue = (120, 190, 250) if shiny else (36, 84, 196)
        for y in range(36, 42):
            for x in list(range(34, 40)) + list(range(43, 49)):
                if px[x, y][3] and lum(px[x, y][:3]) < 0.12:
                    px[x, y] = (*blue, 255)
    return img


VARIANTS = {
    **{f"24-{name}": ("24", lambda img, shiny, back, normal, name=name: img if back else paint_arbok(img, name)) for name in ARBOK_DESIGNS},
    "194-heart": ("194", paint_wooper),
    "241-mooshtank-red": ("241", lambda img, shiny, back, normal: paint_miltank(img, "red", shiny, back, normal)),
    "241-mooshtank-brown": ("241", lambda img, shiny, back, normal: paint_miltank(img, "brown", shiny, back, normal)),
    "205-shulker": ("205", paint_forretress),
    "25-alola-bias": ("25", paint_pikachu),
}


def main():
    cache = {}
    for key, (species, paint) in VARIANTS.items():
        for back in (False, True):
            for shiny in (False, True):
                paths = [f"{'back/' if back else ''}{'shiny/' if sh else ''}{species}.png" for sh in (shiny, False)]
                for path in paths:
                    if path not in cache:
                        cache[path] = fetch(path)
                # Painters classify pixels by the regular sprite's palette, so shinies match.
                img = paint(cache[paths[0]].copy(), shiny, back, cache[paths[1]])
                folder = os.path.join(OUT, "back" if back else "", "shiny" if shiny else "")
                os.makedirs(folder, exist_ok=True)
                img.save(os.path.join(folder, f"{key}.png"), optimize=True)
    print(f"Wrote {len(VARIANTS)} variants to {OUT}")


if __name__ == "__main__":
    main()
