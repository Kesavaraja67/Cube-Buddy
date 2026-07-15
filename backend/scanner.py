"""
scanner.py — Cube-Buddy Scanner Component
==========================================
Standalone, Flask-free module that detects the 9 sticker colors on a single
Rubik's cube face from a raw image (numpy array).

WHY HSV OVER RGB
----------------
HSV separates chromatic information (Hue) from luminance (Value) and
saturation. This makes color ranges far more robust to lighting changes:
a red sticker looks "red" across a wide range of brightness levels because
the Hue channel barely shifts, while the R/G/B channels all scale together
(blowing out whites, crushing darks). In RGB you'd need separate ranges for
"bright red" vs "shadowed red"; in HSV one Hue window covers both.
"""

import cv2
import numpy as np

# ---------------------------------------------------------------------------
# HSV range constants (OpenCV convention: H ∈ [0,179], S/V ∈ [0,255])
# Each tuple is (lower_bound, upper_bound) as numpy arrays ready for
# cv2.inRange.  Red wraps around 0° so it needs two sub-ranges.
# ---------------------------------------------------------------------------

# White: any hue, very low saturation, high brightness
WHITE_LOWER = np.array([0,   0,   170], dtype=np.uint8)
WHITE_UPPER = np.array([180, 55,  255], dtype=np.uint8)

# Red (low-hue band: 0–12°)
RED_LOWER1  = np.array([0,   100, 60],  dtype=np.uint8)
RED_UPPER1  = np.array([12,  255, 255], dtype=np.uint8)
# Red (high-hue band: 158–180°, wraps around)
RED_LOWER2  = np.array([158, 100, 60],  dtype=np.uint8)
RED_UPPER2  = np.array([180, 255, 255], dtype=np.uint8)

# Blue: hue 90–130°
BLUE_LOWER  = np.array([90,  80,  50],  dtype=np.uint8)
BLUE_UPPER  = np.array([130, 255, 255], dtype=np.uint8)

# Green: hue 40–85°
GREEN_LOWER = np.array([40,  80,  50],  dtype=np.uint8)
GREEN_UPPER = np.array([85,  255, 255], dtype=np.uint8)

# Yellow: hue 20–35°, high value (pale/low-sat yellows excluded)
YELLOW_LOWER = np.array([20,  80,  150], dtype=np.uint8)
YELLOW_UPPER = np.array([35,  255, 255], dtype=np.uint8)

# Orange: hue 10–22°, clearly distinguishable from red (lower H) and
# yellow (higher H), needs decent saturation
ORANGE_LOWER = np.array([10,  100, 100], dtype=np.uint8)
ORANGE_UPPER = np.array([22,  255, 255], dtype=np.uint8)

# ---------------------------------------------------------------------------
# Color map used for range-matching and fallback nearest-neighbor search.
# Order matters for priority when ranges overlap: more specific → earlier.
# ---------------------------------------------------------------------------
_COLOR_RANGES = [
    # (letter, lower1, upper1, lower2, upper2)
    # lower2/upper2 are None unless the hue wraps (red only)
    ("W", WHITE_LOWER,  WHITE_UPPER,  None,       None),
    ("Y", YELLOW_LOWER, YELLOW_UPPER, None,       None),
    ("O", ORANGE_LOWER, ORANGE_UPPER, None,       None),
    ("R", RED_LOWER1,   RED_UPPER1,   RED_LOWER2, RED_UPPER2),
    ("G", GREEN_LOWER,  GREEN_UPPER,  None,       None),
    ("B", BLUE_LOWER,   BLUE_UPPER,   None,       None),
]

# Representative HSV centre-point per color (for fallback nearest-match)
_COLOR_CENTERS = {
    "W": np.array([0,   10,  220], dtype=float),  # near-white
    "R": np.array([5,   200, 180], dtype=float),  # saturated red
    "B": np.array([110, 180, 150], dtype=float),  # mid-blue
    "G": np.array([60,  180, 150], dtype=float),  # mid-green
    "Y": np.array([28,  200, 220], dtype=float),  # bright yellow
    "O": np.array([16,  200, 180], dtype=float),  # orange
}

# Patch size: how much of each cell (fraction) to sample for color averaging.
# 0.4 means the central 40% of each cell dimension → avoids sticker borders.
_PATCH_FRACTION = 0.40


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def detect_face_colors(image: np.ndarray) -> str:
    """
    Detect the 9 sticker colors on a single Rubik's cube face.

    Parameters
    ----------
    image : np.ndarray
        BGR image as returned by cv2.imdecode / cv2.VideoCapture.read.
        Does not need to be square, but the cube face should fill most
        of the frame.

    Returns
    -------
    str
        A 9-character string of color letters in row-major order
        (top-left → top-right → middle-left → … → bottom-right).
        Letters are one of: W R B G Y O.
        Never raises; worst case returns a fallback nearest-match.
    """
    hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
    h, w = hsv.shape[:2]

    cell_h = h // 3
    cell_w = w // 3

    result = []
    for row in range(3):
        for col in range(3):
            # Cell boundaries
            y0 = row * cell_h
            y1 = y0 + cell_h
            x0 = col * cell_w
            x1 = x0 + cell_w

            # Center-patch boundaries (shrink by _PATCH_FRACTION on each side)
            pad_y = int(cell_h * (1 - _PATCH_FRACTION) / 2)
            pad_x = int(cell_w * (1 - _PATCH_FRACTION) / 2)
            py0 = max(y0 + pad_y, 0)
            py1 = min(y1 - pad_y, h)
            px0 = max(x0 + pad_x, 0)
            px1 = min(x1 - pad_x, w)

            patch = hsv[py0:py1, px0:px1]
            avg_hsv = patch.mean(axis=(0, 1))  # shape (3,)

            color = _classify_hsv(avg_hsv)
            result.append(color)

    return "".join(result)


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

def _classify_hsv(avg_hsv: np.ndarray) -> str:
    """
    Match an averaged HSV pixel to a color letter.

    Strategy:
    1. Check each named range; return the first match.
    2. If no range matches, return the color whose centre-point is closest
       in Euclidean HSV distance (Hue axis scaled by 2 to weight it more).
    """
    h_val = float(avg_hsv[0])
    s_val = float(avg_hsv[1])
    v_val = float(avg_hsv[2])

    pixel = np.array([h_val, s_val, v_val])

    for letter, lo1, hi1, lo2, hi2 in _COLOR_RANGES:
        if _in_range(pixel, lo1, hi1):
            return letter
        if lo2 is not None and _in_range(pixel, lo2, hi2):
            return letter

    # Fallback: nearest centre-point by weighted Euclidean distance
    return _nearest_color(pixel)


def _in_range(pixel: np.ndarray, lo: np.ndarray, hi: np.ndarray) -> bool:
    """Return True if every channel of pixel is within [lo, hi]."""
    return bool(np.all(pixel >= lo) and np.all(pixel <= hi))


def _nearest_color(pixel: np.ndarray) -> str:
    """
    Return the color letter whose HSV centre is closest to pixel.
    Hue is weighted ×2 because it carries the most discriminative
    information for cube colors.
    """
    weight = np.array([2.0, 1.0, 1.0])
    best_letter = "W"
    best_dist = float("inf")
    for letter, centre in _COLOR_CENTERS.items():
        diff = (pixel - centre) * weight
        dist = float(np.dot(diff, diff))  # squared distance is fine for comparison
        if dist < best_dist:
            best_dist = dist
            best_letter = letter
    return best_letter
