export const rocketEquationFields = [
  "initialMassKg",
  "finalMassKg",
  "specificImpulseSeconds",
] as const;

export type RocketEquationField = (typeof rocketEquationFields)[number];

export interface RocketEquationInputs {
  readonly finalMassKg: number;
  readonly initialMassKg: number;
  readonly specificImpulseSeconds: number;
}

export interface RocketEquationResult {
  readonly deltaVMetresPerSecond: number;
  readonly effectiveExhaustVelocityMetresPerSecond: number;
  readonly massRatio: number;
}

export type RocketEquationValidationErrors = Readonly<
  Partial<Record<RocketEquationField, string>>
>;

export const thrustToWeightFields = ["thrustNewtons", "massKg"] as const;

export type ThrustToWeightField = (typeof thrustToWeightFields)[number];

export interface ThrustToWeightInputs {
  readonly massKg: number;
  readonly thrustNewtons: number;
}

export type ThrustToWeightRegime = "below-one" | "around-one" | "above-one";

export interface ThrustToWeightResult {
  readonly regime: ThrustToWeightRegime;
  readonly thrustToWeightRatio: number;
  readonly weightNewtons: number;
}

export type ThrustToWeightValidationErrors = Readonly<
  Partial<Record<ThrustToWeightField, string>>
>;

export const dynamicPressureFields = [
  "airDensityKilogramsPerCubicMetre",
  "velocityMetresPerSecond",
] as const;

export type DynamicPressureField = (typeof dynamicPressureFields)[number];

export interface DynamicPressureInputs {
  readonly airDensityKilogramsPerCubicMetre: number;
  readonly velocityMetresPerSecond: number;
}

export interface DynamicPressureResult {
  readonly dynamicPressurePascals: number;
}

export type DynamicPressureValidationErrors = Readonly<
  Partial<Record<DynamicPressureField, string>>
>;

export const ballisticCoefficientFields = [
  "vehicleMassKilograms",
  "dragCoefficient",
  "referenceAreaSquareMetres",
] as const;

export type BallisticCoefficientField =
  (typeof ballisticCoefficientFields)[number];

export interface BallisticCoefficientInputs {
  readonly dragCoefficient: number;
  readonly referenceAreaSquareMetres: number;
  readonly vehicleMassKilograms: number;
}

export interface BallisticCoefficientResult {
  readonly ballisticCoefficientKilogramsPerSquareMetre: number;
  readonly inputs: BallisticCoefficientInputs;
}

export type BallisticCoefficientValidationErrors = Readonly<
  Partial<Record<BallisticCoefficientField, string>>
>;

export const escapeVelocityFields = [
  "orbitalRadiusMetres",
  "gravitationalParameter",
] as const;

export type EscapeVelocityField = (typeof escapeVelocityFields)[number];

export interface EscapeVelocityInputs {
  readonly gravitationalParameter?: number;
  readonly orbitalRadiusMetres: number;
}

export interface EscapeVelocityResult {
  readonly escapeVelocityMetresPerSecond: number;
  readonly orbitalRadiusMetres: number;
  readonly resolvedGravitationalParameter: number;
}

export type EscapeVelocityValidationErrors = Readonly<
  Partial<Record<EscapeVelocityField, string>>
>;

export const hohmannTransferFields = [
  "initialOrbitRadiusMetres",
  "finalOrbitRadiusMetres",
  "gravitationalParameter",
] as const;

export type HohmannTransferField = (typeof hohmannTransferFields)[number];

export interface HohmannTransferInputs {
  readonly finalOrbitRadiusMetres: number;
  readonly gravitationalParameter?: number;
  readonly initialOrbitRadiusMetres: number;
}

export interface HohmannTransferResult {
  readonly finalOrbitRadiusMetres: number;
  readonly firstBurnDeltaVMetresPerSecond: number;
  readonly initialOrbitRadiusMetres: number;
  readonly resolvedGravitationalParameter: number;
  readonly secondBurnDeltaVMetresPerSecond: number;
  readonly totalDeltaVMetresPerSecond: number;
  readonly transferSemiMajorAxisMetres: number;
  readonly transferTimeHours: number;
  readonly transferTimeSeconds: number;
}

export type HohmannTransferValidationErrors = Readonly<
  Partial<Record<HohmannTransferField, string>>
>;

export interface HohmannTransferAnalysisInputs {
  readonly finalAltitudeMetres: number;
  readonly gravitationalParameter?: number;
  readonly initialAltitudeMetres: number;
  readonly planetRadiusMetres?: number;
}

