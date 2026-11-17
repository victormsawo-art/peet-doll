import { WorldState, Nation, PolicyDirective } from '../types';
import { WorldSimulationController } from './WorldSimulationController';
import { parseTemporalCommand } from './temporalParser';

// ---------------------------------------------------------------------------
// UTILITY: Deep Merge
// ---------------------------------------------------------------------------
function deepMerge(target: any, source: any): any {
  if (typeof target !== 'object' || target === null) return source;
  if (typeof source !== 'object' || source === null) return source;

  if (Array.isArray(target) && Array.isArray(source)) {
    if (source.length === 0) return target;
    if (target.length > 0 && typeof target[0] === 'object' && target[0] !== null) {
      const idKey = target[0].id !== undefined ? 'id' : (target[0].name !== undefined ? 'name' : null);
      if (idKey) {
        const newArray = [...target];
        for (const sourceItem of source) {
          if (typeof sourceItem !== 'object' || sourceItem === null) continue;
          const targetIndex = newArray.findIndex(t => t[idKey] === sourceItem[idKey]);
          if (targetIndex >= 0) {
            newArray[targetIndex] = deepMerge(newArray[targetIndex], sourceItem);
          } else {
            newArray.push(sourceItem);
          }
        }
        return newArray;
      }
    }
    return source;
  }

  const output = { ...target };
  for (const key of Object.keys(source)) {
    if (source[key] instanceof Object && !Array.isArray(source[key])) {
      output[key] = deepMerge(target[key] || {}, source[key]);
    } else if (Array.isArray(source[key])) {
      output[key] = deepMerge(target[key] || [], source[key]);
    } else {
      if (typeof target[key] === 'number' && typeof source[key] === 'string') {
        const cleaned = source[key].replace(/[^0-9.-]+/g, '');
        const parsed = parseFloat(cleaned);
        output[key] = isNaN(parsed) ? source[key] : parsed;
      } else {
        output[key] = source[key];
      }
    }
  }
  return output;
}

function buildNationIdMap(state: WorldState): Record<string, string> {
  const map: Record<string, string> = {};
  if (!state || !state.nations) return map;
  Object.values(state.nations).forEach(n => {
    map[n.id.toLowerCase()] = n.id;
    map[n.name.toLowerCase()] = n.id;
  });
  return map;
}

function applyFallbackGuard(mergedNations: Record<string, Nation>, prevState: WorldState, playerNationId: string): void {
  const player = mergedNations[playerNationId];
  const prev = prevState.nations[playerNationId];
  if (!player || !prev) return;

  const restoreIfMissing = (obj: any, prevObj: any, fields: string[]) => {
    fields.forEach(f => {
      if (obj[f] === undefined || obj[f] === null || Number.isNaN(obj[f])) {
        obj[f] = prevObj[f];
      }
    });
  };

  restoreIfMissing(player, prev, ['stabilityIndex', 'approvalRating']);

  if (!player.economic) {
    player.economic = { ...prev.economic };
  } else {
    if (player.economic.treasury === undefined || player.economic.treasury === null) player.economic.treasury = prev.economic.treasury;
    if (player.economic.liquidCash === undefined || player.economic.liquidCash === null) player.economic.liquidCash = prev.economic.liquidCash;
    if (player.economic.debtToGdp === undefined || player.economic.debtToGdp === null) player.economic.debtToGdp = prev.economic.debtToGdp;
    if (player.economic.gdpNominal === undefined || player.economic.gdpNominal === null) player.economic.gdpNominal = prev.economic.gdpNominal;
  }

  if (!player.survival) player.survival = { ...prev.survival };
  if (!player.military) player.military = { ...prev.military };
  if (!player.social) player.social = { ...prev.social };
  if (!player.diplomatic) player.diplomatic = { ...prev.diplomatic };
  if (!player.activePolicies) player.activePolicies = [...(prev.activePolicies || [])];
  if (!player.activeProjects) player.activeProjects = [...(prev.activeProjects || [])];
  if (!player.historicalSnapshots) player.historicalSnapshots = [...(prev.historicalSnapshots || [])];
}

