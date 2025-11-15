"use client";

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { PuzzleType, PUZZLE_CONFIGS } from '@/lib/puzzle-configs';

interface ScannerPanelProps {
  puzzleType: PuzzleType;
  onComplete: (colors: string[]) => void;
}

type InputMode = 'mode-select' | 'upload' | 'webcam' | 'manual' | 'review';

export default function ScannerPanel({ puzzleType, onComplete }: ScannerPanelProps) {
  const [step, setStep] = useState<InputMode>('mode-select');
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [webcamPhotos, setWebcamPhotos] = useState<string[]>([]);
  const [detectedColors, setDetectedColors] = useState<string[]>([]);
  const [manualColors, setManualColors] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [currentFace, setCurrentFace] = useState(0);

  const puzzle = PUZZLE_CONFIGS[puzzleType];
  const numFaces = puzzle.faces;
  const stickersPerFace = puzzle.stickersPerFace;
  const totalColors = numFaces * stickersPerFace;
  const faceNames = ['Front', 'Back', 'Left', 'Right', 'Top', 'Bottom'];
  const cubeColors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FFA500', '#FFFFFF'];

  const extractDominantColors = (imageFile: File): Promise<string[]> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = 100;
          canvas.height = 100;
          const ctx = canvas.getContext('2d')!;
          ctx.drawImage(img, 0, 0, 100, 100);
          const imageData = ctx.getImageData(0, 0, 100, 100);
          const data = imageData.data;

          // Get dominant colors by dividing image into sticker grid
          const gridSize = Math.sqrt(stickersPerFace);
          const cellSize = 100 / gridSize;
          const colors: string[] = [];

          for (let row = 0; row < gridSize; row++) {
            for (let col = 0; col < gridSize; col++) {
              const x = Math.floor(col * cellSize + cellSize / 2);
              const y = Math.floor(row * cellSize + cellSize / 2);
              const idx = (y * 100 + x) * 4;

              const r = data[idx];
              const g = data[idx + 1];
              const b = data[idx + 2];

              // Convert to hex
              const hex = '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('').toUpperCase();
              colors.push(hex);
            }
          }
          resolve(colors);
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(imageFile);
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (files.length > numFaces) {
      alert(`Please upload at most ${numFaces} images (one for each face)`);
      return;
    }

    setUploadedImages(files);
    setIsAnalyzing(true);

    try {
      const allColors: string[] = [];
      for (const file of files) {
        const colors = await extractDominantColors(file);
        allColors.push(...colors);
      }

      // Pad with random colors if fewer images than faces
      while (allColors.length < totalColors) {
        allColors.push(cubeColors[Math.floor(Math.random() * cubeColors.length)]);
      }

      setDetectedColors(allColors.slice(0, totalColors));
      setStep('review');
    } catch (error) {
      console.error('Error analyzing images:', error);
      alert('Error analyzing images. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
        setStep('webcam');
      }
    } catch (error) {
      alert('Unable to access camera. Please check permissions.');
      console.error('Camera error:', error);
    }
  };

  const captureWebcamPhoto = () => {
    if (canvasRef.current && videoRef.current) {
      const ctx = canvasRef.current.getContext('2d')!;
      ctx.drawImage(videoRef.current, 0, 0);
      const photoData = canvasRef.current.toDataURL('image/png');
      setWebcamPhotos([...webcamPhotos, photoData]);

      if (webcamPhotos.length + 1 === numFaces) {
        // All faces captured
        analyzeWebcamPhotos([...webcamPhotos, photoData]);
      } else {
        alert(`Photo ${webcamPhotos.length + 1}/${numFaces} captured. Next face: ${faceNames[(webcamPhotos.length + 1) % numFaces]}`);
      }
    }
  };

  const analyzeWebcamPhotos = async (photos: string[]) => {
    setIsAnalyzing(true);
    const allColors: string[] = [];

    for (const photoData of photos) {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 100;
        canvas.height = 100;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, 100, 100);
        const imageData = ctx.getImageData(0, 0, 100, 100);
        const data = imageData.data;

        const gridSize = Math.sqrt(stickersPerFace);
        const cellSize = 100 / gridSize;

        for (let row = 0; row < gridSize; row++) {
          for (let col = 0; col < gridSize; col++) {
            const x = Math.floor(col * cellSize + cellSize / 2);
            const y = Math.floor(row * cellSize + cellSize / 2);
            const idx = (y * 100 + x) * 4;

            const r = data[idx];
            const g = data[idx + 1];
            const b = data[idx + 2];

            const hex = '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('').toUpperCase();
            allColors.push(hex);
          }
        }
      };
      img.src = photoData;
    }

    setTimeout(() => {
      setDetectedColors(allColors.slice(0, totalColors));
      stopWebcam();
      setStep('review');
      setIsAnalyzing(false);
    }, 1000);
  };

  const stopWebcam = () => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      setCameraActive(false);
    }
  };

  const handleManualColorChange = (index: number, color: string) => {
    const newColors = [...(manualColors.length > 0 ? manualColors : detectedColors)];
    newColors[index] = color;
    setManualColors(newColors);
  };

  const handleConfirmColors = () => {
    const finalColors = manualColors.length > 0 ? manualColors : detectedColors;
    if (finalColors.length === totalColors) {
      onComplete(finalColors);
      // Reset state
      setStep('mode-select');
      setUploadedImages([]);
      setWebcamPhotos([]);
      setDetectedColors([]);
      setManualColors([]);
    } else {
      alert('Please provide colors for all stickers');
    }
  };

  // Mode selection
  if (step === 'mode-select') {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Scan Your {puzzle.name}</h3>
        <p className="text-sm text-muted-foreground">Choose how to input your puzzle configuration</p>

        {puzzle.scannable ? (
          <div className="space-y-3">
            <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg p-4 border border-primary/20">
              <h4 className="font-medium text-foreground mb-3">Image Upload</h4>
              <p className="text-xs text-muted-foreground mb-3">Upload {numFaces} photos of each face</p>

              {/* Hidden file input (keeps the same handler) */}
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileUpload}
                className="hidden"
                ref={fileInputRef}
              />

              {/* Visible button that explicitly triggers the hidden input */}
              <Button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                aria-label="Upload Images"
              >
                📸 Upload Images
              </Button>
            </div>

            <div className="bg-gradient-to-r from-accent/10 to-primary/10 rounded-lg p-4 border border-accent/20">
              <h4 className="font-medium text-foreground mb-3">Webcam Capture</h4>
              <p className="text-xs text-muted-foreground mb-3">Take {numFaces} photos of each face</p>
              <Button
                onClick={startWebcam}
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                📷 Open Webcam
              </Button>
            </div>
          </div>
        ) : null}

        <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg p-4 border border-purple-500/20">
          <h4 className="font-medium text-foreground mb-3">Manual Mapping</h4>
          <p className="text-xs text-muted-foreground mb-3">Manually select colors for each sticker</p>
          <Button
            onClick={() => {
              setDetectedColors(Array(totalColors).fill('#FF0000'));
              setStep('manual');
            }}
            variant="outline"
            className="w-full"
          >
            🎨 Manual Colors
          </Button>
        </div>
      </div>
    );
  }

  // Upload progress
  if (step === 'upload' && isAnalyzing) {
    return (
      <div className="space-y-4">
        <div className="text-center py-8">
          <div className="inline-block animate-spin w-12 h-12 border-4 border-primary border-t-accent rounded-full" />
          <p className="mt-4 text-muted-foreground">Analyzing images...</p>
        </div>
      </div>
    );
  }

  // Webcam capture
  if (step === 'webcam' && cameraActive) {
    return (
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold text-foreground mb-2">
            Face {webcamPhotos.length + 1} of {numFaces}: {faceNames[webcamPhotos.length % numFaces]}
          </h3>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full rounded-lg border border-border mb-2"
          />
          <canvas ref={canvasRef} className="hidden" width={100} height={100} />
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={stopWebcam}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={captureWebcamPhoto}
            className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            📷 Capture
          </Button>
        </div>

        <div className="text-xs text-muted-foreground text-center">
          {webcamPhotos.length} / {numFaces} faces captured
        </div>
      </div>
    );
  }

  if (step === 'manual') {
    const displayColors = manualColors.length > 0 ? manualColors : detectedColors;
    const gridSize = Math.sqrt(stickersPerFace);

    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Manually Map Colors</h3>
        <p className="text-xs text-muted-foreground">Click each sticker to change its color</p>

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {Array(numFaces).fill(0).map((_, faceIdx) => (
            <div key={faceIdx} className="glass p-3 rounded-lg">
              <h4 className="text-sm font-medium text-foreground mb-2">{faceNames[faceIdx % numFaces]} Face</h4>
              <div
                className="gap-2 mb-2"
                style={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`
                }}
              >
                {Array(stickersPerFace).fill(0).map((_, stickerIdx) => {
                  const colorIdx = faceIdx * stickersPerFace + stickerIdx;
                  return (
                    <div key={stickerIdx} className="aspect-square">
                      <input
                        type="color"
                        value={displayColors[colorIdx] || '#FF0000'}
                        onChange={(e) => handleManualColorChange(colorIdx, e.target.value)}
                        className="w-full h-full rounded cursor-pointer border border-border"
                        title={`Sticker ${stickerIdx + 1}`}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setStep('mode-select');
              setManualColors([]);
              setDetectedColors([]);
            }}
            className="flex-1"
          >
            Back
          </Button>
          <Button
            onClick={handleConfirmColors}
            className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground"
          >
            Confirm Colors
          </Button>
        </div>
      </div>
    );
  }

  // Review detected colors
  if (step === 'review') {
    const displayColors = manualColors.length > 0 ? manualColors : detectedColors;
    const gridSize = Math.sqrt(stickersPerFace);

    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Review Detected Colors</h3>
        <p className="text-xs text-muted-foreground">Click any sticker to adjust the color</p>

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {Array(numFaces).fill(0).map((_, faceIdx) => (
            <div key={faceIdx} className="glass p-3 rounded-lg">
              <h4 className="text-sm font-medium text-foreground mb-2">{faceNames[faceIdx % numFaces]} Face</h4>
              <div
                className="gap-2"
                style={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`
                }}
              >
                {Array(stickersPerFace).fill(0).map((_, stickerIdx) => {
                  const colorIdx = faceIdx * stickersPerFace + stickerIdx;
                  return (
                    <div key={stickerIdx} className="aspect-square">
                      <input
                        type="color"
                        value={displayColors[colorIdx] || '#FF0000'}
                        onChange={(e) => handleManualColorChange(colorIdx, e.target.value)}
                        className="w-full h-full rounded cursor-pointer border border-primary/50 hover:border-primary"
                        title={`Sticker ${stickerIdx + 1}`}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setStep('mode-select');
              setUploadedImages([]);
              setWebcamPhotos([]);
              setDetectedColors([]);
              setManualColors([]);
            }}
            className="flex-1"
          >
            Re-scan
          </Button>
          <Button
            onClick={handleConfirmColors}
            className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground"
          >
            Confirm & Solve
          </Button>
        </div>
      </div>
    );
  }

  return null;
}
