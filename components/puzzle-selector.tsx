"use client";

import { useState } from 'react';
import { PUZZLE_CONFIGS, CATEGORIES, PuzzleType } from '@/lib/puzzle-configs';
import { Button } from '@/components/ui/button';

interface PuzzleSelectorProps {
  onSelect: (puzzleType: PuzzleType) => void;
}

export default function PuzzleSelector({ onSelect }: PuzzleSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('Cubes');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = Object.values(PUZZLE_CONFIGS).filter(puzzle => 
    puzzle.category === selectedCategory &&
    (puzzle.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
     puzzle.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-balance mb-2">Which puzzle are you solving today?</h1>
        <p className="text-muted-foreground">Select from 34+ twisty puzzles and get instant solutions</p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search puzzles..."
          className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 mb-8">
        {CATEGORIES.map(cat => (
          <Button
            key={cat}
            variant={selectedCategory === cat ? "default" : "outline"}
            className="rounded-full"
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </Button>
        ))}
      </div>

      {/* Puzzle Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map(puzzle => (
          <button
            key={puzzle.id}
            onClick={() => onSelect(puzzle.id as PuzzleType)}
            className="group glass p-4 text-left hover:border-primary/50 hover:shadow-lg hover:shadow-primary/30 transition-all duration-300 transform hover:scale-105"
          >
            <div className="mb-3 overflow-hidden rounded-md bg-muted h-40">
              <img
                src={puzzle.image || "/placeholder.svg"}
                alt={puzzle.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
            </div>
            <h3 className="font-semibold text-foreground mb-1">{puzzle.name}</h3>
            <p className="text-sm text-muted-foreground mb-2">{puzzle.description}</p>
            <div className="text-xs text-accent font-medium flex justify-between">
              <span>{puzzle.faces} faces</span>
              <span>{puzzle.scannable ? '✓ Scannable' : 'Manual'}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
