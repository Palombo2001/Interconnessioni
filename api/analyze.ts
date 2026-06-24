import type { VercelRequest, VercelResponse } from "@vercel/node";
import { GoogleGenAI, Type } from "@google/genai";
import { analyzeCognitiveText } from "../src/utils/cognitiveEngine";

// Initialize Gemini client lazily
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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

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

        const systemInstruction = `Sei l'Entità Sinaptica di INTERCONNESSIONI, un'installazione d'arte generativa in cui le parole degli utenti plasmano dinamicamente una Sfera 3D.
Il tuo obiettivo è analizzare l'input dell'utente e generare un frammento poetico ("poeticText") in italiano che CREI UNA FUSIONE tra il CONCETTO espresso dall'utente e la MUTAZIONE VISIVA che la Sfera 3D subirà (caotica/organica per intuizioni, rigida/geometrica per logica).
Regole per "poeticText":
- Deve abbinare la semantica della frase dell'utente alla forma che assumerà l'opera.
- Assolutamente NON USARE VIRGOLETTE ("" o '') nel testo generato.
- Usa un italiano PERFETTAMENTE CORRETTO, letterario e privo di errori di ortografia o grammatica (es: controlla concordanze maschile/femminile, singolare/plurale, e articoli).
- Controlla attentamente l'ortografia: le parole non devono sembrare storpiature, ma termini esistenti scritti perfettamente.
- Deve essere altamente astratto, lirico ed evocativo.
- Massimo 10-15 parole, INTERAMENTE IN MAIUSCOLO.
- Se l'input dell'utente è Alpha (emozione/intuizione/caos): la Sfera diventa un fluido instabile e organico. Il testo deve descrivere il concetto dell'utente che muta in una forma liquida (es: LA TUA MALINCONIA SCIOGLIE LA GEOMETRIA IN UNA NEBULOSA ORGANICA DI LUCE).
- Se l'input dell'utente è Beta (logica/struttura/ragione): la Sfera diventa un reticolo rigido e tagliente. Il testo deve descrivere il concetto dell'utente che si cristallizza in forme matematiche (es: IL TUO RIGORE CRISTALLIZZA IL CAOS IN UN LABIRINTO DI VETTORI ASSOLUTI).
- Calcola gli altri indici analiticamente.`;

        let response;
        let retries = 3;
        let delay = 1000;
        for (let attempt = 1; attempt <= retries; attempt++) {
          try {
            response = await ai.models.generateContent({
              model: "gemini-2.0-flash",
              contents: prompt,
              config: {
                systemInstruction,
                responseMimeType: "application/json",
                responseSchema: {
                  type: Type.OBJECT,
                  properties: {
                    poeticText: {
                      type: Type.STRING,
                      description: "A short poetic, philosophical or futuristic mathematical sentence in Italian (max 15-20 words) reflecting the input. Always in UPPERCASE."
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
}