// ---------------------------------------------------------------------------
// MAIN TURN & FAST-FORWARD PROCESSOR (Calls Server-Side Gemini Endpoint)
// ---------------------------------------------------------------------------
export async function processTurn(
  currentState: WorldState,
  playerAction: string,
  history: { role: string; text: string }[] = [],
  explicitJumpDays?: number
): Promise<WorldState> {
  const playerNationId = currentState.playerNationId || 'KEN';

  // 1. Detect if the player's command is a natural-language fast-forward or explicit UI jump
  const nlJump = explicitJumpDays && explicitJumpDays > 0
    ? {
        isJumpRequest: true,
        targetDate: null,
        deltaDays: explicitJumpDays,
        explanation: `Fast-forwarding ${explicitJumpDays} days`,
      }
    : parseTemporalCommand(playerAction, currentState.currentDate);

  let workingState = { ...currentState };
  let temporalJumpPayload: any = null;

  if (nlJump.isJumpRequest && nlJump.deltaDays > 0) {
    const fromDate = workingState.currentDate;
    const { state: jumpedState, report } = await WorldSimulationController.executeTemporalJump(
      workingState,
      nlJump.deltaDays,
      playerAction
    );
    workingState = jumpedState;
    temporalJumpPayload = {
      isJumpRequest: true,
      fromDate,
      toDate: workingState.currentDate,
      elapsedDays: nlJump.deltaDays,
      report,
    };
  } else {
    // Only advance time on explicit commands (postTickDays) or fast-forwards;
    // never silently skip days based on wall-clock idle time.
  }

  // 2. Call Server-Side Gemini Simulation Route (with local deterministic resilience)
  let intent: 'COMMAND' | 'QUESTION' | 'CONVERSATION' = 'COMMAND';
  let parsed: any = null;

  try {
    const response = await fetch('/api/simulation/turn', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        state: workingState,
        playerAction,
        history,
        temporalJump: temporalJumpPayload,
      }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || `Server error (${response.status})`);
    }

    const json = await response.json();
    intent = json.intent || 'COMMAND';
    parsed = json.parsed;
  } catch (err) {
    console.warn('[processTurn] Falling back to local deterministic state update:', err);
    if (temporalJumpPayload?.isJumpRequest) {
      return {
        ...workingState,
        lastInteractionTime: Date.now(),
        isProcessing: false,
        briefing: workingState.briefing
          ? {
              ...workingState.briefing,
              chiefOfStaffMessage:
                temporalJumpPayload.report?.executiveSummary ||
                `Fast-forwarded to ${workingState.currentDate}.`,
            }
          : null,
      };
    }
    throw err;
  }

  // 3. Merge Nation Updates
  const nationIdMap = buildNationIdMap(workingState);
  const parsedNationsObj: Record<string, any> = {};

  const normalizeNation = (nation: any) => {
    if (!nation) return null;
    if (nation.treasury !== undefined && (!nation.economic || nation.economic.treasury === undefined)) {
      nation.economic = nation.economic || {};
      nation.economic.treasury = nation.treasury;
      delete nation.treasury;
    }
    if (nation.liquidCash !== undefined && (!nation.economic || nation.economic.liquidCash === undefined)) {
      nation.economic = nation.economic || {};
      nation.economic.liquidCash = nation.liquidCash;
      delete nation.liquidCash;
    }
    return nation;
  };

  if (Array.isArray(parsed.nations)) {
    for (const nation of parsed.nations) {
      const key = nation?.id || nation?.name || '';
      const canonicalId = nationIdMap[key.toLowerCase()];
      if (canonicalId) parsedNationsObj[canonicalId] = normalizeNation(nation);
    }
  } else if (parsed.nations && typeof parsed.nations === 'object') {
    for (const key of Object.keys(parsed.nations)) {
      const canonicalId = nationIdMap[key.toLowerCase()];
      if (canonicalId) parsedNationsObj[canonicalId] = normalizeNation(parsed.nations[key]);
    }
  }

  // When a temporal jump occurred, preserve the deterministic post-jump macroeconomic figures
  // unless the AI explicitly adjusted them further
  const preAINation = workingState.nations[playerNationId];
  const mergedNations = deepMerge(workingState.nations, parsedNationsObj);
  applyFallbackGuard(mergedNations, workingState, playerNationId);

  if (temporalJumpPayload?.isJumpRequest && preAINation) {
    // Guarantee the compounded GDP, Treasury, Debt, and Vitals from the time jump aren't accidentally reverted to pre-jump values
    mergedNations[playerNationId].economic.gdpNominal = preAINation.economic.gdpNominal;
    mergedNations[playerNationId].economic.realGdp = preAINation.economic.realGdp;
    mergedNations[playerNationId].economic.treasury = preAINation.economic.treasury;
    mergedNations[playerNationId].economic.debtToGdp = preAINation.economic.debtToGdp;
    mergedNations[playerNationId].social.population = preAINation.social.population;
    mergedNations[playerNationId].activeProjects = preAINation.activeProjects;
    mergedNations[playerNationId].historicalSnapshots = preAINation.historicalSnapshots;
  }

  // 4. Register New Causal Policy Directive if AI returned one
  if (
    parsed.newPolicyDirective &&
    typeof parsed.newPolicyDirective === 'object' &&
    parsed.newPolicyDirective.title &&
    !temporalJumpPayload?.isJumpRequest &&
    intent === 'COMMAND'
  ) {
    const newPol: PolicyDirective = {
      id: parsed.newPolicyDirective.id || `pol-${Date.now()}`,
      title: parsed.newPolicyDirective.title,
      category: parsed.newPolicyDirective.category || 'ECONOMIC',
      enactedDate: workingState.currentDate,
      summary: parsed.newPolicyDirective.summary || playerAction,
      status: 'ACTIVE',
      dailyEffects: {
        gdpGrowthBonus: Number(parsed.newPolicyDirective.dailyEffects?.gdpGrowthBonus) || 0.00004,
        treasuryDeltaB: Number(parsed.newPolicyDirective.dailyEffects?.treasuryDeltaB) || 0.001,
        stabilityDelta: Number(parsed.newPolicyDirective.dailyEffects?.stabilityDelta) || 0.003,
        approvalDelta: Number(parsed.newPolicyDirective.dailyEffects?.approvalDelta) || 0.003,
        inflationDelta: Number(parsed.newPolicyDirective.dailyEffects?.inflationDelta) || 0,
        foodDelta: Number(parsed.newPolicyDirective.dailyEffects?.foodDelta) || 0,
        waterDelta: Number(parsed.newPolicyDirective.dailyEffects?.waterDelta) || 0,
        housingDelta: Number(parsed.newPolicyDirective.dailyEffects?.housingDelta) || 0,
        transportDelta: Number(parsed.newPolicyDirective.dailyEffects?.transportDelta) || 0,
      },
    };
    const existingPolicies = mergedNations[playerNationId].activePolicies || [];
    mergedNations[playerNationId].activePolicies = [newPol, ...existingPolicies];
  }

  // 5. Enrich Temporal Jump Report with AI's qualitative analysis if available
  let finalJumpReport = workingState.lastJumpReport || null;
  if (temporalJumpPayload?.isJumpRequest && finalJumpReport && parsed.temporalAnalysis) {
    if (Array.isArray(parsed.temporalAnalysis.progressedFactors) && parsed.temporalAnalysis.progressedFactors.length > 0) {
      finalJumpReport = {
        ...finalJumpReport,
        progressedFactors: [
          ...finalJumpReport.progressedFactors,
          ...parsed.temporalAnalysis.progressedFactors.filter((f: string) => !finalJumpReport!.progressedFactors.includes(f)),
        ].slice(0, 6),
      };
    }
    if (Array.isArray(parsed.temporalAnalysis.degradedFactors) && parsed.temporalAnalysis.degradedFactors.length > 0) {
      finalJumpReport = {
        ...finalJumpReport,
        degradedFactors: [
          ...finalJumpReport.degradedFactors,
          ...parsed.temporalAnalysis.degradedFactors.filter((f: string) => !finalJumpReport!.degradedFactors.includes(f)),
        ].slice(0, 6),
      };
    }
    if (parsed.temporalAnalysis.executiveSummary) {
      finalJumpReport = {
        ...finalJumpReport,
        executiveSummary: parsed.temporalAnalysis.executiveSummary,
      };
    }
  }

  // 6. Merge Briefing and synchronize State of Nation with actual playerNation metrics
  const mergedBriefing = parsed.briefing
    ? deepMerge(workingState.briefing, parsed.briefing)
    : workingState.briefing;

  const activePlayer = mergedNations[playerNationId];
  if (mergedBriefing && activePlayer) {
    mergedBriefing.stateOfNation = {
      ...mergedBriefing.stateOfNation,
      stabilityIndex: Math.round(activePlayer.stabilityIndex),
      approvalRating: Math.round(activePlayer.approvalRating),
      vitals: {
        food: Math.round(activePlayer.survival.foodSecurity),
        water: Math.round(activePlayer.survival.waterAccess),
        housing: Math.round(activePlayer.survival.housingAvailability),
        transport: Math.round(activePlayer.survival.transportEfficiency),
      },
      treasury: `Treasury: $${activePlayer.economic.treasury.toFixed(2)}B · Liquid: $${Math.round(activePlayer.economic.liquidCash)}M · Debt/GDP: ${activePlayer.economic.debtToGdp.toFixed(1)}%`,
    };
  }

  const intermediateState: WorldState = {
    ...workingState,
    currentDate: workingState.currentDate,
    worldTension: parsed.worldTension !== undefined ? parsed.worldTension : workingState.worldTension,
    lastInteractionTime: Date.now(),
    nations: mergedNations,
    briefing: mergedBriefing,
    lastJumpReport: finalJumpReport,
    isProcessing: false,
  };

  // If this was a regular command (not already fast-forwarded), advance 1 day
  const postTickDays = !temporalJumpPayload?.isJumpRequest && intent === 'COMMAND' ? 1 : 0;
  return await WorldSimulationController.advanceSimulation(intermediateState, postTickDays);
}