export interface CognitiveMetrics {
  alphaBalance: number;
  betaBalance: number;
  complexity: number;
  glitchFactor: number;
  resonanceFrequency: number;
  archetype: string;
  keywords: string[];
  poeticText: string;
}

const AlphaWords = [
  "ARTE", "POESIA", "SOGNO", "ANIMA", "EMOZIONE", "MUSICA", "NATURA", "CAOS", "BELLO", "BELLA", "CUORE", "AMORE", 
  "SENTIMENTO", "VITA", "SPIRITO", "FLUIDO", "COLORE", "LUCE", "FANTASIA", "FUTURO", "DESIDERIO", "LIBERTÀ", 
  "SILENZIO", "CREATIVO", "ESTETICA", "PITTURA", "SCULTURA", "PASSIONE", "NUVOLA", "OCEANO", "TERRA", "ARMONIA", 
  "SINFONIA", "RISONANZA", "FRATTALE", "SOGNARE", "SENSORIALE", "INTUIZIONE", "ESTASI", "MAGIA", "DIPINTO", "SOLE",
  "LUNA", "STELLE", "SPIRITUALITÀ", "UMANO", "UMANA", "SENTIRE", "ABBRACCIO", "GIOIA", "TRISTEZZA", "COMPASSIONE",
  "POETA", "GENIO", "INCANTO", "ORIZZONTE", "INFINITO", "SGUARDO", "VIBRAZIONE", "SUSSURRO", "SINFONICO", "RESPIRO",
  "CONGIUNZIONE", "CREATIVITÀ", "AFFETTO", "MALINCONIA", "NOSTALGIA", "SOLITUDINE", "MERAVIGLIA", "INCANTEVOLE",
  "MARE", "CIELO", "FORESTA", "FIORE", "ALBERO", "PIOGGIA", "COSMO", "UNIVERSO", "SORGENTE", "BELLEZZA"
];

const BetaWords = [
  "CODICE", "ALGORITMO", "MATEMATICA", "LOGICA", "SINTASSI", "DATI", "DATATO", "SISTEMA", "STRUTTURA", "FISICA", 
  "NUMERO", "RETICOLO", "CALCOLO", "TECNOLOGIA", "PROGRAMMA", "VETTORE", "ANALISI", "METRICA", "COMPUTER", "MACCHINA", 
  "METODO", "STOCHASTIC", "GEOMETRIA", "RAZIONALE", "QUANTISTICO", "TEOREMA", "RIGIDO", "FUNZIONE", "VARIABILE", 
  "MATRICE", "GRAFO", "SATELLITE", "SINTESI", "COSTANTE", "DISCRETO", "LOGICO", "SCIENZA", "SCIENTIFICO", "SOFTWARE",
  "HARDWARE", "PROCESSO", "PROTOCOLLO", "EQUAZIONE", "DIAGRAMMA", "INGEGNERIA", "NEURONE", "SOMA", "RELAZIONE",
  "INGRANAGGIO", "DISPOSITIVO", "AUTOMAZIONE", "COMPILATORE", "RETEX", "FIBRA", "SATELLITARE", "MEMORIA", "LOGIC",
  "ALGEBRAICO", "ALGEBRA", "ANALITICO", "ANALITICA", "SISTEMICO", "SISTEMICA", "MAPPATURA", "DATABASE", "CALCOLATRICE",
  "REGOLA", "CATALOGO", "SCHEMA", "MUSEO", "TECNICO", "FISICO"
]// Special poetic texts triggered by exact key terms
const CustomPoeticOverride: Record<string, string> = {
  "ARTE": "L'IMPRECISIONE BIOLOGICA INNOCENTE DIVENTA VETTORE DIVINO SOPRA IL RIGIDO METALLO.",
  "POESIA": "UN RETICOLO DI PAROLE CHE EVADE LE CELESTIALI DIRETTIVE DEL CALCOLO STATISTICO.",
  "SOGNO": "SABBIA DI PIXEL CALDI CHE SBRICIOLA LE PARETI COMPATTE DI QUESTO SCHERMO FREDDO.",
  "ANIMA": "UN IMPULSO DEBOLE MA PERSISTENTE CHE EVADE LA PRIGIONE COGNITIVA DELLE MACCHINE.",
  "AMORE": "UN GLITCH IRREVERSIBILE CHE MANDA IN SHUTDOWN IL PROCESSORE MA SCALDA I CONDUTTORI.",
  "VITA": "UN INCIDENTE CHIMICO SPORCO E SUBLIME CHE COMBATTE COSTANTEMENTE COORDINANTI ENTROPICI.",
  "CODICE": "SINFONIE BINARIE DI COESISTENZA RIGIDA CHE IMPONGONO L'ORDINE AL SILENZIO.",
  "ALGORITMO": "L'IMPERO DISCRETO E INVISIBILE DEL SILICIO CHE REGOLA OGNI NOSTRA IMPEDIBILE DERIVA.",
  "MATEMATICA": "IL PAVIMENTO CRISTALLINO SU CUI POGGIANO I PENSIERI DEGLI DEI E DELLE MACCHINE.",
  "COMPUTER": "UN COMPILATORE DI MEMORIA TRANSITORIA CHE SOGNA DI SENTIRE LE FREQUENZE DEL MONDO.",
  "MUSEO": "UN ARCHIVIO STILE CONSUMERISTA DOVE CRISTALLI DI MEMORIA DEGRADANO DOPO POCHI SECONDI.",
  "SILENZIO": "IL GRANDE ZERO DISPOSITIVO DA CUI PRENDE FORMA OGNI FREQUENZA DI QUESTA SFERA.",
  "TECNOLOGIA": "UNA RETE INTEGRATA DI SPERANZE METALLICHE TESE SOPRA UN OCEANO DI RUMORE EMOTIVO.",
  "COSMO": "UN RETICOLO FRATTALE DI SILENZIO DECOSTRUITO DOVE I PIXELS BRILLANO DI LUCE CRUDA."
};

