import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Brain,
  Activity,
  Download,
  RefreshCw,
  Send,
  Volume2,
  VolumeX,
  History,
  Sliders,
  Server,
  Cpu,
  HelpCircle,
  FileText,
  Clock,
  Settings,
  AlertTriangle,
  ArrowLeft,
  CheckCircle,
  Share2,
  X,
  Smartphone,
  QrCode,
  Link2,
  Gamepad2,
  Trash2
} from "lucide-react";
import QRCode from "qrcode";
import SynapticCanvas from "./components/SynapticCanvas";
import SynapticArtFrame from "./components/SynapticArtFrame";
import { ArtisticGlitchPoetry } from "./components/ArtisticGlitchPoetry";
import GameMode from "./GameMode";
import { SynapticResponse, InstallationState, HistoricRecord } from "./types";
import { synapticSynth } from "./utils/synapticSynth";
import { analyzeCognitiveText } from "./utils/cognitiveEngine";

export default function App() {
  const [textInput, setTextInput] = useState("");
  const [synapticData, setSynapticData] = useState<SynapticResponse | null>(null);
  const [activeState, setActiveState] = useState<InstallationState>("BENVENUTO");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  const [records, setRecords] = useState<HistoricRecord[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");
  const [qrCountdown, setQrCountdown] = useState<number | null>(null);
  const [currentTime, setCurrentTime] = useState("");
  const [latestArtFrameDataUrl, setLatestArtFrameDataUrl] = useState<string>("");
  const [downloadHelperImage, setDownloadHelperImage] = useState<string | null>(null);
  const [isDownloadHelperOpen, setIsDownloadHelperOpen] = useState(false);
  const [downloadHelperTitle, setDownloadHelperTitle] = useState("");
  const [isManifestoOpen, setIsManifestoOpen] = useState(false);
  const [isProjectionActive, setIsProjectionActive] = useState(false);
  const [isGameMode, setIsGameMode] = useState(false);
  const [isSharedScan, setIsSharedScan] = useState(false);
  const [projectionFilter, setProjectionFilter] = useState<"raw" | "phosphor" | "cyber">("raw");
  const poetryFont = "font-sans"; // Clean and stable classic sans font

  // Refs for manual overrides when not using Gemini active records
  const [manualAlpha, setManualAlpha] = useState(0.5);
  const [manualBeta, setManualBeta] = useState(0.5);
  const [manualComplexity, setManualComplexity] = useState(1.0);
  const [manualGlitch, setManualGlitch] = useState(0.1);
  const [copiedLink, setCopiedLink] = useState(false);

  const copyFallback = (text: string) => {
    try {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.opacity = "0";
      textArea.style.left = "-9999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand("copy");
      document.body.removeChild(textArea);
      if (successful) {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
        if (!isMuted) synapticSynth.triggerSynapticBeep(880, 0.25, 0.35);
      } else {
        alert("Impossibile copiare automaticamente. Seleziona ed evidenzia il link.");
      }
    } catch (err) {
      console.error("Fallback copy failed", err);
    }
  };

  const handleCopyLink = (input: string, data: SynapticResponse) => {
    const shareUrl = generateShareUrl(input, data);
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(shareUrl)
        .then(() => {
          setCopiedLink(true);
          setTimeout(() => setCopiedLink(false), 2000);
          if (!isMuted) synapticSynth.triggerSynapticBeep(880, 0.25, 0.35);
        })
        .catch(() => {
          copyFallback(shareUrl);
        });
    } else {
      copyFallback(shareUrl);
    }
  };

  // Reference container save canvas handler from p5 callback
  const p5SaveFnRef = useRef<(() => void) | null>(null);

  const handleSaveCanvasReady = useCallback((saveFn: () => void) => {
    p5SaveFnRef.current = saveFn;
  }, []);

  // Load records from local storage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("synaptic_neural_records");
      if (stored) {
        setRecords(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load synaptic records:", e);
    }
  }, []);

  // Sync virtual clock
  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      setCurrentTime(d.toISOString().replace("T", " ").substring(0, 19) + " UTC");
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Ephemeral QR code self-destruction countdown effect for Net Art experience
  useEffect(() => {
    if (activeState !== "REPERTO" || qrCountdown === null) {
      return;
    }
    if (qrCountdown <= 0) {
      setQrCodeDataUrl(""); // auto-destruct the QR image from the client memory
      return;
    }
    const timer = setTimeout(() => {
      setQrCountdown(prev => (prev !== null ? prev - 1 : null));
    }, 1000);
    return () => clearTimeout(timer);
  }, [qrCountdown, activeState]);

  // Keyboard handler for closing projection mode with Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isProjectionActive) {
          setIsProjectionActive(false);
        } else if (activeState === "REPERTO" || activeState === "SALVATAGGIO") {
          setActiveState("INTERAZIONE");
          setTextInput("");
          setSynapticData(null);
          setManualAlpha(0.5);
          setManualBeta(0.5);
          setManualComplexity(1.0);
          setManualGlitch(0.05);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isProjectionActive, activeState]);

  // Regenerate secure permanent QR code for the SALVATAGGIO (third page) view
  useEffect(() => {
    if (activeState === "SALVATAGGIO" && synapticData) {
      const shareUrl = generateShareUrl(textInput, synapticData);
      QRCode.toDataURL(shareUrl, {
        errorCorrectionLevel: 'M',
        margin: 2,
        width: 300,
        color: {
          dark: "#000000",
          light: "#ffffff",
        }
      })
      .then(url => {
        setQrCodeDataUrl(url);
        setQrCountdown(null); // Clear countdown completely to ensure QR stays alive
      })
      .catch(err => {
        console.error("Errore rigenerazione QR permanente:", err);
      });
    }
  }, [activeState, textInput, synapticData]);

  // Save records helper
  const saveRecordsToStorage = (newRecords: HistoricRecord[]) => {
    try {
      localStorage.setItem("synaptic_neural_records", JSON.stringify(newRecords));
    } catch (e) {
      console.error("Failed to persist records:", e);
    }
  };

  const clearRecords = () => {
    setRecords([]);
    saveRecordsToStorage([]);
    if (!isMuted) synapticSynth.triggerSynapticBeep(220, 0.5, 0.5);
  };

  // Shared URL generator to make QR codes extremely low-density and instantly scannable by smartphones
  const generateShareUrl = (input: string, data: SynapticResponse) => {
    let baseOrigin = window.location.origin;
    if (baseOrigin.includes("ais-dev-")) {
      baseOrigin = baseOrigin.replace("ais-dev-", "ais-pre-");
    } else if (baseOrigin.includes("-dev-")) {
      baseOrigin = baseOrigin.replace("-dev-", "-pre-");
    }
    const origin = baseOrigin + window.location.pathname;
    const t = encodeURIComponent(input);
    const a = data.alphaBalance.toFixed(2);
    const b = data.betaBalance.toFixed(2);
    const c = (data.complexity || 1.0).toFixed(2);
    const g = (data.glitchFactor || 0.1).toFixed(2);
    const r = Math.round(data.resonanceFrequency || 440);
    const ar = encodeURIComponent(data.archetype || "ESTETICA INTEGRATA");
    const p = encodeURIComponent(data.poeticText || "CONNESSIONE RECOGNITIVA");
    return `${origin}?t=${t}&a=${a}&b=${b}&c=${c}&g=${g}&r=${r}&ar=${ar}&p=${p}`;
  };

  // Load shared states directly on mount if loaded from a QR Code scan
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const t = params.get("t");
      const a = params.get("a");
      const b = params.get("b");
      const c = params.get("c");
      const g = params.get("g");
      const r = params.get("r");
      const ar = params.get("ar");
      const p = params.get("p");

      if (t && a && b && ar && p) {
        const decodedText = t;
        const sharedResponse: SynapticResponse = {
          poeticText: p,
          alphaBalance: parseFloat(a),
          betaBalance: parseFloat(b),
          complexity: c ? parseFloat(c) : 1.0,
          glitchFactor: g ? parseFloat(g) : 0.1,
          resonanceFrequency: r ? parseFloat(r) : 440,
          archetype: ar,
          keywords: ["CONDIVISO", "SINAPSI", "ESTETICA"],
          simulated: false
        };
        setTextInput(decodedText);
        setSynapticData(sharedResponse);
        setManualAlpha(parseFloat(a));
        setManualBeta(parseFloat(b));
        setManualComplexity(c ? parseFloat(c) : 1.0);
        setManualGlitch(g ? parseFloat(g) : 0.1);
        setActiveState("REPERTO");
        setIsSharedScan(true);

        // Clear query parameters from URL state so refreshes start clean but retain QR
        window.history.replaceState({}, document.title, window.location.pathname);

        // Render its own low density instant-scan QR Code
        const shareUrl = generateShareUrl(decodedText, sharedResponse);
        QRCode.toDataURL(shareUrl, {
          errorCorrectionLevel: 'M',
          margin: 2,
          width: 300,
          color: {
            dark: "#000000",
            light: "#ffffff",
          }
        }).then(url => {
          setQrCodeDataUrl(url);
          setQrCountdown(300); // 300s single-experience countdown timer
        });
      }
    } catch (err) {
      console.error("Errore nel parsing dell'oracolo condiviso:", err);
    }
  }, []);

  // Manage continuous ambient drone based on active state
  useEffect(() => {
    // Only play ambient drone when in REPERTO or SALVATAGGIO state.
    // Stop it immediately upon exiting.
    if ((activeState === "REPERTO" || activeState === "SALVATAGGIO") && synapticData && !isMuted) {
      synapticSynth.updateAmbientEngine(
        synapticData.alphaBalance,
        synapticData.betaBalance,
        synapticData.complexity,
        isMuted
      );
    } else {
      synapticSynth.stopAmbientEngine();
    }
  }, [activeState, synapticData, isMuted]);

  // Keyboard and dynamic sounds configuration
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (activeState === "REPERTO") return;
    
    const target = e.target;
    const newValue = target.value;
    
    // Play delicate piano sound if a new character was typed
    if (newValue.length > textInput.length && !isMuted) {
       const charCode = newValue.charCodeAt(newValue.length - 1);
       synapticSynth.triggerTypingPiano(charCode);
    }
    
    setTextInput(newValue);
  };

  // Submission endpoint fetch
  const handleSynapticSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (textInput.trim().length === 0 || isAnalyzing) return;

    setIsAnalyzing(true);
    setErrorStatus(null);

    // Audio arrival drone sweep
    if (!isMuted) {
      synapticSynth.triggerAnalysisArrival(330);
    }

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: textInput.trim() }),
      });

      if (!response.ok) {
        throw new Error("Impossibile connettersi all'oracolo sinaptico dell'AI.");
      }

      const data: SynapticResponse = await response.json();
      setSynapticData(data);

      // Generate highly scannable low-density share URL QR code for smartphones
      const shareUrl = generateShareUrl(textInput, data);
      
      const qrUrl = await QRCode.toDataURL(shareUrl, {
        errorCorrectionLevel: 'M',
        margin: 2,
        width: 300,
        color: {
          dark: "#000000",
          light: "#ffffff",
        },
      });
      setQrCodeDataUrl(qrUrl);
      setQrCountdown(300); // Extended 300s single-experience countdown timer
      // Do not automatically launch the QR modal to keep the main view fully visible

      // Append record in lists
      const newRecord: HistoricRecord = {
        id: `rec_${Date.now()}`,
        timestamp: new Date().toISOString().substring(11, 19),
        input: textInput,
        response: data,
      };
      const updatedRecords = [newRecord, ...records.slice(0, 19)]; // Cap at 20 logs
      setRecords(updatedRecords);
      saveRecordsToStorage(updatedRecords);

      // Switch to report view state and automatically display the immersive Museum Projection mode
      setActiveState("REPERTO");
    } catch (err: any) {
      console.error(err);
      setErrorStatus(err.message || "Errore di connessione al server.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleManualTune = () => {
    const calculatedResponse: SynapticResponse = {
      poeticText: `DEFORMAZIONE STRUTTURALE MANUALE IN ARMONIA VETTORIALE.`,
      alphaBalance: manualAlpha,
      betaBalance: manualBeta,
      complexity: manualComplexity,
      glitchFactor: manualGlitch,
      resonanceFrequency: 220 + (manualAlpha * 400),
      archetype: manualAlpha > 0.55 ? "ORCHESTRAZIONE SOGNANTE" : "CRISTALLO LOGICO",
      keywords: ["MANUALE", "SINTESI", "GHOST_COGNITION"]
    };
    setSynapticData(calculatedResponse);
    setTextInput("PROIEZIONE COGNITIVA SINTETICA");
    
    const shareUrl = generateShareUrl("PROIEZIONE COGNITIVA SINTETICA", calculatedResponse);
    QRCode.toDataURL(shareUrl, { errorCorrectionLevel: 'M', margin: 2, width: 300, color: { dark: '#000000', light: '#ffffff' } })
      .then(url => {
        setQrCodeDataUrl(url);
        setQrCountdown(300); // Extended 300s single-experience countdown timer
        // Do not automatically launch the QR modal
      });

    setActiveState("REPERTO");
    if (!isMuted) {
      synapticSynth.triggerAnalysisArrival(440);
    }
  };

  const loadPastRecord = (rec: HistoricRecord) => {
    setTextInput(rec.input);
    setSynapticData(rec.response);
    const shareUrl = generateShareUrl(rec.input, rec.response);
    QRCode.toDataURL(shareUrl, { errorCorrectionLevel: 'M', margin: 2, width: 300, color: { dark: '#000000', light: '#ffffff' } }).then(url => {
      setQrCodeDataUrl(url);
      setQrCountdown(300); // Extended 300s single-experience countdown timer
      // Do not automatically launch the QR modal
    });
    
    setActiveState("REPERTO");
    if (!isMuted) {
      synapticSynth.triggerSynapticBeep(rec.response.resonanceFrequency, rec.response.alphaBalance, rec.response.betaBalance);
    }
  };

  const handleReset = () => {
    setTextInput("");
    setSynapticData(null);
    setActiveState("INTERAZIONE");
    setErrorStatus(null);
    setQrCodeDataUrl(""); // Securely delete QR Code at the end of the single experience
    setQrCountdown(null); // Reset the timer
    setIsSharedScan(false);
    // Return sphere parameters to neutral state
    setManualAlpha(0.5);
    setManualBeta(0.5);
    setManualComplexity(1.0);
    setManualGlitch(0.05);
  };

  const triggerSavePNG = () => {
    if (latestArtFrameDataUrl) {
      handleArtFrameDownload(latestArtFrameDataUrl);
      return;
    }
    
    // Attempt to grab the active 3D canvas rendering as fallback
    const p5Canvas = (document.getElementById("synaptic-p5-canvas") || document.querySelector(".p5Canvas")) as HTMLCanvasElement | null;
    if (p5Canvas) {
      try {
        const dataUrl = p5Canvas.toDataURL("image/png");
        setDownloadHelperImage(dataUrl);
        setDownloadHelperTitle(`SCULTURA 3D // ${textInput.toUpperCase() || "SINTESI"}`);
        setIsDownloadHelperOpen(true);
        if (!isMuted) synapticSynth.triggerSynapticBeep(640, 0.4, 0.4);
        
        // Best-effort auto-download of 3D canvas snapshot (might fail in sandboxed iframe)
        try {
          const link = document.createElement("a");
          link.href = dataUrl;
          link.download = `INTERCONNESSIONI_3D_${textInput.replace(/\s+/g, "_") || "ART"}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } catch (downloadErr) {
          console.warn("Direct iframe download blocked, fallback modal displayed", downloadErr);
        }
      } catch (err) {
        console.error("Failed to capture p5 canvas toDataURL snapshot:", err);
      }
    }
  };

  const handleArtFrameDownload = (dataUrl: string) => {
    setDownloadHelperImage(dataUrl);
    setDownloadHelperTitle(`PITTURA ALGORITMICA // ${textInput.toUpperCase() || "SINTESI"}`);
    setIsDownloadHelperOpen(true);
    if (!isMuted) synapticSynth.triggerSynapticBeep(580, 0.3, 0.3);
  };

  // Computed display stats
  const activeAlpha = (activeState === "REPERTO" || activeState === "SALVATAGGIO") && synapticData ? synapticData.alphaBalance : manualAlpha;
  const activeBeta = (activeState === "REPERTO" || activeState === "SALVATAGGIO") && synapticData ? synapticData.betaBalance : manualBeta;
  const activeComplexity = (activeState === "REPERTO" || activeState === "SALVATAGGIO") && synapticData ? synapticData.complexity : manualComplexity;
  const activeGlitch = (activeState === "REPERTO" || activeState === "SALVATAGGIO") && synapticData ? synapticData.glitchFactor : manualGlitch;

  // --- Early render for Game Mode ---
  if (isGameMode) {
    return <GameMode onExit={() => setIsGameMode(false)} isMuted={isMuted} />;
  }

  return (
    <div className="min-h-[100dvh] bg-slate-950 text-slate-100 flex flex-col selection:bg-rose-500/30 selection:text-rose-100">
      {/* Hidden high-res canvas generator for PNG export */}
      {synapticData && (
        <div className="fixed -top-[3000px] -left-[3000px] opacity-0 pointer-events-none">
          <SynapticArtFrame
            word={textInput}
            alpha={activeAlpha}
            beta={activeBeta}
            complexity={activeComplexity}
            glitch={activeGlitch}
            resonance={synapticData.resonanceFrequency || 440}
            archetype={synapticData.archetype || "SINTESI"}
            poeticText={synapticData.poeticText || "CONNESSIONE DI COSCIENZA INTEGRATA NELLA MATRICE."}
            onDataUrlGenerate={setLatestArtFrameDataUrl}
          />
        </div>
      )}
      
      {/* 1. Elegant Header Navigation */}
      <header className="border-b border-slate-900 bg-[#06070a]/90 backdrop-blur px-6 py-4 flex flex-wrap gap-4 items-center justify-between z-50 font-sans relative">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-pink-500 to-sky-450 flex items-center justify-center animate-pulse shadow-lg shadow-pink-500/20">
              <Brain className="w-4 h-4 text-slate-950" />
            </div>
          </div>
          <div>
            <h1 className="text-sm font-semibold tracking-widest text-[#f8fafc] uppercase font-sans">
              Interconnessioni
            </h1>
            <p className="text-[9px] tracking-wider text-slate-500 font-mono uppercase">Il processo invisibile del pensiero</p>
          </div>
        </div>

        {/* Realtime stats strip & Page Switcher */}
        <div className="flex flex-wrap items-center gap-4 lg:gap-6 text-xs font-mono">
          {/* 5-Tabs Navigation breadcrumbs */}
          <div className="flex flex-wrap items-center gap-1 bg-[#111218] p-1 rounded-xl border border-slate-900">
            <button
              onClick={() => {
                setActiveState("BENVENUTO");
                setIsProjectionActive(false);
                if (!isMuted) synapticSynth.triggerSynapticBeep(330, 0.4, 0.4);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold tracking-wider transition-all uppercase cursor-pointer ${
                activeState === "BENVENUTO" && !isProjectionActive
                  ? "bg-gradient-to-r from-pink-500 to-rose-500 text-slate-950 shadow-md shadow-pink-500/10"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              id="switch-nav-welcome"
            >
              1. Benvenuto
            </button>
            <button
              onClick={() => {
                setActiveState("INTERAZIONE");
                setIsProjectionActive(false);
                if (!isMuted) synapticSynth.triggerSynapticBeep(440, 0.4, 0.4);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold tracking-wider transition-all uppercase cursor-pointer ${
                activeState === "INTERAZIONE" && !isProjectionActive
                  ? "bg-sky-400 text-slate-950 font-bold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              id="switch-nav-experience"
            >
              2. Interazione
            </button>
            <button
              onClick={() => {
                if (synapticData) {
                  setActiveState("REPERTO");
                }
                if (!isMuted) synapticSynth.triggerSynapticBeep(660, 0.4, 0.4);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold tracking-wider transition-all uppercase cursor-pointer ${
                activeState === "REPERTO"
                  ? "bg-gradient-to-r from-pink-500 to-rose-500 text-slate-950 font-bold shadow-md"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              id="switch-nav-projection"
              title="Risultato"
            >
              3. Risultato
            </button>
            <button
              onClick={() => {
                setActiveState("SALVATAGGIO");
                if (!isMuted) synapticSynth.triggerSynapticBeep(770, 0.4, 0.4);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold tracking-wider transition-all uppercase cursor-pointer ${
                activeState === "SALVATAGGIO"
                  ? "bg-amber-400 text-slate-950 font-bold shadow-md"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              id="switch-nav-save"
              title="Archiviazione"
            >
              4. Archiviazione
            </button>
          </div>

          <button
            onClick={() => {
              setIsGameMode(true);
              if (!isMuted) synapticSynth.triggerSynapticBeep(550, 0.4, 0.4);
            }}
            className="p-2 rounded-xl border bg-slate-900/50 border-sky-900/50 text-sky-400 hover:bg-sky-900/20 hover:text-sky-300 transition-all cursor-pointer"
            title="Test di Allineamento"
            id="header-game-mode-btn"
          >
            <Gamepad2 className="w-6 h-6" />
          </button>

          <button
            onClick={() => {
              setIsManifestoOpen(true);
              if (!isMuted) synapticSynth.triggerSynapticBeep(550, 0.4, 0.4);
            }}
            className="p-1 px-3 rounded-xl text-slate-200 hover:text-white transition-all cursor-pointer text-xs uppercase font-mono tracking-wider font-bold flex items-center gap-1.5"
            title="Concept dell'Opera"
            id="manifesto-trigger-btn"
          >
            Concept
          </button>

          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`p-2 rounded-xl border transition-all ${
              isMuted
                ? "bg-slate-900 border-rose-900/40 text-rose-400"
                : "bg-slate-900/50 border-slate-850 text-slate-400 hover:bg-slate-900"
            }`}
            title={isMuted ? "Attiva audio" : "Silenzia audio"}
            id="audio-toggle-btn"
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </header>

      <div className="flex-1 relative flex flex-col">
        {/* 2. Primary Layout Split Grid */}
        <main className="flex-1 flex flex-col justify-center max-w-7xl w-full mx-auto p-4 md:p-6 gap-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 flex-1 items-stretch">
            
            {/* Left Side Panel Dynamic Switch Card */}
            <div className={`col-span-1 ${activeState === "REPERTO" ? "order-last md:col-span-4 md:order-last" : "md:col-span-4"} flex flex-col justify-between font-sans`} id="left-sidebar-panel-holder">
              {activeState === "BENVENUTO" ? (
                /* Left Column: Welcome, brand title, description */
                <div className="bg-[#0b0c11]/80 border border-slate-900 rounded-3xl p-6 md:p-8 flex flex-col justify-between backdrop-blur-md shadow-xl relative overflow-hidden h-full text-left" id="left-sidebar-welcome-card">
                  <div className="space-y-6 flex-1 flex flex-col justify-center">
                    <h2 className="text-2xl sm:text-3xl md:text-lg lg:text-xl xl:text-2xl 2xl:text-3xl font-extrabold tracking-tighter uppercase leading-none text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-sky-400 pb-1 whitespace-nowrap">
                      INTERCONNESSIONI
                    </h2>

                    <div className="h-[1px] w-12 bg-slate-800" />
                    
                    <div className="space-y-4 text-[15px] text-slate-300 leading-relaxed font-normal">
                      <p>
                        Progetto che nasce dall’intenzione di rendere visibile il processo invisibile del pensiero e della produzione del linguaggio.
                      </p>
                      <p>
                        Quando pensiamo o scriviamo, ciò che emerge è solo il risultato finale.
                      </p>
                      <p className="text-sky-400 font-medium tracking-wide">
                        Scrivi un pensiero e osserva la tua attività cerebrale prendere forma in tempo reale.
                      </p>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-900 mt-6 shrink-0 flex flex-col gap-3">
                    <button
                      onClick={() => {
                        setActiveState("INTERAZIONE");
                        if (!isMuted) {
                          synapticSynth.triggerSynapticBeep(330, 0.5, 0.5);
                        }
                      }}
                      className="w-full px-8 py-3.5 rounded-xl bg-gradient-to-r from-pink-500 to-sky-400 text-slate-950 font-mono font-bold text-xs tracking-widest uppercase transition-all duration-300 transform hover:scale-[1.01] active:scale-[0.98] cursor-pointer inline-flex items-center justify-center gap-2 shadow-md shadow-pink-500/5"
                      id="enter-experience-btn"
                    >
                      <span>Avvia il Dialogo</span>
                    </button>
                    
                    <button
                      onClick={() => {
                        setIsGameMode(true);
                        if (!isMuted) synapticSynth.triggerSynapticBeep(550, 0.4, 0.4);
                      }}
                      className="w-full px-8 py-3.5 rounded-xl border border-sky-900/50 bg-slate-900/30 text-sky-400 hover:bg-sky-900/20 hover:text-sky-300 transition-all cursor-pointer text-xs font-mono font-bold tracking-widest uppercase flex items-center justify-center gap-2"
                      title="Test di Allineamento"
                    >
                      <Gamepad2 className="w-4 h-4" />
                      TEST DI ALLINEAMENTO
                    </button>
                  </div>
                </div>
              ) : activeState === "REPERTO" ? (
                /* Text Side (Right): Museum Welcome, Poetic Text, and Stats */
                <section className="bg-[#0b0c11]/80 border border-slate-900 rounded-3xl p-6 flex flex-col justify-between backdrop-blur-md shadow-xl relative overflow-hidden h-full text-left" id="right-text-panel">
                  <div className="space-y-5 flex-1 flex flex-col">
                    <div className="flex items-center justify-between border-b border-slate-900 pb-3 shrink-0">
                      <span className="text-[10px] font-mono tracking-widest text-slate-500 uppercase">
                        Museo d'Arte Digitale
                      </span>
                      <span className="text-[8px] font-mono px-2 py-0.5 rounded-md bg-cyan-950/40 border border-cyan-900/35 text-cyan-400 uppercase tracking-widest font-semibold">
                        Opera attiva
                      </span>
                    </div>

                    <div className="space-y-4 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-800 pb-4">
                      {synapticData && (
                        <div className="space-y-4 font-mono">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[9px] text-pink-400 font-bold tracking-widest block uppercase">ESPRESSIONE POETICA</span>
                              {synapticData?.simulated && (
                                <span className="text-[8px] bg-amber-500/10 border border-amber-500/30 text-amber-400 px-1.5 py-0.5 rounded leading-none font-bold">
                                  SIMULATO
                                </span>
                              )}
                            </div>
                            <div className="p-5 bg-slate-950/40 rounded-2xl border border-slate-900 relative overflow-hidden">
                              <ArtisticGlitchPoetry
                                text={synapticData?.poeticText || "CONNESSIONE DI COSCIENZA INTEGRATA NELLA MATRICE."}
                                glitchFactor={activeGlitch}
                                fontClass="font-serif italic text-lg"
                              />
                            </div>
                          </div>

                          <div className="p-4 bg-slate-950/40 rounded-2xl border border-slate-900 space-y-2 text-[10px] uppercase font-mono mt-4">
                            <div className="text-slate-600 text-[8px] tracking-widest mb-0.5">PENSIERO ANALIZZATO</div>
                            <div className="text-cyan-400 font-extrabold text-xs tracking-wide">
                              "{textInput}"
                            </div>
                          </div>

                          <div className="space-y-1">
                            <span className="text-[9px] text-slate-500 font-bold tracking-widest block uppercase">CLASSIFICATORE ARCHETIPICO:</span>
                            <h3 className="text-xs font-bold text-yellow-300/80 leading-tight uppercase tracking-wider">
                              {synapticData?.archetype || "ESTETICA INTEGRATA"}
                            </h3>
                          </div>
                          
                          {synapticData?.simulated && (
                            <div className="p-3 bg-amber-950/10 border border-amber-900/20 rounded-xl">
                              <p className="text-[8px] text-slate-400 font-mono leading-relaxed">
                                {synapticData.simReason === "overload" ? (
                                  <span>Simulatore bio-sinaptico offline attivato (sovraccarico).</span>
                                ) : synapticData.simReason === "missing_key" ? (
                                  <span>Simulatore locale. Aggiungi GEMINI_API_KEY per l'analisi reale.</span>
                                ) : (
                                  <span>Simulatore locale attivato.</span>
                                )}
                              </p>
                            </div>
                          )}

                          <div className="grid grid-cols-2 gap-2 text-[9px] text-slate-400">
                            <div className="p-3 bg-slate-900/30 rounded-lg">
                              <span className="text-slate-500 uppercase block">RISONANZA</span>
                              <span className="font-bold text-sky-400 text-xs">{synapticData?.resonanceFrequency.toFixed(1) || "440.0"} Hz</span>
                            </div>
                            <div className="p-3 bg-slate-900/30 rounded-lg">
                              <span className="text-slate-500 uppercase block font-mono">CONCETTI CHIAVE</span>
                              <span className="font-bold text-pink-400 text-xs truncate block uppercase">
                                {synapticData?.keywords?.join(", ") || "SOGNO, LOGICA"}
                              </span>
                            </div>
                          </div>

                        </div>
                      )}
                      {/* Prominent Minimal QR Code for mobile scanning */}
                      {qrCodeDataUrl && !isSharedScan && (
                        <div className="mt-6 pt-4 border-t border-slate-900/50 flex flex-col items-center gap-3">
                          <span className="text-[9px] text-slate-500 uppercase font-bold tracking-widest text-center">CLONA SU MOBILE</span>
                          <div className="relative p-2 bg-white rounded-xl shadow-[0_0_20px_rgba(244,63,145,0.15)] transition-transform hover:scale-105 duration-300">
                            <img
                              src={qrCodeDataUrl}
                              alt="Synaptic QR signature"
                              className="w-36 h-36 select-none rounded-sm"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                          <span className="text-[8px] text-slate-500 text-center leading-tight uppercase font-mono">
                            Scansiona per interagire<br/>da smartphone
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-900 mt-2 shrink-0 space-y-2 font-mono">
                    {synapticData && (
                      <button
                        onClick={() => handleCopyLink(textInput, synapticData)}
                        className="w-full bg-slate-900/50 hover:bg-slate-800 text-slate-400 hover:text-slate-200 py-2.5 rounded-xl text-[10px] font-bold tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer uppercase border border-slate-800"
                      >
                        <Link2 className="w-3.5 h-3.5 text-slate-500" />
                        {copiedLink ? "COPIATO CON SUCCESSO! ✓" : "COPIA LINK 🔗"}
                      </button>
                    )}
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setActiveState("SALVATAGGIO")}
                        className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 py-3 rounded-xl text-[10px] font-bold tracking-widest flex items-center justify-center gap-2 transition-all cursor-pointer uppercase"
                        id="go-to-saving-page-btn"
                      >
                        <Share2 className="w-3.5 h-3.5 text-slate-400" />
                        ARCHIVIAZIONE
                      </button>
                      <button
                        onClick={handleReset}
                        className="w-full bg-slate-950 border border-slate-800 hover:bg-slate-900 text-slate-400 hover:text-slate-200 py-3 rounded-xl text-[10px] font-bold tracking-widest flex items-center justify-center gap-2 transition-all cursor-pointer uppercase"
                      >
                        NUOVA OPERA
                      </button>
                    </div>
                  </div>
                </section>
              ) : (
                <section className="bg-[#0b0c11]/80 border border-slate-900 rounded-3xl p-6 md:p-8 flex flex-col justify-between backdrop-blur-md shadow-xl relative overflow-hidden h-full" id="left-sidebar-card">
                  <div className="space-y-6">

                {/* If in interactive input state */}
                {activeState === "INTERAZIONE" ? (
                  <form onSubmit={handleSynapticSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="synaptic-input" className="block text-xs font-mono text-slate-400 uppercase tracking-widest">
                        Inserisci un pensiero o una sensazione:
                      </label>
                      <p className="text-[11px] font-sans text-slate-400 leading-relaxed">
                        Esprimiti in modo libero e sintetico. La sfera si modellerà durante la digitazione e genererà la forma finale della tua attività cerebrale ad elaborazione conclusa.
                      </p>
                      <div className="relative">
                        <textarea
                          id="synaptic-input"
                          rows={3}
                          value={textInput}
                          maxLength={75}
                          onChange={handleInputChange}
                          autoComplete="off"
                          spellCheck="false"
                          placeholder="es. Oggi mi sento in equilibrio, come un fiume che scorre quieto..."
                          className="w-full bg-slate-950/80 border border-slate-800/80 focus:border-pink-500 focus:ring-1 focus:ring-pink-500/30 rounded-2xl pl-4 pr-14 py-3.5 text-sm font-sans tracking-wide text-slate-100 placeholder-slate-600 focus:outline-none transition-all resize-none scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent"
                          disabled={isAnalyzing}
                        />
                        <button
                          type="submit"
                          disabled={textInput.trim().length === 0 || isAnalyzing}
                          className="absolute right-2 bottom-2 p-2 rounded-xl bg-pink-500 hover:bg-pink-600 text-slate-950 font-bold transition-all disabled:opacity-30 disabled:hover:bg-pink-500 cursor-pointer"
                          id="submit-synaptic-btn"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between text-xs font-mono text-slate-500 px-1">
                        <span>MAX 75 CARATTERI: {textInput.length}/75</span>
                        <span>INVIO PER INFERENZA AI</span>
                      </div>
                    </div>

                    {errorStatus && (
                      <div className="p-3 bg-red-950/40 border border-red-900/35 rounded-xl text-xs text-red-400 flex items-start gap-2 font-mono uppercase font-bold">
                        <AlertTriangle className="w-4 h-4 shrink-0 text-red-500" />
                        <span>{errorStatus}</span>
                      </div>
                    )}

                    {/* Loading state bar */}
                    {isAnalyzing && (
                      <div className="space-y-2 py-2">
                        <div className="flex items-center justify-between text-xs font-mono text-pink-400">
                          <span className="flex items-center gap-2 animate-pulse uppercase">
                            <Activity className="w-4 h-4 animate-spin text-sky-400" />
                            ELABORAZIONE DEL PROCESSO IN CORSO...
                          </span>
                          <span>{Math.floor(75 + Math.random() * 20)}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-sky-400 via-pink-500 to-amber-300 w-[85%] rounded-full animate-pulse" />
                        </div>
                      </div>
                    )}
                  </form>
                ) : (
                  <div className="space-y-4 font-mono">
                    {synapticData ? (
                      <div className="p-4 bg-slate-950/80 border border-[#1e1e2d]/60 rounded-2xl space-y-3 relative overflow-hidden">
                        <div className="absolute right-3 top-3 bg-pink-500/10 border border-pink-550/20 text-pink-400 text-[8px] px-1.5 py-0.5 rounded uppercase font-bold tracking-widest leading-none flex items-center gap-1">
                          <span className="w-1 h-1 rounded-full bg-pink-500 animate-pulse" />
                          OPERA ATTIVA
                        </div>
                        <div>
                          <h4 className="text-xs text-slate-400 uppercase font-bold tracking-wider">CONCETTO ANALIZZATO</h4>
                          <p className="text-sm font-semibold text-sky-400 uppercase tracking-wide font-mono">"{textInput}"</p>
                        </div>
                        <div className="pt-4 border-t border-[#1e1e2d]/60 space-y-2">
                          <span className="text-[10px] text-pink-400 uppercase font-black tracking-widest block">SINTESI POETICA</span>
                          <div className="py-2 text-base md:text-lg font-medium text-slate-100 leading-relaxed border-l-2 border-pink-500/50 pl-3">
                            <ArtisticGlitchPoetry
                              text={synapticData.poeticText}
                              glitchFactor={activeGlitch}
                              fontClass={poetryFont}
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 bg-slate-950/80 border border-[#1e1e2d]/60 rounded-2xl space-y-3 text-center">
                        <p className="text-slate-400 text-sm font-mono mt-2">Nessuna opera attualmente in esecuzione.</p>
                        <p className="text-slate-600 text-xs mt-1">Seleziona un'opera dal registro sottostante o crea una nuova apertura sinaptica.</p>
                      </div>
                    )}

                    {/* Reset dialogue */}
                    <button
                      onClick={handleReset}
                      className="w-full bg-slate-900 hover:bg-slate-800 border border-slate-800 max-h-min text-slate-100 py-3.5 rounded-2xl font-mono text-sm font-bold tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg hover:shadow-slate-950 uppercase"
                      id="reset-canvas-btn"
                    >
                      <RefreshCw className="w-4 h-4" />
                      NUOVA APERTURA SINAPTICA
                    </button>
                  </div>
                )}

                {/* Visual real-time metrics telemetry table */}
                {(activeState === "INTERAZIONE" || synapticData) && (
                  <div className="border-t border-slate-800/40 pt-5 space-y-3 font-mono text-xs">
                    <span className="font-bold text-slate-500 block uppercase tracking-wider">INDICATORI DI COMPLESSITÀ COGNITIVA</span>
                    <div className="grid grid-cols-2 gap-3 bg-slate-950/40 p-3 rounded-xl border border-slate-900">
                      <div className="space-y-1 border-r border-slate-900 pr-2">
                        <div className="text-slate-500 uppercase">INDICE COMPLESSITÀ</div>
                        <div className="font-bold text-slate-300 flex items-center gap-1.5">
                          <Activity className="w-3 h-3 text-sky-400" />
                          {activeComplexity.toFixed(4)} Hz
                        </div>
                      </div>
                      <div className="space-y-1 pl-1">
                        <div className="text-slate-500 font-mono uppercase">DISSONANZA (GLITCH)</div>
                        <div className="font-bold text-pink-400 uppercase">
                          {activeGlitch > 0.4 ? "ANOMALIA RILEVANTE" : "CONGRUA"} ({Math.round(activeGlitch * 100)}%)
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              </div>

              {/* Past logs record library index */}
              <div className="mt-6 border-t border-slate-800/40 pt-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold tracking-widest text-slate-400 flex items-center gap-1.5 uppercase">
                    <History className="w-3.5 h-3.5 text-pink-500" />
                    REGISTRO SINAPSI ({records.length})
                  </span>
                  {records.length > 0 && (
                    <button 
                      onClick={clearRecords}
                      className="text-[9px] text-slate-500 hover:text-red-400 uppercase font-mono tracking-widest cursor-pointer transition-colors"
                      title="Svuota Archivio"
                    >
                      SVUOTA
                    </button>
                  )}
                </div>
                {records.length === 0 ? (
                  <div className="p-3 border border-slate-900 bg-slate-950/20 rounded-2xl text-center text-xs text-slate-600 font-mono">
                    Nessun record in archivio
                  </div>
                ) : (
                  <div className="max-h-24 overflow-y-auto space-y-1.5 pr-1" id="records-historic-list">
                    {records.map((rec) => (
                      <div key={rec.id} className="w-full flex gap-1">
                        <button
                          onClick={() => loadPastRecord(rec)}
                          className="flex-1 p-2 bg-slate-950/40 hover:bg-slate-900 border border-slate-850 hover:border-slate-700/60 rounded-xl text-left font-mono text-xs flex items-center justify-between transition-all group shrink-0 cursor-pointer overflow-hidden"
                        >
                          <div className="truncate pr-3">
                            <span className="text-slate-500">[{rec.timestamp}]</span>{" "}
                            <span className="text-sky-300 font-semibold text-sm group-hover:text-pink-400 transition-colors">
                              "{rec.input}"
                            </span>
                          </div>
                          <span className="text-pink-400 font-bold shrink-0">
                            {(rec.response.alphaBalance * 100).toFixed(0)}% A
                          </span>
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            const newRecords = records.filter(r => r.id !== rec.id);
                            setRecords(newRecords);
                            saveRecordsToStorage(newRecords);
                          }}
                          className="p-2 border border-slate-850 bg-slate-950/40 hover:bg-red-900/30 hover:border-red-900 hover:text-red-400 rounded-xl transition-all cursor-pointer flex items-center justify-center shrink-0"
                          title="Elimina record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          )}
        </div>

            {/* Right Side: Dynamic Active's Installation Screen Area */}
            <section className={`col-span-1 ${activeState === "REPERTO" ? "order-first md:col-span-8 md:order-first" : "md:col-span-8"} flex flex-col gap-6`} id="right-canvas-panel">
              
              <div className="flex flex-col md:flex-row h-full min-h-[460px] relative overflow-hidden">
                
                {/* Canvas block overlay layout for states */}
                <div className="flex-1 relative flex flex-col">
                  <SynapticCanvas
                    textInput={textInput}
                    synapticData={synapticData}
                    activeState={activeState}
                    onSaveCanvasReady={handleSaveCanvasReady}
                    activeAlpha={activeAlpha}
                    activeBeta={activeBeta}
                    activeComplexity={activeComplexity}
                    activeGlitch={activeGlitch}
                  />

                  {/* Adaptive state-based overlays inside HTML container */}
                  {activeState === "BENVENUTO" ? (
                    <>
                      <div className="absolute top-4 left-4 p-3 bg-[#0a0b10]/60 border border-slate-900 rounded-xl space-y-1 font-sans text-[10px] z-10 pointer-events-none text-left">
                        <span className="text-slate-450 uppercase tracking-widest font-mono text-[9px] block">Aura Inattiva</span>
                        <div className="text-slate-500 font-mono text-[9px]">Sintonizzazione: <span className="text-sky-400">440Hz</span></div>
                      </div>

                    </>
                  ) : (
                    <>
                      {/* Very minimal subtle indicators instead of crowded dashboard widgets */}
                      <div className="absolute top-4 left-4 p-3 bg-[#0a0b10]/60 border border-slate-900 rounded-xl space-y-1 font-sans text-[10px] z-10 pointer-events-none text-left">
                        <span className="text-slate-450 uppercase tracking-widest font-mono text-[9px] block">Rapporto di Risonanza</span>
                        <div className="text-slate-500 font-mono text-[9px]">Simmetria: <span className="text-pink-400">{((1 - Math.abs(activeAlpha - activeBeta)) * 100).toFixed(0)}%</span></div>
                      </div>

                      <div className="absolute top-4 right-4 p-3 bg-[#0a0b10]/60 border border-[#1b1926]/40 rounded-xl space-y-1 font-sans text-[10px] z-10 pointer-events-none text-right uppercase">
                        <span className="text-slate-450 uppercase tracking-widest font-mono text-[9px] block">Spazio Sferico</span>
                        <div className="text-slate-500 font-mono text-[9px]">Camera: <span className="text-amber-300">Orbitale</span></div>
                      </div>

                      {/* If "INTERAZIONE" and empty input, show gorgeous quick instructions */}

                      {/* Floating Download Button in REPERTO state */}
                      {activeState === "REPERTO" && isSharedScan && (
                        <div className="absolute bottom-6 right-6 z-20">
                          <button
                            onClick={triggerSavePNG}
                            className="p-3 bg-slate-950/80 backdrop-blur-xl rounded-2xl border border-slate-800 shadow-2xl flex flex-col items-center gap-2 hover:bg-slate-900 transition-all cursor-pointer pointer-events-auto hover:scale-105"
                            title="Scarica la scultura 3D"
                          >
                            <Download className="w-6 h-6 text-sky-400" />
                            <span className="text-[9px] text-slate-400 uppercase font-mono tracking-widest text-center">
                              SCARICA
                            </span>
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </section>
          </div>
      </main>

      {/* 4. Elegant Minimal Footer */}
      <footer className="mt-auto border-t border-slate-900/80 bg-slate-950 py-4 text-center">
        <p className="text-[10px] font-mono text-slate-600 uppercase tracking-widest">
          INTERCONNESSIONI AI — COGNITIVE GEOMETRIC INSTALLATION © 2026. CREATA DA PRISCILLA PALOMBO.
        </p>
      </footer>

      {/* 6. METICULOUS FAIL-SAFE DOWNLOAD INSTRUCTION MODAL */}
      {isDownloadHelperOpen && downloadHelperImage && (
        <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-fade-in" id="download-helper-modal">
          <div className="relative max-w-sm w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col items-center max-h-[95vh] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800">
            {/* Ambient visual line */}
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-sky-400 via-pink-500 to-amber-300" />
            
            {/* Close Button */}
            <button
              onClick={() => {
                setIsDownloadHelperOpen(false);
                setDownloadHelperImage(null);
                if (!isMuted) synapticSynth.triggerSynapticBeep(330, 0.3, 0.3);
              }}
              className="absolute right-4 top-4 p-1.5 rounded-full border border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-100 hover:bg-slate-900 transition-all cursor-pointer"
              id="close-download-modal-btn"
              title="Chiudi"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header */}
            <div className="space-y-1 mb-4 mt-2">
              <span className="text-[8px] text-pink-500 font-mono tracking-[0.25em] font-black uppercase block">
                ✦ ARCHIVIO ESPOSIZIONE HD ✦
              </span>
              <h3 className="text-sm font-black font-mono text-slate-100 uppercase tracking-tight">
                {downloadHelperTitle}
              </h3>
              <p className="text-[9px] font-mono text-slate-400 uppercase">
                Grafica sincronizzata pronta per il salvataggio!
              </p>
            </div>

            {/* Canvas/Image Preview Block with Passepartout Exhibition Frame */}
            <div className="relative p-4 bg-gradient-to-b from-slate-950 to-slate-900 rounded-3xl border border-slate-800 shadow-[0_0_40px_rgba(236,72,153,0.12)] mb-5 w-full max-w-[240px]">
              {/* Thin neon gallery accent border */}
              <div className="absolute inset-0 rounded-3xl border border-pink-500/10 pointer-events-none" />
              
              <div className="p-2.5 bg-slate-100 rounded-xl shadow-2xl border border-white/95">
                <img
                  src={downloadHelperImage}
                  alt="Opera d'Arte Sinaptica"
                  className="w-full h-auto aspect-[45/58] rounded shadow-[0_4px_15px_rgba(0,0,0,0.55)] object-contain select-all cursor-pointer hover:opacity-95 transition-opacity"
                  referrerPolicy="no-referrer"
                  title="Fai click destro o tieni premuto per salvare"
                />
              </div>
              <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 bg-slate-950 border border-slate-800 px-3 py-1 rounded-full font-mono text-[10px] text-pink-400 uppercase font-bold tracking-widest shadow-lg">
                PNG ULTRA HD ✦ 1:1.28
              </div>
            </div>

            {/* Elegant simplified instruction list with high-end gallery aesthetic */}
            <div className="w-full space-y-2.5 mb-5 text-left font-mono">
              <span className="text-[10px] text-pink-500 font-black uppercase tracking-[0.25em] block border-b border-slate-800/70 pb-1.5 text-center">
                ✦ ACQUISIZIONE DIGITALE ✦
              </span>
              
              <p className="text-[10px] text-slate-300 text-center leading-relaxed">
                Clicca su SCARICA PNG per salvare l'opera sul tuo dispositivo.
              </p>
              
              {/* Discretely packaged fallback instructions */}
              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-850 text-[9px] leading-relaxed text-slate-400 space-y-1 text-center">
                <span className="text-sky-400 font-bold block mb-0.5">Se il download fallisce:</span>
                Tieni premuto (o fai tasto destro) sull'immagine e scegli "Salva".
              </div>
            </div>

            {/* Elegant action buttons */}
            <div className="grid grid-cols-2 gap-3 w-full">
              <button
                onClick={async () => {
                  try {
                    const res = await fetch(downloadHelperImage);
                    const blob = await res.blob();
                    const blobUrl = window.URL.createObjectURL(blob);
                    
                    const link = document.createElement("a");
                    link.href = blobUrl;
                    const normalized = textInput.toUpperCase().replace(/\s+/g, "_") || "ART";
                    link.download = `INTERCONNESSIONI_OPERA_${normalized}.png`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    
                    setTimeout(() => {
                      window.URL.revokeObjectURL(blobUrl);
                    }, 100);
                    
                    if (!isMuted) synapticSynth.triggerSynapticBeep(520, 0.2, 0.2);
                  } catch (e) {
                    console.error("Direct download link trigger failed", e);
                  }
                }}
                className="bg-gradient-to-r from-sky-400 to-pink-500 hover:opacity-95 hover:scale-[1.02] text-slate-950 py-3 px-1 rounded-2xl text-xs font-mono font-black tracking-widest uppercase cursor-pointer transition-all shadow-md flex items-center justify-center gap-1.5"
                id="modal-download-direct-btn"
              >
                <Download className="w-3.5 h-3.5" />
                SCARICA PNG
              </button>

              <button
                onClick={() => {
                  setIsDownloadHelperOpen(false);
                  setDownloadHelperImage(null);
                  if (!isMuted) synapticSynth.triggerSynapticBeep(330, 0.3, 0.3);
                }}
                className="bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-300 hover:text-slate-100 py-3 rounded-2xl text-xs font-mono font-bold tracking-widest uppercase cursor-pointer transition-all"
                id="modal-helper-dismiss-btn"
              >
                TORNA IN OPERA
              </button>
            </div>
            
          </div>
        </div>
      )}

      {/* 4. Art Curator Manifesto and Academic Concept Modal */}
      {isManifestoOpen && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-[60] flex items-center justify-center p-4 animate-fade-in sm:p-6 md:p-10">
          <div className="bg-slate-950 border border-slate-800/80 rounded-3xl max-w-2xl w-full p-6 md:p-8 relative shadow-2xl flex flex-col max-h-[85vh] overflow-hidden" id="curator-manifesto-modal">
            
            {/* Ambient subtle glow header */}
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-pink-500 via-rose-500 to-sky-400 opacity-40 animate-pulse" />
            
            {/* Close Button absolute */}
            <button
              onClick={() => {
                setIsManifestoOpen(false);
                if (!isMuted) synapticSynth.triggerSynapticBeep(330, 0.3, 0.3);
              }}
              className="absolute top-5 right-5 p-2 rounded-xl bg-slate-900 border border-slate-805 text-slate-400 hover:text-slate-100 transition-all cursor-pointer"
              aria-label="Chiudi Descrizione Progetto"
              id="close-manifesto-btn"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="space-y-1 mb-5 pr-10 text-left">
              <span className="text-pink-500 font-mono text-xs tracking-[0.25em] font-black uppercase block">
                ✦ CONCEPT DELL'OPERA ✦
              </span>
              <h3 className="text-xl md:text-2xl font-black font-sans text-slate-100 uppercase tracking-tight leading-tight">
                INTERCONNESSIONI: <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-rose-300 to-sky-300 drop-shadow-sm">IL PENSIERO VISIBILE</span>
              </h3>
              <p className="text-xs font-mono text-slate-500">
                Progetto di ricerca artistica di <strong className="text-slate-300">Priscilla Palombo</strong>
              </p>
            </div>

            {/* Scrollable Contents Grid */}
            <div className="flex-1 overflow-y-auto space-y-6 pr-1 font-sans text-sm text-slate-300 leading-relaxed relative text-left scrollbar-thin scrollbar-thumb-slate-800" id="manifesto-scroll-body">
              
              <section className="space-y-2 border-b border-slate-900 pb-4">
                <span className="text-pink-500 font-bold uppercase tracking-wide text-xs block">1. La Genesi Personale: Mappare l'Invisibile</span>
                <p className="text-slate-300 text-sm leading-relaxed mb-3">
                  All'origine di questo progetto c'è un'esigenza personale: la volontà di rappresentare visivamente il modo in cui percepisco il funzionamento della mia stessa mente. L'installazione nasce dal tentativo di dare una forma scultorea e dinamica a quel flusso caotico e affascinante che si attiva in me ogni volta che elaboro un pensiero, trasformando un'esperienza puramente cerebrale e intima in uno spazio di condivisione collettiva.
                </p>
                <p className="text-slate-300 text-sm leading-relaxed">
                  <strong>INTERCONNESSIONI</strong> non è un semplice software o una classica installazione statica, ma un’opera d’arte interattiva e generativa che trasforma l'invisibile (il pensiero e il linguaggio umano) in qualcosa di visibile, tangibile e udibile.
                </p>
              </section>

              <section className="space-y-2 border-b border-slate-900 pb-4">
                <span className="text-sky-400 font-bold uppercase tracking-wide text-xs block">2. La Traduzione da Concetto a Forma (Sinestesia)</span>
                <p className="text-slate-300 text-sm leading-relaxed">
                  L'opera agisce come un "traduttore estetico". L'utente inserisce del testo (input) e il sistema lo elabora in tempo reale, trasformandolo in una scultura digitale o fisica che cambia forma e produce suoni. È un'esperienza sinestetica: il significato delle parole diventa materia e stimolo sensoriale.
                </p>
              </section>

              <section className="space-y-2 border-b border-slate-900 pb-4">
                <span className="text-pink-500 font-bold uppercase tracking-wide text-xs block">3. La Scienza come Metafora Artistica</span>
                <p className="text-slate-300 text-sm leading-relaxed">
                  L'opera non ha pretese di rigore neuroscientifico, ma usa la neurologia come codice poetico. Divide l'espressione umana in due grandi famiglie visive:
                </p>
                <ul className="list-disc list-inside text-slate-400 text-sm space-y-1.5 ml-1 pl-1">
                  <li><strong className="text-slate-200">Se l'input è emotivo/intuitivo:</strong> La scultura si muove con linee morbide, elastiche e forme organiche (che ricordano la natura o il corpo).</li>
                  <li><strong className="text-slate-200">Se l'input è logico/razionale:</strong> La scultura si irrigidisce in forme geometriche, spigolose, matematiche e simmetriche.</li>
                </ul>
              </section>

              <section className="space-y-2 pb-2">
                <span className="text-amber-400 font-bold uppercase tracking-wide text-xs block">4. L'Interazione non è Passiva: Il Test come Sfida</span>
                <p className="text-slate-300 text-sm leading-relaxed">
                  Il "Test di Allineamento Emisferico" introduce un elemento di gamification o comunque di sforzo attivo. Non basta guardare l'opera; l'utente deve cercare una "sintonizzazione". Questo simula la fatica reale della comunicazione umana: per capire davvero un concetto target (o un'altra persona), bisogna calibrare il proprio modo di esprimersi, trovando il giusto bilanciamento tra logica ed emozione.
                </p>
              </section>
            </div>

            {/* Footer information block with signature */}
            <div className="pt-4 border-t border-slate-900 mt-5 flex justify-end text-xs font-mono shrink-0">
              <button
                onClick={() => {
                  setIsManifestoOpen(false);
                  if (!isMuted) synapticSynth.triggerSynapticBeep(440, 0.4, 0.4);
                }}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-400 via-rose-500 to-pink-500 hover:scale-[1.03] text-slate-950 font-black tracking-widest cursor-pointer transition-all uppercase"
                id="manifesto-close-action-btn"
              >
                Chiudi
              </button>
            </div>

          </div>
        </div>
      )}

      </div>
    </div>
  );
}