export interface HohmannTransferAnalysisResult {
  readonly finalOrbit: {
    readonly altitudeMetres: number;
    readonly circularVelocityMetresPerSecond: number;
    readonly orbitalRadiusMetres: number;
  };
  readonly initialOrbit: {
    readonly altitudeMetres: number;
    readonly circularVelocityMetresPerSecond: number;
    readonly orbitalRadiusMetres: number;
  };
  readonly resolved: {
    readonly gravitationalParameter: number;
    readonly planetRadiusMetres: number;
  };
  readonly transfer: {
    readonly firstBurnDeltaVMetresPerSecond: number;
    readonly secondBurnDeltaVMetresPerSecond: number;
    readonly totalDeltaVMetresPerSecond: number;
    readonly transferSemiMajorAxisMetres: number;
    readonly transferTimeHours: number;
    readonly transferTimeSeconds: number;
  };
}

export const orbitalElementsFields = [
  "altitudeMetres",
  "gravitationalParameter",
  "planetRadiusMetres",
] as const;

export type OrbitalElementsField = (typeof orbitalElementsFields)[number];

export interface OrbitalElementsInputs {
  readonly altitudeMetres: number;
  readonly gravitationalParameter?: number;
  readonly planetRadiusMetres?: number;
}

export interface OrbitalElementsResult {
  readonly orbitalPeriodMinutes: number;
  readonly orbitalPeriodSeconds: number;
  readonly orbitalRadiusMetres: number;
  readonly orbitalVelocityMetresPerSecond: number;
  readonly resolvedConstants: {
    readonly gravitationalParameterCubicMetresPerSecondSquared: number;
    readonly planetRadiusMetres: number;
  };
  readonly specificOrbitalEnergyJoulesPerKilogram: number;
}

export type OrbitalElementsValidationErrors = Readonly<
  Partial<Record<OrbitalElementsField, string>>
>;

export const orbitalPlaneChangeFields = [
  "orbitalVelocityMetresPerSecond",
  "inclinationChangeDegrees",
] as const;

export type OrbitalPlaneChangeField = (typeof orbitalPlaneChangeFields)[number];

export interface OrbitalPlaneChangeInputs {
  readonly inclinationChangeDegrees: number;
  readonly orbitalVelocityMetresPerSecond: number;
}

export interface OrbitalPlaneChangeResult {
  readonly deltaVMetresPerSecond: number;
  readonly inclinationChangeDegrees: number;
  readonly inclinationChangeRadians: number;
  readonly orbitalVelocityMetresPerSecond: number;
}

export type OrbitalPlaneChangeValidationErrors = Readonly<
  Partial<Record<OrbitalPlaneChangeField, string>>
>;

export interface OrbitalPlaneChangeAnalysisInputs {
  readonly gravitationalParameter?: number;
  readonly inclinationChangeDegrees: number;
  readonly orbitalAltitudeMetres: number;
  readonly planetRadiusMetres?: number;
}

export interface OrbitalPlaneChangeAnalysisResult {
  readonly deltaVMetresPerSecond: number;
  readonly inclinationChangeDegrees: number;
  readonly inclinationChangeRadians: number;
  readonly orbitalElements: OrbitalElementsResult;
  readonly orbitalRadiusMetres: number;
  readonly orbitalVelocityMetresPerSecond: number;
  readonly planeChange: OrbitalPlaneChangeResult;
}

export interface OrbitalTransferPlaneChangeInputs {
  readonly finalAltitudeMetres: number;
  readonly gravitationalParameter?: number;
  readonly inclinationChangeDegrees: number;
  readonly initialAltitudeMetres: number;
  readonly planetRadiusMetres?: number;
}

export interface OrbitalTransferPlaneChangeAnalysis {
  readonly finalOrbitVelocityMetresPerSecond: number;
  readonly hohmannTransfer: HohmannTransferAnalysisResult;
  readonly planeChange: OrbitalPlaneChangeResult;
  readonly planeChangeDeltaVMetresPerSecond: number;
  readonly totalDeltaVMetresPerSecond: number;
  readonly transferDeltaVMetresPerSecond: number;
}

export interface DeltaVBudgetManeuver {
  readonly deltaVMetresPerSecond: number;
  readonly id: string;
  readonly name: string;
}

export interface DeltaVBudgetInputs {
  readonly hohmannTransfer?: HohmannTransferAnalysisInputs;
  readonly maneuvers?: readonly DeltaVBudgetManeuver[];
  readonly missionName: string;
  readonly orbitalPlaneChange?: OrbitalPlaneChangeAnalysisInputs;
}

export interface DeltaVBudgetAnalysis {
  readonly largestDeltaVContributor: DeltaVBudgetManeuver | null;
  readonly maneuvers: readonly DeltaVBudgetManeuver[];
  readonly missionName: string;
  readonly numberOfManeuvers: number;
  readonly sourceAnalyses: {
    readonly hohmannTransfer?: HohmannTransferAnalysisResult;
    readonly orbitalPlaneChange?: OrbitalPlaneChangeAnalysisResult;
  };
  readonly totalDeltaVMetresPerSecond: number;
}

export const visVivaFields = [
  "orbitalRadiusMetres",
  "semiMajorAxisMetres",
  "gravitationalParameter",
] as const;

export type VisVivaField = (typeof visVivaFields)[number];

