import type { VercelRequest, VercelResponse } from "@vercel/node";
import { analyzeCognitiveText } from "../src/utils/cognitiveEngine.js";

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

        const requestBody = {
          system_instruction: {
            parts: [{ text: systemInstruction }]
          },
          contents: [
            { role: "user", parts: [{ text: prompt }] }
          ],
          generationConfig: {
            responseMimeType: "application/json",
            responseSchema: {
              type: "OBJECT",
              properties: {
                poeticText: {
                  type: "STRING",
                  description: "A short poetic, philosophical or futuristic mathematical sentence in Italian (max 15-20 words) reflecting the input. Always in UPPERCASE."
                },
                alphaBalance: {
                  type: "NUMBER",
                  description: "Float value between 0.0 and 1.0 representing creativity, fluid art, chaos, emotional depth."
                },
                betaBalance: {
                  type: "NUMBER",
                  description: "Float value between 0.0 and 1.0 representing logic, mathematics, clean grid structures, rationality."
                },
                complexity: {
                  type: "NUMBER",
                  description: "Float from 0.1 to 2.0 defining visual geometry morphing complexity."
                },
                glitchFactor: {
                  type: "NUMBER",
                  description: "Float from 0.0 to 1.0 defining random layout/visual interference potential."
                },
                resonanceFrequency: {
                  type: "NUMBER",
                  description: "Float from 100.0 to 1000.0 representing acoustic signature frequency."
                },
                archetype: {
                  type: "STRING",
                  description: "A short, beautiful archetype label (e.g. 'RISONANZA FRATTALE', 'SINFONIA ALGOMETRICA', 'COLLASSO DI COSCIENZA', etc.). Always in UPPERCASE."
                },
                keywords: {
                  type: "ARRAY",
                  items: { type: "STRING" },
                  description: "Exactly three semantic concepts related to the user text and analysis. Always in UPPERCASE."
                }
              },
              required: [
                "poeticText", "alphaBalance", "betaBalance", "complexity",
                "glitchFactor", "resonanceFrequency", "archetype", "keywords"
              ]
            }
          }
        };

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
          const errorData = await response.text();
          console.error("Gemini API Error:", errorData);
          throw new Error(`Gemini API error: ${response.status}`);
        }

        const data = await response.json();
        const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!resultText) {
          throw new Error("Gemini ha restituito un output vuoto.");
        }

        const payload = JSON.parse(resultText);
        return res.json({ ...payload, simulated: false });
      } catch (innerError: any) {
        useSimulation = true;
        const errMsg = innerError?.message || "";
        if (errMsg.includes("503") || errMsg.includes("demand") || errMsg.includes("UNAVAILABLE") || errMsg.includes("429")) {
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
