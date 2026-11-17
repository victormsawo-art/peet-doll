import { WorldState, TemporalJumpReport } from '../types';
import { processTick } from './simulationEngine';

export class WorldSimulationController {
  /**
   * Advances the entire world simulation by a specified number of days.
   * Supports multi-decade jumps (up to 30 years / 10,950 days) while recording
   * quarterly historical snapshots and completing infrastructure projects.
   */
  public static async advanceSimulation(state: WorldState, deltaDays: number): Promise<WorldState> {
    if (deltaDays <= 0) return state;

    // Cap single jump to 30 years (10,950 days)
    const iterations = Math.min(deltaDays, 10950);
    let updatedState: WorldState = { ...state };

    const [y, m, d] = updatedState.currentDate.split('-').map(Number);
    const currentDate = new Date(Date.UTC(y, (m || 1) - 1, d || 1));

    for (let i = 0; i < iterations; i++) {
      currentDate.setUTCDate(currentDate.getUTCDate() + 1);
      const stepDateISO = currentDate.toISOString().split('T')[0];
      updatedState = processTick(updatedState, stepDateISO);
      updatedState.currentDate = stepDateISO;

      // Yield briefly on huge multi-year loops to keep UI responsive
      if (i > 0 && i % 400 === 0) {
        await new Promise(resolve => setTimeout(resolve, 0));
      }
    }

    // Ensure final date has a historical snapshot recorded for the player nation
    const playerNationId = updatedState.playerNationId || 'KEN';
    const playerNation = updatedState.nations[playerNationId];
    if (playerNation) {
      const snaps = playerNation.historicalSnapshots || [];
      if (!snaps.some(s => s.date === updatedState.currentDate)) {
        playerNation.historicalSnapshots = [
          ...snaps.slice(-39),
          {
            date: updatedState.currentDate,
            gdpNominal: Number(playerNation.economic.gdpNominal.toFixed(2)),
            realGdp: Number(playerNation.economic.realGdp.toFixed(2)),
            treasury: Number(playerNation.economic.treasury.toFixed(2)),
            debtToGdp: Number(playerNation.economic.debtToGdp.toFixed(1)),
            stabilityIndex: Math.round(playerNation.stabilityIndex),
            approvalRating: Math.round(playerNation.approvalRating),
            inflation: Number(playerNation.economic.inflation.toFixed(2)),
            population: Number(playerNation.social.population.toFixed(2)),
            foodSecurity: Math.round(playerNation.survival.foodSecurity),
            waterAccess: Math.round(playerNation.survival.waterAccess),
            housingAvailability: Math.round(playerNation.survival.housingAvailability),
            transportEfficiency: Math.round(playerNation.survival.transportEfficiency),
          },
        ];
      }
    }

    updatedState = await this.resolveGlobalEvents(updatedState);
    return updatedState;
  }

