import base64
import cv2
import numpy as np
import re
from flask import Flask, request, jsonify
from rubik_solver import utils  # pip install rubik-solver

# ------------------ Flask App ------------------
app = Flask(__name__)


# ------------------ Helper: decode base64 → OpenCV image ------------------
def decode_image(base64_string):
    """
    Converts a base64-encoded image string into an OpenCV image.
    """
    try:
        img_data = base64.b64decode(base64_string)
        np_arr = np.frombuffer(img_data, np.uint8)
        image = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
        return image
    except Exception as e:
        print("Decode error:", e)
        return None


# ------------------ Dummy Color Detection (Replace with YOLO/OpenCV later) ------------------
def detect_face_colors(image):
    """
    Detects colors of 9 stickers on one face of a cube.
    Replace this dummy function with actual detection logic.
    """
    # Currently returns a dummy face (all white W)
    return "WWWWWWWWW"


# ------------------ ROUTE 1: Detect single face ------------------
@app.route('/detect', methods=['POST'])
def detect():
    try:
        data = request.get_json()
        if not data or "image_data" not in data:
            return jsonify({"error": "Missing image_data"}), 400

        # Decode base64 image
        image = decode_image(data["image_data"])
        if image is None:
            return jsonify({"error": "Invalid image"}), 400

        # Detect colors (currently dummy)
        face_string = detect_face_colors(image)

        return jsonify({"face_string": face_string})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ------------------ ROUTE 2: Home ------------------
@app.route("/")
def home():
    return "🟩 Welcome to Cube Buddy API! Use the /solve endpoint to solve a Rubik's Cube."


# ------------------ ROUTE 3: Solve cube ------------------
@app.route('/solve', methods=['POST'])
def solve():
    try:
        data = request.get_json()
        if not data or "cube_state" not in data:
            return jsonify({"error": "Missing cube_state"}), 400

        cube_state = data["cube_state"].strip().upper()

        if len(cube_state) != 54:
            return jsonify({"error": "Cube state must be 54 characters"}), 400

        # Map colors → standard notation (URFDLB)
        color_map = {
            'W': 'U',  # White = Up
            'Y': 'D',  # Yellow = Down
            'R': 'R',  # Red = Right
            'O': 'L',  # Orange = Left
            'G': 'F',  # Green = Front
            'B': 'B'   # Blue = Back
        }

        # Accept either WRGYOB or URFDLB
        if re.match(r'^[WRGYOB]{54}$', cube_state):
            cube_state = ''.join(color_map[c] for c in cube_state)
        elif re.match(r'^[URFDLB]{54}$', cube_state):
            pass  # already in solver format
        else:
            return jsonify({"error": "Cube state must use either WRGYOB or URFDLB"}), 400

        # Solve cube using Kociemba algorithm
        solution = utils.solve(cube_state, 'Kociemba')

        return jsonify({"solution": " ".join(solution)})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ------------------ Run Flask App ------------------
if __name__ == "__main__":
    app.run(debug=True)
