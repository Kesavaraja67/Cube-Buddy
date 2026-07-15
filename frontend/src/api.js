import axios from "axios";

const BASE_URL = "http://127.0.0.1:5000";

// Solver component — calls Kociemba /solve endpoint
export const solveCube = (cubeState) =>
    axios.post(`${BASE_URL}/solve`, { cube_state: cubeState });

// Scanner API — single face detection
export const detectFace = (base64Image) =>
    axios.post(`${BASE_URL}/detect`, { image_data: base64Image });

// Scanner API — all 6 faces at once → full 54-char cube state
// base64Images: array of 6 base64 strings in order U/D/F/B/L/R
export const detectFullCube = (base64Images) =>
    axios.post(`${BASE_URL}/detect_full_cube`, { images: base64Images });
