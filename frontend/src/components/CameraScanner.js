/**
 * CameraScanner.js — Scanner Component
 * ======================================
 * Responsibility: open a live camera feed, walk the user through capturing
 * all 6 cube faces, call /detect once per face, then call /solve with the
 * resulting 54-char cube state and display the solution.
 *
 * This component is deliberately isolated:
 *   - No Three.js / CubeViewer logic (that is the "display" component)
 *   - No Kociemba awareness — it just calls solveCube() from api.js
 *   - Pure webcam → base64 → API → solution text pipeline
 */

import React, { useRef, useState, useEffect, useCallback } from "react";
import { detectFace, solveCube } from "../api";

// Face capture order and prompts shown to the user.
// Order matches what /detect_full_cube (and the Kociemba state string) expects:
// U D F B L R
const FACES = [
  { label: "U — White face",  hint: "Hold the WHITE centre facing the camera",  color: "#f0f0f0", textColor: "#222" },
  { label: "D — Yellow face", hint: "Hold the YELLOW centre facing the camera", color: "#fde047", textColor: "#333" },
  { label: "F — Green face",  hint: "Hold the GREEN centre facing the camera",  color: "#22c55e", textColor: "#fff" },
  { label: "B — Blue face",   hint: "Hold the BLUE centre facing the camera",   color: "#3b82f6", textColor: "#fff" },
  { label: "L — Orange face", hint: "Hold the ORANGE centre facing the camera", color: "#f97316", textColor: "#fff" },
  { label: "R — Red face",    hint: "Hold the RED centre facing the camera",    color: "#ef4444", textColor: "#fff" },
];