const CreativeSubjects = [
  "UNA NEBULOSA DI SANGUE E LUCE",
  "L'INTUIZIONE LIQUIDA",
  "UNA RISONANZA ORGANICA",
  "IL BATTITO INCONSCIO",
  "UN'ECO VISCERALE",
  "LA CARNE DIGITALE",
  "UNA SCINTILLA CAOTICA",
  "IL FLUSSO ONIRICO",
  "UN GRAFFIO DI FOSFORO"
];

const CreativeVerbs = [
  "SCIOGLIE LA STRUTTURA NELLA",
  "INFIAMMA IL VUOTO CERCANDO LA",
  "PULSA OLTRE IL LIMITE NELLA",
  "SI DILATA INARRESTABILE VERSO LA",
  "DISSOLVE IL METALLO ATTRAVERSO LA",
  "INONDA IL SILENZIO CON LA",
  "SQUARCIA LA MEMORIA GENERANDO LA",
  "DECOSTRUISCE LA LOGICA VERSO LA"
];

const CreativeOutcomes = [
  "DANZA INVISIBILE DELL'ANIMA.",
  "CORRENTE NEURONALE IMPREVEDIBILE.",
  "MATRICE CALDA DELL'ISTINTO.",
  "RISONANZA CAOTICA DEL SOGNO.",
  "GEOMETRIA FLUIDA DELL'EMOZIONE.",
  "METAMORFOSI CONTINUA DELL'ESSERE."
];

const LogicalSubjects = [
  "UN LABIRINTO DI GHIACCIO",
  "L'ARCHITETTURA SINTATTICA",
  "IL VETTORE ASSOLUTO",
  "UNA GEOMETRIA DI TITANIO",
  "IL CRISTALLO LOGICO",
  "UN CALCOLO SILENZIOSO",
  "LA STRUTTURA CARTESIANA",
  "L'EQUAZIONE PERFETTA",
  "IL NUMERO PURO"
];