export interface VisVivaInputs {
  readonly gravitationalParameter?: number;
  readonly orbitalRadiusMetres: number;
  readonly semiMajorAxisMetres: number;
}

export interface VisVivaResult {
  readonly orbitalRadiusMetres: number;
  readonly orbitalVelocityMetresPerSecond: number;
  readonly resolvedGravitationalParameter: number;
  readonly semiMajorAxisMetres: number;
}

export type VisVivaValidationErrors = Readonly<
  Partial<Record<VisVivaField, string>>
>;

export const stagnationHeatingFields = [
  "atmosphericDensityKilogramsPerCubicMetre",
  "velocityMetresPerSecond",
  "noseRadiusMetres",
  "heatingCoefficient",
] as const;

export type StagnationHeatingField = (typeof stagnationHeatingFields)[number];

export interface StagnationHeatingInputs {
  readonly atmosphericDensityKilogramsPerCubicMetre: number;
  readonly heatingCoefficient?: number;
  readonly noseRadiusMetres: number;
  readonly velocityMetresPerSecond: number;
}

export interface StagnationHeatingResult {
  readonly heatFluxKilowattsPerSquareMetre: number;
  readonly heatFluxWattsPerSquareMetre: number;
  readonly inputs: {
    readonly atmosphericDensityKilogramsPerCubicMetre: number;
    readonly heatingCoefficient: number;
    readonly noseRadiusMetres: number;
    readonly velocityMetresPerSecond: number;
  };
  readonly resolvedHeatingCoefficient: number;
}

export type StagnationHeatingValidationErrors = Readonly<
  Partial<Record<StagnationHeatingField, string>>
>;

export const liftEquationFields = [
  "airDensityKilogramsPerCubicMetre",
  "velocityMetresPerSecond",
  "wingAreaSquareMetres",
  "liftCoefficient",
] as const;

export type LiftEquationField = (typeof liftEquationFields)[number];

export interface LiftEquationInputs {
  readonly airDensityKilogramsPerCubicMetre: number;
  readonly liftCoefficient: number;
  readonly velocityMetresPerSecond: number;
  readonly wingAreaSquareMetres: number;
}

export interface LiftEquationResult {
  readonly liftForceNewtons: number;
}

export type LiftEquationValidationErrors = Readonly<
  Partial<Record<LiftEquationField, string>>
>;

export const dragEquationFields = [
  "airDensityKilogramsPerCubicMetre",
  "velocityMetresPerSecond",
  "referenceAreaSquareMetres",
  "dragCoefficient",
] as const;

export type DragEquationField = (typeof dragEquationFields)[number];

export interface DragEquationInputs {
  readonly airDensityKilogramsPerCubicMetre: number;
  readonly dragCoefficient: number;
  readonly referenceAreaSquareMetres: number;
  readonly velocityMetresPerSecond: number;
}

export interface DragEquationResult {
  readonly dragForceNewtons: number;
}

export type DragEquationValidationErrors = Readonly<
  Partial<Record<DragEquationField, string>>
>;

export const STANDARD_ATMOSPHERE_MAX_ALTITUDE_METRES = 11_000;

export const atmosphereFields = ["altitudeMetres"] as const;

export type AtmosphereField = (typeof atmosphereFields)[number];

export interface AtmosphereInputs {
  readonly altitudeMetres: number;
}

export interface AtmosphereResult {
  readonly densityKilogramsPerCubicMetre: number;
  readonly pressurePascals: number;
  readonly speedOfSoundMetersPerSecond: number;
  readonly temperatureKelvin: number;
}

export type AtmosphereValidationErrors = Readonly<
  Partial<Record<AtmosphereField, string>>
>;

export const machNumberFields = [
  "velocityMetresPerSecond",
  "speedOfSoundMetersPerSecond",
] as const;

export type MachNumberField = (typeof machNumberFields)[number];

export type FlowRegime = "subsonic" | "transonic" | "supersonic" | "hypersonic";

export interface MachNumberInputs {
  readonly speedOfSoundMetersPerSecond: number;
  readonly velocityMetresPerSecond: number;
}

export interface MachNumberResult {
  readonly flowRegime: FlowRegime;
  readonly machNumber: number;
}

export type MachNumberValidationErrors = Readonly<
  Partial<Record<MachNumberField, string>>
>;

export const isentropicFlowFields = ["machNumber", "gamma"] as const;

export type IsentropicFlowField = (typeof isentropicFlowFields)[number];

export interface IsentropicFlowInputs {
  readonly gamma?: number;
  readonly machNumber: number;
}

export interface IsentropicFlowResult {
  readonly densityRatio: number;
  readonly pressureRatio: number;
  readonly temperatureRatio: number;
}

export type IsentropicFlowValidationErrors = Readonly<
  Partial<Record<IsentropicFlowField, string>>
>;

export const normalShockFields = ["machNumber", "gamma"] as const;

export type NormalShockField = (typeof normalShockFields)[number];

