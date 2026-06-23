export interface SynapticResponse {
  poeticText: string;
  alphaBalance: number;       // Right hemisphere (creativity, intuition, emotion) [0.0 - 1.0]
  betaBalance: number;        // Left hemisphere (logic, science, precision) [0.0 - 1.0]
  complexity: number;         // Visual complexity factor for deforming geometry [0.1 - 2.0]
  glitchFactor: number;       // Glitch/interference factor [0.0 - 1.0]
  resonanceFrequency: number; // Customized audio signature frequency in Hz [100.0 - 1000.0]
  archetype: string;          // Majestic aesthetic label (e.g. SINTESI FRATTALE)
  keywords: string[];         // Exactly 3 semantic concepts
  simulated?: boolean;        // Optional flag for local simulation fallback values
  simReason?: string;         // Reason for simulation fallback (e.g. "missing_key", "overload", "api_error")
}

export type InstallationState = "BENVENUTO" | "INTERAZIONE" | "REPERTO" | "SALVATAGGIO";

export interface HistoricRecord {
  id: string;
  timestamp: string;
  input: string;
  response: SynapticResponse;
}
