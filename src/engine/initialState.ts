import { WorldState } from '../types';

export const initialState: WorldState = {
  version: "2.0.0",
  playerNationId: "KEN",
  currentDate: "2026-05-15",
  lastInteractionTime: Date.now(),
  isProcessing: false,
  worldTension: 36,
  lastJumpReport: null,
  briefing: {
    globalTicker: [
      "EAST AFRICAN COMMUNITY EXPANDS COMMON CORRIDOR DIGITAL CUSTOMS",
      "NAIROBI GREEN GEOTHERMAL BONDS OVERSUBSCRIBED BY 140% IN LONDON",
      "RED SEA MARITIME INSURANCE PREMIUMS FLUCTUATE AMID REGIONAL PATROLS",
      "AFRICAN CONTINENTAL FREE TRADE AREA CLEARING HOUSE LAUNCHES IN ACCRA",
      "GLOBAL SEMICONDUCTOR & LITHIUM SUPPLY CHAINS SHIFT TOWARD AFRICAN REFINERIES"
    ],
    stateOfNation: {
      stabilityIndex: 65,
      approvalRating: 56,
      vitals: {
        food: 70,
        water: 65,
        housing: 60,
        transport: 58
      },
      treasury: "Treasury: $8.50B · Liquid: $1,020M · Debt/GDP: 68.5%",
      intelligenceBrief: "Regional trade corridors from Mombasa to Kampala and Kigali report 14% higher throughput following automated customs integration. Domestic fiscal debates center on balancing infrastructure capital expenditure against sovereign Eurobond coupon obligations while maintaining rural agricultural subsidies."
    },
    sovereignsDesk: [
      "Parliamentary Budget Committee awaits Executive directive on the 2026 Digital & Industrial Finance Bill.",
      "Mombasa-Nairobi-Malaba Standard Gauge Railway electrification & logistics hub expansion requires $1.2B tranche authorization.",
      "Joint EAC Security Council requests coordinated border intelligence sharing along the Juba-Mandera corridor."
    ],
    chiefOfStaffMessage: "Welcome to the Sovereign Atlas Command Deck, Mr. President. All national telemetry, ministerial ledgers, and regional diplomatic feeds are synchronized as of 2026-05-15.\n\nYour administration currently holds $8.50B in sovereign treasury reserves against a $115.0B nominal GDP (68.5% Debt-to-GDP). Three flagship national projects—the Affordable Housing Initiative, Universal Health Coverage (SHIF), and the Digital Superhighway—are actively compounding in our causal ledger.\n\nYou may issue any executive policy directive in natural language, reallocate ministerial budgets, initiate bilateral diplomatic treaties, or fast-forward the simulation to any future date (e.g., 'Fast-forward to February 6, 2029' or '+5 Years') to inspect the exact macroeconomic and social trajectory of your policies.",
    cabinetAdvice: [
      {
        minister: "John Mbadi",
        ministry: "National Treasury & Economic Planning",
        advice: "Maintain at least $3.0B in liquid sovereign reserves ahead of the June Eurobond coupon window while expanding e-TIMS digital tax compliance to lower our Debt-to-GDP ratio below 64%.",
        urgency: "high"
      },
      {
        minister: "Prof. Kithure Kindiki",
        ministry: "Interior & National Administration",
        advice: "Deploying acoustic and satellite border surveillance in the North Eastern corridor will raise domestic stability by +6 points and protect cross-border trade.",
        urgency: "medium"
      },
      {
        minister: "Dr. Margaret Ndungu",
        ministry: "ICT & Digital Economy",
        advice: "Completing the 100,000km Digital Superhighway fiber backbone will permanently boost annual GDP growth by +0.8% and expand youth employment.",
        urgency: "medium"
      },
      {
        minister: "Opiyo Wandayi",
        ministry: "Energy & Petroleum",
        advice: "Olkaria VI Geothermal expansion can increase grid stability to 88% and cut industrial power tariffs by 18% within 18 months.",
        urgency: "low"
      }
    ],
    publicPulse: [
      {
        source: "Nairobi Business Daily",
        sentiment: "positive",
        text: "Shilling stability and geothermal industrial parks attract $680M in fresh East African manufacturing commitments."
      },
      {
        source: "Rift Valley Farmers Union",
        sentiment: "neutral",
        text: "Fertilizer distribution digital vouchers have improved maize yields, though rural feeder roads require urgent grading before harvest."
      },
      {
        source: "TechMoran / Silicon Savannah",
        sentiment: "positive",
        text: "Nairobi fintech and AI engineering hubs record 22% growth in regional cross-border payment volume."
      }
    ],
    forecasts: [
      {
        metric: "Annualized GDP Growth",
        prediction: "+5.4% projected over next 12 months on back of Digital Superhighway & EAC trade",
        trend: "up"
      },
      {
        metric: "Sovereign Debt-to-GDP",
        prediction: "Projected to decline toward 64.2% if current primary fiscal surplus holds",
        trend: "down"
      },
      {
        metric: "Regional Trade Balance",
        prediction: "Tea, horticulture, and digital service exports narrowing current account deficit",
        trend: "up"
      }
    ],
    osintFeeds: [
      {
        source: "SIGINT",
        confidence: 92,
        timestamp: "2026-05-15T06:30:00Z",
        data: "Intercepted maritime logistics telemetry indicates 18% increase in container vessel diversions toward Mombasa Port due to Red Sea insurance surcharges.",
        region: "Indian Ocean / Coastal Corridor"
      },
      {
        source: "FININT",
        confidence: 89,
        timestamp: "2026-05-15T08:15:00Z",
        data: "Sovereign wealth desks in Abu Dhabi and London signaling strong appetite for East African green infrastructure bonds at 6.2% yield.",
        region: "Global Financial Markets"
      },
      {
        source: "HUMINT",
        confidence: 85,
        timestamp: "2026-05-15T09:40:00Z",
        data: "EAC Ministerial caucus in Arusha preparing draft protocol for zero-tariff agricultural and refined mineral transit across Kenya, Uganda, and Tanzania.",
        region: "East African Community"
      }
    ],
    threatMatrix: [
      {
        id: "threat-border-1",
        category: "TERRORISM",
        description: "Cross-border asymmetric militia supply line activity near Mandera-Gedo tri-border sector.",
        probability: 58,
        impact: 65,
        timeframe: "30d",
        coordinates: [41.85, 3.93]
      },
      {
        id: "threat-cyber-2",
        category: "CYBER",
        description: "Automated DDoS and credential-stuffing probes targeting regional customs and central bank payment gateways.",
        probability: 64,
        impact: 55,
        timeframe: "14d",
        coordinates: [36.82, -1.29]
      },
      {
        id: "threat-econ-3",
        category: "ECONOMIC",
        description: "Global crude oil price volatility impacting Mombasa refinery import bill and inland haulage costs.",
        probability: 48,
        impact: 60,
        timeframe: "60d",
        coordinates: [39.66, -4.04]
      }
    ],
    knowledgeGraph: {
      nodes: [
        { id: "n1", label: "Sovereign Treasury", type: "ORGANIZATION" },
        { id: "n2", label: "Mombasa-Malaba Corridor", type: "LOCATION" },
        { id: "n3", label: "EAC Common Market", type: "ORGANIZATION" },
        { id: "n4", label: "Olkaria Geothermal Grid", type: "ASSET" },
        { id: "n5", label: "Digital Superhighway", type: "ASSET" },
        { id: "n6", label: "2026 Finance Reform", type: "EVENT" }
      ],
      edges: [
        { source: "n1", target: "n5", relation: "FUNDS" },
        { source: "n1", target: "n6", relation: "ADMINISTERS" },
        { source: "n2", target: "n3", relation: "ANCHORS" },
        { source: "n4", target: "n2", relation: "POWERS" },
        { source: "n5", target: "n1", relation: "EXPANDS_REVENUE" }
      ]
    }
  },
  nations: {
    "KEN": {
      id: "KEN",
      name: "Kenya",
      region: "East Africa",
      capital: "Nairobi",
      coordinates: [36.8219, -1.2921],
      isPlayer: true,
      isLandlocked: false,
      stabilityIndex: 65,
      approvalRating: 56,
      survival: { foodSecurity: 70, waterAccess: 65, housingAvailability: 60, transportEfficiency: 58 },
      powerTrinity: { weaponsTech: 44, militaryLogistics: 52, nuclearReadiness: 0 },
      shadow: { spyingNetwork: 48, digitalSecurity: 46, internalPolicing: 58, infrastructureResilience: 52 },
      softPower: { tourismAppeal: 86, diplomaticTrust: 74, culturalExport: 68 },
      economicEngine: { gdp: 115, debtInterest: 4.8, inflationTax: 1.8, tradeBalance: -4.2, schooling: 68, jobs: 52, energyIndependence: 64 },
      economic: {
        gdpNominal: 115.0,
        gdpPpp: 342.0,
        realGdp: 110.5,
        debtToGdp: 68.5,
        inflation: 0.38,
        currencyVolatility: 11,
        exchangeRate: 129.5,
        treasury: 8.5,
        liquidCash: 1020,
        eurobondPaymentDate: "2027-06-24",
        debtCrisis: false,
        taxEfficiency: 76,
        taxRevenue: 19.4,
        foreignReserves: 7.8,
        portEfficiency: 70,
        portCongestionDays: 2,
        fuelReserves: 58,
        electricityGridStability: 76,
        energyBalance: 14.2,
        defaultWarning: false,
        supplyChain: {
          crudeOil: 18, wheat: 48, semiconductors: 15, rareEarths: 28, lithium: 14, medicine: 45,
          uranium: 0, gold: 32, steel: 35, naturalGas: 18, copper: 24, cobalt: 18
        }
      },
      military: {
        activePersonnel: 28000,
        reservePersonnel: 8000,
        powerProjection: 42,
        nuclearReadiness: 0,
        logisticsCapacity: 54,
        techTier: 2,
        warExhaustion: 5,
        casualtyTolerance: 42,
        ewIntensity: 24,
        weaponStockpiles: 56,
        chemicalStatus: "Non-Proliferation Compliant",
        armyDivisions: [
          { name: "1st Infantry Brigade (Garissa)", role: "Border & Corridor Defense", personnel: 5500, tanks: 24, artillery: 18, firepowerScore: 48, visibility: 60 },
          { name: "Special Operations Regiment (Gilgil)", role: "Rapid Counter-Terrorism", personnel: 1800, tanks: 0, artillery: 6, firepowerScore: 68, visibility: 20 },
          { name: "Armored Reconnaissance Battalion", role: "Mechanized Mobility", personnel: 2400, tanks: 38, artillery: 12, firepowerScore: 55, visibility: 50 }
        ],
        navalFleets: [
          { name: "Kenya Navy Mtongwe Fleet", role: "EEZ & Indian Ocean Patrol", aircraftCarriers: 0, submarines: 0, frigates: 1, destroyers: 0, patrolShips: 16 }
        ],
        airWings: [
          { name: "Laikipia Tactical Air Wing", role: "Air Superiority & Close Support", fighterJets: 14, bombers: 0, reconnaissanceAircraft: 4, transportAircraft: 8, helicopters: 18 }
        ],
        droneFleets: [
          { id: "ken-drone-1", name: "ISR Border Surveillance Wing", fpvDensity: 35, jammingResilience: 45, loiteringEndurance: 4, hasAIGuidance: false }
        ]
      },
      social: {
        politicalLegitimacy: 66,
        tension: 42,
        brainDrain: 48,
        socialMediaSentiment: 54,
        population: 56.2,
        cynicism: 0.28,
        socialCreditScore: 62,
        voterDemographics: {
          identification: { Socialist: 0.4, Capitalist: 0.35, Nationalist: 0.6, Globalist: 0.3, Religious: 0.65, Secular: 0.35, Urban: 0.38, Rural: 0.62 },
          approval: { Socialist: 56, Capitalist: 58, Nationalist: 68, Globalist: 54, Religious: 62, Secular: 52, Urban: 54, Rural: 64 },
          grudges: { Socialist: 0, Capitalist: 0, Nationalist: 0, Globalist: 0, Religious: 0, Secular: 0, Urban: 0, Rural: 0 }
        },
        hospitalBedsPer1k: 1.5,
        housingDeficit: 1850000
      },
      diplomatic: {
        bti: { "UGA": 68, "TZA": 64, "ETH": 62, "EGY": 52, "NGA": 60, "ZAF": 62, "USA": 72, "CHN": 74, "GBR": 68, "RUS": 40 },
        treaties: ["EAC Common Market", "AfCFTA", "Nairobi-London Trade Pact", "COMESA"],
        sanctions: []
      },
      governance: {
        transparency: 52,
        monthsBelowApprovalThreshold: 0
      },
      borderSecurity: {
        somaliaBorderOpen: false,
        portFeesEAC: "normal"
      },
      intelligenceGrid: {
        domestic: { name: "National Intelligence Service (NIS)", power: 72, activeOperations: ["Northern Corridor SIGINT", "Customs Revenue Integrity", "Counter-Insurgency Grid"] },
        foreign: {
          "CHN": { name: "MSS Africa Desk", power: 80, threatLevel: 35, activeOperations: ["Port & Rail Telemetry Monitoring"] },
          "USA": { name: "CIA East Africa Station", power: 88, threatLevel: 25, activeOperations: ["Horn of Africa Counter-Terrorism Liaison"] },
          "GBR": { name: "SIS (MI6) Regional Liaison", power: 82, threatLevel: 20, activeOperations: ["Financial & Cyber Compliance"] }
        }
      },
      ministries: {
        "executive": { name: "Executive Office of the President", cabinetSecretary: "Musalia Mudavadi", budget: 0.4, performance: 82, status: "Operational" },
        "treasury": { name: "National Treasury & Economic Planning", cabinetSecretary: "John Mbadi", budget: 0.9, performance: 74, status: "Operational" },
        "interior": { name: "Interior & National Administration", cabinetSecretary: "Prof. Kithure Kindiki", budget: 2.6, performance: 75, status: "Operational" },
        "defense": { name: "Ministry of Defense", cabinetSecretary: "Soipan Tuya", budget: 1.5, performance: 85, status: "Operational" },
        "education": { name: "Ministry of Education", cabinetSecretary: "Julius Migos Ogamba", budget: 4.8, performance: 76, status: "Operational" },
        "health": { name: "Ministry of Health", cabinetSecretary: "Dr. Deborah Barasa", budget: 1.4, performance: 68, status: "Operational" },
        "energy": { name: "Energy & Petroleum", cabinetSecretary: "Opiyo Wandayi", budget: 0.8, performance: 78, status: "Operational" },
        "ict": { name: "ICT & Digital Economy", cabinetSecretary: "Dr. Margaret Ndungu", budget: 0.6, performance: 81, status: "Operational" },
        "agriculture": { name: "Agriculture & Livestock Development", cabinetSecretary: "Dr. Andrew Karanja", budget: 0.9, performance: 72, status: "Operational" },
        "lands": { name: "Lands, Public Works & Housing", cabinetSecretary: "Alice Wahome", budget: 0.7, performance: 66, status: "Operational" },
        "trade": { name: "Investment, Trade & Industry", cabinetSecretary: "Salim Mvurya", budget: 0.6, performance: 73, status: "Operational" },
        "water": { name: "Water, Sanitation & Irrigation", cabinetSecretary: "Eric Mugaa", budget: 0.6, performance: 67, status: "Operational" },
        "tourism": { name: "Tourism & Wildlife", cabinetSecretary: "Rebecca Miano", budget: 0.4, performance: 80, status: "Operational" },
        "mining": { name: "Mining, Blue Economy & Maritime", cabinetSecretary: "Hassan Joho", budget: 0.4, performance: 70, status: "Operational" },
        "environment": { name: "Environment, Climate Change & Forestry", cabinetSecretary: "Aden Duale", budget: 0.4, performance: 75, status: "Operational" }
      },
      activeProjects: [
        { id: "proj-1", name: "Affordable Housing Initiative (Phase II)", ministry: "Lands, Public Works & Housing", budgetAllocated: 1.5, progress: 34, status: "On Track", expectedCompletionDate: "2027-11-01" },
        { id: "proj-2", name: "Universal Health Coverage (SHIF Digital Rollout)", ministry: "Ministry of Health", budgetAllocated: 1.1, progress: 62, status: "On Track", expectedCompletionDate: "2026-12-15" },
        { id: "proj-3", name: "National Digital Superhighway (100,000km Fiber)", ministry: "ICT & Digital Economy", budgetAllocated: 0.7, progress: 72, status: "On Track", expectedCompletionDate: "2026-10-30" },
        { id: "proj-4", name: "Olkaria Geothermal 500MW Industrial Expansion", ministry: "Energy & Petroleum", budgetAllocated: 0.9, progress: 45, status: "On Track", expectedCompletionDate: "2027-08-01" }
      ],
      activePolicies: [
        {
          id: "pol-init-1",
          title: "Silicon Savannah Digital Tax & Fiber Incentive",
          category: "ECONOMIC",
          enactedDate: "2026-01-15",
          summary: "Automated e-TIMS revenue collection paired with zero-rated fiber optic equipment imports to boost GDP growth and fiscal revenue.",
          status: "ACTIVE",
          dailyEffects: {
            gdpGrowthBonus: 0.000045,
            treasuryDeltaB: 0.0022,
            stabilityDelta: 0.003,
            approvalDelta: 0.002,
            inflationDelta: -0.001,
            transportDelta: 0.004
          }
        },
        {
          id: "pol-init-2",
          title: "Fertilizer & Irrigation Input Subsidy Program",
          category: "SOCIAL",
          enactedDate: "2026-02-10",
          summary: "Direct e-voucher fertilizer distribution to 4.2M smallholder farmers across Rift Valley and Western regions.",
          status: "ACTIVE",
          dailyEffects: {
            gdpGrowthBonus: 0.000025,
            treasuryDeltaB: -0.0008,
            stabilityDelta: 0.005,
            approvalDelta: 0.006,
            inflationDelta: -0.002,
            foodDelta: 0.008,
            waterDelta: 0.004
          }
        }
      ],
      historicalSnapshots: [
        {
          date: "2025-07-01",
          gdpNominal: 109.4,
          realGdp: 105.2,
          treasury: 7.6,
          debtToGdp: 71.2,
          stabilityIndex: 61,
          approvalRating: 51,
          inflation: 0.48,
          population: 55.2,
          foodSecurity: 65,
          waterAccess: 62,
          housingAvailability: 57,
          transportEfficiency: 54
        },
        {
          date: "2025-10-01",
          gdpNominal: 111.1,
          realGdp: 106.8,
          treasury: 7.9,
          debtToGdp: 70.4,
          stabilityIndex: 62,
          approvalRating: 53,
          inflation: 0.44,
          population: 55.5,
          foodSecurity: 67,
          waterAccess: 63,
          housingAvailability: 58,
          transportEfficiency: 55
        },
        {
          date: "2026-01-01",
          gdpNominal: 113.0,
          realGdp: 108.6,
          treasury: 8.2,
          debtToGdp: 69.5,
          stabilityIndex: 64,
          approvalRating: 54,
          inflation: 0.41,
          population: 55.8,
          foodSecurity: 68,
          waterAccess: 64,
          housingAvailability: 59,
          transportEfficiency: 56
        },
        {
          date: "2026-04-01",
          gdpNominal: 114.4,
          realGdp: 109.9,
          treasury: 8.4,
          debtToGdp: 68.8,
          stabilityIndex: 65,
          approvalRating: 55,
          inflation: 0.39,
          population: 56.1,
          foodSecurity: 70,
          waterAccess: 65,
          housingAvailability: 60,
          transportEfficiency: 58
        },
        {
          date: "2026-05-15",
          gdpNominal: 115.0,
          realGdp: 110.5,
          treasury: 8.5,
          debtToGdp: 68.5,
          stabilityIndex: 65,
          approvalRating: 56,
          inflation: 0.38,
          population: 56.2,
          foodSecurity: 70,
          waterAccess: 65,
          housingAvailability: 60,
          transportEfficiency: 58
        }
      ],
      exports: { "Tea & Specialty Coffee": 1.6, "Cut Flowers & Horticulture": 1.1, "Digital & Fintech Services": 0.8, "Apparel & Textiles": 0.5, "Titanium & Soda Ash": 0.4 },
      imports: { "Industrial Machinery": 1.6, "Refined Petroleum": 2.0, "Pharmaceuticals": 0.7, "Commercial Vehicles": 0.7, "Steel & Construction": 0.5 },
      profitMargin: 0.12,
      focusTree: [
        { id: "econ_recovery", name: "Sovereign Debt & Revenue Modernization", description: "Digitize customs and expand geothermal industrial zones to build fiscal surplus.", duration: 4, progress: 30, completed: false, effects: ["+$2.5B Treasury", "-1.5% Debt/GDP", "+5% Tax Efficiency"], prerequisites: [] },
        { id: "military_modernization", name: "East African Rapid Defense Doctrine", description: "Upgrade ISR drone wings, armored mobility, and coastal patrol frigates.", duration: 5, progress: 0, completed: false, effects: ["+8 Power Projection", "+6 Logistics Capacity"], prerequisites: [] },
        { id: "pan_african_unity", name: "EAC Common Currency & Corridor Accord", description: "Eliminate non-tariff barriers across Mombasa-Kampala-Dar es Salaam corridors.", duration: 5, progress: 0, completed: false, effects: ["+15 BTI with EAC", "+10 Diplomatic Trust", "+8 Transport Efficiency"], prerequisites: [] }
      ],
      activeFocusId: "econ_recovery",
      characters: [
        { id: "char_1", name: "Gen. Charles Kahariri", role: "General", age: 58, traits: ["Strategic Planner", "Joint Operations"], loyalty: 94, influence: 84 },
        { id: "char_2", name: "Amb. Amina Mohamed", role: "Diplomat", age: 61, traits: ["Multilateral Negotiator", "Trade Specialist"], loyalty: 88, influence: 80 },
        { id: "char_3", name: "Noordin Haji", role: "Spy", age: 56, traits: ["Counter-Terrorism", "Regional SIGINT"], loyalty: 91, influence: 82 }
      ],
      president: {
        name: "Victor",
        title: "President of the Republic",
        salary: 165000,
        netWorth: 2800000,
        familyStatus: "Married, 2 Children",
        publicPerception: "Technocratic Reformer",
        stressLevel: 38,
        personalAssets: ["Agricultural Estate in Rift Valley", "NSE Infrastructure Bonds", "Safaricom Equity Holdings"]
      },
      religiousInfluence: 45,
      researchedTechs: ["Modernized Signal Encryption", "Geothermal Direct-Use Steam Grids"],
      isDemocratic: true
    },

    "UGA": {
      id: "UGA",
      name: "Uganda",
      region: "East Africa",
      capital: "Kampala",
      coordinates: [32.5825, 0.3476],
      isPlayer: false,
      isLandlocked: true,
      stabilityIndex: 58,
      approvalRating: 52,
      survival: { foodSecurity: 76, waterAccess: 62, housingAvailability: 54, transportEfficiency: 48 },
      powerTrinity: { weaponsTech: 36, militaryLogistics: 40, nuclearReadiness: 0 },
      shadow: { spyingNetwork: 45, digitalSecurity: 32, internalPolicing: 64, infrastructureResilience: 40 },
      softPower: { tourismAppeal: 64, diplomaticTrust: 58, culturalExport: 45 },
      economicEngine: { gdp: 54, debtInterest: 2.1, inflationTax: 2.0, tradeBalance: -1.8, schooling: 58, jobs: 46, energyIndependence: 55 },
      economic: {
        gdpNominal: 54.0, gdpPpp: 155.0, realGdp: 51.2, debtToGdp: 48.5, inflation: 0.42, currencyVolatility: 14, exchangeRate: 3720, treasury: 4.8,
        liquidCash: 520, eurobondPaymentDate: "2027-11-15", debtCrisis: false, taxEfficiency: 64, portCongestionDays: 0,
        energyBalance: 6.4, defaultWarning: false,
        supplyChain: { crudeOil: 55, wheat: 35, semiconductors: 5, rareEarths: 15, lithium: 8, medicine: 28, uranium: 0, gold: 45, steel: 20, naturalGas: 15, copper: 20, cobalt: 25 }
      },
      military: { activePersonnel: 45000, reservePersonnel: 10000, powerProjection: 34, nuclearReadiness: 0, logisticsCapacity: 40, techTier: 2, warExhaustion: 10, casualtyTolerance: 50, ewIntensity: 18, armyDivisions: [{ name: "UPDF 1st Infantry Division", role: "Regional Security", personnel: 12000, tanks: 35, artillery: 22, firepowerScore: 42, visibility: 65 }], navalFleets: [], airWings: [{ name: "Entebbe Air Base Wing", role: "Close Air Support", fighterJets: 8, bombers: 0, reconnaissanceAircraft: 2, transportAircraft: 4, helicopters: 16 }], droneFleets: [] },
      social: {
        politicalLegitimacy: 58, tension: 46, brainDrain: 55, socialMediaSentiment: 48, population: 49.5, cynicism: 0.35, socialCreditScore: 48,
        voterDemographics: {
          identification: { Socialist: 0.3, Capitalist: 0.3, Nationalist: 0.7, Globalist: 0.2, Religious: 0.75, Secular: 0.25, Urban: 0.28, Rural: 0.72 },
          approval: { Socialist: 50, Capitalist: 52, Nationalist: 62, Globalist: 48, Religious: 58, Secular: 46, Urban: 45, Rural: 60 },
          grudges: { Socialist: 0, Capitalist: 0, Nationalist: 0, Globalist: 0, Religious: 0, Secular: 0, Urban: 0, Rural: 0 }
        }
      },
      diplomatic: { bti: { "KEN": 68, "TZA": 70, "ETH": 55, "USA": 50, "CHN": 68, "RUS": 55 }, treaties: ["EAC Common Market", "AfCFTA"], sanctions: [] },
      activeProjects: [
        { id: "uga-proj-1", name: "Albertine Graben Tilenga Oil Refinery", ministry: "Energy & Mineral Development", budgetAllocated: 2.2, progress: 58, status: "On Track", expectedCompletionDate: "2027-06-01" }
      ],
      activePolicies: [],
      historicalSnapshots: [],
      profitMargin: 0.06,
      focusTree: [],
      characters: [],
      religiousInfluence: 40,
      isDemocratic: true
    },

    "TZA": {
      id: "TZA",
      name: "Tanzania",
      region: "East Africa",
      capital: "Dodoma",
      coordinates: [35.7516, -6.1630],
      isPlayer: false,
      isLandlocked: false,
      stabilityIndex: 72,
      approvalRating: 64,
      survival: { foodSecurity: 78, waterAccess: 66, housingAvailability: 64, transportEfficiency: 62 },
      powerTrinity: { weaponsTech: 38, militaryLogistics: 46, nuclearReadiness: 0 },
      shadow: { spyingNetwork: 42, digitalSecurity: 38, internalPolicing: 60, infrastructureResilience: 48 },
      softPower: { tourismAppeal: 88, diplomaticTrust: 72, culturalExport: 62 },
      economicEngine: { gdp: 85, debtInterest: 2.8, inflationTax: 1.5, tradeBalance: -2.1, schooling: 64, jobs: 54, energyIndependence: 70 },
      economic: {
        gdpNominal: 85.0, gdpPpp: 235.0, realGdp: 81.5, debtToGdp: 46.2, inflation: 0.31, currencyVolatility: 9, exchangeRate: 2580, treasury: 6.4,
        liquidCash: 780, eurobondPaymentDate: "2028-03-15", debtCrisis: false, taxEfficiency: 70, portCongestionDays: 2,
        energyBalance: 11.8, defaultWarning: false,
        supplyChain: { crudeOil: 15, wheat: 50, semiconductors: 8, rareEarths: 45, lithium: 35, medicine: 35, uranium: 20, gold: 65, steel: 30, naturalGas: 75, copper: 40, cobalt: 35 }
      },
      military: { activePersonnel: 32000, reservePersonnel: 15000, powerProjection: 36, nuclearReadiness: 0, logisticsCapacity: 48, techTier: 2, warExhaustion: 5, casualtyTolerance: 45, ewIntensity: 18, armyDivisions: [{ name: "TPDF Southern Command", role: "Border & LNG Protection", personnel: 10000, tanks: 30, artillery: 20, firepowerScore: 44, visibility: 60 }], navalFleets: [{ name: "Dar es Salaam Naval Command", role: "Coastal Defense", aircraftCarriers: 0, submarines: 0, frigates: 0, destroyers: 0, patrolShips: 12 }], airWings: [], droneFleets: [] },
      social: {
        politicalLegitimacy: 72, tension: 30, brainDrain: 35, socialMediaSentiment: 62, population: 67.4, cynicism: 0.22, socialCreditScore: 58,
        voterDemographics: {
          identification: { Socialist: 0.5, Capitalist: 0.35, Nationalist: 0.65, Globalist: 0.3, Religious: 0.6, Secular: 0.4, Urban: 0.36, Rural: 0.64 },
          approval: { Socialist: 66, Capitalist: 62, Nationalist: 70, Globalist: 58, Religious: 64, Secular: 60, Urban: 62, Rural: 66 },
          grudges: { Socialist: 0, Capitalist: 0, Nationalist: 0, Globalist: 0, Religious: 0, Secular: 0, Urban: 0, Rural: 0 }
        }
      },
      diplomatic: { bti: { "KEN": 64, "UGA": 70, "CHN": 78, "USA": 62, "GBR": 60 }, treaties: ["EAC Common Market", "SADC", "AfCFTA"], sanctions: [] },
      activeProjects: [
        { id: "tza-proj-1", name: "Central Corridor Electric SGR & Lindi LNG Terminal", ministry: "Transport & Energy", budgetAllocated: 3.1, progress: 64, status: "On Track", expectedCompletionDate: "2027-09-01" }
      ],
      activePolicies: [],
      historicalSnapshots: [],
      profitMargin: 0.1,
      focusTree: [],
      characters: [],
      religiousInfluence: 40,
      isDemocratic: true
    },

    "ETH": {
      id: "ETH",
      name: "Ethiopia",
      region: "Horn of Africa",
      capital: "Addis Ababa",
      coordinates: [38.7578, 9.0054],
      isPlayer: false,
      isLandlocked: true,
      stabilityIndex: 52,
      approvalRating: 50,
      survival: { foodSecurity: 60, waterAccess: 68, housingAvailability: 55, transportEfficiency: 54 },
      powerTrinity: { weaponsTech: 48, militaryLogistics: 50, nuclearReadiness: 0 },
      shadow: { spyingNetwork: 62, digitalSecurity: 48, internalPolicing: 70, infrastructureResilience: 50 },
      softPower: { tourismAppeal: 60, diplomaticTrust: 58, culturalExport: 65 },
      economicEngine: { gdp: 145, debtInterest: 4.5, inflationTax: 3.5, tradeBalance: -5.5, schooling: 56, jobs: 48, energyIndependence: 82 },
      economic: {
        gdpNominal: 145.0, gdpPpp: 390.0, realGdp: 136.0, debtToGdp: 54.0, inflation: 0.85, currencyVolatility: 22, exchangeRate: 118.0, treasury: 6.2,
        liquidCash: 680, eurobondPaymentDate: "2027-12-01", debtCrisis: false, taxEfficiency: 62, portCongestionDays: 0,
        energyBalance: 24.5, defaultWarning: false,
        supplyChain: { crudeOil: 5, wheat: 68, semiconductors: 8, rareEarths: 25, lithium: 20, medicine: 30, uranium: 0, gold: 45, steel: 30, naturalGas: 25, copper: 25, cobalt: 15 }
      },
      military: { activePersonnel: 138000, reservePersonnel: 40000, powerProjection: 52, nuclearReadiness: 0, logisticsCapacity: 50, techTier: 3, warExhaustion: 35, casualtyTolerance: 60, ewIntensity: 35, armyDivisions: [{ name: "ENDF Central Command", role: "Mechanized Defense", personnel: 25000, tanks: 120, artillery: 85, firepowerScore: 62, visibility: 70 }], navalFleets: [], airWings: [{ name: "Bishoftu Air Wing", role: "Strategic Strike & ISR", fighterJets: 24, bombers: 0, reconnaissanceAircraft: 6, transportAircraft: 10, helicopters: 22 }], droneFleets: [] },
      social: {
        politicalLegitimacy: 54, tension: 58, brainDrain: 50, socialMediaSentiment: 46, population: 128.0, cynicism: 0.36, socialCreditScore: 55,
        voterDemographics: {
          identification: { Socialist: 0.45, Capitalist: 0.3, Nationalist: 0.7, Globalist: 0.25, Religious: 0.75, Secular: 0.25, Urban: 0.25, Rural: 0.75 },
          approval: { Socialist: 52, Capitalist: 54, Nationalist: 55, Globalist: 50, Religious: 55, Secular: 48, Urban: 54, Rural: 50 },
          grudges: { Socialist: 0, Capitalist: 0, Nationalist: 0, Globalist: 0, Religious: 0, Secular: 0, Urban: 0, Rural: 0 }
        }
      },
      diplomatic: { bti: { "KEN": 62, "EGY": -45, "CHN": 75, "USA": 52, "RUS": 60 }, treaties: ["AU Host Accord", "BRICS", "AfCFTA", "LAPSSET Corridor"], sanctions: [] },
      activeProjects: [
        { id: "eth-proj-1", name: "GERD Full Turbine Hydro-Export Grid", ministry: "Water & Energy", budgetAllocated: 4.5, progress: 88, status: "On Track", expectedCompletionDate: "2026-11-01" }
      ],
      activePolicies: [],
      historicalSnapshots: [],
      profitMargin: 0.08,
      focusTree: [],
      characters: [],
      religiousInfluence: 55,
      isDemocratic: true
    },

    "EGY": {
      id: "EGY",
      name: "Egypt",
      region: "North Africa & Suez",
      capital: "Cairo",
      coordinates: [31.2357, 30.0444],
      isPlayer: false,
      isLandlocked: false,
      stabilityIndex: 62,
      approvalRating: 54,
      survival: { foodSecurity: 64, waterAccess: 58, housingAvailability: 68, transportEfficiency: 74 },
      powerTrinity: { weaponsTech: 72, militaryLogistics: 74, nuclearReadiness: 15 },
      shadow: { spyingNetwork: 78, digitalSecurity: 68, internalPolicing: 82, infrastructureResilience: 70 },
      softPower: { tourismAppeal: 85, diplomaticTrust: 66, culturalExport: 78 },
      economicEngine: { gdp: 380, debtInterest: 18, inflationTax: 8, tradeBalance: -12, schooling: 70, jobs: 58, energyIndependence: 72 },
      economic: {
        gdpNominal: 380.0, gdpPpp: 1850.0, realGdp: 360.0, debtToGdp: 88.5, inflation: 0.95, currencyVolatility: 20, exchangeRate: 48.5, treasury: 34.0,
        liquidCash: 4200, eurobondPaymentDate: "2027-05-01", debtCrisis: false, taxEfficiency: 74, portCongestionDays: 1,
        energyBalance: 45.0, defaultWarning: false,
        supplyChain: { crudeOil: 65, wheat: 40, semiconductors: 20, rareEarths: 25, lithium: 15, medicine: 65, uranium: 15, gold: 55, steel: 70, naturalGas: 85, copper: 45, cobalt: 10 }
      },
      military: { activePersonnel: 440000, reservePersonnel: 480000, powerProjection: 74, nuclearReadiness: 10, logisticsCapacity: 75, techTier: 4, warExhaustion: 15, casualtyTolerance: 55, ewIntensity: 55, armyDivisions: [{ name: "Second Field Army (Suez)", role: "Armored Canal Defense", personnel: 45000, tanks: 450, artillery: 220, firepowerScore: 82, visibility: 80 }], navalFleets: [{ name: "Alexandria & Red Sea Fleet", role: "Amphibious & Maritime Control", aircraftCarriers: 2, submarines: 8, frigates: 13, destroyers: 0, patrolShips: 45 }], airWings: [], droneFleets: [] },
      social: {
        politicalLegitimacy: 62, tension: 48, brainDrain: 42, socialMediaSentiment: 50, population: 112.0, cynicism: 0.32, socialCreditScore: 65,
        voterDemographics: {
          identification: { Socialist: 0.4, Capitalist: 0.4, Nationalist: 0.75, Globalist: 0.3, Religious: 0.7, Secular: 0.3, Urban: 0.45, Rural: 0.55 },
          approval: { Socialist: 50, Capitalist: 58, Nationalist: 68, Globalist: 54, Religious: 55, Secular: 56, Urban: 54, Rural: 58 },
          grudges: { Socialist: 0, Capitalist: 0, Nationalist: 0, Globalist: 0, Religious: 0, Secular: 0, Urban: 0, Rural: 0 }
        }
      },
      diplomatic: { bti: { "KEN": 52, "ETH": -45, "USA": 68, "CHN": 72, "RUS": 65 }, treaties: ["COMESA", "BRICS", "AfCFTA", "Suez Maritime Convention"], sanctions: [] },
      activeProjects: [
        { id: "egy-proj-1", name: "New Administrative Capital & Suez Economic Zone", ministry: "Housing & Transport", budgetAllocated: 12.0, progress: 78, status: "On Track", expectedCompletionDate: "2027-04-01" }
      ],
      activePolicies: [],
      historicalSnapshots: [],
      profitMargin: 0.35,
      focusTree: [],
      characters: [],
      religiousInfluence: 60,
      isDemocratic: false
    },

    "NGA": {
      id: "NGA",
      name: "Nigeria",
      region: "West Africa",
      capital: "Abuja",
      coordinates: [7.4951, 9.0579],
      isPlayer: false,
      isLandlocked: false,
      stabilityIndex: 56,
      approvalRating: 49,
      survival: { foodSecurity: 62, waterAccess: 60, housingAvailability: 55, transportEfficiency: 56 },
      powerTrinity: { weaponsTech: 55, militaryLogistics: 58, nuclearReadiness: 0 },
      shadow: { spyingNetwork: 60, digitalSecurity: 54, internalPolicing: 62, infrastructureResilience: 50 },
      softPower: { tourismAppeal: 65, diplomaticTrust: 68, culturalExport: 92 },
      economicEngine: { gdp: 395, debtInterest: 14, inflationTax: 9, tradeBalance: 8.5, schooling: 62, jobs: 50, energyIndependence: 85 },
      economic: {
        gdpNominal: 395.0, gdpPpp: 1420.0, realGdp: 375.0, debtToGdp: 51.2, inflation: 1.1, currencyVolatility: 24, exchangeRate: 1550, treasury: 36.5,
        liquidCash: 3800, eurobondPaymentDate: "2027-09-28", debtCrisis: false, taxEfficiency: 62, portCongestionDays: 3,
        energyBalance: 32.0, defaultWarning: false,
        supplyChain: { crudeOil: 92, wheat: 35, semiconductors: 12, rareEarths: 30, lithium: 40, medicine: 40, uranium: 10, gold: 45, steel: 45, naturalGas: 90, copper: 30, cobalt: 20 }
      },
      military: { activePersonnel: 230000, reservePersonnel: 50000, powerProjection: 62, nuclearReadiness: 0, logisticsCapacity: 58, techTier: 3, warExhaustion: 25, casualtyTolerance: 55, ewIntensity: 35, armyDivisions: [{ name: "1st Mechanized Division (Kaduna)", role: "Internal & Regional Security", personnel: 22000, tanks: 140, artillery: 90, firepowerScore: 65, visibility: 70 }], navalFleets: [{ name: "Western Naval Command (Lagos)", role: "Gulf of Guinea Security", aircraftCarriers: 0, submarines: 0, frigates: 2, destroyers: 0, patrolShips: 32 }], airWings: [], droneFleets: [] },
      social: {
        politicalLegitimacy: 58, tension: 55, brainDrain: 62, socialMediaSentiment: 52, population: 229.0, cynicism: 0.38, socialCreditScore: 54,
        voterDemographics: {
          identification: { Socialist: 0.35, Capitalist: 0.55, Nationalist: 0.6, Globalist: 0.4, Religious: 0.75, Secular: 0.25, Urban: 0.52, Rural: 0.48 },
          approval: { Socialist: 46, Capitalist: 54, Nationalist: 52, Globalist: 55, Religious: 52, Secular: 48, Urban: 50, Rural: 50 },
          grudges: { Socialist: 0, Capitalist: 0, Nationalist: 0, Globalist: 0, Religious: 0, Secular: 0, Urban: 0, Rural: 0 }
        }
      },
      diplomatic: { bti: { "KEN": 60, "ZAF": 62, "USA": 66, "CHN": 72, "GBR": 65 }, treaties: ["ECOWAS", "AfCFTA", "OPEC"], sanctions: [] },
      activeProjects: [
        { id: "nga-proj-1", name: "Lekki Deep Sea Port & Petrochemical Export Hub", ministry: "Trade & Petroleum", budgetAllocated: 4.8, progress: 82, status: "On Track", expectedCompletionDate: "2026-12-01" }
      ],
      activePolicies: [],
      historicalSnapshots: [],
      profitMargin: 0.42,
      focusTree: [],
      characters: [],
      religiousInfluence: 65,
      isDemocratic: true
    },

    "ZAF": {
      id: "ZAF",
      name: "South Africa",
      region: "Southern Africa",
      capital: "Pretoria",
      coordinates: [28.2293, -25.7479],
      isPlayer: false,
      isLandlocked: false,
      stabilityIndex: 66,
      approvalRating: 58,
      survival: { foodSecurity: 82, waterAccess: 76, housingAvailability: 64, transportEfficiency: 72 },
      powerTrinity: { weaponsTech: 68, militaryLogistics: 66, nuclearReadiness: 20 },
      shadow: { spyingNetwork: 65, digitalSecurity: 70, internalPolicing: 60, infrastructureResilience: 66 },
      softPower: { tourismAppeal: 88, diplomaticTrust: 76, culturalExport: 80 },
      economicEngine: { gdp: 410, debtInterest: 16, inflationTax: 4, tradeBalance: 6.2, schooling: 74, jobs: 48, energyIndependence: 74 },
      economic: {
        gdpNominal: 410.0, gdpPpp: 990.0, realGdp: 392.0, debtToGdp: 73.5, inflation: 0.35, currencyVolatility: 14, exchangeRate: 18.2, treasury: 42.0,
        liquidCash: 5100, eurobondPaymentDate: "2027-10-15", debtCrisis: false, taxEfficiency: 84, portCongestionDays: 2,
        energyBalance: 48.0, defaultWarning: false,
        supplyChain: { crudeOil: 25, wheat: 70, semiconductors: 25, rareEarths: 75, lithium: 45, medicine: 72, uranium: 65, gold: 92, steel: 78, naturalGas: 35, copper: 65, cobalt: 55 }
      },
      military: { activePersonnel: 74000, reservePersonnel: 15000, powerProjection: 60, nuclearReadiness: 15, logisticsCapacity: 68, techTier: 3, warExhaustion: 10, casualtyTolerance: 45, ewIntensity: 40, armyDivisions: [{ name: "SANDF 43rd South African Brigade", role: "Mechanized Rapid Reaction", personnel: 14000, tanks: 85, artillery: 60, firepowerScore: 68, visibility: 65 }], navalFleets: [{ name: "Simon's Town Fleet", role: "Cape Sea Route Patrol", aircraftCarriers: 0, submarines: 3, frigates: 4, destroyers: 0, patrolShips: 18 }], airWings: [], droneFleets: [] },
      social: {
        politicalLegitimacy: 68, tension: 46, brainDrain: 44, socialMediaSentiment: 56, population: 62.0, cynicism: 0.3, socialCreditScore: 64,
        voterDemographics: {
          identification: { Socialist: 0.45, Capitalist: 0.45, Nationalist: 0.5, Globalist: 0.45, Religious: 0.55, Secular: 0.45, Urban: 0.68, Rural: 0.32 },
          approval: { Socialist: 55, Capitalist: 62, Nationalist: 56, Globalist: 60, Religious: 58, Secular: 60, Urban: 60, Rural: 55 },
          grudges: { Socialist: 0, Capitalist: 0, Nationalist: 0, Globalist: 0, Religious: 0, Secular: 0, Urban: 0, Rural: 0 }
        }
      },
      diplomatic: { bti: { "KEN": 62, "NGA": 62, "CHN": 78, "RUS": 65, "USA": 58, "GBR": 64 }, treaties: ["BRICS", "SADC", "AfCFTA", "G20"], sanctions: [] },
      activeProjects: [
        { id: "zaf-proj-1", name: "Eskom Renewable Grid & Transnet Freight Modernization", ministry: "Electricity & Transport", budgetAllocated: 6.5, progress: 66, status: "On Track", expectedCompletionDate: "2027-07-01" }
      ],
      activePolicies: [],
      historicalSnapshots: [],
      profitMargin: 0.38,
      focusTree: [],
      characters: [],
      religiousInfluence: 40,
      isDemocratic: true
    },

    "GBR": {
      id: "GBR",
      name: "United Kingdom",
      region: "Europe",
      capital: "London",
      coordinates: [-0.1276, 51.5072],
      isPlayer: false,
      isLandlocked: false,
      stabilityIndex: 74,
      approvalRating: 48,
      survival: { foodSecurity: 90, waterAccess: 95, housingAvailability: 66, transportEfficiency: 82 },
      powerTrinity: { weaponsTech: 90, militaryLogistics: 88, nuclearReadiness: 92 },
      shadow: { spyingNetwork: 94, digitalSecurity: 92, internalPolicing: 78, infrastructureResilience: 88 },
      softPower: { tourismAppeal: 90, diplomaticTrust: 74, culturalExport: 92 },
      economicEngine: { gdp: 3500, debtInterest: 110, inflationTax: 25, tradeBalance: -45, schooling: 88, jobs: 82, energyIndependence: 62 },
      economic: {
        gdpNominal: 3500.0, gdpPpp: 4050.0, realGdp: 3410.0, debtToGdp: 98.2, inflation: 0.22, currencyVolatility: 7, exchangeRate: 0.78, treasury: 185.0,
        liquidCash: 22000, eurobondPaymentDate: "2028-01-31", debtCrisis: false, taxEfficiency: 90, portCongestionDays: 1,
        energyBalance: 320.0, defaultWarning: false,
        supplyChain: { crudeOil: 55, wheat: 75, semiconductors: 65, rareEarths: 35, lithium: 30, medicine: 92, uranium: 60, gold: 80, steel: 65, naturalGas: 60, copper: 60, cobalt: 35 }
      },
      military: { activePersonnel: 145000, reservePersonnel: 35000, powerProjection: 86, nuclearReadiness: 92, logisticsCapacity: 88, techTier: 5, warExhaustion: 15, casualtyTolerance: 30, ewIntensity: 78, armyDivisions: [{ name: "3rd (UK) Division", role: "NATO High Readiness", personnel: 16000, tanks: 148, artillery: 90, firepowerScore: 88, visibility: 80 }], navalFleets: [{ name: "Royal Navy Carrier Strike Group", role: "Global Maritime Projection", aircraftCarriers: 2, submarines: 10, frigates: 11, destroyers: 6, patrolShips: 16 }], airWings: [], droneFleets: [] },
      social: {
        politicalLegitimacy: 72, tension: 42, brainDrain: 18, socialMediaSentiment: 46, population: 68.3, cynicism: 0.28, socialCreditScore: 72,
        voterDemographics: {
          identification: { Socialist: 0.4, Capitalist: 0.55, Nationalist: 0.45, Globalist: 0.55, Religious: 0.25, Secular: 0.75, Urban: 0.82, Rural: 0.18 },
          approval: { Socialist: 48, Capitalist: 50, Nationalist: 44, Globalist: 54, Religious: 46, Secular: 50, Urban: 50, Rural: 44 },
          grudges: { Socialist: 0, Capitalist: 0, Nationalist: 0, Globalist: 0, Religious: 0, Secular: 0, Urban: 0, Rural: 0 }
        }
      },
      diplomatic: { bti: { "KEN": 68, "USA": 88, "CHN": -25, "RUS": -75 }, treaties: ["NATO", "Commonwealth", "Nairobi-London Trade Pact", "G7"], sanctions: [] },
      activeProjects: [],
      activePolicies: [],
      historicalSnapshots: [],
      profitMargin: 1.4,
      focusTree: [],
      characters: [],
      religiousInfluence: 18,
      isDemocratic: true
    },

    "USA": {
      id: "USA",
      name: "United States",
      region: "North America",
      capital: "Washington, D.C.",
      coordinates: [-77.0369, 38.9072],
      isPlayer: false,
      isLandlocked: false,
      stabilityIndex: 72,
      approvalRating: 48,
      survival: { foodSecurity: 95, waterAccess: 95, housingAvailability: 72, transportEfficiency: 86 },
      powerTrinity: { weaponsTech: 100, militaryLogistics: 100, nuclearReadiness: 100 },
      shadow: { spyingNetwork: 100, digitalSecurity: 98, internalPolicing: 80, infrastructureResilience: 94 },
      softPower: { tourismAppeal: 90, diplomaticTrust: 68, culturalExport: 98 },
      economicEngine: { gdp: 28200, debtInterest: 850, inflationTax: 95, tradeBalance: -850, schooling: 90, jobs: 86, energyIndependence: 95 },
      economic: {
        gdpNominal: 28200.0, gdpPpp: 28200.0, realGdp: 27400.0, debtToGdp: 121.0, inflation: 0.21, currencyVolatility: 5, exchangeRate: 1.0, treasury: 980.0,
        liquidCash: 55000, eurobondPaymentDate: "2028-01-01", debtCrisis: false, taxEfficiency: 90, portCongestionDays: 1,
        energyBalance: 4200, defaultWarning: false,
        supplyChain: { crudeOil: 92, wheat: 95, semiconductors: 84, rareEarths: 45, lithium: 40, medicine: 92, uranium: 65, gold: 85, steel: 85, naturalGas: 96, copper: 72, cobalt: 30 }
      },
      military: { activePersonnel: 1320000, reservePersonnel: 780000, powerProjection: 100, nuclearReadiness: 100, logisticsCapacity: 100, techTier: 5, warExhaustion: 25, casualtyTolerance: 25, ewIntensity: 85, armyDivisions: [{ name: "1st Armored Division", role: "Heavy Combined Arms", personnel: 18000, tanks: 300, artillery: 150, firepowerScore: 96, visibility: 90 }], navalFleets: [{ name: "5th & 7th Fleet Task Forces", role: "Global Carrier Projection", aircraftCarriers: 11, submarines: 68, frigates: 0, destroyers: 72, patrolShips: 25 }], airWings: [{ name: "1st Fighter Wing", role: "5th-Gen Air Dominance", fighterJets: 48, bombers: 12, reconnaissanceAircraft: 8, transportAircraft: 20, helicopters: 30 }], droneFleets: [{ id: "usa-drone-1", name: "MQ-4C Triton Strategic Wing", fpvDensity: 20, jammingResilience: 95, loiteringEndurance: 10, hasAIGuidance: true }] },
      social: {
        politicalLegitimacy: 62, tension: 58, brainDrain: 8, socialMediaSentiment: 44, population: 336.5, cynicism: 0.25, socialCreditScore: 76,
        voterDemographics: {
          identification: { Socialist: 0.3, Capitalist: 0.7, Nationalist: 0.5, Globalist: 0.6, Religious: 0.4, Secular: 0.6, Urban: 0.8, Rural: 0.2 },
          approval: { Socialist: 40, Capitalist: 54, Nationalist: 46, Globalist: 52, Religious: 44, Secular: 52, Urban: 50, Rural: 44 },
          grudges: { Socialist: 0, Capitalist: 0, Nationalist: 0, Globalist: 0, Religious: 0, Secular: 0, Urban: 0, Rural: 0 }
        }
      },
      diplomatic: { bti: { "KEN": 72, "UGA": 50, "GBR": 88, "CHN": -48, "RUS": -80 }, treaties: ["NATO", "USMCA", "AGOA Strategic Partnership", "G7"], sanctions: [] },
      activeProjects: [],
      activePolicies: [],
      historicalSnapshots: [],
      profitMargin: 8.5,
      focusTree: [],
      characters: [],
      religiousInfluence: 25,
      researchedTechs: ["Active Trophy Systems", "Precision Munitions Cluster"],
      isDemocratic: true
    },

    "CHN": {
      id: "CHN",
      name: "China",
      region: "East Asia",
      capital: "Beijing",
      coordinates: [116.4074, 39.9042],
      isPlayer: false,
      isLandlocked: false,
      stabilityIndex: 84,
      approvalRating: 78,
      survival: { foodSecurity: 86, waterAccess: 82, housingAvailability: 78, transportEfficiency: 92 },
      powerTrinity: { weaponsTech: 92, militaryLogistics: 88, nuclearReadiness: 80 },
      shadow: { spyingNetwork: 95, digitalSecurity: 95, internalPolicing: 94, infrastructureResilience: 92 },
      softPower: { tourismAppeal: 74, diplomaticTrust: 62, culturalExport: 76 },
      economicEngine: { gdp: 18800, debtInterest: 310, inflationTax: 40, tradeBalance: 680, schooling: 86, jobs: 88, energyIndependence: 68 },
      economic: {
        gdpNominal: 18800.0, gdpPpp: 34500.0, realGdp: 18200.0, debtToGdp: 82.0, inflation: 0.12, currencyVolatility: 7, exchangeRate: 7.18, treasury: 3150.0,
        liquidCash: 320000, eurobondPaymentDate: "2030-01-01", debtCrisis: false, taxEfficiency: 94, portCongestionDays: 1,
        energyBalance: 8900, defaultWarning: false,
        supplyChain: { crudeOil: 45, wheat: 82, semiconductors: 72, rareEarths: 96, lithium: 85, medicine: 88, uranium: 55, gold: 86, steel: 100, naturalGas: 48, copper: 82, cobalt: 85 }
      },
      military: { activePersonnel: 2000000, reservePersonnel: 510000, powerProjection: 88, nuclearReadiness: 80, logisticsCapacity: 86, techTier: 5, warExhaustion: 8, casualtyTolerance: 60, ewIntensity: 80, armyDivisions: [{ name: "72nd Group Army", role: "Combined Arms Assault", personnel: 40000, tanks: 420, artillery: 210, firepowerScore: 88, visibility: 85 }], navalFleets: [{ name: "PLAN South Sea Fleet", role: "Blue Water Projection", aircraftCarriers: 3, submarines: 60, frigates: 42, destroyers: 48, patrolShips: 80 }], airWings: [{ name: "Eastern Theater Air Force", role: "Air Superiority", fighterJets: 180, bombers: 45, reconnaissanceAircraft: 20, transportAircraft: 35, helicopters: 60 }], droneFleets: [{ id: "chn-drone-1", name: "WZ-8 & Wing Loong Wing", fpvDensity: 45, jammingResilience: 88, loiteringEndurance: 9, hasAIGuidance: true }] },
      social: {
        politicalLegitimacy: 82, tension: 28, brainDrain: 18, socialMediaSentiment: 66, population: 1410.0, cynicism: 0.14, socialCreditScore: 86,
        voterDemographics: {
          identification: { Socialist: 0.85, Capitalist: 0.45, Nationalist: 0.8, Globalist: 0.4, Religious: 0.15, Secular: 0.85, Urban: 0.65, Rural: 0.35 },
          approval: { Socialist: 84, Capitalist: 68, Nationalist: 82, Globalist: 62, Religious: 50, Secular: 78, Urban: 80, Rural: 76 },
          grudges: { Socialist: 0, Capitalist: 0, Nationalist: 0, Globalist: 0, Religious: 0, Secular: 0, Urban: 0, Rural: 0 }
        }
      },
      diplomatic: { bti: { "KEN": 74, "UGA": 68, "TZA": 78, "ETH": 75, "USA": -48, "RUS": 82 }, treaties: ["BRICS", "SCO", "Belt and Road Initiative", "RCEP"], sanctions: [] },
      activeProjects: [],
      activePolicies: [],
      historicalSnapshots: [],
      profitMargin: 14.0,
      focusTree: [],
      characters: [],
      religiousInfluence: 10,
      researchedTechs: ["Active Trophy Systems", "Precision Munitions Cluster", "Ultra-High-Voltage Grid Transmission"],
      isDemocratic: false
    },

    "RUS": {
      id: "RUS",
      name: "Russia",
      region: "Eurasia",
      capital: "Moscow",
      coordinates: [37.6173, 55.7558],
      isPlayer: false,
      isLandlocked: false,
      stabilityIndex: 62,
      approvalRating: 68,
      survival: { foodSecurity: 88, waterAccess: 85, housingAvailability: 78, transportEfficiency: 64 },
      powerTrinity: { weaponsTech: 86, militaryLogistics: 66, nuclearReadiness: 100 },
      shadow: { spyingNetwork: 90, digitalSecurity: 88, internalPolicing: 86, infrastructureResilience: 80 },
      softPower: { tourismAppeal: 42, diplomaticTrust: 38, culturalExport: 52 },
      economicEngine: { gdp: 2150, debtInterest: 42, inflationTax: 65, tradeBalance: 120, schooling: 78, jobs: 68, energyIndependence: 100 },
      economic: {
        gdpNominal: 2150.0, gdpPpp: 5400.0, realGdp: 2020.0, debtToGdp: 21.5, inflation: 0.65, currencyVolatility: 22, exchangeRate: 92.5, treasury: 145.0,
        liquidCash: 18000, eurobondPaymentDate: "2027-05-20", debtCrisis: false, taxEfficiency: 80, portCongestionDays: 1,
        energyBalance: 1350, defaultWarning: false,
        supplyChain: { crudeOil: 100, wheat: 100, semiconductors: 28, rareEarths: 65, lithium: 45, medicine: 50, uranium: 92, gold: 90, steel: 85, naturalGas: 100, copper: 80, cobalt: 55 }
      },
      military: { activePersonnel: 1150000, reservePersonnel: 1500000, powerProjection: 76, nuclearReadiness: 100, logisticsCapacity: 64, techTier: 4, warExhaustion: 55, casualtyTolerance: 75, ewIntensity: 90, armyDivisions: [{ name: "1st Guards Tank Army", role: "Heavy Armored Breakthrough", personnel: 35000, tanks: 450, artillery: 280, firepowerScore: 82, visibility: 90 }], navalFleets: [{ name: "Northern & Pacific Strategic Fleet", role: "SSBN Deterrence", aircraftCarriers: 1, submarines: 58, frigates: 12, destroyers: 10, patrolShips: 28 }], airWings: [], droneFleets: [] },
      social: {
        politicalLegitimacy: 68, tension: 42, brainDrain: 45, socialMediaSentiment: 50, population: 144.2, cynicism: 0.42, socialCreditScore: 70,
        voterDemographics: {
          identification: { Socialist: 0.5, Capitalist: 0.3, Nationalist: 0.85, Globalist: 0.15, Religious: 0.65, Secular: 0.35, Urban: 0.72, Rural: 0.28 },
          approval: { Socialist: 65, Capitalist: 52, Nationalist: 74, Globalist: 34, Religious: 68, Secular: 56, Urban: 60, Rural: 70 },
          grudges: { Socialist: 0, Capitalist: 0, Nationalist: 0, Globalist: 0, Religious: 0, Secular: 0, Urban: 0, Rural: 0 }
        }
      },
      diplomatic: { bti: { "KEN": 40, "UGA": 55, "ETH": 60, "EGY": 65, "USA": -80, "GBR": -75, "CHN": 82 }, treaties: ["BRICS", "CSTO", "EAEU"], sanctions: ["Western Financial & Tech Sanctions"] },
      activeProjects: [],
      activePolicies: [],
      historicalSnapshots: [],
      profitMargin: 1.8,
      focusTree: [],
      characters: [],
      religiousInfluence: 55,
      researchedTechs: ["Active Trophy Systems"],
      isDemocratic: false
    }
  }
};
