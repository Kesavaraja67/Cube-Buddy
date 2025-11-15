"use client";

import { useRef, useEffect } from 'react';
import { PuzzleType } from '@/lib/puzzle-configs';

interface Viewer3DProps {
  puzzleType: PuzzleType;
}

export default function Viewer3D({ puzzleType }: Viewer3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Simple WebGL canvas - placeholder for react-three-fiber integration
    const canvas = document.createElement('canvas');
    canvas.width = containerRef.current.clientWidth;
    canvas.height = containerRef.current.clientHeight;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Create a gradient background
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, 'rgba(30, 20, 60, 0.9)');
    gradient.addColorStop(1, 'rgba(10, 20, 40, 0.9)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw a placeholder cube
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const size = 100;

    // Draw cube wireframe
    const drawCube = () => {
      ctx.strokeStyle = 'rgba(147, 112, 219, 0.6)';
      ctx.lineWidth = 2;

      // Front face
      ctx.strokeRect(centerX - size, centerY - size, size * 2, size * 2);
      
      // Back face (smaller)
      ctx.strokeRect(centerX - size * 0.7, centerY - size * 0.7, size * 1.4, size * 1.4);
      
      // Connecting lines
      ctx.beginPath();
      ctx.moveTo(centerX - size, centerY - size);
      ctx.lineTo(centerX - size * 0.7, centerY - size * 0.7);
      ctx.moveTo(centerX + size, centerY - size);
      ctx.lineTo(centerX + size * 0.7, centerY - size * 0.7);
      ctx.moveTo(centerX + size, centerY + size);
      ctx.lineTo(centerX + size * 0.7, centerY + size * 0.7);
      ctx.moveTo(centerX - size, centerY + size);
      ctx.lineTo(centerX - size * 0.7, centerY + size * 0.7);
      ctx.stroke();

      // Add glow
      ctx.shadowColor = 'rgba(147, 112, 219, 0.8)';
      ctx.shadowBlur = 20;
    };

    drawCube();

    // Add text
    ctx.fillStyle = 'rgba(147, 112, 219, 0.8)';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${puzzleType.toUpperCase()}`, centerX, canvas.height - 40);
    ctx.font = '12px sans-serif';
    ctx.fillStyle = 'rgba(100, 255, 150, 0.6)';
    ctx.fillText('Interactive 3D Viewer', centerX, canvas.height - 20);

    containerRef.current.innerHTML = '';
    containerRef.current.appendChild(canvas);
  }, [puzzleType]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full rounded-lg border border-border bg-gradient-to-br from-slate-900 to-slate-950"
    />
  );
}
