import React, { useEffect, useRef, useState } from "react";
import { Sparkles, Download, ShieldCheck, Cpu } from "lucide-react";

interface SynapticArtFrameProps {
  word: string;
  alpha: number;
  beta: number;
  complexity: number;
  glitch: number;
  resonance: number;
  archetype: string;
  poeticText?: string;
  onDataUrlGenerate?: (dataUrl: string) => void;
  onDownloadClick?: (dataUrl: string) => void;
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = "";

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const testLine = currentLine ? currentLine + " " + word : word;
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;
    if (testWidth > maxWidth && i > 0) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) {
    lines.push(currentLine);
  }
  return lines;
}

export default function SynapticArtFrame({
  word,
  alpha,
  beta,
  complexity,
  glitch,
  resonance,
  archetype,
  poeticText,
  onDataUrlGenerate,
  onDownloadClick,
}: SynapticArtFrameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [artDataUrl, setArtDataUrl] = useState<string>("");
  const onDataUrlGenerateRef = useRef(onDataUrlGenerate);
  const onDownloadClickRef = useRef(onDownloadClick);

  useEffect(() => {
    onDownloadClickRef.current = onDownloadClick;
  }, [onDownloadClick]);

  useEffect(() => {
    onDataUrlGenerateRef.current = onDataUrlGenerate;
  }, [onDataUrlGenerate]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas dimensions
    const width = 450;
    const height = 580;
    const centerY = 225;
    canvas.width = width;
    canvas.height = height;

    // Seeded random number generator based on the word
    let h = 0;
    const cleanWord = word.trim().toUpperCase() || "SINTESI";
    for (let i = 0; i < cleanWord.length; i++) {
      h = (h << 5) - h + cleanWord.charCodeAt(i);
      h |= 0;
    }
    let state = Math.abs(h) || 54321;
    function seededRandom() {
      state = (state * 1664525 + 1013904223) % 4294967296;
      return state / 4294967296;
    }

    // Clear and paint background with deep cosmic gradient
    const bgGrad = ctx.createRadialGradient(
      width / 2,
      centerY,
      20,
      width / 2,
      centerY,
      width * 0.7
    );
    bgGrad.addColorStop(0, "#090d23");
    bgGrad.addColorStop(0.5, "#040614");
    bgGrad.addColorStop(1, "#02030a");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Create an elegant glowing grid overlay
    ctx.strokeStyle = "rgba(139, 192, 255, 0.04)";
    ctx.lineWidth = 1;
    const gridSize = 25;
    for (let x = 0; x < width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Determine visual style / palette based on alpha and beta waves
    const isCreative = alpha > beta;
    
    // Choose high-fidelity neon colors based on seed
    const palettes = [
      ["#f43f91", "#ec4899", "#d946ef", "#8b5cf6"], // Ethereal Rose & Violet
      ["#38bdf8", "#0ea5e9", "#6366f1", "#a855f7"], // Cosmic Turquoise & Blue
      ["#f59e0b", "#f43f5e", "#d946ef", "#6366f1"], // Solar Flame
      ["#10b981", "#0ea5e9", "#3b82f6", "#22d3ee"], // Emerald Matrix
    ];

    const chosenPal = palettes[Math.abs(h) % palettes.length];
    const baseColor = chosenPal[0];
    const accentColor = chosenPal[1];
    const auxColor = chosenPal[2];

    // Radial main aura
    const auraGrad = ctx.createRadialGradient(
      width / 2,
      centerY,
      50,
      width / 2,
      centerY,
      220
    );
    auraGrad.addColorStop(0, hexToRgba(baseColor, 0.25));
    auraGrad.addColorStop(0.4, hexToRgba(accentColor, 0.12));
    auraGrad.addColorStop(0.8, hexToRgba(auxColor, 0.03));
    auraGrad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = auraGrad;
    ctx.beginPath();
    ctx.arc(width / 2, centerY, 220, 0, Math.PI * 2);
    ctx.fill();

    // Draw cosmic generative mathematical patterns
    ctx.translate(width / 2, centerY);

    // Draw multiple spiral pathways representing synaptic connections
    const curvesCount = 8 + Math.floor(seededRandom() * 6);
    const maxRadius = 160 + seededRandom() * 30;

    for (let i = 0; i < curvesCount; i++) {
      const angleOffset = (i * Math.PI * 2) / curvesCount;
      ctx.beginPath();
      
      const segments = 60;
      ctx.lineWidth = isCreative ? 1.5 : 1 + seededRandom() * 1.5;
      
      const grad = ctx.createLinearGradient(-100, -100, 100, 100);
      grad.addColorStop(0, auxColor);
      grad.addColorStop(0.5, accentColor);
      grad.addColorStop(1, baseColor);
      ctx.strokeStyle = grad;

      ctx.shadowBlur = 10;
      ctx.shadowColor = baseColor;

      for (let j = 0; j <= segments; j++) {
        const ratio = j / segments;
        const radius = ratio * maxRadius;
        
        // Complex mathematical noise representation derived from seed
        const theta = ratio * Math.PI * 4 + angleOffset + Math.sin(ratio * Math.PI * 2 + seededRandom() * 10) * (complexity * 0.5);
        
        const x = Math.cos(theta) * radius + Math.sin(theta * 3) * (5 * glitch);
        const y = Math.sin(theta) * radius + Math.cos(theta * 3) * (5 * glitch);
        
        if (j === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();
    }

    // Draw geometric digital structures if beta (rationality) is strong
    if (beta > 0.4) {
      ctx.shadowBlur = 0;
      ctx.strokeStyle = "rgba(139, 192, 255, 0.18)";
      ctx.lineWidth = 0.8;
      const polySides = 3 + (Math.abs(h) % 6); // Triangle to Octagon
      const rad = 110;
      
      ctx.beginPath();
      for (let s = 0; s <= polySides; s++) {
        const theta = (s * Math.PI * 2) / polySides + (complexity * 0.2);
        const x = Math.cos(theta) * rad;
        const y = Math.sin(theta) * rad;
        if (s === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Connecting spokes
      for (let s = 0; s < polySides; s++) {
        const theta = (s * Math.PI * 2) / polySides + (complexity * 0.2);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(theta) * rad, Math.sin(theta) * rad);
        ctx.stroke();
      }
    }

    // Draw small sparkling synaps particles
    ctx.shadowBlur = 15;
    ctx.shadowColor = "#ffffff";
    const particleCount = 20 + Math.floor(seededRandom() * 30);
    for (let p = 0; p < particleCount; p++) {
      const angle = seededRandom() * Math.PI * 2;
      const distance = seededRandom() * maxRadius;
      const size = 1.5 + seededRandom() * 3;
      const px = Math.cos(angle) * distance;
      const py = Math.sin(angle) * distance;

      ctx.fillStyle = seededRandom() > 0.5 ? "#ffffff" : accentColor;
      ctx.beginPath();
      ctx.arc(px, py, size, 0, Math.PI * 2);
      ctx.fill();
    }

    // Reset translation to draw text framing
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.shadowBlur = 0; // Turn off shadows for text legibility

    // Add high-end museum label metadata frame at bottom
    const boxHeight = 120;
    const boxY = height - boxHeight - 8;
    ctx.fillStyle = "rgba(2, 4, 12, 0.85)";
    ctx.fillRect(8, boxY, width - 16, boxHeight);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
    ctx.lineWidth = 1;
    ctx.strokeRect(8, boxY, width - 16, boxHeight);

    // Concept Title
    ctx.font = "bold 13px 'JetBrains Mono', monospace";
    ctx.fillStyle = "#ffffff";
    ctx.fillText(`CONCEPT // ${cleanWord}`, 20, boxY + 20);

    // Stats Bar
    ctx.font = "9px 'JetBrains Mono', monospace";
    ctx.fillStyle = "#94a3b8";
    ctx.fillText(`ALPHA RESONANCE: ${Math.round(alpha * 100)}%   BETA RATIONAL: ${Math.round(beta * 100)}%   RES: ${resonance.toFixed(1)}Hz`, 20, boxY + 38);
    
    // Archetype and certification
    ctx.fillText(`ARCHETYPE: ${archetype}`, 20, boxY + 54);

    // Subtle line separator
    ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
    ctx.beginPath();
    ctx.moveTo(18, boxY + 64);
    ctx.lineTo(width - 18, boxY + 64);
    ctx.stroke();

    // Poetic custom text wrap
    const cleanPoeticText = (poeticText || "").trim().toUpperCase() || "INTERCONNESSIONI COMPLETATE";
    ctx.font = "italic 8.5px 'JetBrains Mono', monospace";
    ctx.fillStyle = "#ec4899";
    const lines = wrapText(ctx, cleanPoeticText, width - 40);
    lines.slice(0, 4).forEach((line, index) => {
      ctx.fillText(line, 20, boxY + 78 + (index * 11));
    });

    // Generate output URL
    try {
      const dataUrl = canvas.toDataURL("image/png");
      setArtDataUrl(dataUrl);
      if (onDataUrlGenerateRef.current) {
        onDataUrlGenerateRef.current(dataUrl);
      }
    } catch (err) {
      console.error("Failed to generate base64 image d'arte:", err);
    }
  }, [word, alpha, beta, complexity, glitch, resonance, archetype, poeticText]);

  // Mini utility to convert hex colors to RGBA formatted strings
  function hexToRgba(hex: string, op: number) {
    const cleanHex = hex.replace("#", "");
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${op})`;
  }

  const handleDownload = () => {
    if (!artDataUrl) return;
    
    // Always call the parent callback if available to open the instruction modal
    if (onDownloadClickRef.current) {
      onDownloadClickRef.current(artDataUrl);
    }
    
    // Attempt the direct download (best effort inside iframe, may be blocked, which is why modal is great)
    try {
      const link = document.createElement("a");
      link.href = artDataUrl;
      link.download = `INTERCONNESSIONI_OPERA_${word.replace(/\s+/g, "_") || "ART"}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.warn("Direct download link trigger failed but fallback modal handles it", err);
    }
  };

  return (
    <div className="flex flex-col items-center gap-3 w-full max-w-sm mx-auto" id="generative-art-container">
      <div className="relative rounded-2xl overflow-hidden border border-slate-800/80 bg-slate-950 p-2 shadow-2xl group transition-all duration-300 hover:border-pink-500/40">
        
        {/* Subtle decorative futuristic labels */}
        <div className="absolute top-4 left-4 z-10 bg-slate-950/90 text-slate-400 text-[8px] px-2 py-0.5 rounded border border-slate-800 font-mono tracking-widest uppercase flex items-center gap-1">
          <Cpu className="w-2.5 h-2.5 text-pink-500 animate-pulse" />
          CODICE GENERATO_D'ANIMA
        </div>

        <div className="absolute top-4 right-4 z-10 bg-pink-500/10 text-pink-400 text-[8px] px-2 py-0.5 rounded border border-pink-500/30 font-mono tracking-widest uppercase font-bold">
          INTERCONNESSIONI
        </div>

        {/* Hidden original painter, visible high-resolution canvas element */}
        <canvas
          ref={canvasRef}
          className="w-full aspect-[450/580] rounded-xl bg-slate-950 block transition-transform duration-500 group-hover:scale-[1.01]"
          style={{ maxWidth: "100%", height: "auto" }}
        />

        {/* Aura gradient corner decors */}
        <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b border-l border-pink-500/45 rounded-bl-xl pointer-events-none" />
        <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b border-r border-sky-400/45 rounded-br-xl pointer-events-none" />
        <div className="absolute -top-1 -left-1 w-6 h-6 border-t border-l border-sky-400/45 rounded-tl-xl pointer-events-none" />
        <div className="absolute -top-1 -right-1 w-6 h-6 border-t border-r border-pink-500/45 rounded-tr-xl pointer-events-none" />
      </div>

      <div className="flex w-full items-center justify-between px-1">
        <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1 uppercase">
          <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
          Pittura Algoritmica
        </span>
        <button
          onClick={handleDownload}
          disabled={!artDataUrl}
          className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg border border-slate-800 text-[10px] font-mono font-bold transition-all inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
        >
          <Download className="w-3 h-3 text-pink-400" />
          SCARICA
        </button>
      </div>
    </div>
  );
}
