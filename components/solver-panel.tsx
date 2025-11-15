"use client";

import { useState } from 'react';
import { useRouter } from "next/navigation";
import { Button } from '@/components/ui/button';
import { PuzzleType, PUZZLE_CONFIGS } from '@/lib/puzzle-configs';

interface SolverPanelProps {
  puzzleType: PuzzleType;
  colors: string[];
}

interface SolveStep {
  notation: string;
  description: string;
  moves: number;
}

export default function SolverPanel({ puzzleType, colors }: SolverPanelProps) {
  const router = useRouter();
  const [steps, setSteps] = useState<SolveStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [difficulty, setDifficulty] = useState<'beginner' | 'optimal'>('beginner');
  const puzzle = PUZZLE_CONFIGS[puzzleType];

  // Navigate to solution page — store in sessionStorage to avoid long URLs
  function openSolutionPageUsingSession(solutionSteps: any[]) {
    try {
      if (typeof window === "undefined" || !window.sessionStorage) {
        // fallback to encoding in URL if sessionStorage not available
        const json = encodeURIComponent(JSON.stringify(solutionSteps));
        router.push(`/solver/solution?moves=${json}`);
        return;
      }

      const id = `solution-${Date.now()}`;
      sessionStorage.setItem(id, JSON.stringify(solutionSteps));
      router.push(`/solver/solution?id=${id}`);
    } catch (err) {
      console.error("Failed to store solution or navigate:", err);
      // fallback to URL encoding as last resort
      try {
        const json = encodeURIComponent(JSON.stringify(solutionSteps));
        router.push(`/solver/solution?moves=${json}`);
      } catch (err2) {
        console.error("Also failed to encode solution as query param:", err2);
        alert("Unable to open detailed solution (see console).");
      }
    }
  }

  // Old name left for compatibility; call session version
  function openSolutionPage(solutionSteps: any[]) {
    openSolutionPageUsingSession(solutionSteps);
  }

  const handleGenerateSolution = async () => {
    setIsLoading(true);
    // Simulate solver API call
    setTimeout(() => {
      const mockSteps: SolveStep[] = [
        { notation: "R U R' U'", description: 'Sexy move to solve first layer corners', moves: 4 },
        { notation: "F D F'", description: 'Solve first layer edges', moves: 3 },
        { notation: "U2 R U' R' U' R U' R'", description: 'Position middle layer edges', moves: 8 },
        { notation: "R U R' U R U2 R'", description: 'Orient last layer', moves: 7 },
        { notation: "R U R' U R U R'", description: 'Permute last layer corners', moves: 7 },
      ];
      setSteps(mockSteps);
      setCurrentStep(0);
      setIsLoading(false);
    }, 1500);
  };

  if (!colors.length) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Scan your puzzle to generate a solution</p>
      </div>
    );
  }

  if (steps.length === 0) {
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Solution Type</label>
          <div className="flex gap-2">
            <Button
              variant={difficulty === 'beginner' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setDifficulty('beginner')}
            >
              Beginner
            </Button>
            <Button
              variant={difficulty === 'optimal' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setDifficulty('optimal')}
            >
              Optimal
            </Button>
          </div>
        </div>
        <Button
          onClick={handleGenerateSolution}
          disabled={isLoading}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          {isLoading ? 'Generating...' : 'Generate Solution'}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold">Solution: {steps.length} steps</h3>
        <span className="text-sm text-muted-foreground">
          Step {currentStep + 1} of {steps.length}
        </span>
      </div>

      <div className="glass p-4 space-y-3">
        <div className="text-center">
          <div className="text-3xl font-bold text-accent mb-2">
            {steps[currentStep].notation}
          </div>
          <p className="text-sm text-muted-foreground">
            {steps[currentStep].description}
          </p>
          <p className="text-xs text-accent mt-2">
            {steps[currentStep].moves} moves
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
          disabled={currentStep === 0}
          className="flex-1"
        >
          ← Previous
        </Button>
        <Button
          variant="outline"
          onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
          disabled={currentStep === steps.length - 1}
          className="flex-1"
        >
          Next →
        </Button>
      </div>

      <div className="flex flex-col gap-2">
        <Button
          onClick={() => openSolutionPage(steps)}
          className="w-full bg-black text-white"
        >
          View Detailed Solution
        </Button>

        <Button
          variant="outline"
          onClick={() => setSteps([])}
          className="w-full"
        >
          Scan Different Puzzle
        </Button>
      </div>
    </div>
  );
}
