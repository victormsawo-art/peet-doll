export interface CommodityMarket {
  crudeOil: number;
  wheat: number;
  semiconductors: number;
  rareEarths: number;
  lithium: number;
  medicine: number;
  uranium: number;
  gold: number;
  steel: number;
  naturalGas: number;
  copper: number;
  cobalt: number;
}

export interface SurvivalMatrix {
  foodSecurity: number;
  waterAccess: number;
  housingAvailability: number;
  transportEfficiency: number;
}

export interface PowerTrinity {
  weaponsTech: number;
  militaryLogistics: number;
  nuclearReadiness: number;
}

export interface Shadow {
  spyingNetwork: number;
  digitalSecurity: number;
  internalPolicing: number;
  infrastructureResilience?: number;
}

export interface SoftPower {
  tourismAppeal: number;
  diplomaticTrust: number;
  culturalExport: number;
}

export interface EconomicEngine {
  gdp: number;
  debtInterest: number;
  inflationTax: number;
  tradeBalance: number;
  schooling: number;
  jobs: number;
  energyIndependence: number;
}

export interface EconomicLayer {
  gdpNominal: number; // in billions
  gdpPpp: number; // in billions
  realGdp: number; // in billions
  debtToGdp: number; // percentage
  inflation: number; // monthly change percentage
  currencyVolatility: number; // index 0-100
  exchangeRate: number; // relative to USD
  treasury: number; // in billions
  liquidCash: number; // in millions
  eurobondPaymentDate: string; // YYYY-MM-DD
  debtCrisis: boolean;
  defaultWarning?: boolean;
  taxEfficiency: number; // 0-100
  taxRevenue?: number;
  foreignReserves?: number;
  portEfficiency?: number;
  portCongestionDays: number;
  fuelReserves?: number;
  electricityGridStability?: number;
  energyBalance?: number; // in TWh
  supplyChain: CommodityMarket;
}

export interface ArmyDivision {
  name: string;
  role: string;
  personnel: number;
  tanks: number;
  artillery: number;
  firepowerScore: number;
  visibility: number; // 0-100
}

export interface NavalFleet {
  name: string;
  role: string;
  aircraftCarriers: number;
  submarines: number;
  frigates: number;
  destroyers: number;
  patrolShips: number;
}

export interface AirWing {
  name: string;
  role: string;
  fighterJets: number;
  bombers: number;
  reconnaissanceAircraft: number;
  transportAircraft: number;
  helicopters: number;
}

export interface DroneFleet {
  id: string;
  name: string;
  fpvDensity: number; // 0-100
  jammingResilience: number; // 0-100
  loiteringEndurance: number; // turns
  hasAIGuidance: boolean;
}

export interface MilitaryLayer {
  activePersonnel: number;
  reservePersonnel: number;
  powerProjection: number; // 0-100
  nuclearReadiness: number; // 0-100
  logisticsCapacity: number; // 0-100
  techTier: number; // 1-5
  warExhaustion: number; // 0-100
  casualtyTolerance: number; // 0-100
  ewIntensity: number; // 0-100
  weaponStockpiles?: number;
  chemicalStatus?: string;
  armyDivisions: ArmyDivision[];
  navalFleets: NavalFleet[];
  airWings: AirWing[];
  droneFleets: DroneFleet[];
}

export type VoterGroup = 'Socialist' | 'Capitalist' | 'Nationalist' | 'Globalist' | 'Religious' | 'Secular' | 'Urban' | 'Rural';

export interface VoterDemographics {
  identification: Record<VoterGroup, number>; // 0-1
  approval: Record<VoterGroup, number>; // 0-100
  grudges: Record<VoterGroup, number>;
}

export interface SocialLayer {
  politicalLegitimacy: number; // 0-100
  tension: number; // 0-100
  brainDrain: number; // 0-100
  socialMediaSentiment: number; // 0-100
  population: number; // in millions
  cynicism: number; // 0-1
  socialCreditScore: number; // 0-100
  voterDemographics: VoterDemographics;
  hospitalBedsPer1k?: number;
  housingDeficit?: number;
}