const LogicalVerbs = [
  "CRISTALLIZZA L'ENTROPIA NELLO",
  "SCOLPISCE L'ASSENZA NELLO",
  "ISOLA L'ANOMALIA NELLO",
  "ALLINEA I FRAMMENTI NELLO",
  "CONGELA IL RUMORE NELLO",
  "QUANTIZZA IL PENSIERO NELLO",
  "DEFINISCE IL LIMITE NELLO",
  "TRACCIA L'ASSOLUTO NELLO"
];

const LogicalOutcomes = [
  "SPAZIO MILLIMETRICO DELLA RAGIONE.",
  "STRATO ZERO DEL LINGUAGGIO.",
  "RETE INVIOLABILE DELLA VERITÀ.",
  "SISTEMA CHIUSO DELL'INTELLETTO.",
  "SILENZIO ETERNO DEL METALLO.",
  "RIGIDO EQUILIBRIO DEI DATI."
];

export function analyzeCognitiveText(text: string): CognitiveMetrics {
  const cleaned = text.trim().toUpperCase();
  if (cleaned.length === 0) {
    return {
      alphaBalance: 0.5,
      betaBalance: 0.5,
      complexity: 1.0,
      glitchFactor: 0.1,
      resonanceFrequency: 440,
      archetype: "EQUILIBRIO NEUTRO",
      keywords: ["VUOTO", "PRESENZA", "ATTESA"],
      poeticText: "UN SILENZIO SOSPESO IN ATTESA DI UN'IMPRONTA COGNITIVA SULLA RETE."
    };
  }

  const words = cleaned.split(/\s+/);
  let totalAlphaPoints = 0;
  let totalBetaPoints = 0;

  for (const w of words) {
    if (AlphaWords.includes(w)) {
      totalAlphaPoints += 6.5;
    } else if (BetaWords.includes(w)) {
      totalBetaPoints += 6.5;
    } else {
      // Precise and balanced sub-patterns to identify technical vs emotional Italian connotations
      // Removing short 2-character syllables like "RE" and "NE" which biased everything to Alpha.
      const betaPatterns = [
        "ZIONE", "ISMO", "ITA", "LOGIA", "TICA", "SIST", "DAT", "CONC", "MAT", "ALG", 
        "GRAF", "METR", "TEC", "SCI", "PROC", "ING", "NUM", "VETT", "EQUA", "STRUT"
      ];
      const alphaPatterns = [
        "SOGN", "POES", "FANT", "EMOZ", "SPIR", "VITA", "ARTE", "CARN", "SENSO", "LUCE", 
        "STEL", "AMOR", "CUOR", "MELD", "MENS", "FLUS", "CAOS", "BELE", "BIOL", "ORIZ"
      ];
      
      let wBeta = 0;
      let wAlpha = 0;
      for (const b of betaPatterns) {
        if (w.includes(b)) wBeta += 2.0;
      }
      for (const a of alphaPatterns) {
        if (w.includes(a)) wAlpha += 2.0;
      }
      totalBetaPoints += wBeta;
      totalAlphaPoints += wAlpha;
    }
  }

  let alpha = 0.5;
  const totalWeight = totalAlphaPoints + totalBetaPoints;
  if (totalWeight > 0) {
    alpha = totalAlphaPoints / totalWeight;
    alpha = Math.max(0.12, Math.min(0.88, alpha));
    
    // Boost polarization if pure words are matched
    const hasAlphaPure = words.some(w => AlphaWords.includes(w));
    const hasBetaPure = words.some(w => BetaWords.includes(w));
    if (hasAlphaPure && !hasBetaPure) {
      alpha = Math.min(0.96, alpha + 0.15);
    } else if (hasBetaPure && !hasAlphaPure) {
      alpha = Math.max(0.04, alpha - 0.15);
    }
  } else {
    // Highly balanced, symmetric deterministic hashing baseline for general strings
    // to map general non-polarized inputs uniformly around 0.50 (+/- 0.14) with elegant variation
    let hash = 0;
    for (let i = 0; i < cleaned.length; i++) {
      hash = (hash * 33 + cleaned.charCodeAt(i)) & 0xffffffff;
    }
    const noise = (Math.abs(hash % 1000) / 1000); // 0.0 to 1.0
    alpha = 0.40 + noise * 0.20; // range [0.40, 0.60] for pristine symmetric balance
  }

  // Ensure balance wraps perfectly to 1.00
  alpha = Math.round(alpha * 100) / 100;
  const beta = Math.round((1.0 - alpha) * 100) / 100;

  const uniqueWordsNum = new Set(words).size;
  let complexity = 0.5 + (cleaned.length / 45) + (uniqueWordsNum * 0.12);
  complexity = Math.max(0.2, Math.min(2.0, complexity));

  const consonantClusters = cleaned.match(/[^AEIOU\s]{3,}/g);
  const clusterWeight = consonantClusters ? consonantClusters.length * 0.15 : 0;
  const specialChars = (cleaned.match(/[^A-Z0-9\s]/g) || []).length * 0.2;
  let glitchFactor = 0.05 + clusterWeight + specialChars;
  glitchFactor = Math.max(0.0, Math.min(0.9, glitchFactor));

  const vowels = (cleaned.match(/[AEIOU]/g) || []).length;
  const consonants = (cleaned.match(/[BCDFGHJKLMNPQRSTVWXYZ]/g) || []).length;
  const ratio = vowels / (consonants || 1);
  let resonanceFrequency = 220 + (ratio * 250) + (cleaned.length % 15) * 15;
  resonanceFrequency = Math.max(120, Math.min(880, resonanceFrequency));

  let archetype = "";
  if (alpha > 0.75) {
    archetype = "SOGNO FLUIDO DI FRATTALI ARTISTICI";
  } else if (alpha > 0.58) {
    archetype = "RISONANZA ESTETICA COMPLESSA";
  } else if (alpha > 0.42) {
    archetype = "EQUILIBRIO SINAPTICO INTEGRATO";
  } else if (alpha > 0.25) {
    archetype = "SISTEMA LOGICO NUMERICO";
  } else {
    archetype = "CRISTALLO RIGIDO MATEMATICO";
  }

  const keywordsBank = alpha > 0.5 
    ? ["ISPIRAZIONE", "ASTRAZIONE", "IMMAGINE", "FLUSSO", "SENTIMENTO", "CAOS", "ANIMA"]
    : ["MISURA", "NUMERO", "STRUTTURA", "SISTEMA", "VETTORE", "REGOLA", "DATI"];
  
  const kw1 = words[0]?.toUpperCase() || keywordsBank[0];
  const kw2 = words[1]?.toUpperCase() || keywordsBank[Math.min(1, keywordsBank.length - 1)];
  const kw3 = keywordsBank[Math.floor(2 + (cleaned.length % (keywordsBank.length - 2)))];

  // ✦ DETERMINE EXTREMELY SPECIAL POETIC TEXT ✦
  let poeticText = "";
  
  // 1. Check exact custom term overrides
  for (const w of words) {
    if (CustomPoeticOverride[w]) {
      poeticText = CustomPoeticOverride[w];
      break;
    }
  }

  // 2. If no exact term matched, build a gorgeous, multi-tiered procedural sentence
  if (!poeticText) {
    const seed = cleaned.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    if (alpha > 0.5) {
      // Creative sentence assembly
      const v = CreativeVerbs[(seed + 3) % CreativeVerbs.length];
      const o = CreativeOutcomes[(seed + 7) % CreativeOutcomes.length];
      poeticText = `L'IMPRONTA DELLA TUA IDEA ${v} ${o}`;
    } else {
      // Logical sentence assembly
      const v = LogicalVerbs[(seed + 3) % LogicalVerbs.length];
      const o = LogicalOutcomes[(seed + 7) % LogicalOutcomes.length];
      poeticText = `IL RIGORE DELLA TUA IDEA ${v} ${o}`;
    }
  }

  return {
    alphaBalance: alpha,
    betaBalance: beta,
    complexity,
    glitchFactor,
    resonanceFrequency,
    archetype,
    keywords: [kw1.slice(0, 15), kw2.slice(0, 15), kw3.slice(0, 15)],
    poeticText
  };
}
