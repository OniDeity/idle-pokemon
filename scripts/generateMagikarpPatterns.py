"""
Generates sprites for the Magikarp Jump patterns and their Gyarados evolutions by repainting the
body of PokeAPI's default Magikarp and Gyarados sprites. Only body pixels change; outlines, eyes,
fins and whiskers are kept, and the original shading is carried over onto the new colors.

Magikarp colors follow Pokémon: Magikarp Jump; Gyarados colors follow the descriptions of
Cobblemon's Gyarados Jump Patterns (https://wiki.cobblemon.com/index.php/Pokémon/Unique_Forms).

Usage: python3 scripts/generateMagikarpPatterns.py  (needs Pillow; downloads the base sprites)
Writes public/sprites/pokemon/{back/}{shiny/}{129|130}-{pattern}.png
"""
import colorsys
import io
import math
import os
import urllib.request

from PIL import Image

BASE = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon"
OUT = os.path.join(os.path.dirname(__file__), "..", "public", "sprites", "pokemon")

# Body palette of each base sprite, and its main (mid-tone) color.
MAGIKARP_BODY = {(131, 0, 65), (189, 32, 82), (189, 65, 65), (246, 98, 24), (255, 156, 98), (255, 230, 197)}
MAGIKARP_MAIN = (246, 98, 24)
MAGIKARP_FINS = {(255, 255, 255), (205, 205, 213), (139, 139, 164), (82, 82, 98)}
GYARADOS_BODY = {(24, 65, 115), (24, 98, 148), (32, 139, 172), (65, 180, 238), (123, 213, 238)}
GYARADOS_MAIN = (32, 139, 172)
GYARADOS_BELLY = {(90, 65, 32), (205, 180, 123), (246, 230, 172)}
GYARADOS_BELLY_MAIN = (205, 180, 123)

# Where the head is, in the body's bounding box (0-1), for forehead and mask patterns; and
# which way the fish faces (u runs from head to tail).
LAYOUT = {
    ("129", False): {"eye": (0.3, 0.38), "flip": False},
    ("129", True): {"eye": (0.72, 0.22), "flip": True},
    ("130", False): {"eye": (0.2, 0.62), "flip": False},
    ("130", True): {"eye": (0.9, 0.5), "flip": True},
}

WHITE = (246, 244, 238)
BLACK = (40, 40, 44)
ORANGE = (246, 98, 24)
GOLD = (255, 205, 40)
SHINY_GOLD = (255, 222, 0)
RED = (225, 45, 45)
PINK = (250, 140, 180)
LIGHT_BLUE = (130, 196, 250)
GRAY = (150, 150, 162)
DARK_GRAY = (78, 78, 90)
PURPLE = (160, 88, 206)
DARK_PURPLE = (88, 38, 130)
DARK_BLUE = (32, 52, 150)
APRICOT = (255, 172, 92)
BROWN = (150, 92, 52)
STRIPE = (70, 40, 24)
LIGHT_GREEN = (150, 214, 118)
GREEN = (80, 160, 70)
DARK_GREEN = (40, 110, 60)
BLUE = (58, 108, 222)
PALE_BLUE = (150, 196, 252)
VIOLET = (140, 70, 190)
PALE_VIOLET = (206, 164, 242)
DARK_RED = (150, 20, 32)
DEEP_RED = (214, 44, 56)
DARK_PINK = (190, 50, 122)
DEEP_PINK = (240, 112, 172)
GYARA_BLUE = (32, 139, 172)
GYARA_RED = (189, 24, 57)
GYARA_DEEP_BLUE = (40, 104, 196)
LIGHT_PINK = (250, 172, 204)
PINK_WHITE = (246, 218, 226)
DARK_ORANGE = (222, 112, 32)
LIGHT_ORANGE = (250, 176, 96)
PURPLE_G = (130, 72, 190)
DARK_PURPLE_G = (86, 40, 140)
VIOLET_G = (180, 92, 204)
PALE_VIOLET_G = (222, 176, 240)
YELLOW = (250, 230, 120)
DARK_YELLOW = (220, 170, 30)