export default function CameraScanner() {
  const videoRef   = useRef(null);
  const canvasRef  = useRef(null);
  const streamRef  = useRef(null);          // holds MediaStream for cleanup

  const [step, setStep]         = useState("idle");   // idle | scanning | done | error
  const [faceIndex, setFaceIndex] = useState(0);      // 0-5
  const [captured, setCaptured] = useState([]);       // array of 9-char strings, one per face
  const [solution, setSolution] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading]   = useState(false);

  // ------------------------------------------------------------------
  // Camera lifecycle
  // ------------------------------------------------------------------

  const startCamera = useCallback(async () => {
    setErrorMsg("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 640 }, height: { ideal: 480 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setStep("scanning");
      setFaceIndex(0);
      setCaptured([]);
      setSolution("");
    } catch (err) {
      setErrorMsg(`Camera error: ${err.message}. Please allow camera access and try again.`);
      setStep("error");
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, []);

  // Stop camera on unmount
  useEffect(() => () => stopCamera(), [stopCamera]);

  // ------------------------------------------------------------------
  // Capture current video frame and send to /detect
  // ------------------------------------------------------------------

  const captureAndDetect = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;
    setLoading(true);
    setErrorMsg("");

    const video  = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width  = video.videoWidth  || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // canvas.toDataURL gives "data:image/jpeg;base64,<data>" — the backend
    // helper _decode_base64_image strips the prefix automatically.
    const base64 = canvas.toDataURL("image/jpeg", 0.85);

    try {
      const res  = await detectFace(base64);
      const face = res.data.cube_state;         // 9-char string for this face

      const nextCaptured = [...captured, face];
      setCaptured(nextCaptured);

      if (nextCaptured.length === FACES.length) {
        // All 6 faces captured — stop camera, solve the cube
        stopCamera();
        await solveWithState(nextCaptured.join(""));
      } else {
        setFaceIndex(nextCaptured.length);
      }
    } catch (err) {
      const msg = err?.response?.data?.error || err.message || "Detection failed";
      setErrorMsg(`Face ${FACES[faceIndex].label}: ${msg}`);
    } finally {
      setLoading(false);
    }
  }, [captured, faceIndex, stopCamera]);

  // ------------------------------------------------------------------
  // Call /solve with the assembled 54-char state
  // ------------------------------------------------------------------

  const solveWithState = async (cubeState) => {
    setLoading(true);
    try {
      const res = await solveCube(cubeState);
      setSolution(res.data.solution || "No solution returned");
      setStep("done");
    } catch (err) {
      const msg = err?.response?.data?.error || err.message || "Solve failed";
      setErrorMsg(`Solver error: ${msg}`);
      setStep("error");
    } finally {
      setLoading(false);
    }
  };

  // ------------------------------------------------------------------
  // Reset everything
  // ------------------------------------------------------------------

  const reset = useCallback(() => {
    stopCamera();
    setStep("idle");
    setFaceIndex(0);
    setCaptured([]);
    setSolution("");
    setErrorMsg("");
    setLoading(false);
  }, [stopCamera]);

  // ------------------------------------------------------------------
  // Render helpers
  // ------------------------------------------------------------------

  const currentFace = FACES[faceIndex] || FACES[0];
  const progress    = captured.length;

  return (
    <div style={styles.wrapper}>
      <h1 style={styles.title}>🧩 Cube-Buddy Scanner</h1>
      <p style={styles.subtitle}>
        Live camera → OpenCV color detection → Kociemba solver
      </p>

      {/* ---- IDLE ---- */}
      {step === "idle" && (
        <div style={styles.card}>
          <p style={styles.instruction}>
            Place your Rubik's cube in front of the camera.<br />
            You'll capture each of the 6 faces one by one.
          </p>
          <button style={styles.btnPrimary} onClick={startCamera}>
            📷 Start Camera
          </button>
        </div>
      )}

      {/* ---- SCANNING ---- */}
      {step === "scanning" && (
        <div style={styles.card}>
          {/* Face indicator */}
          <div style={{ ...styles.faceBadge, background: currentFace.color, color: currentFace.textColor }}>
            {currentFace.label}
          </div>
          <p style={styles.hint}>{currentFace.hint}</p>

          {/* Progress dots */}
          <div style={styles.progressRow}>
            {FACES.map((f, i) => (
              <div
                key={i}
                title={f.label}
                style={{
                  ...styles.dot,
                  background: i < progress ? f.color : i === progress ? "#94a3b8" : "#1e293b",
                  border: i === progress ? "2px solid #fff" : "2px solid transparent",
                }}
              />
            ))}
          </div>
          <p style={styles.progressText}>{progress} / {FACES.length} faces captured</p>

          {/* Live video feed */}
          <div style={styles.videoWrapper}>
            <video ref={videoRef} style={styles.video} muted playsInline autoPlay />
            {/* Overlay grid to help user align the cube */}
            <div style={styles.gridOverlay}>
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} style={styles.gridCell} />
              ))}
            </div>
          </div>

          <button
            style={{ ...styles.btnPrimary, ...(loading ? styles.btnDisabled : {}) }}
            onClick={captureAndDetect}
            disabled={loading}
          >
            {loading ? "⏳ Detecting…" : "📸 Capture Face"}
          </button>
        </div>
      )}

      {/* ---- DONE ---- */}
      {step === "done" && (
        <div style={styles.card}>
          <div style={styles.successBadge}>✅ Cube Solved!</div>
          <p style={styles.instruction}>Here are your solution moves:</p>
          <div style={styles.solutionBox}>
            {solution.split(" ").map((move, i) => (
              <span key={i} style={styles.move}>{move}</span>
            ))}
          </div>
          <button style={styles.btnSecondary} onClick={reset}>
            🔄 Scan Another Cube
          </button>
        </div>
      )}

      {/* ---- ERROR ---- */}
      {step === "error" && (
        <div style={styles.card}>
          <div style={styles.errorBadge}>⚠️ Something went wrong</div>
          <p style={styles.errorText}>{errorMsg}</p>
          <button style={styles.btnPrimary} onClick={reset}>
            Try Again
          </button>
        </div>
      )}

      {/* Inline error during scanning (non-fatal) */}
      {step === "scanning" && errorMsg && (
        <p style={styles.inlineError}>{errorMsg}</p>
      )}

      {/* Hidden canvas used for frame capture — never displayed */}
      <canvas ref={canvasRef} style={{ display: "none" }} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Inline styles — keeps the component self-contained, no external CSS needed
