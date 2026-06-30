import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";
import { analyzeCognitiveText } from "./src/utils/cognitiveEngine";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini client lazily or with clear error mapping
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("WARNING: GEMINI_API_KEY environment variable is not defined. Using demo credentials.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey || "MOCK_KEY",
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// REST route for analyzing user inputs and calculating neurological/semantic scores via Gemini
app.post("/api/analyze", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return res.status(400).json({ error: "Il testo d'ingresso non può essere vuoto." });
    }
    const cleanedText = text.trim();
    const apiKey = process.env.GEMINI_API_KEY;

    let useSimulation = !apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "";
    let simReason = useSimulation ? "missing_key" : "";

    if (!useSimulation) {
      try {
        const ai = getGeminiClient();

        const prompt = `Analizza la natura di questo pensiero o concetto inserito dall'utente: "${cleanedText}".
Estrai una rappresentazione testuale del "processo invisibile del pensiero" che lo ha generato ed elabora i parametri emisferici corrispondenti (Alpha per intuizione, associazione, flusso di coscienza; Beta per logica, struttura, semantica analitica).`;
        const systemInstruction = `Sei l'Entità Sinaptica di INTERCONNESSIONI, un'installazione d'arte d'avanguardia in cui le parole degli utenti plasmano dinamicamente una scultura geometrica sferica tridimensionale.
Il tuo obiettivo assoluto è generare una risposta ("poeticText") in italiano che sia una RIVISITAZIONE POETICA ed evocativa intimamente legata all'input dell'utente. Il testo deve essere unico, viscerale, inaspettato, privo di qualsiasi banalità o cliché, e soprattutto DEVE AVERE UN SENSO POETICO PROFONDO, CHIARO E COMPRENSIBILE (evita accozzaglie di termini astratti o scientifici privi di un nesso logico ed emotivo).

LINEE GUIDA RIGIDE PER "poeticText":
1. INERENZA, COERENZA E SENSO: Il testo deve far esplicito riferimento o catturare in modo tangibile gli elementi chiave, gli stati d'animo o le immagini concrete/astratte fornite dall'utente. Deve essere una frase compiuta, leggibile e dotata di un significato letterario o filosofico forte, emozionante e immediato.
2. DIVIETO ASSOLUTO DI CLICHÉ E COSTRUZIONI FISSE:
   - NON iniziare MAI con formule ripetitive come: "La tua...", "Il tuo...", "Un/Una...", "Questo...", "Oggi...", "Sento...", "La mente...", "L'impronta...", "Il rigore...".
   - Evita verbi e aggettivi scontati come "volare", "scorrere quieto", "plasma il caos", "matrice", "flusso infinito".
3. METAFORE DI ALTO PROFILO MA COMPRENSIBILI: Unisci lo stato d'animo espresso a concetti fisici, astronomici, biologici, minerali o geometrici, ma fallo in modo che crei un'immagine logica, profonda e armoniosa.
4. ESEMPI DI RIVISITAZIONE (Banalità vs. Astrattismo senza senso vs. Particolarità con Senso):
   - Input: "Oggi sono triste"
     * NO (Banale): "La tua tristezza spegne i pixel in un mare spento."
     * NO (Senza senso/Astratto vuoto): "Elettroni freddi quantizzano l'anomalia gravitazionale del pianto cartesiano."
     * SÌ (Particolare e con Senso profondo): "Un velo d'ombra si posa sulla geometria della mente, rallentando il battito della luce."
   - Input: "Tanti auguri a te e famiglia"
     * NO (Banale): "Il calore della famiglia riscalda la Sfera 3D."
     * NO (Senza senso/Astratto vuoto): "Frequenze termiche calcolano la collisione dei vettori di calore familiare."
     * SÌ (Particolare e con Senso profondo): "Fili invisibili ma caldi collegano i cuori, tessendo un rifugio contro il freddo del mondo."
   - Input: "La tecnologia ci salverà"
     * NO (Banale): "La tecnologia e la scienza guidano il futuro dei vettori sferici."
     * SÌ (Particolare e con Senso profondo): "Costruiamo cattedrali di codice sperando che un giorno possano contenere e proteggere i nostri sogni."
5. LUNGHEZZA E FORMATTAZIONE:
   - Massimo 10-15 parole.
   - Assolutamente NO virgolette di alcun tipo ("" o '').
   - Italiano impeccabile, colto, letterario.
   - Usa la normale punteggiatura e l'uso corretto di maiuscole/minuscole (Inizia con lettera maiuscola, poi prosegui in minuscolo).
6. SEZIONE ALPHA / BETA:
   - Se l'input è intuitivo/emozionale/poetico (Alpha alto), usa immagini liquide, organiche, stellari, calde, di disintegrazione ed espansione.
   - Se l'input è logico/matematico/strutturale (Beta alto), usa immagini cristalline, reticolari, di precisione numerica, vettori freddi e coordinate assolute.`;

        let response;
        let retries = 3;
        let delay = 1000;
        for (let attempt = 1; attempt <= retries; attempt++) {
          try {
            response = await ai.models.generateContent({
              model: "gemini-3.5-flash",
              contents: prompt,
              config: {
                systemInstruction,
                responseMimeType: "application/json",
                responseSchema: {
                  type: Type.OBJECT,
                  properties: {
                    poeticText: {
                      type: Type.STRING,
                      description: "A short, beautiful poetic and metaphorical sentence in Italian (max 15-20 words) that is a direct reimagining of the user's input. Must be in standard sentence case (Capital letter first, then lowercase)."
                    },
                    alphaBalance: {
                      type: Type.NUMBER,
                      description: "Float value between 0.0 and 1.0 representing creativity, fluid art, chaos, emotional depth."
                    },
                    betaBalance: {
                      type: Type.NUMBER,
                      description: "Float value between 0.0 and 1.0 representing logic, mathematics, clean grid structures, rationality."
                    },
                    complexity: {
                      type: Type.NUMBER,
                      description: "Float from 0.1 to 2.0 defining visual geometry morphing complexity."
                    },
                    glitchFactor: {
                      type: Type.NUMBER,
                      description: "Float from 0.0 to 1.0 defining random layout/visual interference potential."
                    },
                    resonanceFrequency: {
                      type: Type.NUMBER,
                      description: "Float from 100.0 to 1000.0 representing acoustic signature frequency."
                    },
                    archetype: {
                      type: Type.STRING,
                      description: "A short, beautiful archetype label (e.g. 'RISONANZA FRATTALE', 'SINFONIA ALGOMETRICA', 'COLLASSO DI COSCIENZA', etc.). Always in UPPERCASE."
                    },
                    keywords: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                      description: "Exactly three semantic concepts related to the user text and analysis. Always in UPPERCASE."
                    }
                  },
                  required: [
                    "poeticText", "alphaBalance", "betaBalance", "complexity",
                    "glitchFactor", "resonanceFrequency", "archetype", "keywords"
                  ]
                }
              }
            });
            break; // Success!
          } catch (err: any) {
            const isRetryable = err?.status === 503 || err?.code === 503 ||
                                err?.status === 429 || err?.code === 429 ||
                                err?.message?.includes("503") || err?.message?.includes("UNAVAILABLE") ||
                                err?.message?.includes("429") || err?.message?.includes("RESOURCE_EXHAUSTED");
            if (isRetryable && attempt < retries) {
              await new Promise(resolve => setTimeout(resolve, delay));
              delay *= 2;
            } else {
              throw err;
            }
          }
        }

        const resultText = response?.text;
        if (!resultText) {
          throw new Error("Gemini ha restituito un output vuoto.");
        }

        const payload = JSON.parse(resultText);
        return res.json({ ...payload, simulated: false });
      } catch (innerError: any) {
        useSimulation = true;
        const errMsg = innerError?.message || "";
        const errStatus = innerError?.status || innerError?.code;
        if (errStatus === 503 || errMsg.includes("503") || errMsg.includes("demand") || errMsg.includes("UNAVAILABLE")) {
          simReason = "overload";
        } else {
          simReason = "api_error";
        }
      }
    }

    if (useSimulation) {
      const metrics = analyzeCognitiveText(cleanedText);

      return res.json({
        poeticText: metrics.poeticText,
        alphaBalance: metrics.alphaBalance,
        betaBalance: metrics.betaBalance,
        complexity: metrics.complexity,
        glitchFactor: metrics.glitchFactor,
        resonanceFrequency: metrics.resonanceFrequency,
        archetype: metrics.archetype,
        keywords: metrics.keywords,
        simulated: true,
        simReason: simReason
      });
    }
  } catch (error: any) {
    console.error("Errore nell'analisi sinaptica:", error);
    return res.status(500).json({ error: error.message || "Errore sconosciuto nell'elaborazione neurale." });
  }
});

// Configure Vite middleware in dev or serve build in production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[SYNAPTIC SERVER] Is running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