# name → (pattern, magikarp colors, shiny magikarp, gyarados, shiny gyarados, belly)
# Colors are (base, a, b): the body color and the pattern's one or two colors. "belly" repaints
# Gyarados's underside white for the two-tone families.
PATTERNS = {
    "skelly": ("skelly", (ORANGE, WHITE, None), (SHINY_GOLD, WHITE, None), (GYARA_BLUE, WHITE, None), (GYARA_RED, WHITE, None), False),
    "calico-orange-white": ("calico", (ORANGE, WHITE, None), (SHINY_GOLD, WHITE, None), (GYARA_BLUE, WHITE, None), (GYARA_RED, WHITE, None), False),
    "calico-orange-white-black": ("calico", (ORANGE, WHITE, BLACK), (SHINY_GOLD, WHITE, BLACK), (GYARA_BLUE, WHITE, BLACK), (GYARA_RED, WHITE, BLACK), False),
    "calico-white-orange": ("calico", (WHITE, ORANGE, None), (WHITE, SHINY_GOLD, None), (WHITE, GYARA_BLUE, None), (WHITE, GYARA_RED, None), False),
    "calico-orange-gold": ("calico", (ORANGE, GOLD, None), (SHINY_GOLD, RED, None), (GYARA_BLUE, RED, None), (GYARA_RED, GYARA_BLUE, None), False),
    "orange-two-tone": ("twoTone", (ORANGE, WHITE, None), (SHINY_GOLD, WHITE, None), (GYARA_BLUE, WHITE, None), (GYARA_RED, WHITE, None), True),
    "orange-orca": ("orca", (ORANGE, WHITE, None), (SHINY_GOLD, WHITE, None), (GYARA_BLUE, WHITE, None), (GYARA_RED, WHITE, None), True),
    "orange-dapples": ("dapples", (ORANGE, WHITE, None), (SHINY_GOLD, WHITE, None), (GYARA_BLUE, WHITE, None), (GYARA_RED, WHITE, None), True),
    "pink-two-tone": ("twoTone", (PINK, WHITE, None), (LIGHT_BLUE, WHITE, None), (LIGHT_GREEN, WHITE, None), (LIGHT_PINK, PINK_WHITE, None), True),
    "pink-orca": ("orca", (PINK, WHITE, None), (LIGHT_BLUE, WHITE, None), (LIGHT_GREEN, WHITE, None), (LIGHT_PINK, WHITE, None), True),
    "pink-dapples": ("dapples", (PINK, WHITE, None), (LIGHT_BLUE, WHITE, None), (LIGHT_GREEN, WHITE, None), (LIGHT_PINK, WHITE, None), True),
    "gray-bubbles": ("bubbles", (GRAY, WHITE, DARK_GRAY), (WHITE, BLACK, BLACK), (BLACK, WHITE, WHITE), (PINK_WHITE, DARK_PINK, DARK_PINK), False),
    "gray-diamonds": ("diamonds", (GRAY, WHITE, DARK_GRAY), (WHITE, BLACK, BLACK), (BLACK, WHITE, WHITE), (PINK_WHITE, DARK_PINK, DARK_PINK), False),
    "gray-patches": ("patches", (WHITE, GRAY, DARK_GRAY), (WHITE, BLACK, BLACK), (BLACK, WHITE, WHITE), (PINK_WHITE, DARK_PINK, DARK_PINK), False),
    "purple-bubbles": ("bubbles", (PURPLE, WHITE, DARK_PURPLE), (LIGHT_BLUE, WHITE, DARK_BLUE), (DARK_GREEN, WHITE, WHITE), (LIGHT_PINK, WHITE, DARK_PINK), False),
    "purple-diamonds": ("diamonds", (PURPLE, WHITE, DARK_PURPLE), (LIGHT_BLUE, WHITE, DARK_BLUE), (DARK_GREEN, WHITE, WHITE), (LIGHT_PINK, WHITE, DARK_PINK), False),
    "purple-patches": ("patches", (WHITE, PURPLE, DARK_PURPLE), (WHITE, LIGHT_BLUE, DARK_BLUE), (DARK_GREEN, WHITE, WHITE), (LIGHT_PINK, WHITE, DARK_PINK), False),
    "apricot-tiger": ("tiger", (APRICOT, STRIPE, None), (LIGHT_GREEN, STRIPE, None), (GYARA_DEEP_BLUE, BLACK, None), (DARK_PINK, BLACK, None), False),
    "apricot-zebra": ("zebra", (APRICOT, STRIPE, None), (LIGHT_GREEN, STRIPE, None), (GYARA_DEEP_BLUE, BLACK, None), (DARK_PINK, BLACK, None), False),
    "apricot-stripes": ("stripes", (APRICOT, STRIPE, None), (LIGHT_GREEN, STRIPE, None), (GYARA_DEEP_BLUE, BLACK, None), (DARK_PINK, BLACK, None), False),
    "brown-tiger": ("tiger", (BROWN, STRIPE, None), (GREEN, STRIPE, None), (LIGHT_GREEN, BLACK, None), (DARK_ORANGE, BLACK, None), False),
    "brown-zebra": ("zebra", (BROWN, STRIPE, None), (GREEN, STRIPE, None), (LIGHT_GREEN, BLACK, None), (DARK_ORANGE, BLACK, None), False),
    "brown-stripes": ("stripes", (BROWN, STRIPE, None), (GREEN, STRIPE, None), (LIGHT_GREEN, BLACK, None), (DARK_ORANGE, BLACK, None), False),
    "orange-forehead": ("forehead", (WHITE, ORANGE, None), (WHITE, SHINY_GOLD, None), (WHITE, GYARA_BLUE, None), (WHITE, GYARA_RED, None), False),
    "orange-mask": ("mask", (WHITE, ORANGE, None), (WHITE, SHINY_GOLD, None), (WHITE, GYARA_BLUE, None), (WHITE, GYARA_RED, None), False),
    "black-forehead": ("forehead", (GRAY, BLACK, None), (BLACK, WHITE, None), (DARK_GRAY, BLACK, None), (BLACK, LIGHT_PINK, None), False),
    "black-mask": ("mask", (GRAY, BLACK, None), (BLACK, WHITE, None), (DARK_GRAY, BLACK, None), (BLACK, LIGHT_PINK, None), False),
    "saucy-blue": ("saucy", (PALE_BLUE, BLUE, None), (DEEP_RED, DARK_RED, None), (PURPLE_G, DARK_PURPLE_G, None), (YELLOW, DARK_YELLOW, None), False),
    "blue-raindrops": ("raindrops", (BLUE, PALE_BLUE, None), (DARK_RED, DEEP_RED, None), (PURPLE_G, PALE_VIOLET_G, None), (DARK_YELLOW, YELLOW, None), False),
    "saucy-violet": ("saucy", (PALE_VIOLET, VIOLET, None), (DEEP_PINK, DARK_PINK, None), (VIOLET_G, PALE_VIOLET_G, None), (LIGHT_ORANGE, DARK_ORANGE, None), False),
    "violet-raindrops": ("raindrops", (VIOLET, PALE_VIOLET, None), (DARK_PINK, DEEP_PINK, None), (VIOLET_G, PALE_VIOLET_G, None), (DARK_ORANGE, LIGHT_ORANGE, None), False),
    # Gold only exists for Magikarp; it evolves into a regular Gyarados.
    "gold": ("gold", (GOLD, None, None), (GOLD, None, None), None, None, False),
}