export interface DiplomaticLayer {
  bti: Record<string, number>; // Bilateral Trust Index (-100 to 100)
  treaties: string[];
  sanctions: string[];
}

export interface Governance {
  transparency: number; // 0-100
  monthsBelowApprovalThreshold: number;
}

export interface BorderSecurity {
  somaliaBorderOpen: boolean;
  portFeesEAC: 'high' | 'normal' | 'low';
}

export interface IntelligenceAgency {
  name: string;
  power: number; // 0-100
  threatLevel?: number; // 0-100
  activeOperations: string[];
}

export interface IntelligenceGrid {
  domestic: IntelligenceAgency;
  foreign: Record<string, IntelligenceAgency>;
}

export interface Ministry {
  name: string;
  cabinetSecretary: string;
  budget: number; // in billions
  performance: number; // 0-100
  status: string;
  politicalCapitalGenerated?: number;
}

export interface ActiveProject {
  id: string;
  name: string;
  ministry: string;
  budgetAllocated: number; // in billions
  progress: number; // 0-100
  status: string; // "On Track" | "Delayed" | "Completed"
  expectedCompletionDate: string;
}

export interface PolicyDirective {
  id: string;
  title: string;
  category: 'ECONOMIC' | 'MILITARY' | 'SOCIAL' | 'DIPLOMATIC' | 'INFRASTRUCTURE';
  enactedDate: string;
  summary: string;
  status: 'ACTIVE' | 'MATURED' | 'REPEALED';
  dailyEffects: {
    gdpGrowthBonus: number;      // e.g., +0.00012 daily (~4.4% annual boost)
    treasuryDeltaB: number;      // Daily treasury impact in billions (e.g., +0.004 or -0.002)
    stabilityDelta: number;      // Daily stability drift (-0.05 to +0.05)
    approvalDelta: number;       // Daily approval drift (-0.05 to +0.05)
    inflationDelta: number;      // Monthly inflation adjustment
    foodDelta?: number;
    waterDelta?: number;
    housingDelta?: number;
    transportDelta?: number;
  };
}

export interface HistoricalSnapshot {
  date: string;
  gdpNominal: number;
  realGdp: number;
  treasury: number;
  debtToGdp: number;
  stabilityIndex: number;
  approvalRating: number;
  inflation: number;
  population: number;
  foodSecurity: number;
  waterAccess: number;
  housingAvailability: number;
  transportEfficiency: number;
}

export interface TemporalJumpReport {
  id: string;
  fromDate: string;
  toDate: string;
  elapsedDays: number;
  nationId: string;
  nationName: string;
  triggerCommand: string;
  metricsBefore: {
    gdpNominal: number;
    treasury: number;
    debtToGdp: number;
    stabilityIndex: number;
    approvalRating: number;
    population: number;
    inflation: number;
    vitals: { food: number; water: number; housing: number; transport: number };
  };
  metricsAfter: {
    gdpNominal: number;
    treasury: number;
    debtToGdp: number;
    stabilityIndex: number;
    approvalRating: number;
    population: number;
    inflation: number;
    vitals: { food: number; water: number; housing: number; transport: number };
  };
  completedProjects: string[];
  activePoliciesCompounded: string[];
  progressedFactors: string[];
  degradedFactors: string[];
  executiveSummary: string;
}

export interface NationalFocus {
  id: string;
  name: string;
  description: string;
  duration: number; // turns or months
  progress: number;
  completed: boolean;
  effects: string[];
  prerequisites: string[];
}

export interface Character {
  id: string;
  name: string;
  role: 'General' | 'Governor' | 'Diplomat' | 'Spy' | 'Heir' | 'Leader';
  age: number;
  traits: string[];
  loyalty: number; // 0-100
  influence: number; // 0-100
  portrait?: string;
}

