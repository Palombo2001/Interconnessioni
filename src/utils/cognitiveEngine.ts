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
  "ARTE": "L'imprecisione biologica innocente diventa vettore divino sopra il rigido metallo.",
  "POESIA": "Un reticolo di parole che evade le celestiali direttive del calcolo statistico.",
  "SOGNO": "Sabbia di pixel caldi che sbriciola le pareti compatte di questo schermo freddo.",
  "ANIMA": "Un impulso debole ma persistente che evade la prigione cognitiva delle macchine.",
  "AMORE": "Un glitch irreversibile che manda in shutdown il processore ma scalda i conduttori.",
  "VITA": "Un incidente chimico sporco e sublime che combatte costantemente coordinanti entropici.",
  "CODICE": "Sinfonie binarie di coesistenza rigida che impongono l'ordine al silenzio.",
  "ALGORITMO": "L'impero discreto e invisibile del silicio che regola ogni nostra impedibile deriva.",
  "MATEMATICA": "Il pavimento cristallino su cui poggiano i pensieri degli dei e delle macchine.",
  "COMPUTER": "Un compilatore di memoria transitoria che sogna di sentire le frequenze del mondo.",
  "MUSEO": "Un archivio stile consumerista dove cristalli di memoria degradano dopo pochi secondi.",
  "SILENZIO": "Il grande zero dispositivo da cui prende forma ogni frequenza di questa sfera.",
  "TECNOLOGIA": "Una rete integrata di speranze metalliche tese sopra un oceano di rumore emotivo.",
  "COSMO": "Un reticolo frattale di silenzio decostruito dove i pixels brillano di luce cruda.",
  "FAMIGLIA": "Un intreccio silenzioso di filamenti caldi che resiste al gelo del vuoto siderale.",
  "AUGURI": "Un'oscillazione pura di onde sincronizzate che attraversa il tempo augurando armonia.",
  "EQUILIBRIO": "La quiete provvisoria di due forze colossali sospese su un abisso di frequenze.",
  "MARE": "Un immenso polmone di onde salate e scure che respira al ritmo di maree orbitali.",
  "CIELO": "Una distesa azzurra di aria e assenza, dove i sogni si disperdono in luce diffusa.",
  "FIORE": "Un'esplosione silenziosa di colore e geometria organica che si schiude all'entropia.",
  "TRISTEZZA": "Un'ombra sottile che rallenta il passo dei pensieri, colorando la mente di sfumature d'autunno.",
  "GIOIA": "Una scintilla di luce improvvisa che accende i pensieri, liberando un'energia contagiosa.",
  "TEMPO": "Un fiume invisibile che scorre e consuma le forme, lasciando solo tracce di polvere.",
  "SPAZIO": "L'infinita tela vuota in cui particelle di materia danzano una coreografia senza fine.",
  "SINESTESIA": "I colori della musica si fondono con la forma geometrica di un profumo intangibile.",
  "CAOS": "Un turbine ribelle di possibilità infinite che rifiuta la prigione di qualsiasi reticolo.",
  "ORDINE": "Una griglia invisibile che organizza il disordine dei pensieri in forme stabili e armoniose.",
  "MONDO": "Una sfera di polvere bagnata, sospesa in un vuoto immenso e perennemente in viaggio.",
  "MELODIA": "Una linea di pura luce sonora che fende l'aria e guarisce le fratture del pensiero.",
  "FUTURO": "Un orizzonte di sogni non ancora scritti, che attende solo di essere immaginato.",
  "FELICITÀ": "Un barlume di risonanza perfetta in cui la mente dimentica di calcolare il tempo.",
  "RABBIA": "Un fuoco impetuoso che divampa nei pensieri, rompendo per un attimo gli argini della ragione.",
  "NATURA": "La forza silenziosa che cresce spontanea, disegnando capolavori senza bisogno di regole.",
  "MUSICA": "Una vibrazione di onde armoniche che organizza il disordine in un tempio invisibile."
};

const CreativeSubjects = [
  "Un soffio di luce calda",
  "L'ispirazione pura",
  "Una risonanza intima",
  "Il battito del cuore",
  "Un'eco di speranza",
  "L'immaginazione fluida",
  "Una scintilla di meraviglia",
  "Il cammino dei sogni",
  "Un sussurro dell'anima"
];

const CreativeVerbs = [
  "disegna percorsi invisibili attraverso la",
  "risveglia emozioni sopite e accende la",
  "si muove con grazia e delicatezza verso la",
  "incontra lo sguardo del pensiero svelando la",
  "apre nuovi orizzonti di senso oltre la",
  "accoglie la fragilità della mente guidando la",
  "crea un legame profondo e sincero con la",
  "trasforma la realtà quotidiana nella"
];

const CreativeOutcomes = [
  "meraviglia di un sogno ad occhi aperti.",
  "bellezza custodita nei ricordi più preziosi.",
  "dolce armonia di un istante perfetto.",
  "quiete di un pensiero finalmente libero.",
  "poesia nascosta nei dettagli più semplici.",
  "luce calda che abita ogni nostra speranza."
];

