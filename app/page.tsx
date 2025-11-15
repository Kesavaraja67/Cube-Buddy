'use client';

import Link from 'next/link';
import { Zap, Cable as Cube, Eye, Sparkles } from 'lucide-react';

export default function HomePage() {
  return (
    <main className="min-h-screen px-4 py-12">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-20 pt-12">
          <h1 className="text-5xl lg:text-7xl font-bold text-balance mb-6 text-foreground">
            Meet Cube Buddy
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            Your AI-powered twisty puzzle solver. Scan. Detect. Visualize. Solve — every puzzle, instantly.
          </p>
          <Link href="/solver">
            <button className="px-8 py-4 bg-primary text-primary-foreground rounded-full font-semibold hover:bg-primary/90 transition-all hover:shadow-lg hover:shadow-primary/30 text-lg">
              Start Solving
            </button>
          </Link>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          <div className="glass p-6 rounded-lg hover:border-primary/50 transition-all">
            <Zap className="w-8 h-8 text-accent mb-4" />
            <h3 className="font-semibold text-lg mb-2">Lightning Fast</h3>
            <p className="text-muted-foreground">Get solutions in seconds, not minutes. Optimized for speed.</p>
          </div>

          <div className="glass p-6 rounded-lg hover:border-primary/50 transition-all">
            <Eye className="w-8 h-8 text-accent mb-4" />
            <h3 className="font-semibold text-lg mb-2">Smart Scanning</h3>
            <p className="text-muted-foreground">Scan or manually input your puzzle state. Flexible options for all.</p>
          </div>

          <div className="glass p-6 rounded-lg hover:border-primary/50 transition-all">
            <Cube className="w-8 h-8 text-accent mb-4" />
            <h3 className="font-semibold text-lg mb-2">34+ Puzzles</h3>
            <p className="text-muted-foreground">From 2×2 to Megaminx. All your favorites supported.</p>
          </div>

          <div className="glass p-6 rounded-lg hover:border-primary/50 transition-all">
            <Sparkles className="w-8 h-8 text-accent mb-4" />
            <h3 className="font-semibold text-lg mb-2">Step by Step</h3>
            <p className="text-muted-foreground">Beginner-friendly or optimal solutions. Your choice.</p>
          </div>
        </div>

        {/* What You Can Solve */}
        <div className="mb-20">
          <h2 className="text-4xl font-bold text-balance mb-12 text-center">Support for Every Puzzle</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Cubes */}
            <div className="glass p-8 rounded-lg">
              <h3 className="text-2xl font-bold mb-4 text-accent">Standard Cubes</h3>
              <p className="text-muted-foreground mb-4">All NxN cubes from 2×2 up to 7×7, including the iconic 3×3 Rubik's Cube.</p>
              <div className="flex flex-wrap gap-2">
                {['2×2', '3×3', '4×4', '5×5', '6×6', '7×7'].map(cube => (
                  <span key={cube} className="bg-primary/20 text-primary px-3 py-1 rounded-full text-sm font-medium">
                    {cube}
                  </span>
                ))}
              </div>
            </div>

            {/* Shape Mods */}
            <div className="glass p-8 rounded-lg">
              <h3 className="text-2xl font-bold mb-4 text-accent">Shape Modifications</h3>
              <p className="text-muted-foreground mb-4">Mirror, Fisher, Axis, Windmill, Ghost, and more twisted variants.</p>
              <div className="flex flex-wrap gap-2">
                {['Mirror', 'Fisher', 'Axis', 'Windmill', 'Ghost'].map(mod => (
                  <span key={mod} className="bg-primary/20 text-primary px-3 py-1 rounded-full text-sm font-medium">
                    {mod}
                  </span>
                ))}
              </div>
            </div>

            {/* Pyramids & Dodeca */}
            <div className="glass p-8 rounded-lg">
              <h3 className="text-2xl font-bold mb-4 text-accent">Pyramids & Polyhedra</h3>
              <p className="text-muted-foreground mb-4">Pyraminx family, Megaminx, Gigaminx, and other exotic shapes.</p>
              <div className="flex flex-wrap gap-2">
                {['Pyraminx', 'Megaminx', 'Kilominx'].map(puzzle => (
                  <span key={puzzle} className="bg-primary/20 text-primary px-3 py-1 rounded-full text-sm font-medium">
                    {puzzle}
                  </span>
                ))}
              </div>
            </div>

            {/* Advanced */}
            <div className="glass p-8 rounded-lg">
              <h3 className="text-2xl font-bold mb-4 text-accent">Advanced & Exotic</h3>
              <p className="text-muted-foreground mb-4">Skewb, Curvy Copter, Square-1, and other challenging variants.</p>
              <div className="flex flex-wrap gap-2">
                {['Skewb', 'Curvy Copter', 'Square-1'].map(puzzle => (
                  <span key={puzzle} className="bg-primary/20 text-primary px-3 py-1 rounded-full text-sm font-medium">
                    {puzzle}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="mb-20">
          <h2 className="text-4xl font-bold text-balance mb-12 text-center">How It Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="font-semibold text-lg mb-2">Choose Your Puzzle</h3>
              <p className="text-muted-foreground">Select from 34+ twisty puzzles across 7 categories.</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="font-semibold text-lg mb-2">Input Your State</h3>
              <p className="text-muted-foreground">Scan via camera or manually map your puzzle's colors.</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="font-semibold text-lg mb-2">Get Solutions</h3>
              <p className="text-muted-foreground">View step-by-step solutions optimized for your skill level.</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="glass p-12 rounded-lg text-center mb-20">
          <h2 className="text-3xl font-bold mb-4">Ready to solve any puzzle?</h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Join thousands of puzzle enthusiasts using Cube Buddy to master twisty puzzles.
          </p>
          <Link href="/solver">
            <button className="px-8 py-4 bg-primary text-primary-foreground rounded-full font-semibold hover:bg-primary/90 transition-all hover:shadow-lg hover:shadow-primary/30">
              Launch Solver
            </button>
          </Link>
        </div>
      </div>
    </main>
  );
}
