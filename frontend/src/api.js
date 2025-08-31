const API_BASE_URL = "http://127.0.0.1:5000"; // Change if backend runs elsewhere

export async function detectCubeColors(imageData) {
  const response = await fetch(`${API_BASE_URL}/detect`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ image: imageData })
  });
  return response.json();
}

export async function solveCube(state) {
  const response = await fetch(`${API_BASE_URL}/solve`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ state })
  });
  return response.json();
}
