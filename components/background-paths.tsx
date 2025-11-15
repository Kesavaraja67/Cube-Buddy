"use client";

export default function BackgroundPaths() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-background">
      {/* Dark gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
      
      {/* Animated accent orbs */}
      <div className="absolute top-1/4 -left-1/3 w-96 h-96 bg-primary/20 rounded-full mix-blend-screen blur-3xl animate-pulse" />
      <div className="absolute top-1/2 -right-1/4 w-80 h-80 bg-accent/20 rounded-full mix-blend-screen blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-secondary/10 rounded-full mix-blend-screen blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      
      {/* Grid pattern overlay */}
      <svg className="absolute inset-0 w-full h-full opacity-5" width="100%" height="100%">
        <defs>
          <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
            <path d="M 50 0 L 0 0 0 50" fill="none" stroke="currentColor" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
    </div>
  );
}