export interface NormalShockInputs {
  readonly gamma?: number;
  readonly machNumber: number;
}

export interface NormalShockAnalysis {
  readonly densityRatio: number;
  readonly downstreamMach: number;
  readonly pressureRatio: number;
  readonly temperatureRatio: number;
  readonly upstreamMach: number;
}

export type NormalShockValidationErrors = Readonly<
  Partial<Record<NormalShockField, string>>
>;

export interface TotalPressureRecoveryInputs {
  readonly gamma?: number;
  readonly machNumber: number;
}

export interface TotalPressureRecoveryResult {
  readonly gamma: number;
  readonly pressureLossPercentage: number;
  readonly pressureRecoveryRatio: number;
  readonly upstreamMach: number;
}

export type ShockSequenceElement =
  | {
      readonly type: "normal";
    }
  | {
      readonly deflectionAngleDegrees: number;
      readonly type: "oblique";
    };

export interface MultiShockRecoveryInputs {
  readonly altitudeMeters?: number;
  readonly gamma?: number;
  readonly shocks: readonly ShockSequenceElement[];
  readonly upstreamMach: number;
}

export type MultiShockRecoveryShockResult =
  | {
      readonly cumulativeRecoveryRatio: number;
      readonly downstreamMach: number;
      readonly pressureRecoveryRatio: number;
      readonly shockType: "normal";
      readonly upstreamMach: number;
    }
  | {
      readonly cumulativeRecoveryRatio: number;
      readonly downstreamMach: number;
      readonly normalMachComponent: number;
      readonly pressureRecoveryRatio: number;
      readonly shockAngleDegrees: number;
      readonly shockType: "oblique";
      readonly upstreamMach: number;
    };

export interface MultiShockRecoveryAnalysis {
  readonly finalMach: number;
  readonly numberOfShocks: number;
  readonly shockResults: readonly MultiShockRecoveryShockResult[];
  readonly totalPressureLossPercentage: number;
  readonly totalPressureRecoveryRatio: number;
  readonly upstreamMach: number;
}

export interface InletCompressionInputs {
  readonly altitudeMeters?: number;
  readonly externalShocks: readonly ShockSequenceElement[];
  readonly gamma?: number;
  readonly initialMach: number;
}

export interface InletCompressionAnalysis {
  readonly externalPressureRecoveryRatio: number;
  readonly externalShockStages: readonly MultiShockRecoveryShockResult[];
  readonly finalExitMach: number;
  readonly initialMach: number;
  readonly machBeforeTerminalShock: number;
  readonly overallPressureRecoveryRatio: number;
  readonly terminalShock: NormalShockAnalysis;
  readonly terminalShockPressureRecoveryRatio: number;
}

export type ShockPressureLossInputs =
  | {
      readonly altitudeMeters?: number;
      readonly machNumber: number;
      readonly shockType: "normal";
    }
  | {
      readonly altitudeMeters?: number;
      readonly deflectionAngleDegrees: number;
      readonly machNumber: number;
      readonly shockType: "oblique";
    };

export type ShockPressureLossAnalysis =
  | {
      readonly downstreamMach: number;
      readonly pressureLossPercentage: number;
      readonly pressureRecoveryRatio: number;
      readonly shockType: "normal";
      readonly upstreamMach: number;
    }
  | {
      readonly downstreamMach: number;
      readonly normalMachComponent: number;
      readonly pressureLossPercentage: number;
      readonly pressureRecoveryRatio: number;
      readonly shockAngleDegrees: number;
      readonly shockType: "oblique";
      readonly upstreamMach: number;
    };

export const obliqueShockFields = [
  "machNumber",
  "deflectionAngleDegrees",
  "gamma",
] as const;

export type ObliqueShockField = (typeof obliqueShockFields)[number];

export interface ObliqueShockInputs {
  readonly deflectionAngleDegrees: number;
  readonly gamma?: number;
  readonly machNumber: number;
}

export interface ObliqueShockAnalysis {
  readonly deflectionAngleDegrees: number;
  readonly densityRatio: number;
  readonly downstreamMach: number;
  readonly pressureRatio: number;
  readonly shockAngleDegrees: number;
  readonly temperatureRatio: number;
  readonly upstreamMach: number;
}

export type ObliqueShockValidationErrors = Readonly<
  Partial<Record<ObliqueShockField, string>>
>;

export interface ObliqueShockConditionInputs {
  readonly altitudeMeters: number;
  readonly deflectionAngleDegrees: number;
  readonly machNumber: number;
}

export interface ObliqueShockConditionAnalysis {
  readonly downstream: {
    readonly densityKilogramsPerCubicMetre: number;
    readonly machNumber: number;
    readonly pressurePascals: number;
    readonly temperatureKelvin: number;
  };
  readonly ratios: {
    readonly densityRatio: number;
    readonly pressureRatio: number;
    readonly temperatureRatio: number;
  };
  readonly shock: {
    readonly deflectionAngleDegrees: number;
    readonly shockAngleDegrees: number;
  };
  readonly upstream: {
    readonly densityKilogramsPerCubicMetre: number;
    readonly machNumber: number;
    readonly pressurePascals: number;
    readonly temperatureKelvin: number;
  };
}