export interface President {
  name: string;
  title?: string;
  salary: number;
  netWorth: number;
  familyStatus: string;
  publicPerception: string;
  stressLevel: number; // 0-100
  personalAssets: string[];
}

export interface Nation {
  id: string;
  name: string;
  region?: string;
  capital?: string;
  coordinates?: [number, number]; // [lng, lat]
  isPlayer: boolean;
  isLandlocked: boolean;
  stabilityIndex: number;
  approvalRating: number;
  survival: SurvivalMatrix;
  powerTrinity: PowerTrinity;
  shadow: Shadow;
  softPower: SoftPower;
  economicEngine: EconomicEngine;
  economic: EconomicLayer;
  military: MilitaryLayer;
  social: SocialLayer;
  diplomatic: DiplomaticLayer;
  governance?: Governance;
  borderSecurity?: BorderSecurity;
  intelligenceGrid?: IntelligenceGrid;
  ministries?: Record<string, Ministry>;
  activeProjects?: ActiveProject[];
  activePolicies?: PolicyDirective[];
  historicalSnapshots?: HistoricalSnapshot[];
  exports?: Record<string, number>;
  imports?: Record<string, number>;
  profitMargin?: number; // Monthly net fiscal balance in billions
  focusTree?: NationalFocus[];
  activeFocusId?: string | null;
  characters?: Character[];
  president?: President;
  religiousInfluence?: number;
  researchedTechs?: string[];
  isDemocratic: boolean;
  lastCyberAttackDate?: string;
}

export interface StateOfNation {
  stabilityIndex: number;
  approvalRating: number;
  vitals: {
    food: number;
    water: number;
    housing: number;
    transport: number;
  };
  treasury: string;
  intelligenceBrief: string;
}

export interface CabinetAdvice {
  minister: string;
  ministry: string;
  advice: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
}

export interface PublicPulse {
  source: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  text: string;
}

export interface Forecast {
  metric: string;
  prediction: string;
  trend: 'up' | 'down' | 'stable';
}

export interface OsintFeed {
  source: 'SATINT' | 'SIGINT' | 'HUMINT' | 'OSINT' | 'FININT';
  confidence: number;
  timestamp: string;
  data: string;
  region: string;
}

export interface ThreatEvent {
  id: string;
  category: 'TERRORISM' | 'CYBER' | 'MILITARY' | 'CIVIL_UNREST' | 'ECONOMIC' | 'DIPLOMATIC';
  description: string;
  probability: number;
  impact: number;
  timeframe: string;
  coordinates: [number, number]; // [longitude, latitude]
}

export interface KGNode {
  id: string;
  label: string;
  type: 'PERSON' | 'ORGANIZATION' | 'LOCATION' | 'EVENT' | 'ASSET';
}

export interface KGEdge {
  source: string;
  target: string;
  relation: string;
}

export interface KnowledgeGraph {
  nodes: KGNode[];
  edges: KGEdge[];
}

export interface IntelligenceBriefing {
  globalTicker: string[];
  stateOfNation: StateOfNation;
  sovereignsDesk: string[];
  chiefOfStaffMessage?: string;
  incomingCall?: {
    caller: string;
    message: string;
    options: string[];
  } | null;
  cabinetAdvice?: CabinetAdvice[];
  publicPulse?: PublicPulse[];
  forecasts?: Forecast[];
  osintFeeds?: OsintFeed[];
  threatMatrix?: ThreatEvent[];
  knowledgeGraph?: KnowledgeGraph;
}

export interface SaveCheckpoint {
  id: string;
  label: string;
  savedAt: string;
  simDate: string;
  playerNationId: string;
  gdpNominal: number;
  treasury: number;
  stabilityIndex: number;
  state: WorldState;
}

export interface WorldState {
  version?: string;
  playerNationId: string;
  currentDate: string;
  lastInteractionTime: number;
  nations: Record<string, Nation>;
  briefing: IntelligenceBriefing | null;
  lastJumpReport?: TemporalJumpReport | null;
  isProcessing: boolean;
  worldTension: number; // 0-100
}