def hls(rgb):
    return colorsys.rgb_to_hls(*(c / 255 for c in rgb))


def shade(target, source, main):
    """Paints `target` with the light/dark offset `source` has from `main`."""
    th, tl, ts = hls(target)
    _, sl, _ = hls(source)
    _, ml, _ = hls(main)
    if sl <= ml:
        l = tl * (sl / ml) if ml > 0 else tl
    else:
        l = tl + (1 - tl) * (sl - ml) / (1 - ml) * 0.8
    # Very light or dark colors keep a little contrast in their shadows.
    if sl < ml and tl > 0.85:
        l = tl - (ml - sl) * 0.9
    r, g, b = colorsys.hls_to_rgb(th, max(0.0, min(1.0, l)), ts)
    return (round(r * 255), round(g * 255), round(b * 255))


def noise(x, y, seed, scale):
    """Smooth value noise in 0-1."""

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


def region(kind, u, v, x, y, eye, belly, spine_y=0):
    """Which color a body pixel gets: 0 base, 1 pattern color a, 2 pattern color b."""
    if kind == "gold":
        return 0
    if kind == "skelly":
        # Thin chevron "bones" pointing toward the head, fanning out from the middle of the body.
        if not 0.3 < u < 0.92 or abs(v - 0.45) > 0.3:
            return 0
        return 1 if (x + abs(y - spine_y)) % 6 == 0 else 0
    if kind == "calico":
        if noise(x, y, 3, 7) > 0.58:
            return 1
        return 2 if noise(x, y, 11, 6) > 0.66 else 0
    if kind in ("twoTone", "orca", "dapples"):
        edge = 0.58 + (0.07 * math.sin(u * math.pi * 4) if kind == "dapples" else 0.02 * math.sin(u * 6))
        if belly is not None:
            under = belly <= (3 if kind == "dapples" else 0)
            if kind == "dapples" and 0 < belly <= 3:
                under = (x + y) % 3 == 0
        else:
            under = v > edge
            if kind == "dapples" and not under and v > edge - 0.14:
                under = (int(x) % 4 < 2) and (int(y) % 4 < 2) and noise(x, y, 5, 3) > 0.45
        if kind == "orca" and not under:
            under = ((u - 0.55) / 0.13) ** 2 + ((v - 0.34) / 0.08) ** 2 < 1
        return 1 if under else 0
    if kind == "bubbles":
        gx, gy = x % 9 - 4, y % 9 - 4
        if gx * gx + gy * gy <= 5:
            return 1 if ((x // 9) + (y // 9)) % 2 == 0 else 2
        return 0
    if kind == "diamonds":
        gx, gy = (x + y) % 10 - 5, (x - y) % 10 - 5
        if abs(gx) + abs(gy) <= 3:
            return 1 if ((x + y) // 10) % 2 == 0 else 2
        return 0
    if kind == "patches":
        # Giraffe-like cells of color separated by thin lines of the base color.
        best, second, cell = 1e9, 1e9, 0
        cx0, cy0 = int(x // 8), int(y // 8)
        for cx in range(cx0 - 1, cx0 + 2):
            for cy in range(cy0 - 1, cy0 + 2):
                px = cx * 8 + noise(cx * 13, cy * 7, 21, 1) * 8
                py = cy * 8 + noise(cx * 5, cy * 11, 22, 1) * 8
                d = math.hypot(x - px, y - py)
                if d < best:
                    best, second, cell = d, best, cx * 31 + cy
                elif d < second:
                    second = d
        if second - best < 1.4:
            return 0
        return 2 if cell % 3 == 0 else 1
    if kind == "tiger":
        wobble = 0.12 * math.sin(v * 9 + u * 3)
        taper = 0.22 * (1 - v)
        return 1 if (u * 6 + wobble) % 1 < taper and v < 0.8 else 0
    if kind == "zebra":
        return 1 if (u * 6 + 0.3 * math.sin(v * 7)) % 1 < 0.32 else 0
    if kind == "stripes":
        return 1 if (u * 7) % 1 < 0.35 else 0
    if kind == "forehead":
        return 1 if math.hypot(u - eye[0] - 0.02, (v - eye[1] + 0.2) * 1.2) < 0.2 else 0
    if kind == "mask":
        return 1 if math.hypot(u - eye[0], v - eye[1]) < 0.19 else 0
    if kind == "saucy":
        drip = 0.36 + 0.22 * max(0.0, math.sin(u * math.pi * 5 + 1)) ** 3
        return 1 if v < drip else 0
    if kind == "raindrops":
        if v < 0.34:
            return 0
        gx, gy = (x + (y // 10) * 5) % 10 - 5, y % 10 - 5
        drop = gx * gx + max(0, gy) ** 2 * 1.5 + min(0, gy) ** 2 * 0.3 <= 5
        return 0 if drop else 1
    raise ValueError(kind)


def fetch(path):
    with urllib.request.urlopen(f"{BASE}/{path}") as response:
        return Image.open(io.BytesIO(response.read())).convert("RGBA")


def belly_distance(img, belly_colors):
    """Distance (in pixels, up to 4) from each pixel to the nearest belly pixel."""
    w, h = img.size
    px = img.load()
    dist = {}
    frontier = [(x, y) for x in range(w) for y in range(h) if px[x, y][3] and px[x, y][:3] in belly_colors]
    for p in frontier:
        dist[p] = 0
    for d in range(1, 5):
        nxt = []
        for x, y in frontier:
            for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                q = (x + dx, y + dy)
                if 0 <= q[0] < w and 0 <= q[1] < h and q not in dist:
                    dist[q] = d
                    nxt.append(q)
        frontier = nxt
    return dist


def paint(species, back, shiny, name):
    kind, mk, mk_shiny, gy, gy_shiny, white_belly = PATTERNS[name]
    colors = (mk_shiny if shiny else mk) if species == "129" else (gy_shiny if shiny else gy)
    if colors is None:
        return None
    img = fetch(f"{'back/' if back else ''}{species}.png")
    body = MAGIKARP_BODY if species == "129" else GYARADOS_BODY
    main = MAGIKARP_MAIN if species == "129" else GYARADOS_MAIN
    layout = LAYOUT[(species, back)]
    px = img.load()
    w, h = img.size
    pts = [(x, y) for x in range(w) for y in range(h) if px[x, y][3] and px[x, y][:3] in body]
    x0, x1 = min(p[0] for p in pts), max(p[0] for p in pts)
    y0, y1 = min(p[1] for p in pts), max(p[1] for p in pts)
    bellies = belly_distance(img, GYARADOS_BELLY) if species == "130" and kind in ("twoTone", "orca", "dapples") else None
    out = img.copy()
    opx = out.load()
    for x in range(w):
        for y in range(h):
            r, g, b, a = px[x, y]
            if not a:
                continue
            rgb = (r, g, b)
            if rgb in body:
                u = (x - x0) / max(1, x1 - x0)
                v = (y - y0) / max(1, y1 - y0)
                if layout["flip"]:
                    u = 1 - u
                belly = bellies.get((x, y), 99) if bellies is not None else None
                which = region(kind, u, v, x, y, layout["eye"], belly, round(y0 + 0.45 * (y1 - y0)))
                target = colors[which] or colors[0]
                opx[x, y] = (*shade(target, rgb, main), a)
            elif species == "130" and white_belly and rgb in GYARADOS_BELLY:
                opx[x, y] = (*shade(colors[1], rgb, GYARADOS_BELLY_MAIN), a)
            elif kind == "gold" and rgb in MAGIKARP_FINS and rgb != (255, 255, 255):
                opx[x, y] = (*shade((250, 222, 120), rgb, (205, 205, 213)), a)
    return out


def main():
    for species in ("129", "130"):
        for name in PATTERNS:
            for back in (False, True):
                for shiny in (False, True):
                    img = paint(species, back, shiny, name)
                    if img is None:
                        continue
                    folder = os.path.join(OUT, "back" if back else "", "shiny" if shiny else "")
                    os.makedirs(folder, exist_ok=True)
                    img.save(os.path.join(folder, f"{species}-{name}.png"), optimize=True)
    print(f"Wrote {len(PATTERNS)} Magikarp and {len(PATTERNS) - 1} Gyarados patterns to {OUT}")


if __name__ == "__main__":
    main()