export interface ShockConditionInputs {
  readonly altitudeMeters: number;
  readonly machNumber: number;
}

export interface ShockConditionAnalysis {
  readonly downstream: {
    readonly densityKilogramsPerCubicMetre: number;
    readonly machNumber: number;
    readonly pressurePascals: number;
    readonly temperatureKelvin: number;
  };
  readonly ratios: {
    readonly densityRatio: number;
    readonly pressureRatio: number;
    readonly temperatureRatio: number;
  };
  readonly upstream: {
    readonly densityKilogramsPerCubicMetre: number;
    readonly machNumber: number;
    readonly pressurePascals: number;
    readonly temperatureKelvin: number;
  };
}

export interface StagnationConditionInputs {
  readonly altitudeMeters: number;
  readonly machNumber: number;
}

export interface StagnationConditionAnalysis {
  readonly ratios: IsentropicFlowResult;
  readonly stagnationConditions: {
    readonly densityKilogramsPerCubicMetre: number;
    readonly pressurePascals: number;
    readonly temperatureKelvin: number;
  };
  readonly staticConditions: {
    readonly densityKilogramsPerCubicMetre: number;
    readonly pressurePascals: number;
    readonly temperatureKelvin: number;
  };
}

export interface HypersonicHeatingInputs {
  readonly altitudeMetres: number;
  readonly heatingCoefficient?: number;
  readonly noseRadiusMetres: number;
  readonly velocityMetresPerSecond: number;
}

export interface HypersonicHeatingAnalysis {
  readonly atmosphere: AtmosphereResult;
  readonly flow: {
    readonly flowRegime: FlowRegime;
    readonly machNumber: number;
    readonly velocityMetresPerSecond: number;
  };
  readonly thermal: {
    readonly heatFluxKilowattsPerSquareMetre: number;
    readonly heatFluxWattsPerSquareMetre: number;
    readonly heatingCoefficient: number;
  };
}

export interface ReentryDecelerationInputs {
  readonly altitudeMetres: number;
  readonly dragCoefficient: number;
  readonly referenceAreaSquareMetres: number;
  readonly vehicleMassKilograms: number;
  readonly velocityMetresPerSecond: number;
}

export interface ReentryDecelerationAnalysis {
  readonly atmosphere: {
    readonly densityKilogramsPerCubicMetre: number;
    readonly pressurePascals: number;
    readonly temperatureKelvin: number;
  };
  readonly flight: {
    readonly decelerationMetresPerSecondSquared: number;
    readonly decelerationStandardGravities: number;
    readonly velocityMetresPerSecond: number;
  };
  readonly vehicle: {
    readonly ballisticCoefficientKilogramsPerSquareMetre: number;
    readonly dragCoefficient: number;
    readonly referenceAreaSquareMetres: number;
    readonly vehicleMassKilograms: number;
  };
}

export interface ReentryTrajectoryInputs {
  readonly dragCoefficient: number;
  readonly initialAltitudeMeters: number;
  readonly initialFlightPathAngleDegrees?: number;
  readonly initialVelocityMetersPerSecond: number;
  readonly referenceAreaSquareMetres: number;
  readonly timeStepSeconds?: number;
  readonly vehicleMassKilograms: number;
}

export interface ReentryTrajectoryPoint {
  readonly altitudeMeters: number;
  readonly decelerationGs: number;
  readonly decelerationMetersPerSecondSquared: number;
  readonly densityKilogramsPerCubicMetre: number;
  readonly dynamicPressurePascals: number;
  readonly timeSeconds: number;
  readonly velocityMetersPerSecond: number;
}

export interface ReentryTrajectoryAnalysis {
  readonly durationSeconds: number;
  readonly finalState: ReentryTrajectoryPoint;
  readonly initialState: ReentryTrajectoryPoint;
  readonly peakDeceleration: ReentryTrajectoryPoint;
  /** Highest-velocity sampled state for future thermal coupling. */
  readonly peakHeatingVelocityState: ReentryTrajectoryPoint;
  readonly trajectoryPoints: readonly ReentryTrajectoryPoint[];
}

export interface ReentryThermalHistoryInputs {
  readonly dragCoefficient: number;
  readonly heatingCoefficient?: number;
  readonly initialAltitudeMeters: number;
  readonly initialFlightPathAngleDegrees?: number;
  readonly initialVelocityMetersPerSecond: number;
  readonly noseRadiusMetres: number;
  readonly referenceAreaSquareMetres: number;
  readonly timestepSeconds?: number;
  readonly vehicleMassKilograms: number;
}

