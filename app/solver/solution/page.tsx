// app/solver/solution/page.tsx
"use client";

import React, { useMemo, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

type Step = {
    title?: string;
    alg: string;
    note?: string;
    movesCount?: number;
};

// Move explanations
const MOVE_EXPLANATIONS: Record<string, string> = {
    "R": "Turn the Right face clockwise 90°.",
    "R'": "Turn the Right face counter-clockwise 90°.",
    "R2": "Right face 180°.",
    "L": "Turn the Left face clockwise 90°.",
    "L'": "Turn the Left face counter-clockwise 90°.",
    "L2": "Left face 180°.",
    "U": "Turn the Up (top) face clockwise 90°.",
    "U'": "Up face counter-clockwise 90°.",
    "U2": "Up face 180°.",
    "D": "Turn the Down (bottom) face clockwise 90°.",
    "D'": "Down face counter-clockwise 90°.",
    "D2": "Down face 180°.",
    "F": "Turn the Front face clockwise 90°.",
    "F'": "Front face counter-clockwise 90°.",
    "F2": "Front face 180°.",
    "B": "Turn the Back face clockwise 90°.",
    "B'": "Back face counter-clockwise 90°.",
    "B2": "Back face 180°.",
};

// Parse algorithm into tokens
function parseAlg(alg: string): string[] {
    const cleaned = (alg || "").replace(/\s+/g, " ").trim();
    if (!cleaned) return [];
    return cleaned.split(/[\s,]+/).filter(Boolean);
}

function explainSequence(alg: string) {
    const parts = parseAlg(alg);
    return parts.map(p => ({
        token: p,
        explanation: MOVE_EXPLANATIONS[p] || `Rotate the face indicated (${p}).`
    }));
}

export default function SolutionPage() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const idParam = searchParams?.get("id");
    const rawMovesParam = searchParams?.get("moves") || "";

    const [parsedSteps, setParsedSteps] = useState<Step[]>([]);
    const [index, setIndex] = useState(0);

    // Load from sessionStorage OR ?moves
    useEffect(() => {
        let loaded: Step[] | null = null;

        // Load from sessionStorage (preferred)
        if (idParam) {
            try {
                const raw = sessionStorage.getItem(idParam);
                if (raw) {
                    const arr = JSON.parse(raw);
                    loaded = arr.map((s: any) => ({
                        title: s.title,
                        alg: s.notation || s.alg || "",
                        note: s.description || s.note,
                        movesCount: s.moves || s.movesCount
                    }));
                }
            } catch (e) {
                console.error("sessionStorage load error:", e);
            }
        }

        // Fallback: load from ?moves query param
        if (!loaded && rawMovesParam) {
            try {
                const decoded = decodeURIComponent(rawMovesParam);
                const arr = JSON.parse(decoded);

                loaded = arr.map((v: any) => {
                    if (typeof v === "string") return { alg: v };
                    return {
                        title: v.title,
                        alg: v.alg || "",
                        note: v.note || v.description,
                        movesCount: v.movesCount
                    };
                });
            } catch (e) {
                console.error("Failed to parse moves param:", e);
            }
        }

        setParsedSteps(loaded || []);
        setIndex(0);
    }, [idParam, rawMovesParam]);

    if (!parsedSteps.length) {
        return (
            <div className="p-6 max-w-3xl mx-auto text-white">
                <h1 className="text-2xl font-semibold mb-4">No solution found</h1>
                <button
                    className="px-3 py-2 bg-slate-800 text-white rounded"
                    onClick={() => router.back()}
                >
                    Go Back
                </button>
            </div>
        );
    }

    const current = parsedSteps[index];
    const stepsCount = parsedSteps.length;
    const tokens = explainSequence(current.alg);

    return (
        <div className="p-6 max-w-4xl mx-auto text-white">
            <header className="mb-6">
                <h1 className="text-3xl font-bold">Solution — Step {index + 1} of {stepsCount}</h1>

                <div className="mt-4 text-sm">
                    <strong>Algorithm:</strong>{" "}
                    <code className="px-2 py-1 rounded bg-white/10 text-white">
                        {current.alg}
                    </code>
                </div>
            </header>

            {/* Notation Reference */}
            <section className="mb-6">
                <h2 className="text-xl font-semibold mb-2">Notation & Quick Reference</h2>

                <div className="grid grid-cols-2 gap-3 text-sm">
                    {Object.entries(MOVE_EXPLANATIONS).map(([k, v]) => (
                        <div key={k} className="flex gap-2 items-start">
                            <div className="font-bold w-12">{k}</div>
                            <div className="text-xs opacity-80">{v}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Step breakdown */}
            <main className="mb-6">
                <h2 className="text-xl font-semibold mb-2">Step-by-step breakdown</h2>

                {/* DARK background FIXED */}
                <div className="border border-white/10 rounded p-4 mb-4 bg-white/5 backdrop-blur">
                    <div className="mb-2">
                        <strong>Full move sequence:</strong>{" "}
                        <code className="bg-white/10 px-2 py-1 rounded">{current.alg}</code>
                    </div>

                    <div className="mb-2">
                        <strong>Moves count:</strong> {parseAlg(current.alg).length} moves
                    </div>

                    {current.note && (
                        <div className="mb-2 text-sm opacity-80">Note: {current.note}</div>
                    )}
                </div>

                <ol className="list-decimal list-inside space-y-3">
                    {tokens.map((t, i) => (
                        <li
                            key={i}
                            className="p-3 border border-white/10 rounded bg-white/5 backdrop-blur"
                        >
                            <div className="font-medium">{t.token}</div>
                            <div className="text-sm opacity-80 mt-1">{t.explanation}</div>
                            <div className="text-xs mt-1 text-blue-300">
                                Tip: {getTipForToken(t.token)}
                            </div>
                        </li>
                    ))}
                </ol>
            </main>

            {/* Beginner notes */}
            <aside className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Beginner notes</h3>
                <ul className="list-disc list-inside text-sm space-y-1 opacity-80">
                    <li>Perform each move slowly until you understand the mechanics.</li>
                    <li>R means rotate the right face clockwise when facing the right side.</li>
                    <li>Practice reversing an algorithm to regain your starting position.</li>
                    <li>Cube orientation matters — always verify which face is front/up.</li>
                </ul>
            </aside>

            {/* Footer Navigation */}
            <footer className="flex gap-3">
                <button
                    onClick={() => setIndex(i => Math.max(0, i - 1))}
                    disabled={index === 0}
                    className={`px-4 py-2 rounded ${index === 0 ? "bg-gray-600/40" : "bg-slate-700"
                        }`}
                >
                    ← Previous
                </button>

                <button
                    onClick={() => setIndex(i => Math.min(stepsCount - 1, i + 1))}
                    disabled={index === stepsCount - 1}
                    className={`px-4 py-2 rounded ${index === stepsCount - 1 ? "bg-gray-600/40" : "bg-slate-900"
                        }`}
                >
                    Next →
                </button>

                <button
                    onClick={() => router.back()}
                    className="ml-auto px-4 py-2 bg-white/10 border border-white/20 rounded"
                >
                    Back to Scanner
                </button>
            </footer>
        </div>
    );
}

function getTipForToken(token: string) {
    if (!token) return "Execute the move slowly and steadily.";
    if (token.endsWith("2")) return "Use a double flick to perform 180° turns efficiently.";
    if (token.includes("'")) return "Counter-clockwise moves require opposite finger tricks.";
    if (token === "R") return "Use your right index/middle finger for smooth R turns.";
    if (token === "U") return "Flick the top layer using your index finger.";
    return "Keep the cube stable while executing the move.";
}
