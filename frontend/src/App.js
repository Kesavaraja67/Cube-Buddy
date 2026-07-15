import CameraScanner from "./components/CameraScanner";

/**
 * App.js — top-level entry point.
 *
 * Architecture (scanner / solver / display separation):
 *   - CameraScanner  (components/CameraScanner.js)  → "scanner" component
 *   - /solve via api.js solveCube()                 → "solver" component (backend)
 *   - CubeViewer     (components/CubeViewer.js)     → "display" component (Three.js)
 *
 * CameraScanner handles the full scan→solve pipeline and displays
 * the solution text.  CubeViewer (3-D visualization) can be wired
 * in later without touching scanner or solver logic.
 */
function App() {
  return <CameraScanner />;
}

export default App;
