export type UnitSystem = "metric" | "us";

const M_TO_FT = 3.28084;
const KN_M3_TO_PCF = 6.36587; // kN/m³ → lb/ft³
const KPA_TO_PSI = 0.145038;

export function depthLabel(system: UnitSystem): string {
  return system === "metric" ? "Depth (m)" : "Depth (ft)";
}
export function depthValue(m: number, system: UnitSystem): number {
  return system === "metric" ? m : m * M_TO_FT;
}

export function unitWeightLabel(system: UnitSystem): string {
  return system === "metric" ? "Unit weight (kN/m³)" : "Unit weight (pcf)";
}
export function unitWeightValue(kn: number, system: UnitSystem): number {
  return system === "metric" ? kn : kn * KN_M3_TO_PCF;
}

export function waterContentLabel(): string {
  return "Water content (%)";
}

export function shearStrengthLabel(system: UnitSystem): string {
  return system === "metric" ? "Shear strength (kPa)" : "Shear strength (psi)";
}
export function shearStrengthValue(kpa: number, system: UnitSystem): number {
  return system === "metric" ? kpa : kpa * KPA_TO_PSI;
}

export function fmt(v: number, decimals = 2): string {
  return v.toFixed(decimals);
}
