"""
Draws the Sinnoh Underground's Spheres (Red, Blue, Green, Pale and Prism), which have no item
sprites in PokeAPI's repository: small glossy gems in the 30x30 item-sprite style, each in its
color from Diamond/Pearl/Platinum (the Prism Sphere shimmers through the rainbow).

Usage: python3 scripts/generateSpheres.py  (needs Pillow)
Writes public/sprites/items/{red,blue,green,pale,prism}-sphere.png
"""
import colorsys
import math
import os

from PIL import Image

OUT = os.path.join(os.path.dirname(__file__), "..", "public", "sprites", "items")
SIZE = 30
CENTER = 14.5
RADIUS = 9.5

# Base color of each Sphere (hue, saturation, value), or None for the rainbow Prism Sphere.
SPHERES = {
    "red": (0.0, 0.85, 0.9),
    "blue": (0.6, 0.8, 0.95),
    "green": (0.33, 0.75, 0.8),
    "pale": (0.55, 0.12, 0.98),
    "prism": None,
}


def color_at(name, x, y):
    dx, dy = x - CENTER, y - CENTER
    dist = math.hypot(dx, dy) / RADIUS
    base = SPHERES[name]
    if base is None:
        # The Prism Sphere's hue turns around its center.
        hue = (math.atan2(dy, dx) / (2 * math.pi)) % 1.0
        base = (hue, 0.55, 0.98)
    h, s, v = base
    # Lit from the top left: brighter there, darker toward the bottom right edge.
    light = 1.0 - 0.45 * max(0.0, (dx + dy) / (RADIUS * 1.6) + dist * 0.3)
    r, g, b = colorsys.hsv_to_rgb(h, s, max(0.0, min(1.0, v * light)))
    # A soft white highlight.
    hx, hy = CENTER - 3.5, CENTER - 3.5
    glint = max(0.0, 1.0 - math.hypot(x - hx, y - hy) / 3.2)
    r, g, b = (c + (1 - c) * glint * 0.9 for c in (r, g, b))
    return tuple(int(round(c * 255)) for c in (r, g, b))


def draw(name):
    image = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    pixels = image.load()
    for y in range(SIZE):
        for x in range(SIZE):
            dist = math.hypot(x - CENTER, y - CENTER)
            if dist <= RADIUS - 1:
                pixels[x, y] = color_at(name, x, y) + (255,)
            elif dist <= RADIUS:
                # A dark outline, like the games' item icons.
                r, g, b = color_at(name, x, y)
                pixels[x, y] = (r // 3, g // 3, b // 3, 255)
    image.save(os.path.join(OUT, f"{name}-sphere.png"))


if __name__ == "__main__":
    for sphere in SPHERES:
        draw(sphere)
    print(f"Wrote {len(SPHERES)} Spheres to {os.path.normpath(OUT)}")