const LogicalSubjects = [
  "Un disegno ordinato",
  "L'architettura del pensiero",
  "Il percorso coerente",
  "Una geometria armoniosa",
  "Il cristallo della mente",
  "Un calcolo limpido",
  "La struttura razionale",
  "L'equazione di senso",
  "Il cammino logico"
];

const LogicalVerbs = [
  "struttura lo spazio mentale definendo il",
  "allinea con rigore e precisione il",
  "ordina il flusso caotico dei pensieri nel",
  "disegna confini limpidi e razionali per il",
  "rivela la logica nascosta e l'equilibrio del",
  "costruisce un ponte di parole stabili verso il",
  "sintetizza la complessità della mente nel"
];

const LogicalOutcomes = [
  "senso profondo di ogni singola parola.",
  "valore autentico dell'esperienza vissuta.",
  "disegno perfetto delle proprie idee.",
  "centro vitale del ragionamento umano.",
  "silenzio ordinato che precede la creazione.",
  "limpido sentiero della comprensione logica."
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
      
      let wBeta = 0.2 + (w.match(/[^AEIOU]/g)?.length || 0) * 0.3;
      let wAlpha = 0.2 + (w.match(/[AEIOU]/g)?.length || 0) * 0.4;
      
      for (const b of betaPatterns) {
        if (w.includes(b)) wBeta += 3.0;
      }
      for (const a of alphaPatterns) {
        if (w.includes(a)) wAlpha += 3.0;
      }
      totalBetaPoints += wBeta;
      totalAlphaPoints += wAlpha;
    }
  }

  let alpha = 0.5;
  const totalWeight = totalAlphaPoints + totalBetaPoints;
  if (totalWeight > 0) {
    alpha = totalAlphaPoints / totalWeight;
    
    // Amp up sensitivity: push slight deviations further towards the extremes
    alpha = 0.5 + (alpha - 0.5) * 2.0; 
    
    alpha = Math.max(0.05, Math.min(0.95, alpha));
    
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

  // 2. If no exact term matched, build a gorgeous, multi-tiered procedural sentence that reimagines the input
  if (!poeticText) {
    const stopwords = new Set([
      "IL", "LO", "LA", "I", "GLI", "LE", "UN", "UNO", "UNA", "DI", "A", "DA", "IN", "CON", "SU", "PER", "TRA", "FRA",
      "E", "O", "MA", "COME", "MI", "TI", "SI", "CI", "VI", "CHE", "NON", "HO", "HA", "SENTO", "OGGI", "QUESTO", "QUESTA",
      "DEI", "DEGLI", "DELLE", "DEL", "DELLO", "DELLA", "AL", "ALLO", "ALLA", "AI", "AGLI", "ALLE", "DAL", "DALLO",
      "DALLA", "DAI", "DAGLI", "DALLE", "NEL", "NELLO", "NELLA", "NEI", "NEGLI", "NELLE", "SUL", "SULLO", "SULLA", "SUI",
      "SUGLI", "SULLE", "COL", "COI", "PEL", "PEI", "MIO", "MIA", "MIEI", "MIE", "TUO", "TUA", "TUOI", "TUE", "SONO", "SEI"
    ]);

    const significantWords = words
      .map(w => w.replace(/[^A-ZÀ-ÖØ-ß]/g, ""))
      .filter(w => w.length > 2 && !stopwords.has(w));

    const seed = cleaned.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const formatWord = (w: string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();

    let subject = "";
    if (significantWords.length >= 2) {
      const word1 = formatWord(significantWords[0]);
      const word2 = formatWord(significantWords[1]);
      const subjectTemplates = [
        `L'intreccio risonante tra ${word1} e ${word2}`,
        `La collisione poetica di ${word1} e ${word2}`,
        `Il flusso emotivo di ${word1} fuso con ${word2}`,
        `L'eco d'arte che unisce ${word1} e ${word2}`,
        `La sinergia invisibile di ${word1} e ${word2}`
      ];
      subject = subjectTemplates[seed % subjectTemplates.length];
    } else if (significantWords.length === 1) {
      const word = formatWord(significantWords[0]);
      const subjectTemplates = [
        `La risonanza intima di ${word}`,
        `Il pensiero fluttuante legato a ${word}`,
        `L'essenza evocativa di ${word}`,
        `La proiezione sognante di ${word}`,
        `La tensione poetica verso ${word}`
      ];
      subject = subjectTemplates[seed % subjectTemplates.length];
    } else {
      // Fallback to beautiful procedural subjects
      if (alpha > 0.5) {
        subject = CreativeSubjects[seed % CreativeSubjects.length];
      } else {
        subject = LogicalSubjects[seed % LogicalSubjects.length];
      }
    }

    if (alpha > 0.5) {
      const v = CreativeVerbs[(seed + 3) % CreativeVerbs.length];
      const o = CreativeOutcomes[(seed + 7) % CreativeOutcomes.length];
      poeticText = `${subject} ${v} ${o}`;
    } else {
      const v = LogicalVerbs[(seed + 3) % LogicalVerbs.length];
      const o = LogicalOutcomes[(seed + 7) % LogicalOutcomes.length];
      poeticText = `${subject} ${v} ${o}`;
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
