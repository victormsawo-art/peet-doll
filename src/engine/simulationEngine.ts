import { WorldState, Nation, VoterGroup } from '../types';

const clamp = (val: number, min: number, max: number) => Math.max(min, Math.min(max, val));

export function processTick(state: WorldState, currentStepDateISO?: string): WorldState {
  const newState: WorldState = {
    ...state,
    nations: { ...state.nations },
  };

  Object.keys(newState.nations).forEach((id) => {
    const src = newState.nations[id];
    if (!src) return;

    const nation: Nation = {
      ...src,
      survival: { ...src.survival },
      powerTrinity: { ...src.powerTrinity },
      shadow: { ...src.shadow },
      softPower: { ...src.softPower },
      economicEngine: { ...src.economicEngine },
      economic: {
        ...src.economic,
        supplyChain: { ...src.economic.supplyChain },
      },
      military: { ...src.military },
      social: {
        ...src.social,
        voterDemographics: {
          identification: { ...src.social.voterDemographics.identification },
          approval: { ...src.social.voterDemographics.approval },
          grudges: { ...src.social.voterDemographics.grudges },
        },
      },
      diplomatic: {
        ...src.diplomatic,
        bti: { ...src.diplomatic.bti },
        treaties: [...(src.diplomatic.treaties || [])],
        sanctions: [...(src.diplomatic.sanctions || [])],
      },
      activeProjects: src.activeProjects ? src.activeProjects.map(p => ({ ...p })) : [],
      activePolicies: src.activePolicies ? src.activePolicies.map(p => ({ ...p, dailyEffects: { ...p.dailyEffects } })) : [],
      historicalSnapshots: src.historicalSnapshots ? [...src.historicalSnapshots] : [],
      focusTree: src.focusTree ? src.focusTree.map(f => ({ ...f })) : [],
    };

    // -------------------------------------------------------------------------
    // 1. CAUSAL POLICY LEDGER COMPOUNDING
    // -------------------------------------------------------------------------
    let policyGdpBonus = 0;
    let policyTreasuryDailyB = 0;
    let policyStabilityDelta = 0;
    let policyApprovalDelta = 0;
    let policyInflationDelta = 0;
    let policyFoodDelta = 0;
    let policyWaterDelta = 0;
    let policyHousingDelta = 0;
    let policyTransportDelta = 0;

    if (nation.activePolicies && nation.activePolicies.length > 0) {
      for (const policy of nation.activePolicies) {
        if (policy.status === 'ACTIVE' && policy.dailyEffects) {
          policyGdpBonus += policy.dailyEffects.gdpGrowthBonus || 0;
          policyTreasuryDailyB += policy.dailyEffects.treasuryDeltaB || 0;
          policyStabilityDelta += policy.dailyEffects.stabilityDelta || 0;
          policyApprovalDelta += policy.dailyEffects.approvalDelta || 0;
          policyInflationDelta += policy.dailyEffects.inflationDelta || 0;
          policyFoodDelta += policy.dailyEffects.foodDelta || 0;
          policyWaterDelta += policy.dailyEffects.waterDelta || 0;
          policyHousingDelta += policy.dailyEffects.housingDelta || 0;
          policyTransportDelta += policy.dailyEffects.transportDelta || 0;
        }
      }
    }

    // -------------------------------------------------------------------------
    // 2. INFRASTRUCTURE & ACTIVE PROJECTS PROGRESSION
    // -------------------------------------------------------------------------
    if (nation.activeProjects && nation.activeProjects.length > 0) {
      for (const proj of nation.activeProjects) {
        if (proj.status !== 'Completed' && proj.progress < 100) {
          const speedMultiplier = proj.status === 'Delayed' ? 0.08 : 0.22; // ~450 days normal, ~1200 delayed
          proj.progress = clamp(Number((proj.progress + speedMultiplier).toFixed(2)), 0, 100);
          if (proj.progress >= 100) {
            proj.progress = 100;
            proj.status = 'Completed';
            // Apply permanent completion dividends
            const lowerName = proj.name.toLowerCase();
            if (lowerName.includes('housing')) {
              nation.survival.housingAvailability = clamp(nation.survival.housingAvailability + 8, 0, 100);
              nation.approvalRating = clamp(nation.approvalRating + 4, 0, 100);
            } else if (lowerName.includes('health') || lowerName.includes('shif') || lowerName.includes('hospital')) {
              nation.survival.foodSecurity = clamp(nation.survival.foodSecurity + 4, 0, 100);
              nation.stabilityIndex = clamp(nation.stabilityIndex + 5, 0, 100);
              nation.approvalRating = clamp(nation.approvalRating + 5, 0, 100);
            } else if (lowerName.includes('digital') || lowerName.includes('tech') || lowerName.includes('fiber')) {
              nation.shadow.digitalSecurity = clamp(nation.shadow.digitalSecurity + 8, 0, 100);
              nation.economic.taxEfficiency = clamp(nation.economic.taxEfficiency + 4, 0, 100);
              nation.economicEngine.jobs = clamp(nation.economicEngine.jobs + 4, 0, 100);
            } else if (lowerName.includes('rail') || lowerName.includes('port') || lowerName.includes('road') || lowerName.includes('transport') || lowerName.includes('corridor')) {
              nation.survival.transportEfficiency = clamp(nation.survival.transportEfficiency + 9, 0, 100);
              nation.economic.portEfficiency = clamp((nation.economic.portEfficiency || 65) + 7, 0, 100);
            } else if (lowerName.includes('energy') || lowerName.includes('geothermal') || lowerName.includes('grid') || lowerName.includes('power') || lowerName.includes('solar')) {
              nation.economic.electricityGridStability = clamp((nation.economic.electricityGridStability || 70) + 8, 0, 100);
              nation.economicEngine.energyIndependence = clamp(nation.economicEngine.energyIndependence + 8, 0, 100);
            } else if (lowerName.includes('water') || lowerName.includes('dam') || lowerName.includes('irrigation')) {
              nation.survival.waterAccess = clamp(nation.survival.waterAccess + 8, 0, 100);
              nation.survival.foodSecurity = clamp(nation.survival.foodSecurity + 5, 0, 100);
            } else {
              nation.stabilityIndex = clamp(nation.stabilityIndex + 3, 0, 100);
              nation.approvalRating = clamp(nation.approvalRating + 3, 0, 100);
            }
          }
        }
      }
    }

    // -------------------------------------------------------------------------
    // 3. NATIONAL FOCUS TREE PROGRESSION
    // -------------------------------------------------------------------------
    if (nation.activeFocusId && nation.focusTree) {
      const activeFocus = nation.focusTree.find(f => f.id === nation.activeFocusId);
      if (activeFocus && !activeFocus.completed) {
        const dailyFocusStep = 100 / Math.max(30, activeFocus.duration * 30);
        activeFocus.progress = clamp(Number((activeFocus.progress + dailyFocusStep).toFixed(2)), 0, 100);
        if (activeFocus.progress >= 100) {
          activeFocus.progress = 100;
          activeFocus.completed = true;
          nation.activeFocusId = null;
          // Apply focus completion bonuses
          if (activeFocus.id.includes('econ')) {
            nation.economic.treasury = Number((nation.economic.treasury + 2.5).toFixed(2));
            nation.economic.inflation = Math.max(0.1, Number((nation.economic.inflation - 0.15).toFixed(2)));
          } else if (activeFocus.id.includes('military')) {
            nation.military.powerProjection = clamp(nation.military.powerProjection + 8, 0, 100);
            nation.military.logisticsCapacity = clamp(nation.military.logisticsCapacity + 6, 0, 100);
          } else if (activeFocus.id.includes('unity') || activeFocus.id.includes('diplomacy')) {
            nation.softPower.diplomaticTrust = clamp(nation.softPower.diplomaticTrust + 10, 0, 100);
          }
        }
      }
    }

    // -------------------------------------------------------------------------
    // 4. MACROECONOMIC ENGINE (GDP, TREASURY, DEBT, VITALS)
    // -------------------------------------------------------------------------
    const gdpNominal = nation.economic.gdpNominal || 1;
    const realGdp = nation.economic.realGdp || 1;

    // Base daily GDP growth: ~3.5% to 6.5% annually (~0.000095 to 0.000175 daily) modulated by stability, schooling, transport, and active policies
    const stabilityFactor = (nation.stabilityIndex - 50) * 0.0000025; // -0.000125 to +0.000125
    const infrastructureFactor = ((nation.survival.transportEfficiency - 50) + (nation.economicEngine.schooling - 50)) * 0.0000012;
    const baseDailyGrowth = 0.00011 + stabilityFactor + infrastructureFactor + clamp(policyGdpBonus, -0.0008, 0.0012);

    const nextGdpNominal = clamp(gdpNominal * (1 + baseDailyGrowth), 1, 150000);
    const nextRealGdp = clamp(realGdp * (1 + baseDailyGrowth * 0.92), 1, 150000);

    // Debt-to-GDP dynamically scales when GDP grows or treasury runs deficits
    const totalDebtBillions = (nation.economic.debtToGdp / 100) * gdpNominal;

    // Fiscal balance: tax efficiency + trade + policy delta vs debt interest
    const baseDailyFiscalB = ((nation.profitMargin ?? 0.08) / 30) + policyTreasuryDailyB;
    const taxEfficiencyBonusB = ((nation.economic.taxEfficiency - 65) * 0.00015) * (gdpNominal / 100);
    const netDailyTreasuryChangeB = baseDailyFiscalB + taxEfficiencyBonusB;

    nation.economic.treasury = Number(Math.max(0.1, (nation.economic.treasury || 0) + netDailyTreasuryChangeB).toFixed(3));
    nation.economic.liquidCash = Math.round(nation.economic.treasury * 120);

    // If treasury is healthy and growing, pay down a fraction of debt; if low, debt rises slightly
    const dailyDebtChangeB = netDailyTreasuryChangeB < 0 ? Math.abs(netDailyTreasuryChangeB) * 0.6 : -netDailyTreasuryChangeB * 0.15;
    const updatedDebtBillions = Math.max(0, totalDebtBillions + dailyDebtChangeB);
    nation.economic.gdpNominal = Number(nextGdpNominal.toFixed(2));
    nation.economic.realGdp = Number(nextRealGdp.toFixed(2));
    nation.economic.gdpPpp = Number((nation.economic.gdpNominal * (gdpNominal < 500 ? 2.85 : 1.2)).toFixed(2));
    nation.economic.debtToGdp = Number(clamp((updatedDebtBillions / nation.economic.gdpNominal) * 100, 5, 250).toFixed(2));
    nation.economicEngine.gdp = nation.economic.gdpNominal;

    // Eurobond payment check
    if (currentStepDateISO && nation.economic.eurobondPaymentDate && currentStepDateISO >= nation.economic.eurobondPaymentDate) {
      const bondCouponB = Math.min(2.0, nation.economic.gdpNominal * 0.012);
      if (nation.economic.treasury >= bondCouponB) {
        nation.economic.treasury = Number((nation.economic.treasury - bondCouponB).toFixed(3));
        nation.economic.debtToGdp = Number(Math.max(5, nation.economic.debtToGdp - 1.1).toFixed(2));
        nation.economic.debtCrisis = false;
      } else {
        nation.economic.debtCrisis = true;
        nation.stabilityIndex = clamp(nation.stabilityIndex - 6, 0, 100);
      }
      // Advance next Eurobond date by 1 year
      const [ey, em, ed] = nation.economic.eurobondPaymentDate.split('-').map(Number);
      nation.economic.eurobondPaymentDate = `${ey + 1}-${String(em || 6).padStart(2, '0')}-${String(ed || 24).padStart(2, '0')}`;
    }

    // Inflation & Exchange Rate
    nation.economic.inflation = Number(clamp((nation.economic.inflation || 0.4) + policyInflationDelta * 0.02, 0.05, 15).toFixed(2));

    // Vitals progression
    nation.survival.foodSecurity = Number(clamp((nation.survival.foodSecurity || 65) + policyFoodDelta + (baseDailyGrowth > 0.00012 ? 0.008 : -0.003), 10, 100).toFixed(2));
    nation.survival.waterAccess = Number(clamp((nation.survival.waterAccess || 60) + policyWaterDelta + (baseDailyGrowth > 0.00012 ? 0.006 : -0.002), 10, 100).toFixed(2));
    nation.survival.housingAvailability = Number(clamp((nation.survival.housingAvailability || 55) + policyHousingDelta + (baseDailyGrowth > 0.00012 ? 0.005 : -0.003), 10, 100).toFixed(2));
    nation.survival.transportEfficiency = Number(clamp((nation.survival.transportEfficiency || 55) + policyTransportDelta + (baseDailyGrowth > 0.00012 ? 0.007 : -0.002), 10, 100).toFixed(2));

    // Population growth (~1.8% annually for developing nations, ~0.4% for developed)
    const dailyPopGrowthRate = nation.economic.gdpNominal < 500 ? 0.000048 : 0.000012;
    nation.social.population = Number(((nation.social.population || 50) * (1 + dailyPopGrowthRate)).toFixed(3));

    // Stability & Approval compounding
    const avgVitals = (
      nation.survival.foodSecurity +
      nation.survival.waterAccess +
      nation.survival.housingAvailability +
      nation.survival.transportEfficiency
    ) / 4;

    const vitalsDrift = (avgVitals - 60) * 0.0008;
    nation.stabilityIndex = Number(clamp(nation.stabilityIndex + vitalsDrift + policyStabilityDelta, 5, 99).toFixed(2));
    nation.approvalRating = Number(clamp(nation.approvalRating + vitalsDrift * 0.9 + policyApprovalDelta, 5, 98).toFixed(2));

    // Voter Demographics drift
    const voterGroups = Object.keys(nation.social.voterDemographics.approval) as VoterGroup[];
    let weightedApproval = 0;
    let totalWeight = 0;

    voterGroups.forEach(group => {
      const currentApp = nation.social.voterDemographics.approval[group] ?? 50;
      const updatedApp = clamp(currentApp + (vitalsDrift + policyApprovalDelta) * 0.85, 5, 98);
      nation.social.voterDemographics.approval[group] = Number(updatedApp.toFixed(1));
      const weight = nation.social.voterDemographics.identification[group] || 0.1;
      weightedApproval += updatedApp * weight;
      totalWeight += weight;

      if (nation.social.voterDemographics.grudges[group] > 0) {
        nation.social.voterDemographics.grudges[group] = Math.max(0, Number((nation.social.voterDemographics.grudges[group] - 0.05).toFixed(2)));
      }
    });

    if (totalWeight > 0 && Math.abs(policyApprovalDelta) < 0.001) {
      // Blend overall approval gently toward demographic average
      nation.approvalRating = Number((nation.approvalRating * 0.98 + (weightedApproval / totalWeight) * 0.02).toFixed(2));
    }

    // Sanity Guard for Ministry Budgets
    if (nation.ministries) {
      const totalMinistryBudget = Object.values(nation.ministries).reduce((sum, m) => sum + (m.budget || 0), 0);
      const gdp = nation.economic.gdpNominal || 115;
      if (totalMinistryBudget > gdp * 0.65) {
        const correctionScale = (gdp * 0.25) / totalMinistryBudget;
        Object.keys(nation.ministries).forEach(mId => {
          nation.ministries![mId] = {
            ...nation.ministries![mId],
            budget: Number((nation.ministries![mId].budget * correctionScale).toFixed(2)),
          };
        });
      }
    }

    // Record quarterly/semi-annual historical snapshot if date aligns (e.g. 1st of Jan, Apr, Jul, Oct)
    if (currentStepDateISO && (currentStepDateISO.endsWith('-01-01') || currentStepDateISO.endsWith('-04-01') || currentStepDateISO.endsWith('-07-01') || currentStepDateISO.endsWith('-10-01'))) {
      const exists = nation.historicalSnapshots?.some(s => s.date === currentStepDateISO);
      if (!exists) {
        nation.historicalSnapshots = [
          ...(nation.historicalSnapshots || []).slice(-39),
          {
            date: currentStepDateISO,
            gdpNominal: Number(nation.economic.gdpNominal.toFixed(2)),
            realGdp: Number(nation.economic.realGdp.toFixed(2)),
            treasury: Number(nation.economic.treasury.toFixed(2)),
            debtToGdp: Number(nation.economic.debtToGdp.toFixed(1)),
            stabilityIndex: Math.round(nation.stabilityIndex),
            approvalRating: Math.round(nation.approvalRating),
            inflation: Number(nation.economic.inflation.toFixed(2)),
            population: Number(nation.social.population.toFixed(2)),
            foodSecurity: Math.round(nation.survival.foodSecurity),
            waterAccess: Math.round(nation.survival.waterAccess),
            housingAvailability: Math.round(nation.survival.housingAvailability),
            transportEfficiency: Math.round(nation.survival.transportEfficiency),
          },
        ];
      }
    }

    newState.nations[id] = nation;
  });

  // Synchronize top-level stateOfNation with active player nation so dashboard & briefing never desync
  const playerNationId = newState.playerNationId || 'KEN';
  const playerNation = newState.nations[playerNationId] || newState.nations['KEN'];
  if (playerNation && newState.briefing) {
    newState.briefing = {
      ...newState.briefing,
      stateOfNation: {
        ...newState.briefing.stateOfNation,
        stabilityIndex: Math.round(playerNation.stabilityIndex),
        approvalRating: Math.round(playerNation.approvalRating),
        vitals: {
          food: Math.round(playerNation.survival.foodSecurity),
          water: Math.round(playerNation.survival.waterAccess),
          housing: Math.round(playerNation.survival.housingAvailability),
          transport: Math.round(playerNation.survival.transportEfficiency),
        },
        treasury: `Treasury: $${playerNation.economic.treasury.toFixed(2)}B · Liquid: $${Math.round(playerNation.economic.liquidCash)}M · Debt/GDP: ${playerNation.economic.debtToGdp.toFixed(1)}%`,
      },
    };
  }

  return newState;
}
