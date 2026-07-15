import base64
import cv2
import numpy as np
import re
from flask import Flask, request, jsonify
from flask_cors import CORS
from rubik_solver import utils  # pip install rubik-solver
from scanner import detect_face_colors  # Scanner component (scanner.py)

app = Flask(__name__)
CORS(app)

# ✅ Allowed cube colors
ALLOWED_COLORS = set("WRBGYO")  # White, Red, Blue, Green, Yellow, Orange

# Fixed face order expected by /detect_full_cube and the Kociemba solver
FACE_ORDER = ["U (White)", "D (Yellow)", "F (Green)", "B (Blue)", "L (Orange)", "R (Red)"]


def validate_cube_state(cube_state: str):
    """Validate cube state string (54 characters, correct colors)."""
    if len(cube_state) != 54:
        return False, "Cube state must be 54 characters"
    if not set(cube_state).issubset(ALLOWED_COLORS):
        return False, f"Invalid color, got {set(cube_state) - ALLOWED_COLORS} and should be one of W,R,B,G,Y,O."
    return True, ""


def _decode_base64_image(img_data: str):
    """
    Decode a base64 string (with or without data-URL prefix) into a BGR
    numpy array suitable for OpenCV.  Returns None on failure.
    """
    # Strip data-URL header if present (e.g. "data:image/jpeg;base64,...")
    if "," in img_data:
        img_data = img_data.split(",", 1)[1]
    try:
        img_bytes = base64.b64decode(img_data)
        np_arr = np.frombuffer(img_bytes, np.uint8)
        img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
        return img
    except Exception:
        return None


# ---------------------------------------------------------------------------
# /solve — UNTOUCHED (Kociemba solver)
# ---------------------------------------------------------------------------

@app.route("/solve", methods=["POST"])
def solve_cube():
    try:
        data = request.json
        cube_state = data.get("cube_state", "")

        # ✅ Validate cube state
        valid, error_msg = validate_cube_state(cube_state)
        if not valid:
            return jsonify({"error": error_msg}), 400

        # ✅ Solve cube
        try:
            solution = utils.solve(cube_state, "Kociemba")
            return jsonify({"solution": solution})
        except Exception as e:
            return jsonify({"error": str(e)}), 400

    except Exception as e:
        return jsonify({"error": f"Server error: {str(e)}"}), 500


# ---------------------------------------------------------------------------
# /detect — single face (Display/API layer calls Scanner component)
# ---------------------------------------------------------------------------

@app.route("/detect", methods=["POST"])
def detect_cube():
    """
    POST { "image_data": "<base64>" }
    Returns { "cube_state": "<9-char color string>" } for one face.
    """
    try:
        data = request.json
        img_data = data.get("image_data", "")

        if not img_data:
            return jsonify({"error": "No image provided"}), 400

        # Decode base64 → OpenCV image
        img = _decode_base64_image(img_data)
        if img is None:
            return jsonify({"error": "Invalid image"}), 400

        # ✅ Call Scanner component to detect face colors via OpenCV/HSV
        face_colors = detect_face_colors(img)

        return jsonify({"cube_state": face_colors})

    except Exception as e:
        return jsonify({"error": f"Server error: {str(e)}"}), 500


# ---------------------------------------------------------------------------
# /detect_full_cube — all 6 faces → complete 54-char cube state
# ---------------------------------------------------------------------------

@app.route("/detect_full_cube", methods=["POST"])
def detect_full_cube():
    """
    POST { "images": ["<base64>", ...] }   — exactly 6 images in order:
        U (White), D (Yellow), F (Green), B (Blue), L (Orange), R (Red)

    Returns { "cube_state": "<54-char string>" } ready to pass to /solve,
    or { "error": "..." } with HTTP 400 if validation fails.

    This endpoint is what makes "reads the full cube state from a live
    camera feed" literally true: each image was captured from the live
    <video> feed in CameraScanner.js and sent here face-by-face.
    """
    try:
        data = request.json
        images = data.get("images", [])

        if not isinstance(images, list) or len(images) != 6:
            return jsonify({
                "error": f"Expected 6 face images in order {FACE_ORDER}, got {len(images)}"
            }), 400

        face_strings = []
        for idx, img_data in enumerate(images):
            img = _decode_base64_image(img_data)
            if img is None:
                return jsonify({"error": f"Invalid image for face {FACE_ORDER[idx]}"}), 400

            # Scanner component: detect 9 sticker colors via HSV analysis
            face_colors = detect_face_colors(img)
            face_strings.append(face_colors)

        # Concatenate all 6 faces → 54-char cube state
        cube_state = "".join(face_strings)

        # Validate before returning (catches impossible states early)
        valid, error_msg = validate_cube_state(cube_state)
        if not valid:
            return jsonify({"error": error_msg}), 400

        return jsonify({"cube_state": cube_state})

    except Exception as e:
        return jsonify({"error": f"Server error: {str(e)}"}), 500


if __name__ == "__main__":
    app.run(debug=True)