export interface ReentryThermalPoint {
  readonly altitudeMeters: number;
  readonly densityKilogramsPerCubicMetre: number;
  readonly heatFluxKilowattsPerSquareMetre: number;
  readonly heatFluxWattsPerSquareMetre: number;
  readonly timeSeconds: number;
  readonly velocityMetersPerSecond: number;
}

export interface ReentryThermalHistoryAnalysis {
  readonly peakHeatFlux: ReentryThermalPoint;
  readonly peakHeatFluxLocation: {
    readonly altitudeMeters: number;
    readonly timeSeconds: number;
    readonly velocityMetersPerSecond: number;
  };
  readonly thermalPoints: readonly ReentryThermalPoint[];
  readonly totalHeatLoadEstimate: {
    readonly heatLoadJoulesPerSquareMetre: number;
    readonly heatLoadMegajoulesPerSquareMetre: number;
  };
  readonly trajectory: ReentryTrajectoryAnalysis;
}

export interface TPSSizingInputs extends ReentryThermalHistoryInputs {
  /**
   * Educational, normalized energy-absorption capacity. Numerically, this is
   * the MJ/m² absorbed by each kg/m² of installed TPS areal mass.
   */
  readonly allowableHeatLoadMegajoulesPerSquareMetre: number;
  readonly materialDensityKilogramsPerCubicMetre: number;
  readonly materialEfficiencyFactor?: number;
  readonly safetyFactor: number;
}

export interface TPSSizingAnalysis {
  readonly estimatedThickness: {
    readonly metres: number;
    readonly millimetres: number;
  };
  readonly peakHeatFlux: ReentryThermalPoint;
  /** The maximum cumulative heat load, reached at the end of the history. */
  readonly peakHeatLoad: ReentryThermalHistoryAnalysis["totalHeatLoadEstimate"];
  readonly requiredArealDensity: {
    readonly kilogramsPerSquareMetre: number;
  };
  readonly safetyMargin: {
    readonly designHeatLoadMegajoulesPerSquareMetre: number;
    readonly heatLoadMarginMegajoulesPerSquareMetre: number;
    readonly marginPercentage: number;
  };
  readonly thermalHistory: ReentryThermalHistoryAnalysis;
}

/**
 * Simplified educational material data for preliminary TPS studies. These
 * values are not certified properties for flight hardware.
 */
export interface TPSMaterial {
  readonly allowableHeatLoadMegajoulesPerSquareMetre: number;
  readonly densityKilogramsPerCubicMetre: number;
  readonly description: string;
  readonly id: string;
  readonly maximumTemperatureKelvin?: number;
  readonly name: string;
  readonly reusable: boolean;
}

export interface MaterialTPSSizingInputs extends ReentryThermalHistoryInputs {
  readonly materialId: string;
  readonly safetyFactor: number;
}

export type TPSSuitabilitySummary =
  "Low thermal margin" | "Moderate thermal margin" | "High thermal margin";

export interface MaterialTPSSizingAnalysis {
  readonly estimatedTPSMassForArea: {
    readonly arealDensityKilogramsPerSquareMetre: number;
    readonly totalTPSMassKilograms: number;
  };
  readonly material: TPSMaterial;
  readonly suitabilitySummary: TPSSuitabilitySummary;
  readonly thermalHistory: ReentryThermalHistoryAnalysis;
  readonly tpsSizing: TPSSizingAnalysis;
}

export interface TPSMaterialComparisonInputs extends ReentryThermalHistoryInputs {
  readonly materialIds?: readonly string[];
  readonly safetyFactor: number;
}

export interface TPSMaterialComparisonRankingLogic {
  readonly description: string;
  readonly massPenalty: number;
  readonly massRank: number;
  readonly thermalMarginContribution: number;
  readonly thermalMarginRank: number;
  readonly thicknessPenalty: number;
  readonly thicknessRank: number;
}

export interface TPSMaterialComparisonResult {
  readonly estimatedTPSMass: MaterialTPSSizingAnalysis["estimatedTPSMassForArea"];
  readonly heatLoadMargin: TPSSizingAnalysis["safetyMargin"];
  readonly marginClassification: TPSSuitabilitySummary;
  readonly material: TPSMaterial;
  readonly rankingLogic: TPSMaterialComparisonRankingLogic;
  readonly rankingScore: number;
  readonly thickness: TPSSizingAnalysis["estimatedThickness"];
  readonly tpsSizing: TPSSizingAnalysis;
}

export interface TPSMaterialComparisonAnalysis {
  readonly materialsCompared: number;
  readonly recommendedMaterial: TPSMaterialComparisonResult;
  readonly results: readonly TPSMaterialComparisonResult[];
}

export interface VehicleReentryConfiguration {
  readonly dragCoefficient: number;
  readonly massKilograms: number;
  readonly noseRadiusMetres: number;
  readonly referenceAreaSquareMetres: number;
  readonly vehicleName: string;
}

