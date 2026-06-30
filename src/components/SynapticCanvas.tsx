import { useEffect, useRef, useState } from "react";
import p5 from "p5";
import { SynapticResponse, InstallationState } from "../types";

interface SynapticCanvasProps {
  textInput: string;
  synapticData: SynapticResponse | null;
  activeState: InstallationState;
  onSaveCanvasReady?: (saveFn: () => void) => void;
  activeAlpha: number;
  activeBeta: number;
  activeComplexity: number;
  activeGlitch: number;
  className?: string;
}

export default function SynapticCanvas({
  textInput,
  synapticData,
  activeState,
  onSaveCanvasReady,
  activeAlpha,
  activeBeta,
  activeComplexity,
  activeGlitch,
  className,
}: SynapticCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const p5InstanceRef = useRef<p5 | null>(null);

  // Keep all props synchronized into a mutable ref so the 60fps p5 loop
  // has immediate, non-blocking access without creating closure-stales or triggering rebuilds.
  const propsRef = useRef({ textInput, synapticData, activeState, activeAlpha, activeBeta, activeComplexity, activeGlitch });
  const onSaveRef = useRef(onSaveCanvasReady);

  useEffect(() => {
    propsRef.current = { textInput, synapticData, activeState, activeAlpha, activeBeta, activeComplexity, activeGlitch };
  }, [textInput, synapticData, activeState, activeAlpha, activeBeta, activeComplexity, activeGlitch]);

  useEffect(() => {
    onSaveRef.current = onSaveCanvasReady;
  }, [onSaveCanvasReady]);

  useEffect(() => {
    if (!containerRef.current) return;

    // Define coordinates of points
    let points: { dir: p5.Vector; lon: number; lat: number }[] = [];
    let sphereRadius = 145; 
    const stepResolutionRaggi = 24;
    const stepResolutionCerchi = 12;

    // Orbit Rotations (made faster and more dynamic for organic life-like aesthetic)
    let rotX = 0;
    let rotY = 0;
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let transitionProgress = 0; // Smooth interpolator between 0 (stasis/idle) and 1 (active/engaged)
    let activeTime = 0; // Accumulates only when active
    let currentHarmonicFreq = 3.0;
    let currentStepGrid = 10.0;

    // Matrix background lines
    let backgroundLines: {
      x: number;
      y: number;
      speed: number;
      text: string;
    }[] = [];

    // Ambient floating particles
    let connectionParticles: {
      pos: p5.Vector;
      vel: p5.Vector;
      color: number[];
      alpha: number;
    }[] = [];

    // Premium interactive orbital trail particles
    let trailParticles: {
      theta: number;
      phi: number;
      radius: number;
      speedTheta: number;
      speedPhi: number;
      size: number;
      life: number;
      maxLife: number;
      color: number[];
    }[] = [];

    let prevRotX = 0;
    let prevRotY = 0;

    // Glowing particles that represent thought fragments assembling the word/phrase
    let lastActiveWord = "";
    let textFadeProgress = 0;

    const initSpherePoints = (p: p5) => {
      points = [];
      for (let i = 0; i <= stepResolutionCerchi; i++) {
        let lat = p.map(i, 0, stepResolutionCerchi, -p.HALF_PI, p.HALF_PI);
        for (let j = 0; j < stepResolutionRaggi; j++) {
          let lon = p.map(j, 0, stepResolutionRaggi, 0, p.TWO_PI);
          points.push({
            dir: p.createVector(
              p.cos(lat) * p.cos(lon),
              p.cos(lat) * p.sin(lon),
              p.sin(lat)
            ),
            lon,
            lat,
          });
        }
      }
    };

    const sketch = (p: p5) => {
      p.setup = () => {
        const width = containerRef.current?.clientWidth || 600;
        const height = containerRef.current?.clientHeight || 600;
        const canvas = p.createCanvas(width, height);
        canvas.id("synaptic-p5-canvas");
        p.textAlign(p.CENTER, p.CENTER);
        
        initSpherePoints(p);

        // Fill custom technological background matrices
        const textOptions = [
          "NEURAL_RESONANCE_V53",
          "SYNAPSE_GRID_ACTIVE",
          "LATENT_WEIGHT_VECTOR",
          "CROSS_ENTROPY_GRADIENT",
          "ALPHA_OSCILLATOR_PUMP",
          "BETA_DATA_QUANTIZER",
          "STOCHASTIC_DECAY"
        ];
        for (let i = 0; i < 20; i++) {
          backgroundLines.push({
            x: p.random(width * 0.05, width * 0.95),
            y: p.random(height * 0.1, height * 0.9),
            speed: p.random(0.18, 0.45),
            text: p.random(textOptions),
          });
        }

        // Provide the canvas save callback back to parent React component
        if (onSaveRef.current) {
          onSaveRef.current(() => {
            const label = propsRef.current.synapticData?.archetype?.replace(/\s+/g, "_") || "INSTALLATION";
            p.saveCanvas(`INTERCONNESSIONI_${label}_${Date.now()}`, "png");
          });
        }
      };

      p.draw = () => {
        const { synapticData, textInput, activeState, activeAlpha, activeBeta, activeComplexity, activeGlitch } = propsRef.current;
        const isRepertoState = activeState === "REPERTO" || activeState === "SALVATAGGIO";

        const currentWidth = p.width;
        const currentHeight = p.height;

        // Calculate sphere radius dynamically according to available container sizes and active state
        const radiusScale = isRepertoState ? 0.44 : 0.26;
        const baseRadius = Math.min(currentWidth, currentHeight) * radiusScale;
        const maxRadius = isRepertoState ? 340 : 136;
        sphereRadius = Math.max(80, Math.min(maxRadius, baseRadius));

        // Apply a solid opaque blend layer using a full-screen polygon
        // to prevent OS/browser GPU compositor alpha flickering, while retaining beautiful trails.
        p.noStroke();
        p.fill(2, 4, 12, 28); // Matches the deep cinematic canvas background
        p.rect(0, 0, currentWidth, currentHeight);

        // Visual Coordinates and metrics
        const alpha = activeAlpha;
        const beta = activeBeta;
        const complexity = activeComplexity;
        const glitch = activeGlitch;

        const hasInputText = textInput.trim().length > 0;
        const isExperienceActive = hasInputText || isRepertoState;
        
        // Butter-smooth transition between States
        const targetProgress = isExperienceActive ? 1.0 : 0.0;
        transitionProgress = p.lerp(transitionProgress, targetProgress, 0.05); // Smooth 5% transition per frame (~0.3 seconds)
        activeTime += transitionProgress;

        // Dynamic Rotational Velocity
        if (!isDragging) {
          // 1. Idle rotation speed - zero (as requested)
          const idleSpeedX = 0;
          const idleSpeedY = 0;

          // 2. Active rotation speed from typed word
          let textVelocityX = 0;
          let textVelocityY = 0;
          if (textInput.length > 0) {
            for (let i = 0; i < textInput.length; i++) {
              const code = textInput.charCodeAt(i);
              textVelocityX += p.sin(code * 1.57 + i * 0.5) * 0.002;
              textVelocityY += p.cos(code * 2.11 + i * 0.33) * 0.002;
            }
          }
          
          const speedMultiplier = 0.05 + (complexity * 0.02); // Slower, calmer rotation
          const activeSpeedX = (0.0001 + (textVelocityX / Math.max(1, textInput.length)) + (alpha * 0.0002)) * speedMultiplier;
          const activeSpeedY = (0.0002 + (textVelocityY / Math.max(1, textInput.length)) + (beta * 0.0002)) * speedMultiplier;

          // Interpolate the actual rotation velocity
          const currentSpeedX = p.lerp(idleSpeedX, activeSpeedX, transitionProgress);
          const currentSpeedY = p.lerp(idleSpeedY, activeSpeedY, transitionProgress);

          rotX += currentSpeedX;
          rotY += currentSpeedY;
        }

        // Real-time sphere angular rotation speed tracking
        let dRotX = rotX - prevRotX;
        let dRotY = rotY - prevRotY;
        // Avoid artifact jumps when dragging wraps or starts
        if (p.abs(dRotX) > 0.4) dRotX = 0.01;
        if (p.abs(dRotY) > 0.4) dRotY = 0.01;
        prevRotX = rotX;
        prevRotY = rotY;
        const rotationSpeed = p.sqrt(dRotX * dRotX + dRotY * dRotY);

        // 1. Draw elegant background starry dust and architectural caliper indicators
        p.noStroke();
        p.textSize(8);
        p.textFont("JetBrains Mono, monospace");

        for (let star of backgroundLines) {
          const isLeft = star.x < currentWidth / 2;
          const starAlpha = 20 + p.sin(p.frameCount * 0.02 + star.y) * 12;
          const starSize = isLeft ? 1.0 : 1.5;
          const rLine = isLeft ? 10 : 255;
          const gLine = isLeft ? 220 : 40;
          const bLine = isLeft ? 255 : 60;

          // Gentle ambient stardust nodes
          p.fill(rLine, gLine, bLine, starAlpha * 1.5);
          p.ellipse(star.x, star.y, starSize, starSize);

          star.y += star.speed * 0.3;
          if (star.y > currentHeight) {
            star.y = 0;
            star.x = p.random(currentWidth);
          }
        }

        // Draw split divider lines with subtle pulsing glow (Only during INTERAZIONE state)
        if (activeState === "INTERAZIONE") {
          p.stroke(255, 255, 255, 6 + p.sin(activeTime * 0.05) * 4);
          p.strokeWeight(1);
          p.line(currentWidth / 2, currentHeight * 0.15, currentWidth / 2, currentHeight * 0.85);
        }

        // 2. Draw Synaptic Particle Bursts 
        if (textInput.length > 0 && p.random(100) < 8) {
          const col = alpha > beta ? [244, 63, 145] : [139, 192, 255];
          connectionParticles.push({
            pos: p.createVector(currentWidth / 2 + p.random(-25, 25), currentHeight / 2 + p.random(-25, 25)),
            vel: p5.Vector.random2D().mult(p.random(1.2, 3.5)),
            color: col,
            alpha: 220,
          });
        }

          for (let i = connectionParticles.length - 1; i >= 0; i--) {
            const cp = connectionParticles[i];
            cp.pos.add(cp.vel);
            cp.alpha -= 5;
            p.stroke(cp.color[0], cp.color[1], cp.color[2], cp.alpha);
            p.strokeWeight(2.5);
            p.point(cp.pos.x, cp.pos.y);
            if (cp.alpha <= 0) {
              connectionParticles.splice(i, 1);
            }
          }

          // 3. Render 3D geometric Neural Core/Sphere
          p.push();
          p.translate(currentWidth / 2, currentHeight / 2);

          const currentInputForGrid = isRepertoState ? textInput : "";
          const lenInput = currentInputForGrid.length > 0 ? currentInputForGrid.length : 1;
          
          const targetHarmonicFreq = p.map(lenInput % 30, 0, 29, 3, 11);
          const targetStepGrid = 10 + (lenInput % 12);

          currentHarmonicFreq = p.lerp(currentHarmonicFreq, targetHarmonicFreq, 0.04);
          currentStepGrid = p.lerp(currentStepGrid, targetStepGrid, 0.04);

          const harmonicFreq = currentHarmonicFreq;

          // A. DRAW INNER PULSATING CORE (Bio-Nucleus Seed)
          const corePulse = p.sin(activeTime * 0.06) * 8 + (alpha * 12);
          const coreRadius = 38 + corePulse;
          p.noFill();
          
          // Core energy aura
          for (let c = 0; c < 3; c++) {
            p.stroke(244, 63, 145, 45 - c * 15);
            p.strokeWeight(1.5);
            p.ellipse(0, 0, coreRadius * 2 - c * 10);
          }

          // Core geometric crosshairs or glowing nucleus dots
          p.stroke(139, 192, 255, 95);
          p.strokeWeight(2);
          p.line(-coreRadius - 5, 0, coreRadius + 5, 0);
          p.line(0, -coreRadius - 5, 0, coreRadius + 5);

          // Secondary core orbit beads
          const orbitAngle = activeTime * 0.02;
          p.fill(255, 230, 100);
          p.noStroke();
          p.ellipse(p.cos(orbitAngle) * coreRadius, p.sin(orbitAngle) * coreRadius, 5, 5);
          p.ellipse(p.cos(orbitAngle + p.PI) * coreRadius, p.sin(orbitAngle + p.PI) * coreRadius, 5, 5);

          // B. DRAW NESTED GYROSCOPIC CONSCIOUSNESS HALE RINGS
          // Halo 1: Intuition (X-Y tilt)
          p.noFill();
          p.strokeWeight(0.6);
          p.stroke(244, 63, 145, 60);
          p.push();
          p.rotate(activeTime * 0.008 + (alpha * 2));
          p.ellipse(0, 0, sphereRadius * 2.5, sphereRadius * 0.82);
          // Ring node bead
          p.fill(244, 63, 145, 200);
          p.noStroke();
          p.ellipse(p.cos(activeTime * 0.02) * (sphereRadius * 1.25), p.sin(activeTime * 0.02) * (sphereRadius * 0.41), 5, 5);
          p.pop();

          // Halo 2: Rationality/Logic (Diagonal tilt)
          p.noFill();
          p.stroke(139, 192, 255, 60);
          p.push();
          p.rotate(-activeTime * 0.012 - (beta * 1.5) + p.QUARTER_PI);
          p.ellipse(0, 0, sphereRadius * 2.3, sphereRadius * 0.6);
          // Ring node bead
          p.fill(139, 192, 255, 200);
          p.noStroke();
          p.ellipse(p.cos(-activeTime * 0.025) * (sphereRadius * 1.15), p.sin(-activeTime * 0.025) * (sphereRadius * 0.3), 5, 5);
          p.pop();

          // B2. ORGANIC BRANCHING AXONS & CURVED DENDRITES (Image 2 Style - Glowing Flow Lines)
          if (transitionProgress > 0.05) {
            p.noFill();
            // Higher Alpha (emotional/creative) or Complexity spawns more curving fibrous pathways
            const dendriteCount = Math.floor(14 + (alpha * 16) + (beta * 8));
            
            for (let d = 0; d < dendriteCount; d++) {
              // Distribute trajectories evenly in a circle with subtle time-drift orbit
              const baseAngle = p.map(d, 0, dendriteCount, 0, p.TWO_PI) + (activeTime * 0.0025);
              
              p.beginShape();
              const steps = 15;
              for (let s = 0; s < steps; s++) {
                const stepProgress = s / (steps - 1);
                // Extend outward up to ~2.2 times the sphere radius
                const currentDist = stepProgress * (sphereRadius * 2.2);
                
                // Alpha = fluid organic noise, Beta = rigid sharp angles
                const noiseScale = 1.8;
                const noiseVal = p.noise(d * 15 + p.sin(stepProgress * 1.5), stepProgress * noiseScale - (activeTime * 0.012)) - 0.5;
                
                // Alpha creates smooth wavy paths. Beta creates straight locked angles
                const fluidAngle = noiseVal * 2.5 * alpha;
                // Snap to 45 degree increments for Beta
                const rigidAngle = Math.round(noiseVal * 8) * (p.QUARTER_PI) * beta * 0.3; 
                
                const angle = baseAngle + fluidAngle + rigidAngle;
                
                const dx = p.cos(angle) * currentDist;
                const dy = p.sin(angle) * currentDist;
                
                // Dynamic gradient mapping: Golden-Copper/Orange center to neon Cyan/Teal extremes mapped to Alpha/Beta
                const rCore = 249;
                const gCore = 115;
                const bCore = 22;

                const totalB = alpha + beta + 0.001;
                const aRatio = alpha / totalB;
                const rOuter = 10 + aRatio * (255 - 10);
                const gOuter = 220 + aRatio * (40 - 220);
                const bOuter = 255 + aRatio * (60 - 255);

                // Linearly interpolate centers to axon extremity colors
                const rLine = rCore + stepProgress * (rOuter - rCore);
                const gLine = gCore + stepProgress * (gOuter - gCore);
                const bLine = bCore + stepProgress * (bOuter - bCore);
                
                // Fine-tune transparency curve (glowing core, taper alpha at edges, pulse based on complexity)
                const edgeFade = p.sin(stepProgress * p.PI);
                const lineAlpha = edgeFade * 175 * transitionProgress * (0.35 + alpha * 0.65);
                
                p.stroke(rLine, gLine, bLine, lineAlpha);
                p.strokeWeight(1.2 - stepProgress * 0.6); // elegant tapering of axon tips
                p.vertex(dx, dy);
              }
              p.endShape();
            }
          }

          // C. DRAW SURFACE MULTI-FREQUENCY MORPHING GEOMETRY (Woven Net & Twinkling Nodes - Highly Optimized)
          let renderedTransformedPoints: { x: number; y: number; z: number; color: number[] }[] = [];
          
          // Precalculate cached string characteristics outside the hot point-rotation loop
          let textCache: { val: number; isVowel: boolean; checkV5: boolean; marker: boolean }[] = [];
          if (isExperienceActive && textInput.length > 0) {
            const sliceCount = textInput.length;
            for (let idx = 0; idx < sliceCount; idx++) {
              const charChar = textInput[idx];
              const charValue = textInput.charCodeAt(idx);
              const charLower = charChar ? charChar.toLowerCase() : "";
              const isVowel = "aeiouàèìòù".includes(charLower);
              textCache.push({
                val: charValue,
                isVowel,
                checkV5: charValue % 5 === 0,
                marker: charValue >= 65 && charValue <= 90
              });
            }
          }

          // Precompute trig values for rotations, avoiding recalculation inside loop
          const cosRotY = p.cos(rotY);
          const sinRotY = p.sin(rotY);
          const cosRotX = p.cos(rotX);
          const sinRotX = p.sin(rotX);
          
          for (let i = 0; i < points.length; i++) {
            const pt = points[i];
            
            // 1. Calculate Stasis coordinates (with relaxing organic breathing pulse)
            const pulse = p.sin(activeTime * 0.02 + pt.lat * 3.0) * 0.03;
            const pulseFactor = 1.0 + pulse;
            const stasisX = pt.dir.x * sphereRadius * pulseFactor;
            const stasisY = pt.dir.y * sphereRadius * pulseFactor;
            const stasisZ = pt.dir.z * sphereRadius * pulseFactor;

            // 2. Calculate Active experience coordinates
            let activeX = stasisX;
            let activeY = stasisY;
            let activeZ = stasisZ;

            // Calculate active deformations dynamically (computed whenever progress is greater than stasis threshold)
            if (transitionProgress > 0.001) {
              const baseOrigX = pt.dir.x * sphereRadius;
              const baseOrigY = pt.dir.y * sphereRadius;
              const baseOrigZ = pt.dir.z * sphereRadius;

              // [BETA GEOMETRY]: Structured mechanical grid quantization (Voxel snapping)
              // Smoothly interpolates into structural digital cell blocks as beta increases
              const stepGrid = 8.0 + (1.0 - beta) * 28.0;
              const roundedX = Math.round(baseOrigX / stepGrid) * stepGrid;
              const roundedY = Math.round(baseOrigY / stepGrid) * stepGrid;
              const roundedZ = Math.round(baseOrigZ / stepGrid) * stepGrid;
              
              let bx = p.lerp(baseOrigX, roundedX, beta);
              let by = p.lerp(baseOrigY, roundedY, beta);
              let bz = p.lerp(baseOrigZ, roundedZ, beta);

              // Apply additional geometric pulsing factor depending on Beta level
              const betaFactor = 1.0 + p.sin(pt.lat * harmonicFreq + activeTime * 0.05) * (beta * 0.28);
              bx *= betaFactor;
              by *= betaFactor;
              bz *= betaFactor;

              // [ALPHA GEOMETRY]: Fluid wave morphing (with dual-octave Perlin-like wave ripples)
              const octave1 = p.sin(pt.lon * (harmonicFreq + 1.0) + activeTime * 0.05) * p.cos(pt.lat * harmonicFreq - activeTime * 0.045);
              const octave2 = p.sin(pt.lon * 3.0 - activeTime * 0.09) * p.cos(pt.lat * 4.0 + activeTime * 0.075) * 0.45;
              const waveDistortion = (octave1 + octave2) * (1.0 + glitch * 0.65);
              
              // Wave amplitude is directly and highly sensitive to alpha now, independent of complexity!
              const waveFactor = 1.0 + (waveDistortion * alpha * 1.55 * (0.35 + complexity * 0.95));
              
              let finalX = bx * waveFactor;
              let finalY = by * waveFactor;
              let finalZ = bz * waveFactor;

              // Apply organic polar twist rotation around Z/Y axis (Squeezes & Twists the sphere like a muscle)
              const twistAngle = alpha * 0.55 * p.sin(pt.lat * 2.0 + activeTime * 0.042);
              const cosT = p.cos(twistAngle);
              const sinT = p.sin(twistAngle);
              const tempX = finalX * cosT - finalZ * sinT;
              const tempZ = finalX * sinT + finalZ * cosT;
              finalX = tempX;
              finalZ = tempZ;

              // Store overall morphed active coordinates
              activeX = finalX;
              activeY = finalY;
              activeZ = finalZ;

              // Spelling-molded neural deformation (Typing shapes the biological structure uniquely)
              if (textCache.length > 0) {
                const letterIndex = Math.floor(p.map(pt.lon, 0, p.TWO_PI, 0, textCache.length)) % textCache.length;
                const cached = textCache[letterIndex];
                let charMutation = 1.0;
                
                if (cached.isVowel) {
                  const vowelWaveFreq = cached.checkV5 ? 0.07 : 0.035;
                  charMutation += p.sin(pt.lat * 5.0 + activeTime * vowelWaveFreq) * 0.26 * (cached.val / 122.0);
                } else {
                  const consSlices = (cached.val % 8) + 3;
                  charMutation += p.cos(pt.lat * consSlices - activeTime * 0.045) * 0.18 + p.sin(pt.lon * 4.0) * 0.1;
                  if (cached.val % 4 === 0) {
                    charMutation *= 1.15;
                  }
                }
                
                if (cached.marker) {
                  charMutation += p.sin(pt.lat * 10.0 + activeTime * 0.02) * 0.35;
                }
                
                activeX *= charMutation;
                activeY *= charMutation;
                activeZ *= charMutation;
              }
            }

            // 3. Fluid state transition interpolation (Eliminates the "scatto" completely)
            let synX = p.lerp(stasisX, activeX, transitionProgress);
            let synY = p.lerp(stasisY, activeY, transitionProgress);
            let synZ = p.lerp(stasisZ, activeZ, transitionProgress);
            
            // 3D Rotations around Axis (Optimized using pre-computed trig values)
            let xRotated = synX * cosRotY - synZ * sinRotY;
            let zRotated = synX * sinRotY + synZ * cosRotY;
            let yRotated = synY * cosRotX - zRotated * sinRotX;
            let zFinal = synY * sinRotX + zRotated * cosRotX;

            // Depth color calculation: Clear Physical Hemispheres Split!
            let finalColorR = 90;
            let finalColorG = 130;
            let finalColorB = 255;

            if (isExperienceActive) {
              const isRightSide = pt.dir.x >= 0;
              const alphaDominant = alpha > beta;
              
              if (isRightSide) {
                // Right hemisphere (Alpha creative / warm fuchsia)
                const brightFactor = alphaDominant ? 1.05 : 0.35;
                finalColorR = 244 * brightFactor;
                finalColorG = 63 * brightFactor;
                finalColorB = 145 * brightFactor;
                
                // Add minor golden tint if complexity is high
                if (complexity > 0.05) {
                  finalColorR = p.lerp(finalColorR, 249, p.min(0.5, complexity));
                  finalColorG = p.lerp(finalColorG, 115, p.min(0.5, complexity));
                }
              } else {
                // Left hemisphere (Beta logical / cold electric teal)
                const brightFactor = !alphaDominant ? 1.05 : 0.35;
                finalColorR = 14 * brightFactor;
                finalColorG = 165 * brightFactor;
                finalColorB = 233 * brightFactor;
                
                // Add minor royal violet if glitch is high
                if (glitch > 0.05) {
                  finalColorR = p.lerp(finalColorR, 124, p.min(0.5, glitch));
                  finalColorB = p.lerp(finalColorB, 237, p.min(0.5, glitch));
                }
              }

              // Apply organic depth shading
              const depthFade = p.map(zFinal, -sphereRadius, sphereRadius, 0.4, 1.0);
              finalColorR *= depthFade;
              finalColorG *= depthFade;
              finalColorB *= depthFade;
            } else {
              // Standby/welcome state split brain rendering
              const isRightSide = pt.dir.x >= 0;
              if (isRightSide) {
                finalColorR = 244;
                finalColorG = 63;
                finalColorB = 145;
              } else {
                finalColorR = 14;
                finalColorG = 165;
                finalColorB = 233;
              }
              
              // Soft, breathing wave intensity
              const intensity = 0.65 + p.sin(activeTime * 0.02 + pt.lat * 2.0) * 0.22;
              const depthFade = p.map(zFinal, -sphereRadius, sphereRadius, 0.4, 1.0) * intensity;
              finalColorR = p.constrain(finalColorR * depthFade, 0, 255);
              finalColorG = p.constrain(finalColorG * depthFade, 0, 255);
              finalColorB = p.constrain(finalColorB * depthFade, 0, 255);
            }

            // Electro-glitch flare on noise thresholds
            const noiseVal = p.noise(pt.dir.x * 2.5, pt.dir.y * 2.5, activeTime * 0.05);
            if (glitch > 0.02 && noiseVal < glitch * 0.45) {
              finalColorR = alpha > 0.5 ? 255 : 45;
              finalColorG = 244;
              finalColorB = 255;
              
              // Pulsate normal coordinates outwards elegantly during glitch spark
              const pulse = p.sin(activeTime * 0.15 + pt.lat * 9.0) * (glitch * 42.0);
              xRotated += pt.dir.x * pulse;
              yRotated += pt.dir.y * pulse;
            }

            renderedTransformedPoints.push({
              x: xRotated,
              y: yRotated,
              z: zFinal,
              color: [finalColorR, finalColorG, finalColorB]
            });
          }

          // D. DRAW DYNAMIC ALGORITHMIC MERCATOR RIBBONS (Continuous latitude flow line curves)
          p.noFill();
          const totalB = alpha + beta + 0.001;
          const aRatio = alpha / totalB;
          // Beta (cold/cyan/white) vs Alpha (warm/red/magenta)
          const rBaseRib = 10 + aRatio * (255 - 10);
          const gBaseRib = 220 + aRatio * (40 - 220);
          const bBaseRib = 255 + aRatio * (60 - 255);

          for (let latIdx = 0; latIdx <= stepResolutionCerchi; latIdx += 2) {
            p.beginShape();
            const waveShift = p.sin(latIdx * 0.4 + activeTime * 0.04) * 0.25 + 0.5;
            const finalR = rBaseRib;
            const finalG = gBaseRib;
            const finalB = bBaseRib;

            p.stroke(finalR, finalG, finalB, 65 + (alpha * 85));
            p.strokeWeight(1.2);
            
            let firstPt: typeof renderedTransformedPoints[0] | null = null;
            for (let rIdx = 0; rIdx < stepResolutionRaggi; rIdx++) {
              const ptIdx = latIdx * stepResolutionRaggi + rIdx;
              if (ptIdx >= renderedTransformedPoints.length) break;
              
              const pt3D = renderedTransformedPoints[ptIdx];
              if (!firstPt) firstPt = pt3D;
              p.vertex(pt3D.x, pt3D.y);
            }
            if (firstPt) {
              p.vertex(firstPt.x, firstPt.y); // Close latitude ring loop perfectly to avoid gaps
            }
            p.endShape();
          }

          // E. DRAW INDIVIDUAL CYBERNETIC SYNAPSE NODES & VIBRANT SOMA CELLS (Image 3 Style)
          let rendered2DPoints: p5.Vector[] = [];
          for (let i = 0; i < renderedTransformedPoints.length; i++) {
            const pt3D = renderedTransformedPoints[i];
            
            p.stroke(pt3D.color[0], pt3D.color[1], pt3D.color[2], p.map(pt3D.z, -sphereRadius, sphereRadius, 60, 240));
            // Nodes vary in size on complexity and rhythmic beats
            const sizeMod = (i % 8 === 0) ? 4.2 + (complexity * 2.2) : 1.4;
            p.strokeWeight(sizeMod);
            p.point(pt3D.x, pt3D.y);

            // Store nodes that are in the foreground to draw connecting sub-constellations
            if (i % 3 === 0 && pt3D.z > -30) {
              rendered2DPoints.push(p.createVector(pt3D.x, pt3D.y, pt3D.z));
            }

            // High-fidelity vibrant neural bodies (Splatter/Soma cells in Image 3)
            if (i % 16 === 0 && transitionProgress > 0.05) {
              const zOpacity = p.map(pt3D.z, -sphereRadius, sphereRadius, 50, 255);
              const cellAlpha = zOpacity * transitionProgress;
              
              const cellRatio = (i % 48) / 48.0;
              const r = 14 + cellRatio * (244 - 14) + (alpha * 20);
              const g = 165 + (1 - cellRatio) * (63 - 165) + (beta * 40);
              const b = 233 + cellRatio * (145 - 233) * (0.5 + complexity * 0.5);
              
              // 1. Double concentric halo/glow layers (concentric transparency blur)
              p.noStroke();
              p.fill(r, g, b, cellAlpha * 0.15);
              p.ellipse(pt3D.x, pt3D.y, 22 + p.sin(activeTime * 0.08 + i) * 6, 22 + p.sin(activeTime * 0.08 + i) * 6);
              p.fill(r, g, b, cellAlpha * 0.35);
              p.ellipse(pt3D.x, pt3D.y, 11, 11);
              
              // 2. Bright high-contrast nucleus core
              p.fill(255, 255, 255, cellAlpha * 0.95);
              p.ellipse(pt3D.x, pt3D.y, 4, 4);
              
              // 3. Fine spiky neurites extending outwards from each vibrant body (Organic threads in Image 3)
              p.stroke(r, g, b, cellAlpha * 0.45);
              p.strokeWeight(0.65);
              const spikeCount = 6;
              const globalAngleOffset = activeTime * 0.01;
              for (let s = 0; s < spikeCount; s++) {
                const sAngle = p.map(s, 0, spikeCount, 0, p.TWO_PI) + globalAngleOffset + (p.noise(i, s) * 0.5);
                const len = (10 + p.noise(i * 1.5, s * 2.2) * 14) * (1.0 + alpha * 0.4);
                p.line(pt3D.x, pt3D.y, pt3D.x + p.cos(sAngle) * len, pt3D.y + p.sin(sAngle) * len);
              }
            }
          }

          // F. DRAW INTER-CONE STELLAR PATHWAY CONSTELLATIONS & SHADED TRIPLETS (Image 1 Style)
          p.strokeWeight(0.75);
          const drawLinesCount = Math.min(rendered2DPoints.length, 75);
          
          // Step 1: Draw triangular mesh faces (Image 1 wireframe shaded planes)
          if (transitionProgress > 0.1) {
            // High logic (Beta) or aesthetic complexity leads to more shaded mesh polygons
            const faceChance = 0.35 + (beta * 0.4); 
            for (let k = 0; k < Math.min(drawLinesCount, 40); k++) {
              const pA = rendered2DPoints[k];
              for (let m = k + 1; m < Math.min(k + 4, drawLinesCount); m++) {
                const pB = rendered2DPoints[m];
                const dAB = p5.Vector.dist(pA, pB);
                if (dAB < 50) {
                  for (let n = m + 1; n < Math.min(m + 4, drawLinesCount); n++) {
                    const pC = rendered2DPoints[n];
                    const dBC = p5.Vector.dist(pB, pC);
                    const dAC = p5.Vector.dist(pA, pC);
                    
                    if (dBC < 50 && dAC < 50 && p.random(1.0) < faceChance) {
                      p.noStroke();
                      // Calculate depth-based opacity
                      const avgZ = (pA.z + pB.z + pC.z) / 3.0;
                      const opacity = p.map(avgZ, -sphereRadius, sphereRadius, 3, 26) * transitionProgress;
                      
                      // Dynamic continuous spectrum mapping for triangular mesh planes
                      const rFill = 14 + aRatio * (244 - 14);
                      const gFill = 165 + aRatio * (63 - 165);
                      const bFill = 233 + aRatio * (145 - 233);
                      p.fill(rFill, gFill, bFill, opacity * 0.65);
                      p.triangle(pA.x, pA.y, pB.x, pB.y, pC.x, pC.y);
                    }
                  }
                }
              }
            }
          }

          // Step 2: Draw the connection wire lines (Thin axonal paths)
          for (let k = 0; k < drawLinesCount; k++) {
            const pA = rendered2DPoints[k];
            for (let m = k + 1; m < Math.min(k + 5, drawLinesCount); m++) {
              const pB = rendered2DPoints[m];
              const d = p5.Vector.dist(pA, pB);
              const maxDist = 48 + (alpha * 38);
              if (d < maxDist) {
                const mapOpacity = p.map(d, 0, maxDist, 190 * (isExperienceActive ? (0.3 + alpha * 0.7) : 0.5), 0);
                p.stroke(255, 255, 255, mapOpacity * transitionProgress);
                p.line(pA.x, pA.y, pB.x, pB.y);
              }
            }
          }

          // G. DYNAMIC HALO & ROTATIONAL TRAIL PARTICLES (Net Art Interactive Scie)
          // Spawning Rate and Parameters based on rotationSpeed, Alpha & Beta
          const baseSpawnChance = 0.28 + (rotationSpeed * 5.5); // higher chance on active rotation
          const spawnQty = p.random(100) < (baseSpawnChance * 100) ? Math.floor(p.random(1, 4 + (complexity * 2))) : 0;
          
          for (let s = 0; s < spawnQty; s++) {
            // Spawn near sphere surface (radius ~ 145)
            const pRadius = sphereRadius + p.random(-18, 35);
            const pTheta = p.random(-p.HALF_PI, p.HALF_PI);
            const pPhi = p.random(0, p.TWO_PI);
            
            // Speed vectors in spherical coordinates
            // Creative Dominance (Alpha) -> fluid, fast tangential oscillations
            // Logical Dominance (Beta) -> rigid orbits
            const speedTheta = (p.random(-0.012, 0.012) + (alpha * p.random(-0.02, 0.02))) * (1.0 + rotationSpeed * 3.0);
            const speedPhi = (p.random(-0.015, 0.015) + (beta * p.random(-0.01, 0.01)) + (alpha * p.random(0.01, 0.03))) * (1.0 + rotationSpeed * 3.0);
            
            // Interpolate particle color based on alpha/beta balance
            const rColor = p.lerp(10, 255, alpha);
            const gColor = p.lerp(220, 20, alpha);
            const bColor = p.lerp(255, 60, alpha);
            
            trailParticles.push({
              theta: pTheta,
              phi: pPhi,
              radius: pRadius,
              speedTheta,
              speedPhi,
              size: p.random(1.8, 4.5 + (complexity * 1.5)),
              life: 255,
              maxLife: p.random(160, 240),
              color: [rColor, gColor, bColor]
            });
          }

          // Update & render trail particles
          for (let i = trailParticles.length - 1; i >= 0; i--) {
            const tp = trailParticles[i];
            
            // Increment angular positions
            tp.theta += tp.speedTheta;
            tp.phi += tp.speedPhi;
            
            // Expand radially outwards when spinning fast (kinetic inertia effect)
            if (rotationSpeed > 0.015) {
              tp.radius += rotationSpeed * 5.0;
              tp.size *= 0.982; // fade out fast as they disperse
            }
            
            // Organic low-frequency wave drift using p5 Noise
            const noiseAdd = p.noise(tp.phi * 1.8, tp.theta * 1.8, activeTime * 0.03) - 0.5;
            tp.phi += noiseAdd * 0.006;
            
            // Convert Spherical to absolute Cartesian 3D coord
            const xOrig = tp.radius * p.cos(tp.theta) * p.cos(tp.phi);
            const yOrig = tp.radius * p.cos(tp.theta) * p.sin(tp.phi);
            const zOrig = tp.radius * p.sin(tp.theta);
            
            // Perform identical transformations as the main 3D sphere so particles correspond in 3D perspective
            let xRotated = xOrig * p.cos(rotY) - zOrig * p.sin(rotY);
            let zRotated = xOrig * p.sin(rotY) + zOrig * p.cos(rotY);
            let yRotated = yOrig * p.cos(rotX) - zRotated * p.sin(rotX);
            let zFinal = yOrig * p.sin(rotX) + zRotated * p.cos(rotX);
            
            const decay = 2.8 + (rotationSpeed * 2.2) - (alpha * 0.4);
            tp.life -= decay;
            if (tp.life <= 0) {
              trailParticles.splice(i, 1);
              continue;
            }
            
            // Depth visual attenuation
            const pAlpha = p.map(zFinal, -sphereRadius, sphereRadius, 35, 235) * (tp.life / 255);
            p.stroke(tp.color[0], tp.color[1], tp.color[2], pAlpha);
            p.strokeWeight(tp.size + p.sin(activeTime * 0.12 + i) * 1.0);
            p.point(xRotated, yRotated);
            
            // Draw visual lag connectors (scia luminosa line trails with lag)
            if (i % 3 === 0 && zFinal > -30) {
              p.stroke(tp.color[0], tp.color[1], tp.color[2], pAlpha * 0.35);
              p.strokeWeight(0.5);
              const lagTheta = tp.theta - tp.speedTheta * 2.5;
              const lagPhi = tp.phi - tp.speedPhi * 2.5;
              const lagRadius = tp.radius - 6;
              
              const xLagOrig = lagRadius * p.cos(lagTheta) * p.cos(lagPhi);
              const yLagOrig = lagRadius * p.cos(lagTheta) * p.sin(lagPhi);
              const zLagOrig = lagRadius * p.sin(lagTheta);
              
              let xLagRot = xLagOrig * p.cos(rotY) - zLagOrig * p.sin(rotY);
              let zLagRot = xLagOrig * p.sin(rotY) + zLagOrig * p.cos(rotY);
              let yLagRot = yLagOrig * p.cos(rotX) - zLagRot * p.sin(rotX);
              
              p.line(xRotated, yRotated, xLagRot, yLagRot);
            }
          }

          p.pop();

          // Typographical Assembled Text removed from canvas to avoid overlapping with the sphere and QR code,
          // and because it is already displayed in the UI panel on the right.
      };

      // Tactile Input Handlers
      p.mousePressed = () => {
        // Direct click checks: restrict rotation handling within the canvas box
        if (synapticData && p.mouseX > 0 && p.mouseX < p.width && p.mouseY > 0 && p.mouseY < p.height) {
          isDragging = true;
          prevMouseX = p.mouseX;
          prevMouseY = p.mouseY;
        }
      };

      p.mouseDragged = () => {
        if (isDragging) {
          const deltaMousX = p.mouseX - prevMouseX;
          const deltaMousY = p.mouseY - prevMouseY;
          rotY += deltaMousX * 0.003;
          rotX -= deltaMousY * 0.003;
          prevMouseX = p.mouseX;
          prevMouseY = p.mouseY;
        }
      };

      p.mouseReleased = () => {
        isDragging = false;
      };
    };

    // Instantiate p5 instance
    const p5Instance = new p5(sketch, containerRef.current);
    p5InstanceRef.current = p5Instance;

    // Resize observer configuration for perfect scale responsiveness with zero-cyclic-loop safety
    const resizeObserver = new ResizeObserver((entries) => {
      window.requestAnimationFrame(() => {
        if (!containerRef.current || !p5InstanceRef.current) return;
        try {
          for (let entry of entries) {
            // Check both entry and borderBox/contentRect values
            const { width, height } = entry.contentRect;
            // Prevent attempting to resize on 0 width/height (which locks up the p5/WebGL drawing engine)
            if (width > 20 && height > 20 && p5InstanceRef.current) {
              p5InstanceRef.current.resizeCanvas(width, height);
              initSpherePoints(p5InstanceRef.current);
            }
          }
        } catch (err) {
          console.warn("Resize event suppressed safely: ", err);
        }
      });
    });
    
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      if (p5InstanceRef.current) {
        try {
          p5InstanceRef.current.remove();
        } catch (e) {
          console.error("Error during p5 instance removal:", e);
        }
        p5InstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      id="canvas-container"
      className={className || "relative w-full h-[380px] md:h-full min-h-[300px] flex items-center justify-center cursor-grab active:cursor-grabbing"}
    />
  );
}
