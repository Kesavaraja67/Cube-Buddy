"use client";

import { useState } from "react";
import Link from "next/link";
import PuzzleSelector from "@/components/puzzle-selector";
import Viewer3D from "@/components/viewer-3d";
import ScannerPanel from "@/components/scanner-panel";
import SolverPanel from "@/components/solver-panel";
import { PuzzleType } from "@/lib/puzzle-configs";
import { RainbowButton } from "@/components/ui/rainbow-button";

export default function SolverPage() {
  const [selectedPuzzle, setSelectedPuzzle] = useState<PuzzleType | null>(null);
  const [scannedColors, setScannedColors] = useState<string[]>([]);

  // Landing view: pick puzzle
  if (!selectedPuzzle) {
    return (
      <main className="min-h-screen px-4 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 flex items-center gap-4">
            {/* Use new Link API: pass className directly to Link */}
            <Link
              href="/"
              className="text-accent hover:text-accent/80 transition-colors font-medium"
            >
              ← Back to Home
            </Link>

            <h1 className="text-2xl font-bold">Choose a Puzzle</h1>
          </div>

          <div className="glass p-6">
            <PuzzleSelector onSelect={setSelectedPuzzle} />
          </div>
        </div>
      </main>
    );
  }

  // Main solver layout
  return (
    <main className="min-h-screen px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6 gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                setSelectedPuzzle(null);
                setScannedColors([]);
                // scroll top so user sees puzzle selector
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              aria-label="Back to puzzles"
              className="text-accent hover:text-accent/80 transition-colors font-medium"
            >
              ← Back to Puzzles
            </button>

            <h2 className="text-xl font-semibold">
              {String(selectedPuzzle).toUpperCase()} Solver
            </h2>
          </div>

          {/* Quick open scanner CTA */}
          <div>
            <RainbowButton
              onClick={() => {
                const node = document.querySelector("#scanner-panel");
                node?.scrollIntoView({ behavior: "smooth", block: "center" });
              }}
            >
              Open Scanner
            </RainbowButton>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left / main: 3D viewer + tips */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass p-6 h-72 lg:h-[600px]">
              <Viewer3D puzzleType={selectedPuzzle} />
            </div>

            <div className="glass p-6">
              <h3 className="text-lg font-semibold mb-2">Tips before scanning</h3>
              <ul className="text-sm list-disc list-inside space-y-1 text-muted-foreground">
                <li>Place the cube on a neutral background with good lighting.</li>
                <li>Capture each face straight-on for best color detection.</li>
                <li>If using webcam, allow camera permissions when prompted.</li>
              </ul>
            </div>
          </div>

          {/* Right sidebar: scanner + solver */}
          <aside className="space-y-6">
            <div id="scanner-panel" className="glass p-6">
              <ScannerPanel puzzleType={selectedPuzzle} onComplete={setScannedColors} />
            </div>

            <div className="glass p-6">
              <SolverPanel puzzleType={selectedPuzzle} colors={scannedColors} />
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