  /**
   * Executes a structured temporal jump and builds a deterministic Before/After
   * TemporalJumpReport capturing everything that progressed or degraded.
   */
  public static async executeTemporalJump(
    state: WorldState,
    deltaDays: number,
    triggerCommand: string
  ): Promise<{ state: WorldState; report: TemporalJumpReport }> {
    const playerNationId = state.playerNationId || 'KEN';
    const beforeNation = state.nations[playerNationId] || state.nations['KEN'];
    const fromDate = state.currentDate;

    const projectsBeforeCompleted = new Set(
      (beforeNation.activeProjects || []).filter(p => p.status === 'Completed').map(p => p.id)
    );

    const metricsBefore = {
      gdpNominal: Number(beforeNation.economic.gdpNominal.toFixed(2)),
      treasury: Number(beforeNation.economic.treasury.toFixed(2)),
      debtToGdp: Number(beforeNation.economic.debtToGdp.toFixed(1)),
      stabilityIndex: Math.round(beforeNation.stabilityIndex),
      approvalRating: Math.round(beforeNation.approvalRating),
      population: Number(beforeNation.social.population.toFixed(2)),
      inflation: Number(beforeNation.economic.inflation.toFixed(2)),
      vitals: {
        food: Math.round(beforeNation.survival.foodSecurity),
        water: Math.round(beforeNation.survival.waterAccess),
        housing: Math.round(beforeNation.survival.housingAvailability),
        transport: Math.round(beforeNation.survival.transportEfficiency),
      },
    };

    const advancedState = await this.advanceSimulation(state, deltaDays);
    const afterNation = advancedState.nations[playerNationId] || advancedState.nations['KEN'];
    const toDate = advancedState.currentDate;

    const metricsAfter = {
      gdpNominal: Number(afterNation.economic.gdpNominal.toFixed(2)),
      treasury: Number(afterNation.economic.treasury.toFixed(2)),
      debtToGdp: Number(afterNation.economic.debtToGdp.toFixed(1)),
      stabilityIndex: Math.round(afterNation.stabilityIndex),
      approvalRating: Math.round(afterNation.approvalRating),
      population: Number(afterNation.social.population.toFixed(2)),
      inflation: Number(afterNation.economic.inflation.toFixed(2)),
      vitals: {
        food: Math.round(afterNation.survival.foodSecurity),
        water: Math.round(afterNation.survival.waterAccess),
        housing: Math.round(afterNation.survival.housingAvailability),
        transport: Math.round(afterNation.survival.transportEfficiency),
      },
    };

    const newlyCompletedProjects = (afterNation.activeProjects || [])
      .filter(p => p.status === 'Completed' && !projectsBeforeCompleted.has(p.id))
      .map(p => p.name);

    const activePoliciesCompounded = (afterNation.activePolicies || [])
      .filter(p => p.status === 'ACTIVE')
      .map(p => p.title);

    const progressedFactors: string[] = [];
    const degradedFactors: string[] = [];

    const gdpDeltaPct = ((metricsAfter.gdpNominal - metricsBefore.gdpNominal) / Math.max(1, metricsBefore.gdpNominal)) * 100;
    if (gdpDeltaPct >= 0.5) {
      progressedFactors.push(`Nominal GDP expanded by +${gdpDeltaPct.toFixed(1)}% ($${metricsBefore.gdpNominal}B → $${metricsAfter.gdpNominal}B)`);
    } else if (gdpDeltaPct <= -0.5) {
      degradedFactors.push(`Nominal GDP contracted by ${gdpDeltaPct.toFixed(1)}% ($${metricsBefore.gdpNominal}B → $${metricsAfter.gdpNominal}B)`);
    }

    const treasuryDelta = metricsAfter.treasury - metricsBefore.treasury;
    if (treasuryDelta >= 0.2) {
      progressedFactors.push(`Sovereign Treasury reserves grew by +$${treasuryDelta.toFixed(2)}B to $${metricsAfter.treasury.toFixed(2)}B`);
    } else if (treasuryDelta <= -0.2) {
      degradedFactors.push(`Sovereign Treasury reserves drew down by $${treasuryDelta.toFixed(2)}B to $${metricsAfter.treasury.toFixed(2)}B`);
    }

    const debtDelta = metricsAfter.debtToGdp - metricsBefore.debtToGdp;
    if (debtDelta <= -0.5) {
      progressedFactors.push(`Debt-to-GDP ratio improved by ${debtDelta.toFixed(1)}% (${metricsBefore.debtToGdp}% → ${metricsAfter.debtToGdp}%)`);
    } else if (debtDelta >= 0.5) {
      degradedFactors.push(`Debt-to-GDP burden rose by +${debtDelta.toFixed(1)}% (${metricsBefore.debtToGdp}% → ${metricsAfter.debtToGdp}%)`);
    }

    const stabDelta = metricsAfter.stabilityIndex - metricsBefore.stabilityIndex;
    if (stabDelta >= 1) {
      progressedFactors.push(`National Stability Index strengthened by +${stabDelta} pts (${metricsBefore.stabilityIndex}% → ${metricsAfter.stabilityIndex}%)`);
    } else if (stabDelta <= -1) {
      degradedFactors.push(`National Stability Index eroded by ${stabDelta} pts (${metricsBefore.stabilityIndex}% → ${metricsAfter.stabilityIndex}%)`);
    }

    const appDelta = metricsAfter.approvalRating - metricsBefore.approvalRating;
    if (appDelta >= 1) {
      progressedFactors.push(`Public Approval climbed by +${appDelta} pts (${metricsBefore.approvalRating}% → ${metricsAfter.approvalRating}%)`);
    } else if (appDelta <= -1) {
      degradedFactors.push(`Public Approval declined by ${appDelta} pts (${metricsBefore.approvalRating}% → ${metricsAfter.approvalRating}%)`);
    }

    if (newlyCompletedProjects.length > 0) {
      progressedFactors.push(`Completed ${newlyCompletedProjects.length} major national project(s): ${newlyCompletedProjects.join(', ')}`);
    }

    const report: TemporalJumpReport = {
      id: `jump-${Date.now()}`,
      fromDate,
      toDate,
      elapsedDays: deltaDays,
      nationId: playerNationId,
      nationName: afterNation.name,
      triggerCommand,
      metricsBefore,
      metricsAfter,
      completedProjects: newlyCompletedProjects,
      activePoliciesCompounded,
      progressedFactors,
      degradedFactors,
      executiveSummary: `Over the ${deltaDays}-day progression (${fromDate} to ${toDate}), ${afterNation.name} compounded ${activePoliciesCompounded.length} active executive policy directives and ${newlyCompletedProjects.length} completed infrastructure programs.`,
    };

    advancedState.lastJumpReport = report;
    return { state: advancedState, report };
  }

  private static async resolveGlobalEvents(state: WorldState): Promise<WorldState> {
    const newState = { ...state };
    const playerNationId = newState.playerNationId || 'KEN';
    const player = newState.nations[playerNationId];

    if (player && newState.worldTension > 65) {
      const defensePower = player.shadow?.digitalSecurity || 25;
      if (defensePower < 40) {
        player.economic.treasury = Math.max(0.1, Number((player.economic.treasury - 0.05).toFixed(3)));
        player.lastCyberAttackDate = newState.currentDate;
      }
    }

    return newState;
  }
}