// ---------------------------------------------------------------------------
const styles = {
  wrapper: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "2rem 1rem",
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    color: "#f8fafc",
  },
  title: {
    fontSize: "2.2rem",
    fontWeight: 800,
    margin: "0 0 0.25rem",
    background: "linear-gradient(90deg, #60a5fa, #a78bfa)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  subtitle: {
    fontSize: "0.9rem",
    color: "#94a3b8",
    marginBottom: "2rem",
  },
  card: {
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "1.25rem",
    padding: "2rem",
    width: "100%",
    maxWidth: "560px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "1.25rem",
    backdropFilter: "blur(12px)",
  },
  faceBadge: {
    padding: "0.5rem 1.5rem",
    borderRadius: "999px",
    fontWeight: 700,
    fontSize: "1rem",
    letterSpacing: "0.05em",
  },
  hint: {
    fontSize: "0.95rem",
    color: "#cbd5e1",
    textAlign: "center",
    margin: 0,
  },
  progressRow: {
    display: "flex",
    gap: "0.6rem",
  },
  dot: {
    width: "18px",
    height: "18px",
    borderRadius: "50%",
    transition: "all 0.3s ease",
  },
  progressText: {
    fontSize: "0.8rem",
    color: "#64748b",
    margin: 0,
  },
  videoWrapper: {
    position: "relative",
    width: "100%",
    borderRadius: "0.75rem",
    overflow: "hidden",
    border: "2px solid rgba(255,255,255,0.15)",
  },
  video: {
    width: "100%",
    display: "block",
    borderRadius: "0.75rem",
    background: "#000",
  },
  gridOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gridTemplateRows: "repeat(3, 1fr)",
    pointerEvents: "none",
  },
  gridCell: {
    border: "1px solid rgba(255,255,255,0.25)",
  },
  instruction: {
    textAlign: "center",
    color: "#cbd5e1",
    lineHeight: 1.6,
    margin: 0,
  },
  solutionBox: {
    display: "flex",
    flexWrap: "wrap",
    gap: "0.5rem",
    justifyContent: "center",
    padding: "1rem",
    background: "rgba(0,0,0,0.3)",
    borderRadius: "0.75rem",
    width: "100%",
  },
  move: {
    background: "rgba(96,165,250,0.2)",
    border: "1px solid rgba(96,165,250,0.4)",
    borderRadius: "0.375rem",
    padding: "0.25rem 0.6rem",
    fontSize: "1rem",
    fontFamily: "monospace",
    fontWeight: 600,
    color: "#93c5fd",
  },
  btnPrimary: {
    padding: "0.75rem 2rem",
    background: "linear-gradient(90deg, #3b82f6, #6366f1)",
    color: "#fff",
    border: "none",
    borderRadius: "0.75rem",
    fontSize: "1rem",
    fontWeight: 700,
    cursor: "pointer",
    transition: "opacity 0.2s",
    width: "100%",
    maxWidth: "320px",
  },
  btnDisabled: {
    opacity: 0.55,
    cursor: "not-allowed",
  },
  btnSecondary: {
    padding: "0.65rem 1.75rem",
    background: "transparent",
    color: "#93c5fd",
    border: "1px solid #3b82f6",
    borderRadius: "0.75rem",
    fontSize: "0.95rem",
    fontWeight: 600,
    cursor: "pointer",
  },
  successBadge: {
    fontSize: "1.4rem",
    fontWeight: 700,
    color: "#4ade80",
  },
  errorBadge: {
    fontSize: "1.2rem",
    fontWeight: 700,
    color: "#fb923c",
  },
  errorText: {
    color: "#fca5a5",
    textAlign: "center",
    fontSize: "0.9rem",
    margin: 0,
  },
  inlineError: {
    marginTop: "0.75rem",
    color: "#fca5a5",
    fontSize: "0.85rem",
    maxWidth: "560px",
    textAlign: "center",
  },
};
