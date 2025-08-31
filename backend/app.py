from flask import Flask, request, jsonify
from flask_cors import CORS
import random
import kociemba

app = Flask(_name_)
CORS(app)  # allow frontend to access backend

# --- Detector Logic (dummy random colors) ---
COLORS = ["U", "R", "F", "D", "L", "B"]  # Kociemba expects face notation

def detect_colors(image_data):
    """
    Dummy detection: generates a random cube state.
    Replace later with OpenCV logic for real detection.
    """
    return [random.choice(COLORS) for _ in range(54)]


# --- Solver Logic ---
def solve_cube(state):
    """
    Solves the cube using kociemba algorithm.
    state: string of 54 chars (URFDLB)
    """
    try:
        if isinstance(state, list):
            state = ''.join(state)

        solution = kociemba.solve(state)
        return solution.split()
    except Exception as e:
        return [f"Error solving cube: {str(e)}"]


# --- API Routes ---
@app.route("/detect", methods=["POST"])
def detect():
    try:
        data = request.get_json()
        image_data = data.get("image")

        if not image_data:
            return jsonify({"error": "No image provided"}), 400

        state = detect_colors(image_data)
        return jsonify({"state": state})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/solve", methods=["POST"])
def solve():
    try:
        data = request.get_json()
        state = data.get("state")

        if not state:
            return jsonify({"error": "No cube state provided"}), 400

        steps = solve_cube(state)
        return jsonify({"steps": steps})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if _name_ == "_main_":
    app.run(host="127.0.0.1", port=5000, debug=True)