export interface VehicleReentryEvaluationInputs {
  readonly heatingCoefficient?: number;
  readonly initialAltitudeMeters: number;
  readonly initialFlightPathAngleDegrees?: number;
  readonly initialVelocityMetersPerSecond: number;
  readonly safetyFactor: number;
  readonly timestepSeconds?: number;
  readonly vehicle: VehicleReentryConfiguration;
}

export interface VehicleReentryEvaluationAnalysis {
  readonly summary: {
    readonly dynamics: {
      readonly peakDeceleration: {
        readonly altitudeMeters: number;
        readonly decelerationGs: number;
        readonly decelerationMetersPerSecondSquared: number;
      };
      readonly peakVelocityState: ReentryTrajectoryPoint;
    };
    readonly flight: {
      readonly finalState: ReentryTrajectoryPoint;
      readonly initialAltitudeMeters: number;
      readonly initialVelocityMetersPerSecond: number;
      readonly reentryDurationSeconds: number;
    };
    readonly thermal: {
      readonly peakHeatFluxKilowattsPerSquareMetre: number;
      readonly peakHeatFluxWattsPerSquareMetre: number;
      readonly peakHeatingAltitudeMeters: number;
      readonly totalHeatLoadJoulesPerSquareMetre: number;
      readonly totalHeatLoadMegajoulesPerSquareMetre: number;
    };
    readonly tps: {
      readonly estimatedTPSMassKilograms: number;
      readonly recommendedMaterial: TPSMaterial;
      readonly requiredThickness: TPSSizingAnalysis["estimatedThickness"];
      readonly thermalMargin: {
        readonly classification: TPSSuitabilitySummary;
        readonly heatLoadMarginMegajoulesPerSquareMetre: number;
        readonly marginPercentage: number;
      };
    };
  };
  readonly thermalHistory: ReentryThermalHistoryAnalysis;
  readonly tpsComparison: TPSMaterialComparisonAnalysis;
  readonly trajectory: ReentryTrajectoryAnalysis;
  readonly vehicle: VehicleReentryConfiguration;
}

export interface VehicleReentryComparisonInputs {
  readonly heatingCoefficient?: number;
  readonly initialAltitudeMeters: number;
  readonly initialFlightPathAngleDegrees?: number;
  readonly initialVelocityMetersPerSecond: number;
  readonly safetyFactor: number;
  readonly timestepSeconds?: number;
  readonly vehicles: readonly VehicleReentryConfiguration[];
}

export interface VehicleReentryComparisonResult {
  /** Complete source evaluation retained without transformation. */
  readonly evaluation: VehicleReentryEvaluationAnalysis;
  readonly peakDeceleration: VehicleReentryEvaluationAnalysis["summary"]["dynamics"]["peakDeceleration"];
  readonly peakHeating: {
    readonly altitudeMeters: number;
    readonly heatFluxKilowattsPerSquareMetre: number;
    readonly heatFluxWattsPerSquareMetre: number;
    readonly timeSeconds: number;
    readonly velocityMetersPerSecond: number;
  };
  readonly recommendedTPSMaterial: TPSMaterial;
  readonly thermalClassification: TPSSuitabilitySummary;
  readonly thermalMargin: VehicleReentryEvaluationAnalysis["summary"]["tps"]["thermalMargin"];
  readonly totalHeatLoad: {
    readonly heatLoadJoulesPerSquareMetre: number;
    readonly heatLoadMegajoulesPerSquareMetre: number;
  };
  readonly tpsMassKilograms: number;
  readonly tpsThickness: TPSSizingAnalysis["estimatedThickness"];
  readonly trajectorySummary: VehicleReentryEvaluationAnalysis["summary"]["flight"];
  readonly vehicle: VehicleReentryConfiguration;
  readonly vehicleName: string;
}

export interface VehicleReentryComparisonAnalysis {
  readonly comparisonMetadata: {
    readonly rankingCriteria: {
      readonly primary: "lowest-tps-mass";
      readonly secondary: "lowest-required-tps-thickness";
      readonly tertiary: "lowest-peak-deceleration";
    };
    readonly sharedReentryConditions: {
      readonly heatingCoefficient?: number;
      readonly initialAltitudeMeters: number;
      readonly initialFlightPathAngleDegrees?: number;
      readonly initialVelocityMetersPerSecond: number;
      readonly safetyFactor: number;
      readonly timestepSeconds?: number;
    };
    readonly vehiclesCompared: number;
  };
  /** Vehicle evaluations in caller-supplied order. */
  readonly evaluatedVehicles: readonly VehicleReentryComparisonResult[];
  /** Vehicle evaluations sorted by the documented ranking priorities. */
  readonly ranking: readonly VehicleReentryComparisonResult[];
  readonly recommendedVehicle: VehicleReentryComparisonResult;
}

export interface MissionProfileInputs {
  readonly deltaVBudget?: DeltaVBudgetInputs;
  readonly missionName: string;
  readonly vehicleComparison?: VehicleReentryComparisonInputs;
  readonly vehicleReentryEvaluation?: VehicleReentryEvaluationInputs;
}

