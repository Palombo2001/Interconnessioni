import React, { useState, useEffect, useRef } from "react";
import { Activity, Crosshair, Zap, ShieldAlert, CheckCircle, RefreshCw, Play, Trophy, ArrowLeft } from "lucide-react";
import SynapticCanvas from "./components/SynapticCanvas";
import { synapticSynth } from "./utils/synapticSynth";

interface GameModeProps {
  onExit: () => void;
  isMuted: boolean;
}

const LEVELS = [
  { word: "CAOS", targetAlpha: 0.8, targetBeta: 0.2, targetComplexity: 1.5, hint: "Alta intuizione, bassa logica" },
  { word: "GEOMETRIA", targetAlpha: 0.2, targetBeta: 0.9, targetComplexity: 0.8, hint: "Rigidità strutturale, logica pura" },
  { word: "SOGNO", targetAlpha: 0.9, targetBeta: 0.1, targetComplexity: 0.6, hint: "Fluido, onirico, zero schemi" },
  { word: "CALCOLO", targetAlpha: 0.1, targetBeta: 0.8, targetComplexity: 1.8, hint: "Matematico, freddo, complesso" },
  { word: "SINESTESIA", targetAlpha: 0.7, targetBeta: 0.7, targetComplexity: 2.0, hint: "Equilibrio caotico tra i due emisferi" }
];

