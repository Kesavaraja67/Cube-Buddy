import base64
import cv2
import numpy as np
import re
from flask import Flask, request, jsonify
from rubik_solver import utils  # pip install rubik-solver

app = Flask(__name__)

# ✅ Allowed cube colors
ALLOWED_COLORS = set("WRBGYO")  # White, Red, Blue, Green, Yellow, Orange


def validate_cube_state(cube_state: str):
    """Validate cube state string (54 characters, correct colors)."""
    if len(cube_state) != 54:
        return False, "Cube state must be 54 characters"
    if not set(cube_state).issubset(ALLOWED_COLORS):
        return False, f"Invalid color, got {set(cube_state) - ALLOWED_COLORS} and should be one of W,R,B,G,Y,O."
    return True, ""


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


@app.route("/detect", methods=["POST"])
def detect_cube():
    try:
        data = request.json
        img_data = data.get("image_data", "")

        if not img_data:
            return jsonify({"error": "No image provided"}), 400

        # ✅ Decode base64
        try:
            img_bytes = base64.b64decode(img_data)
            np_arr = np.frombuffer(img_bytes, np.uint8)
            img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
        except Exception:
            return jsonify({"error": "Invalid image"}), 400

        # ❗ Dummy detection (replace with actual YOLO or CV pipeline later)
        cube_state = "WWWWWWWWWRRRRRRRRRGGGGGGGGGOOOOOOOOOBBBBBBBBBYYYYYYYYY"

        # ✅ Validate dummy output
        valid, error_msg = validate_cube_state(cube_state)
        if not valid:
            return jsonify({"error": error_msg}), 400

        return jsonify({"cube_state": cube_state})

    except Exception as e:
        return jsonify({"error": f"Server error: {str(e)}"}), 500


if __name__ == "__main__":
    app.run(debug=True)
