/*
  ✦ GENERATIVE SYNAPTIC ARTWORK - SUPREME P5.JS PORT FOR ORAL EXAM ✦
  Creato per l'esame di Priscilla Palombo.
  
  Questo file contiene l'algoritmo d'avanguardia della Sfera Sinaptica,
  riscritta interamente in pura grafica 2D proiettata manualmente in 3D con profondità.
  
  INTERAZIONE:
  - Muovi il mouse sulla tela per alterare la polarità biologica (Alpha/Beta).
  - Clicca sulla tela per scatenare un impulso "Potenziale d'Azione" (Action Potential)
    con onda d'onda d'urto elettromagnetica che altera gli stati delle connessioni!
*/

let spherePoints = [];
let sphereRadius = 135;
let particles = [];
let resonanceFreq = 340.0;
let alphaResonance = 0.75;
let betaRational = 0.35;

// Array per gestire gli impulsi elettrici attivi (scatenati dal click)
let actionPotentials = [];

function setup() {
  createCanvas(450, 580);
  angleMode(RADIANS);
  
  // 1. Inizializzazione dei nodi sferici (calcolo trigonometrico 3D distribuito)
  for (let i = 0; i < 90; i++) {
    let theta = acos(random(-1, 1));
    let phi = random(TWO_PI);
    spherePoints.push({
      x: sin(theta) * cos(phi),
      y: sin(theta) * sin(phi),
      z: cos(theta),
      id: i,
      pulseSpeed: random(0.02, 0.07),
      pulseOffset: random(TWO_PI)
    });
  }

  // 2. Inizializza i nodi sinaptici orbitanti di sfondo
  for (let i = 0; i < 45; i++) {
    particles.push({
      angle: random(TWO_PI),
      distance: random(20, 205),
      speed: random(0.001, 0.005) * (random() > 0.5 ? 1 : -1),
      size: random(1.5, 4.5),
      pulse: random(TWO_PI)
    });
  }
}