export default function GameMode({ onExit, isMuted }: GameModeProps) {
  const [levelIndex, setLevelIndex] = useState(0);
  const [gameState, setGameState] = useState<"MENU" | "PLAYING" | "WON" | "GAMEOVER" | "LEVEL_TRANSITION">("MENU");
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  
  const [activeAlpha, setActiveAlpha] = useState(0.5);
  const [activeBeta, setActiveBeta] = useState(0.5);
  const [activeComplexity, setActiveComplexity] = useState(1.0);
  
  const [resonance, setResonance] = useState(0);

  const currentLevel = LEVELS[levelIndex];

  useEffect(() => {
    if (gameState === "PLAYING") {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setGameState("GAMEOVER");
            if (!isMuted) synapticSynth.triggerSynapticBeep(150, 1.0, 0.5);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [gameState]);

  // Calcola la risonanza (distanza tra i valori attuali e i target)
  useEffect(() => {
    if (gameState !== "PLAYING") return;
    
    const distAlpha = Math.abs(activeAlpha - currentLevel.targetAlpha);
    const distBeta = Math.abs(activeBeta - currentLevel.targetBeta);
    const distComp = Math.abs((activeComplexity - 0.5) / 1.5 - (currentLevel.targetComplexity - 0.5) / 1.5);
    
    const totalDist = (distAlpha + distBeta + distComp) / 3;
    const currentResonance = Math.max(0, 100 - (totalDist * 100));
    setResonance(currentResonance);

    if (currentResonance >= 90) {
      handleLevelComplete();
    }
  }, [activeAlpha, activeBeta, activeComplexity, gameState, currentLevel]);

  const handleLevelComplete = () => {
    if (!isMuted) {
      synapticSynth.triggerSynapticBeep(880, 0.2, 0.5);
      setTimeout(() => synapticSynth.triggerSynapticBeep(1200, 0.4, 0.5), 200);
    }
    
    setScore(s => s + timeLeft * 10 + 1000);
    
    if (levelIndex + 1 < LEVELS.length) {
      setGameState("LEVEL_TRANSITION");
      setTimeout(() => {
        setLevelIndex(l => l + 1);
        setTimeLeft(60);
        setActiveAlpha(0.5);
        setActiveBeta(0.5);
        setActiveComplexity(1.0);
        setGameState("PLAYING");
      }, 2000);
    } else {
      setGameState("WON");
    }
  };

  const startGame = () => {
    setLevelIndex(0);
    setScore(0);
    setTimeLeft(60);
    setActiveAlpha(0.5);
    setActiveBeta(0.5);
    setActiveComplexity(1.0);
    setGameState("PLAYING");
    if (!isMuted) synapticSynth.triggerSynapticBeep(440, 0.5, 0.5);
  };

  useEffect(() => {
    if (gameState === "PLAYING" && !isMuted) {
      synapticSynth.updateAmbientEngine(activeAlpha, activeBeta, activeComplexity, isMuted);
    } else {
      synapticSynth.stopAmbientEngine();
    }
  }, [gameState, activeAlpha, activeBeta, activeComplexity, isMuted]);

  useEffect(() => {
    return () => synapticSynth.stopAmbientEngine();
  }, []);

  return (
    <div className="h-screen w-screen bg-[#020204] text-slate-300 font-sans selection:bg-pink-500/30 flex flex-col overflow-hidden fixed inset-0 z-[200]">
      {/* Header */}
      <header className="p-4 border-b border-slate-900 flex justify-between items-center bg-slate-950/50 shrink-0">
        <button 
          onClick={onExit}
          className="flex items-center gap-2 text-sm font-mono text-slate-300 hover:text-sky-400 transition-colors uppercase cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Torna all'Installazione
        </button>
        <div className="flex gap-6 font-mono text-sm font-bold tracking-widest">
          <span className="text-sky-400">SCORE: {score}</span>
          {(gameState === "PLAYING" || gameState === "LEVEL_TRANSITION") && (
            <span className={timeLeft < 15 ? "text-rose-500 animate-pulse" : "text-emerald-400"}>
              TIME: {timeLeft}s
            </span>
          )}
        </div>
      </header>

      <main className="flex-1 flex flex-col md:flex-row relative">
        {/* Left Panel - Controls */}
        <div className="w-full md:w-80 border-r border-slate-900 bg-slate-950/80 p-6 flex flex-col gap-8 z-10 shrink-0">
          {gameState === "MENU" && (
            <div className="flex flex-col gap-6 h-full justify-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-black uppercase text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-pink-500">
                  Neural Sync
                </h1>
                <p className="text-sm text-slate-300 font-mono leading-relaxed mb-4">
                  Decodifica le frequenze cerebrali. Sintonizza i lobi Alpha e Beta per stabilizzare il pensiero anomalo prima che collassi.
                </p>
                <div className="bg-slate-900/80 p-4 rounded-xl text-sm text-slate-200 font-mono mt-4 border border-slate-700 leading-relaxed space-y-2 text-left">
                  <span className="text-sky-400 font-bold block mb-1">✦ OBIETTIVO DEL GIOCO ✦</span>
                  <p>Il sistema ti fornirà una <strong>parola chiave</strong> e un indizio. Il tuo scopo è capire quale combinazione di frequenze cerebrali corrisponde a quel concetto.</p>
                  <ul className="list-disc list-inside space-y-1 ml-1 text-slate-400">
                    <li>Muovi gli slider (Alpha, Beta, Complessità) per cercare la sintonia.</li>
                    <li>Guarda la barra in basso: più ti avvicini alla soluzione, più la <strong>Sincronizzazione</strong> sale.</li>
                    <li>Raggiungi il <strong>90%</strong> prima che il tempo scada!</li>
                  </ul>
                </div>
              </div>
              <button 
                onClick={startGame}
                className="py-4 rounded-xl bg-pink-500 hover:bg-pink-400 text-slate-950 font-black font-mono tracking-widest uppercase flex items-center justify-center gap-2 transition-all hover:scale-105 cursor-pointer"
              >
                <Play className="w-5 h-5" /> Inizia Decodifica
              </button>
            </div>
          )}

          {(gameState === "PLAYING" || gameState === "LEVEL_TRANSITION") && (
            <div className="flex flex-col gap-6">
              <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-xl space-y-2">
                <span className="text-xs text-slate-400 font-mono uppercase tracking-widest">Pensiero Target</span>
                <h2 className="text-2xl font-black text-white tracking-widest">{currentLevel.word}</h2>
                <p className="text-xs text-sky-400 font-mono uppercase border-t border-slate-800 pt-2 mt-2">
                  HINT: {currentLevel.hint}
                </p>
              </div>

              <div className="space-y-6">
                {/* Alpha Slider */}
                <div className="space-y-2 font-mono text-xs">
                  <div className="flex justify-between text-pink-400">
                    <span>ONDA ALPHA</span>
                    <span>{Math.round(activeAlpha * 100)}%</span>
                  </div>
                  <input
                    type="range" min="0" max="1" step="0.01"
                    value={activeAlpha}
                    onChange={(e) => setActiveAlpha(parseFloat(e.target.value))}
                    className="w-full accent-pink-500"
                  />
                </div>

                {/* Beta Slider */}
                <div className="space-y-2 font-mono text-xs">
                  <div className="flex justify-between text-sky-400">
                    <span>ONDA BETA</span>
                    <span>{Math.round(activeBeta * 100)}%</span>
                  </div>
                  <input
                    type="range" min="0" max="1" step="0.01"
                    value={activeBeta}
                    onChange={(e) => setActiveBeta(parseFloat(e.target.value))}
                    className="w-full accent-sky-400"
                  />
                </div>

                {/* Complexity Slider */}
                <div className="space-y-2 font-mono text-xs">
                  <div className="flex justify-between text-amber-400">
                    <span>COMPLESSITÀ</span>
                    <span>{activeComplexity.toFixed(2)}Hz</span>
                  </div>
                  <input
                    type="range" min="0.5" max="2.0" step="0.01"
                    value={activeComplexity}
                    onChange={(e) => setActiveComplexity(parseFloat(e.target.value))}
                    className="w-full accent-amber-400"
                  />
                </div>
              </div>

              <div className="mt-auto pt-6 border-t border-slate-900">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-mono text-slate-400 uppercase items-center">
                    <span>Sincronizzazione</span>
                    <span className={resonance > 90 ? "text-emerald-400 font-bold" : ""}>
                      {resonance.toFixed(1)}%
                    </span>
                  </div>
                  <div className="text-xs text-slate-300 mb-1 leading-tight font-mono">Muovi gli slider per raggiungere il 90%</div>
                  <div className="h-2 bg-slate-900 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-300 ${resonance > 90 ? 'bg-emerald-400 shadow-[0_0_10px_#34d399]' : 'bg-sky-500'}`}
                      style={{ width: `${resonance}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {(gameState === "WON" || gameState === "GAMEOVER") && (
            <div className="flex flex-col gap-6 h-full justify-center text-center">
              <div className="space-y-2">
                {gameState === "WON" ? (
                  <Trophy className="w-16 h-16 text-amber-400 mx-auto mb-4" />
                ) : (
                  <ShieldAlert className="w-16 h-16 text-rose-500 mx-auto mb-4" />
                )}
                <h1 className="text-3xl font-black uppercase text-white">
                  {gameState === "WON" ? "VITTORIA!" : "COLLASSO NEURALE"}
                </h1>
                <p className="text-sm text-slate-400 font-mono">
                  Punteggio Finale: <span className="text-sky-400 font-bold">{score}</span>
                </p>
              </div>
              <button 
                onClick={startGame}
                className="py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold font-mono tracking-widest uppercase flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" /> Rigioca
              </button>
            </div>
          )}
        </div>

        {/* Right Panel - 3D Canvas */}
        <div className="flex-1 relative bg-black overflow-hidden flex items-center justify-center">
          {(gameState === "PLAYING" || gameState === "LEVEL_TRANSITION") ? (
            <SynapticCanvas
              textInput={currentLevel.word}
              synapticData={null}
              activeState="INTERAZIONE"
              activeAlpha={activeAlpha}
              activeBeta={activeBeta}
              activeComplexity={activeComplexity}
              activeGlitch={Math.max(0, 1.0 - (resonance / 80))} // Più sei lontano, più c'è glitch
            />
          ) : (
            <SynapticCanvas
              textInput="NEURAL SYNC"
              synapticData={null}
              activeState="INTERAZIONE"
              activeAlpha={0.8}
              activeBeta={0.8}
              activeComplexity={1.5}
              activeGlitch={0.5}
            />
          )}

          {/* HUD Overlay */}
          {(gameState === "PLAYING" || gameState === "LEVEL_TRANSITION") && (
            <div className="absolute inset-0 pointer-events-none p-8 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div className="font-mono text-xs text-sky-500/50 uppercase tracking-widest">
                  Analisi Vettoriale: {currentLevel.word}
                </div>
                <div className="font-mono text-xl font-black text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
                  {timeLeft}
                </div>
              </div>
              
              {gameState === "LEVEL_TRANSITION" ? (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-pink-400 font-mono text-4xl font-black uppercase tracking-[0.5em] animate-pulse bg-slate-950/80 px-8 py-4 rounded-2xl border border-pink-500/50 backdrop-blur-md">
                  DECODIFICATO
                </div>
              ) : resonance > 80 && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-emerald-400/80 font-mono text-4xl font-black uppercase tracking-[0.5em] animate-pulse">
                  LOCKING...
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