export interface MissionProfileAnalysis {
  readonly missionName: string;
  readonly missionSummaryState: {
    readonly analysesResolved: number;
    readonly hasDeltaVBudget: boolean;
    readonly hasVehicleComparison: boolean;
    readonly hasVehicleReentryEvaluation: boolean;
  };
  readonly selectedVehicleRecommendation?: VehicleReentryComparisonResult;
  readonly sourceAnalyses: {
    readonly deltaVBudget?: DeltaVBudgetAnalysis;
    readonly vehicleComparison?: VehicleReentryComparisonAnalysis;
    readonly vehicleReentryEvaluation?: VehicleReentryEvaluationAnalysis;
  };
  readonly totalDeltaVMetresPerSecond?: number;
  readonly tpsRecommendation?: TPSMaterial;
}

export type MissionInsightCategory =
  | "mission-overview"
  | "orbital-analysis"
  | "vehicle-analysis"
  | "thermal-analysis"
  | "engineering-tradeoffs"
  | "limitations";

export interface MissionInsight {
  readonly category: MissionInsightCategory;
  readonly details: readonly string[];
  readonly id: string;
  readonly summary: string;
  readonly title: string;
}

export interface MissionInsightsAnalysis {
  readonly assumptions: readonly string[];
  readonly insights: readonly MissionInsight[];
  readonly limitations: readonly string[];
  readonly missionName: string;
  readonly sourceAvailability: {
    readonly hasOrbitalAnalysis: boolean;
    readonly hasThermalAnalysis: boolean;
    readonly hasVehicleAnalysis: boolean;
    readonly hasVehicleReentryEvaluation: boolean;
  };
  readonly systemsInterpreted: readonly string[];
}

export interface MissionReportInputs {
  readonly description: string;
  readonly missionProfileAnalysis: MissionProfileAnalysis;
}

export type MissionReportExportFormat = "json" | "markdown";

export interface MissionReport {
  readonly missionSummary: {
    readonly description: string;
    readonly missionName: string;
    readonly systemsUsed: readonly string[];
  };
  readonly orbitalAnalysis?: {
    readonly hohmannTransfer?: HohmannTransferAnalysisResult;
    readonly maneuvers: readonly DeltaVBudgetManeuver[];
    readonly orbitalPlaneChange?: OrbitalPlaneChangeAnalysisResult;
    readonly totalDeltaVMetresPerSecond: number;
  };
  readonly vehicleAnalysis?: {
    readonly comparisonRecommendation?: VehicleReentryComparisonResult;
    readonly performanceSummary: {
      readonly dynamics: VehicleReentryEvaluationAnalysis["summary"]["dynamics"];
      readonly flight: VehicleReentryEvaluationAnalysis["summary"]["flight"];
    };
    readonly selectedVehicle: VehicleReentryConfiguration;
  };
  readonly thermalAnalysis?: {
    readonly thermalSummary: VehicleReentryEvaluationAnalysis["summary"]["thermal"];
    readonly tpsRecommendation?: {
      readonly estimatedTPSMassKilograms: number;
      readonly material: TPSMaterial;
      readonly requiredThickness: TPSSizingAnalysis["estimatedThickness"];
      readonly thermalMargin: VehicleReentryEvaluationAnalysis["summary"]["tps"]["thermalMargin"];
    };
  };
  readonly missionAssessment: {
    readonly educationalSummary: string;
    readonly limitations: readonly string[];
    readonly modelAssumptions: readonly string[];
  };
  readonly sourceAnalysis: MissionProfileAnalysis;
}

export type MissionPresetCategory =
  | "deep-space-concept"
  | "lunar-transfer"
  | "orbital-deployment"
  | "orbital-logistics"
  | "reentry-demonstration";

export interface MissionPreset {
  readonly category: MissionPresetCategory;
  readonly description: string;
  readonly id: string;
  readonly missionProfileInputs: MissionProfileInputs;
  readonly name: string;
}

export type MissionPresetCatalog = readonly MissionPreset[];

export const flightConditionFields = [
  "altitudeMetres",
  "velocityMetresPerSecond",
  "wingAreaSquareMetres",
  "liftCoefficient",
  "dragCoefficient",
] as const;

export type FlightConditionField = (typeof flightConditionFields)[number];

export interface FlightConditionInputs {
  readonly altitudeMetres: number;
  readonly dragCoefficient: number;
  readonly liftCoefficient: number;
  readonly velocityMetresPerSecond: number;
  readonly wingAreaSquareMetres: number;
}

export interface FlightConditionAnalysis {
  readonly aerodynamics: {
    readonly dragForceNewtons: number;
    readonly dynamicPressurePascals: number;
    readonly liftForceNewtons: number;
  };
  readonly atmosphere: AtmosphereResult;
  readonly flight: MachNumberResult;
  readonly performance: {
    readonly liftToDragRatio: number;
  };
}

export type FlightConditionValidationErrors = Readonly<
  Partial<Record<FlightConditionField, string>>
>;
