import axios from "axios";

const BASE_URL = "http://127.0.0.1:5000";

export const solveCube = (cubeState) =>
    axios.post(`${BASE_URL}/solve`, { cube_state: cubeState });

export const detectFace = (base64Image) =>
    axios.post(`${BASE_URL}/detect`, { image_data: base64Image });
