import React, { useState } from "react";
import { detectCubeColors, solveCube } from "./api";
import Cube3D from "./Cube3D";
import CubeAnimator from "./CubeAnimator";
import "./index.css";

function App() {
  const [cubeState, setCubeState] = useState(null);
  const [solutionSteps, setSolutionSteps] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      setLoading(true);
      const base64Data = reader.result.split(",")[1];
      const detected = await detectCubeColors(base64Data);
      setCubeState(detected.state);
      setLoading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSolve = async () => {
    if (!cubeState) return;
    setLoading(true);
    const solution = await solveCube(cubeState);
    setSolutionSteps(solution.steps);
    setLoading(false);
  };

  return (
    <div className="app">
      <h1>Cube-Buddy</h1>
      <input type="file" accept="image/*" onChange={handleImageUpload} />
      {loading && <p>Processing...</p>}

      {cubeState && (
        <>
          <Cube3D cubeState={cubeState} />
          <button onClick={handleSolve}>Solve Cube</button>
        </>
      )}

      {solutionSteps.length > 0 && <CubeAnimator steps={solutionSteps} />}
    </div>
  );
}

export default App;