function draw() {
  // Sfondo scuro e profondo (Cosmico)
  background(8, 11, 30);
  
  let centerX = width / 2;
  let centerY = 225; // Centrata in alto per fare spazio al pannello informativo HUD
  
  // 1. INPUT DINAMICO: Controlla se il mouse è sopra il canvas
  if (mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height) {
    // Transizione fluida verso i valori del mouse (effetto magnetico)
    let targetAlpha = map(mouseX, 0, width, 0.1, 0.95);
    let targetBeta = map(mouseY, 0, height, 0.1, 0.95);
    alphaResonance = lerp(alphaResonance, targetAlpha, 0.1);
    betaRational = lerp(betaRational, targetBeta, 0.1);
  } else {
    // Oscillazioni organiche autonome in assenza dell'utente
    alphaResonance = lerp(alphaResonance, 0.55 + 0.3 * sin(frameCount * 0.012), 0.05);
    betaRational = lerp(betaRational, 0.45 + 0.3 * cos(frameCount * 0.008), 0.05);
  }
  
  // Aggiorna l'indice di frequenza basato sui parametri correnti
  resonanceFreq = 220 + (alphaResonance * 180) + (betaRational * 120);

  // Aggiorna e ripulisce gli impulsi ondulatori del click
  for (let i = actionPotentials.length - 1; i >= 0; i--) {
    actionPotentials[i].radius += actionPotentials[i].speed;
    actionPotentials[i].life -= 0.02; // sfuma gradualmente
    if (actionPotentials[i].life <= 0) {
      actionPotentials[i].radius = 0;
      actionPotentials.splice(i, 1);
    }
  }

  // A. AREA LUMINOSA DI SFONDO (Aura e profondità cellulare)
  let auraGradient = drawingContext.createRadialGradient(centerX, centerY, 10, centerX, centerY, 230);
  auraGradient.addColorStop(0, 'rgba(236, 72, 153, 0.22)'); // Rosa caldo neon (Alpha)
  auraGradient.addColorStop(0.5, 'rgba(14, 165, 233, 0.08)'); // Tocco azzurro/celeste (Beta)
  auraGradient.addColorStop(1, 'rgba(8, 11, 30, 0)');
  
  drawingContext.fillStyle = auraGradient;
  noStroke();
  ellipse(centerX, centerY, 460, 460);

  // Tempo sincronizzato per l'animazione di oscillazione
  let t = frameCount * 0.006;

  // B. CALCOLO E PROIEZIONE 3D INTERATTIVA SUL CAMPO 2D
  push();
  translate(centerX, centerY);
  
  // Rotazione angolare tridimensionale guidata dal tempo e dal mouse
  let rY = t * 0.9;
  let rX = t * 0.5;
  
  let projectedPoints = [];
  for (let pt of spherePoints) {
    // Rotazione asse Y
    let x1 = pt.x * cos(rY) - pt.z * sin(rY);
    let z1 = pt.x * sin(rY) + pt.z * cos(rY);
    
    // Rotazione asse X
    let y2 = pt.y * cos(rX) - z1 * sin(rX);
    let z2 = pt.y * sin(rX) + z1 * cos(rX);
    
    // Deformazione cardiaca/sinaptica sinusoidale (Risonanza Organica)
    let waveOffset = sin(pt.id * 0.2 + t * 4) * 0.12 * alphaResonance;
    
    // Distorsione indotta se investito dall'onda del Potenziale d'azione
    let shockwavePush = 0;
    for (let ap of actionPotentials) {
      let dx = x1 * sphereRadius;
      let dy = y2 * sphereRadius;
      let dFromClickOrigin = dist(dx, dy, ap.x, ap.y);
      let distDiff = abs(dFromClickOrigin - ap.radius);
      if (distDiff < 30) {
        shockwavePush = map(distDiff, 0, 30, 0.28 * ap.life, 0);
      }
    }
    
    let rCur = sphereRadius * (1.0 + waveOffset + shockwavePush);
    
    projectedPoints.push({
      x: x1 * rCur,
      y: y2 * rCur,
      z: z2,
      id: pt.id
    });
  }

  // C. DISEGNO DEI FILAMENTI ASSONICI CHE DIRAMANO (Image 2 Style - Glowing Axons)
  noFill();
  let dendriteCount = Math.floor(14 + (alphaResonance * 16) + (betaRational * 8));
  for (let d = 0; d < dendriteCount; d++) {
    let baseAngle = map(d, 0, dendriteCount, 0, TWO_PI) + (t * 0.4);
    
    beginShape();
    let steps = 15;
    for (let s = 0; s < steps; s++) {
      let stepProgress = s / (steps - 1);
      let currentDist = stepProgress * (sphereRadius * 2.1);
      
      // Calcolo del percorso sinuoso guidato da p5 noise + attrazione magnetica verso il mouse
      let noiseVal = noise(d * 12 + sin(stepProgress * 1.5), stepProgress * 1.5 - t * 2.0) - 0.5;
      
      // Calcola l'angolo d'attrazione verso il mouse se presente all'interno del cerchio
      let angle = baseAngle + (noiseVal * 1.8 * (0.35 + alphaResonance * 0.65));
      
      // Se c'è un impulso elettrico cliccato, l'assonome pulsa ritmicamente
      let clickWaveMod = 1.0;
      for (let ap of actionPotentials) {
        let waveDist = abs(currentDist - ap.radius);
        if (waveDist < 45) {
          clickWaveMod += map(waveDist, 0, 45, 0.4 * ap.life, 0);
        }
      }
      
      let dx = cos(angle) * currentDist * clickWaveMod;
      let dy = sin(angle) * currentDist * clickWaveMod;
      
      // Fusione colore: Arancione Copper/Neon al centro, Celeste Spaziale alle estremità
      let colCopper = color(249, 115, 22);
      let colCyan = color(14, 165, 233);
      let blendCol = lerpColor(colCopper, colCyan, stepProgress);
      
      let edgeFade = sin(stepProgress * PI);
      let lineAlpha = edgeFade * 135 * (0.45 + alphaResonance * 0.55);
      
      stroke(red(blendCol), green(blendCol), blue(blendCol), lineAlpha);
      strokeWeight((1.15 - stepProgress * 0.55) * clickWaveMod);
      vertex(dx, dy);
    }
    endShape();
  }

  // D. COSTRUZIONE DI TRIANGOLI DI RETICOLO GENERATIVO (Image 1 Style - Crystalline Constellations)
  let maxWires = Math.min(projectedPoints.length, 75);
  let faceChance = 0.3 + (betaRational * 0.45);
  
  for (let k = 0; k < maxWires; k++) {
    let pA = projectedPoints[k];
    
    for (let m = k + 1; m < Math.min(k + 4, maxWires); m++) {
      let pB = projectedPoints[m];
      let dAB = dist(pA.x, pA.y, pB.x, pB.y);
      
      if (dAB < 55) {
        for (let n = m + 1; n < Math.min(m + 4, maxWires); n++) {
          let pC = projectedPoints[n];
          let dBC = dist(pB.x, pB.y, pC.x, pC.y);
          let dAC = dist(pA.x, pA.y, pC.x, pC.y);
          
          if (dBC < 55 && dAC < 55 && random(1) < faceChance) {
            noStroke();
            let avgZ = (pA.z + pB.z + pC.z) / 3.0;
            let opacity = map(avgZ, -1, 1, 3, 24);
            
            if (alphaResonance > betaRational) {
              fill(236, 72, 153, opacity * 0.85); // Bagliore Caldo Rosa
            } else {
              fill(139, 192, 255, opacity * 0.8);  // Bagliore Stellare Celeste
            }
            triangle(pA.x, pA.y, pB.x, pB.y, pC.x, pC.y);
          }
        }
      }
    }
  }

  // E. DISEGNO DEI COLLEGAMENTI ASSONICI AD AGO (Linee di Rete Sottili)
  strokeWeight(0.75);
  for (let k = 0; k < maxWires; k++) {
    let pA = projectedPoints[k];
    for (let m = k + 1; m < Math.min(k + 4, maxWires); m++) {
      let pB = projectedPoints[m];
      let d = dist(pA.x, pA.y, pB.x, pB.y);
      let threshold = 50 + (alphaResonance * 35);
      
      // Le onde d'urto del click aumentano temporaneamente a dismura il range delle connessioni
      for (let ap of actionPotentials) {
        let avgD = (dist(pA.x, pA.y, ap.x, ap.y) + dist(pB.x, pB.y, ap.x, ap.y)) / 2;
        if (abs(avgD - ap.radius) < 25) {
          threshold += 40 * ap.life;
        }
      }
      
      if (d < threshold) {
        let opacity = map(d, 0, threshold, 140 * (0.35 + alphaResonance * 0.65), 0);
        stroke(255, 255, 255, opacity);
        line(pA.x, pA.y, pB.x, pB.y);
      }
    }
  }

  // F. DISEGNO DEI CORPI CELLULARI NEURONALI VIBRANTI (Image 3 Style - Somi e Spore)
  drawingContext.shadowBlur = 15;
  drawingContext.shadowColor = 'rgba(236, 72, 153, 0.65)';
  
  for (let i = 0; i < projectedPoints.length; i++) {
    let val = projectedPoints[i];
    
    // Disegna solo una parte per pulizia visiva, privilegiando quelli davanti (z superiore)
    if (i % 8 === 0) {
      let isFront = val.z > -0.2;
      let depthOpacity = map(val.z, -1, 1, 35, 255);
      
      let cellColor = color(236, 72, 153); // Colore Rosa Neon
      if (i % 24 === 0) {
        cellColor = color(249, 115, 22);  // Arancione caldo Copper (Image 3)
      } else if (i % 16 === 0) {
        cellColor = color(45, 212, 191);   // Verde Smeraldo / Teal
      }
      
      let rColors = red(cellColor);
      let gColors = green(cellColor);
      let bColors = blue(cellColor);
      
      // 1. Concentrated Cell Halos (Aloni luminosi)
      noStroke();
      fill(rColors, gColors, bColors, depthOpacity * 0.16);
      ellipse(val.x, val.y, 22 + sin(t * 5 + i) * 5, 22 + sin(t * 5 + i) * 5);
      fill(rColors, gColors, bColors, depthOpacity * 0.4);
      ellipse(val.x, val.y, 11, 11);
      
      // 2. High brightness Nucleo
      fill(255, 255, 255, depthOpacity * 0.95);
      ellipse(val.x, val.y, 4, 4);
      
      // 3. Spiky Neurites (micro-spine sottili dei neuroni biologici)
      stroke(rColors, gColors, bColors, depthOpacity * 0.55);
      strokeWeight(0.6);
      let spikes = 5;
      for (let s = 0; s < spikes; s++) {
        let sAngle = map(s, 0, spikes, 0, TWO_PI) + (t * 2) + i;
        let sLength = 8 + noise(i, s) * 12 * (1.0 + alphaResonance * 0.4);
        line(val.x, val.y, val.x + cos(sAngle) * sLength, val.y + sin(sAngle) * sLength);
      }
    }
  }
  
  // G. RAPPRESENTAZIONE GRAFICA VISIBILE DELL'ONDA DEL POTENZIALE D'AZIONE (Click wave ripple ring)
  for (let ap of actionPotentials) {
    noFill();
    stroke(255, 255, 255, ap.life * 180);
    strokeWeight(1.5 + ap.life * 2.5);
    drawingContext.shadowBlur = 20;
    drawingContext.shadowColor = 'rgba(14, 165, 233, 0.9)';
    ellipse(ap.x, ap.y, ap.radius * 2, ap.radius * 2);
  }
  
  // Ripristina l'effetto Glow a zero per non appesantire il rendering del testo
  drawingContext.shadowBlur = 0;

  // H. NODI COGNITIVI ESTERNI ORBITANTI
  for (let p of particles) {
    p.angle += p.speed;
    p.pulse += 0.04;
    
    let animatedDistance = p.distance * (1 + sin(p.pulse) * 0.025);
    let px = cos(p.angle) * animatedDistance;
    let py = sin(p.angle) * animatedDistance;
    
    let brightness = map(sin(p.pulse), -1, 1, 120, 255);
    fill(255, 255, 255, brightness);
    noStroke();
    ellipse(px, py, p.size, p.size);
  }
  pop();
  
  // 4. DISEGNA L'INTERFACCIA INFORMATIVA INFERIORE (HUD)
  fill(5, 8, 22, 235); // Sfondo scuro semitrasparente
  stroke(30, 41, 59, 200); // Bordo metallico
  strokeWeight(2);
  rect(15, 412, width - 30, 153, 14);
  
  noStroke();
  fill(255);
  textFont('monospace');
  
  // Titolo HUD con stile neon
  textSize(12);
  textStyle(BOLD);
  fill(255);
  text("CONCEPT // SFERA SINAPTICA", 32, 439);
  
  // Indicatori Metrici Dinamici dipendenti da MouseX e MouseY
  textSize(8.5);
  textStyle(NORMAL);
  fill(148, 163, 184); // slate-400
  text("REPULSION FIELD: " + (resonanceFreq.toFixed(1)) + " HZ   SYSTEM STABILITY: ONLINE", 32, 458);
  
  // 5. GAUGES INTERATTIVI ANIMATI SUL CANVAS (Progress Bars per Alpha e Beta)
  drawHUDGauge(32, 472, 175, 7, alphaResonance, "ALPHA RESONANCE", color(236, 72, 153)); // Rosa (Alpha)
  drawHUDGauge(240, 472, 175, 7, betaRational, "BETA RATIONAL", color(14, 165, 233));    // Celeste (Beta)

  // Separatore d'aspetto HUD
  stroke(30, 41, 59, 130);
  strokeWeight(1);
  line(32, 497, width - 32, 497);
  
  // Citazione poetica dinamica
  noStroke();
  textStyle(ITALIC);
  fill(236, 72, 153); // Rosa Neon
  textSize(8.2);
  text("IL CREPUSCOLO ACCAREZZA LA SOGLIA DEL SALUTO, OLTRE IL RIGORE", 32, 516);
  text("DEL GIORNO NELL'ACCOGLIENZA DELL'OMBRA - CLICCA PER ATTIVARE IL SOMA.", 32, 528);
  
  // Autore e Firma
  fill(14, 165, 233); // Celeste Cielo
  textStyle(BOLD);
  textSize(8.5);
  text("FIRMATARIO INSTALLAZIONE: PRISCILLA PALOMBO // BELLE ARTI", 32, 550);
}

// Funzione ausiliaria per mappare i progressi ed i valori sulla barra HUD
function drawHUDGauge(x, y, w, h, val, label, col) {
  noStroke();
  fill(15, 23, 42); // Sfondo barra scuro
  rect(x, y + 10, w, h, 2);
  
  fill(col);
  rect(x, y + 10, w * val, h, 2);
  
  // Scritta etichetta sopra la barra
  fill(148, 163, 184);
  textSize(7.2);
  textStyle(BOLD);
  text(label + ": " + (val * 100).toFixed(0) + "%", x, y + 6);
}

// Interazione click: sprigiona un Potenziale d'azione sulla sfera
function mousePressed() {
  if (mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height) {
    // Calcola le coordinate relative all'origine centrata della sfera (centerX, centerY)
    let rx = mouseX - width / 2;
    let ry = mouseY - 225;
    
    actionPotentials.push({
      x: rx,
      y: ry,
      radius: 5,
      speed: 7.5,
      life: 1.0
    });
  }
}
