import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, GenerateContentResponse, ThinkingLevel } from '@google/genai';
import { jsonrepair } from 'jsonrepair';
import dotenv from 'dotenv';

dotenv.config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const MODEL_CHAIN = ['gemini-3.1-flash-lite', 'gemini-flash-latest', 'gemini-3.8-flash'];

function extractJSON(raw: string): any {
  const cleaned = raw.replace(/```json/gi, '').replace(/```/g, '').trim();
  try {
    return JSON.parse(jsonrepair(cleaned));
  } catch {
    try {
      return JSON.parse(cleaned);
    } catch (e) {
      console.error('[Server JSON Extract] Failed to parse response:', e);
      return null;
    }
  }
}

async function generateWithFallback(
  contents: string,
  responseMimeType?: string
): Promise<GenerateContentResponse> {
  let lastError: any = null;
  for (const model of MODEL_CHAIN) {
    try {
      const config: any = {
        thinkingConfig: {
          thinkingLevel: model === 'gemini-3.1-flash-lite' ? ThinkingLevel.MINIMAL : ThinkingLevel.LOW,
        },
      };
      if (responseMimeType) config.responseMimeType = responseMimeType;
      const callPromise = ai.models.generateContent({
        model,
        contents,
        config,
      });
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error(`Model ${model} timed out after 22s`)), 22000)
      );
      return await Promise.race([callPromise, timeoutPromise]);
    } catch (err: any) {
      lastError = err;
      console.warn(`[Server Gemini] Model ${model} failed (${err?.message || err}). Trying next fallback...`);
    }
  }
  throw lastError || new Error('All Gemini models temporarily unavailable.');
}

function classifyIntentFast(playerAction: string): 'COMMAND' | 'QUESTION' | 'CONVERSATION' {
  const trimmed = playerAction.trim();
  const lower = trimmed.toLowerCase();

  // Fast-forward or explicit fiscal/policy/military/diplomatic enactment is always COMMAND
  const hasExplicitActionVerb =
    /\b(fast[\s-]*forward|time[\s-]*jump|jump\s+(to|into|ahead|forward|\d+)|advance\s+(time|to|into|by|\d+)|skip\s+(to|ahead|forward|\d+)|simulate\s+\d+|allocate|invest|spend|enact|pass\s+the|sign\s+the|abolish|repeal|cut\s+taxes|raise\s+taxes|deploy|launch|build|construct|approve\s+\$)\b/i.test(lower);

  if (hasExplicitActionVerb) {
    return 'COMMAND';
  }

  // Meetings, greetings, or direct dialogue
  if (
    /\b(cabinet meeting|call a meeting|convene|speak to|talk to|let'?s discuss|good morning|good evening|hello|hi\b|hey\b|thank you|thanks)\b/i.test(lower)
  ) {
    return 'CONVERSATION';
  }

  // Reports, briefings, questions, analysis requests
  if (
    trimmed.endsWith('?') ||
    /^(what|how|why|who|where|when|which|tell me|show me|give me|brief me|update me|explain|status|report|full report|summarize|analyze|review|assess|audit|check|list)\b/i.test(lower) ||
    /\b(full report|report on|briefing on|status of|details on)\b/i.test(lower)
  ) {
    return 'QUESTION';
  }

  return 'COMMAND';
}

function buildNPCSummary(nations: Record<string, any>, playerNationId: string): string {
  if (!nations) return '  No NPC data available.\n';
  let summary = '';
  for (const id of Object.keys(nations)) {
    if (id === playerNationId) continue;
    const n = nations[id];
    const bti = n.diplomatic?.bti?.[playerNationId] ?? 0;
    const posture = n.military?.powerProjection > 70 ? 'HIGH POWER PROJECTION' : 'Standard Posture';
    summary += `  ${id} (${n.name}): GDP $${n.economic?.gdpNominal}B | Stability ${Math.round(n.stabilityIndex)}% | BTI→${playerNationId}: ${bti} | ${posture}\n`;
  }
  return summary || '  No NPC data available.\n';
}

/**
 * Context-aware deterministic fallback if all Gemini models fail transiently.
 * Never fabricates fake policies for questions, reports, or cabinet meetings.
 */
function buildDeterministicFallbackResponse(
  state: any,
  playerNation: any,
  playerNationId: string,
  playerAction: string,
  intent: 'COMMAND' | 'QUESTION' | 'CONVERSATION',
  temporalJump: any
) {
  const lower = playerAction.toLowerCase();
  let treasury = Number(playerNation.economic?.treasury || 8.5);
  let stability = Number(playerNation.stabilityIndex || 65);
  let approval = Number(playerNation.approvalRating || 55);
  const gdpNominal = Number(playerNation.economic?.gdpNominal || 115);

  let spendB = 0;
  const billionMatch = lower.match(/\$\s*(\d+(?:\.\d+)?)\s*(b|billion)/i);
  const millionMatch = lower.match(/\$\s*(\d+(?:\.\d+)?)\s*(m|million)/i);
  if (billionMatch) spendB = parseFloat(billionMatch[1]);
  else if (millionMatch) spendB = parseFloat(millionMatch[1]) / 1000;

  let newPolicyDirective: any = null;
  let summaryMsg = '';

  if (temporalJump?.isJumpRequest) {
    const r = temporalJump.report;
    summaryMsg = `Temporal Jump Completed (${temporalJump.fromDate} → ${temporalJump.toDate}, ${temporalJump.elapsedDays} days elapsed).\n\nOver this period, ${playerNation.name}'s Nominal GDP moved from $${r?.metricsBefore?.gdpNominal}B to $${r?.metricsAfter?.gdpNominal}B, Sovereign Treasury shifted from $${r?.metricsBefore?.treasury}B to $${r?.metricsAfter?.treasury}B, and Debt-to-GDP stands at ${r?.metricsAfter?.debtToGdp}%. National Stability is now ${r?.metricsAfter?.stabilityIndex}% with Public Approval at ${r?.metricsAfter?.approvalRating}%.`;
  } else if (intent === 'CONVERSATION') {
    if (lower.includes('cabinet') || lower.includes('meeting')) {
      const adviceLines = (state.briefing?.cabinetAdvice || [])
        .map((c: any) => `• ${c.minister} (${c.ministry}): "${c.advice}"`)
        .join('\n');
      summaryMsg = `Cabinet Session Convened (${state.currentDate}) — State House Briefing Room\n\nAll senior Cabinet Secretaries for ${playerNation.name} are present. Here is the immediate round-table brief:\n\n${adviceLines || '• Treasury & Interior Secretaries are ready for your agenda.'}\n\nWhat item on the Sovereign's Desk would you like to address first, Mr. President?`;
    } else {
      summaryMsg = `Acknowledged, Mr. President. All ministries and intelligence desks for ${playerNation.name} are standing by as of ${state.currentDate}.`;
    }
  } else if (intent === 'QUESTION') {
    const deskMatches = (state.briefing?.sovereignsDesk || []).filter((d: string) =>
      lower.split(/\s+/).some(w => w.length > 4 && d.toLowerCase().includes(w))
    );
    const projectMatches = (playerNation.activeProjects || []).filter((p: any) =>
      lower.split(/\s+/).some(w => w.length > 4 && p.name.toLowerCase().includes(w))
    );
    const policyList = (playerNation.activePolicies || [])
      .map((p: any) => `• ${p.title} (${p.category}): ${p.summary}`)
      .join('\n');

    summaryMsg = `${playerNation.name} Executive Intelligence & Policy Report (${state.currentDate}):\n\n` +
      `• Macroeconomic Snapshot: Nominal GDP $${gdpNominal.toFixed(2)}B | Treasury $${treasury.toFixed(2)}B | Debt/GDP ${Number(playerNation.economic?.debtToGdp || 68.5).toFixed(1)}% | Stability ${Math.round(stability)}% | Approval ${Math.round(approval)}%.\n` +
      (deskMatches.length > 0 ? `\nRelevant Sovereign Desk Dockets:\n• ${deskMatches.join('\n• ')}\n` : '') +
      (projectMatches.length > 0 ? `\nMatching Active Projects:\n${projectMatches.map((p: any) => `• ${p.name}: ${p.progress}% complete (${p.status}, $${p.budgetAllocated}B)`).join('\n')}\n` : '') +
      (policyList ? `\nActive Compounding Policies:\n${policyList}` : '');
  } else {
    // Only register a policy if it's genuinely an enactment/spending/reform command
    const isConcretePolicy =
      spendB > 0 ||
      /\b(allocate|invest|spend|enact|pass|subsid|tax|reform|build|construct|deploy|treaty|pact|protocol|moderniz)\b/i.test(lower);

    if (spendB > 0 && spendB < treasury) {
      treasury = Number((treasury - spendB).toFixed(2));
    }

    if (isConcretePolicy) {
      const isEcon = /\b(tax|gdp|debt|trade|port|customs|invest|industry|geothermal|energy|rail|tech|digital|budget|treasury)\b/i.test(lower);
      const isSecurity = /\b(military|defense|army|police|border|cyber|intelligence|security|drone)\b/i.test(lower);
      const isSocial = /\b(food|water|housing|health|hospital|school|education|subsidy|farmer|fertilizer)\b/i.test(lower);

      const category = isSecurity ? 'MILITARY' : isSocial ? 'SOCIAL' : 'ECONOMIC';
      stability = Math.min(99, stability + (isSecurity || isSocial ? 1.5 : 0.8));
      approval = Math.min(98, approval + (isSocial ? 1.8 : 0.9));

      newPolicyDirective = {
        id: `pol-${Date.now()}`,
        title: playerAction.length > 52 ? playerAction.slice(0, 49) + '...' : playerAction,
        category,
        enactedDate: state.currentDate,
        summary: `Executive directive enacted on ${state.currentDate}: ${playerAction}`,
        status: 'ACTIVE',
        dailyEffects: {
          gdpGrowthBonus: isEcon ? 0.00006 : 0.00003,
          treasuryDeltaB: isEcon ? 0.0018 : -0.0006,
          stabilityDelta: isSecurity ? 0.006 : 0.003,
          approvalDelta: isSocial ? 0.006 : 0.003,
          inflationDelta: isEcon ? -0.001 : 0,
          foodDelta: isSocial ? 0.004 : 0.001,
          waterDelta: isSocial ? 0.003 : 0.001,
          housingDelta: isSocial ? 0.003 : 0.001,
          transportDelta: isEcon ? 0.004 : 0.001,
        },
      };

      summaryMsg = `Executive Directive Enacted (${state.currentDate}): "${playerAction}".\n\n${spendB > 0 ? `$${spendB.toFixed(2)}B allocated from Sovereign Treasury (remaining reserves: $${treasury.toFixed(2)}B). ` : ''}Logged as an active ${category} policy directive.`;
    } else {
      summaryMsg = `Order acknowledged (${state.currentDate}): "${playerAction}". Relevant ministries have been briefed and are awaiting any specific budget or legislative action.`;
    }
  }

  return {
    currentDate: state.currentDate,
    worldTension: state.worldTension,
    newPolicyDirective,
    temporalAnalysis: temporalJump?.isJumpRequest
      ? {
          progressedFactors: temporalJump.report?.progressedFactors || [],
          degradedFactors: temporalJump.report?.degradedFactors || [],
          executiveSummary: summaryMsg,
        }
      : null,
    nations: [
      {
        id: playerNationId,
        name: playerNation.name,
        stabilityIndex: Math.round(stability),
        approvalRating: Math.round(approval),
        economic: {
          gdpNominal,
          treasury,
          liquidCash: Math.round(treasury * 120),
          debtToGdp: playerNation.economic?.debtToGdp,
          inflation: playerNation.economic?.inflation,
        },
      },
    ],
    briefing: {
      ...(state.briefing || {}),
      chiefOfStaffMessage: summaryMsg,
      incomingCall: null,
    },
  };
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  app.post('/api/simulation/turn', async (req, res) => {
    try {
      const {
        state,
        playerAction,
        history = [],
        temporalJump = null,
      } = req.body;

      if (!state || !playerAction) {
        res.status(400).json({ error: 'Missing simulation state or playerAction' });
        return;
      }

      const playerNationId = state.playerNationId || 'KEN';
      const playerNation = state.nations?.[playerNationId] || state.nations?.['KEN'];
      const president = playerNation?.president?.name || 'President';
      const activeCrises = state.briefing?.sovereignsDesk?.join('\n  • ') || 'None';
      const activePoliciesList = (playerNation?.activePolicies || [])
        .map((p: any) => `${p.title} (${p.category}, enacted ${p.enactedDate}): ${p.summary}`)
        .join('\n  • ') || 'None';

      const intent = temporalJump?.isJumpRequest ? 'COMMAND' : classifyIntentFast(playerAction);

      const historyText = (history || [])
        .slice(-8)
        .map((h: any) => `${String(h.role).toUpperCase()}: ${h.text}`)
        .join('\n');

      const temporalContextBlock = temporalJump?.isJumpRequest
        ? `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TEMPORAL FAST-FORWARD EXECUTED:
The simulation clock has just advanced from ${temporalJump.fromDate} to ${temporalJump.toDate} (${temporalJump.elapsedDays} days elapsed).
All active policies, projects, fiscal balances, and demographic trends have been mathematically compounded across this ${temporalJump.elapsedDays}-day period!

BEFORE (${temporalJump.fromDate}) vs AFTER (${temporalJump.toDate}) METRICS FOR ${playerNation.name.toUpperCase()}:
- Nominal GDP: $${temporalJump.report?.metricsBefore?.gdpNominal}B → $${temporalJump.report?.metricsAfter?.gdpNominal}B
- Sovereign Treasury: $${temporalJump.report?.metricsBefore?.treasury}B → $${temporalJump.report?.metricsAfter?.treasury}B
- Debt-to-GDP: ${temporalJump.report?.metricsBefore?.debtToGdp}% → ${temporalJump.report?.metricsAfter?.debtToGdp}%
- Stability Index: ${temporalJump.report?.metricsBefore?.stabilityIndex}% → ${temporalJump.report?.metricsAfter?.stabilityIndex}%
- Approval Rating: ${temporalJump.report?.metricsBefore?.approvalRating}% → ${temporalJump.report?.metricsAfter?.approvalRating}%
- Completed Infrastructure Projects during gap: ${(temporalJump.report?.completedProjects || []).join(', ') || 'None'}
- Active Policies Compounded during gap: ${(temporalJump.report?.activePoliciesCompounded || []).join(', ') || 'Baseline Governance'}

CRITICAL FAST-FORWARD MANDATE:
1. Keep 'currentDate' at "${state.currentDate}" (${temporalJump.toDate}).
2. Respect the post-jump macroeconomic metrics above as the new ground truth for ${temporalJump.toDate}.
3. In 'chiefOfStaffMessage', write an authoritative, comprehensive multi-paragraph historical retrospective explaining how ${playerNation.name} progressed from ${temporalJump.fromDate} to ${temporalJump.toDate}, detailing what improved, what faced friction or degraded, and how the player's enacted policies shaped the nation by ${temporalJump.toDate}.
4. Populate 'temporalAnalysis' with concrete bullet points for 'progressedFactors', 'degradedFactors', and 'executiveSummary'.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`
        : '';

      const intentInstruction = {
        COMMAND: `The player issued an EXECUTIVE COMMAND or TEMPORAL JUMP. Execute it realistically. Update ${playerNation.name}'s state, mutate financials accurately, register a 'newPolicyDirective' ONLY if the player enacted a concrete lasting policy/reform/investment/treaty (otherwise null), and update global events. The current date is ${state.currentDate}.`,
        QUESTION: `The player asked for a REPORT or QUESTION. Provide a thorough, multi-paragraph, data-rich executive report directly answering their request in 'chiefOfStaffMessage'. DO NOT mutate nation financials, DO NOT register 'newPolicyDirective' (set to null), and DO NOT advance the date.`,
        CONVERSATION: `The player is convening a MEETING or holding a CONVERSATION (e.g. calling a cabinet meeting, speaking with ministers/officials). Roleplay the live meeting or dialogue in 'chiefOfStaffMessage' with specific ministers speaking and offering options. Set 'newPolicyDirective' to null and 'incomingCall' to null. DO NOT mutate financials or advance the date.`,
      }[intent];

      const mainPrompt = `You are OMEGA — Chief of Staff, Strategic Atlas Director, and Geopolitical Simulation Engine serving ${president}, Leader of ${playerNation.name} (${playerNationId}).

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
INTENT: ${intent}
${intentInstruction}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${temporalContextBlock}

=== WORLD STATUS (Current Date: ${state.currentDate}) ===
World Tension: ${state.worldTension}/100
Active Player Nation: ${playerNation.name} (${playerNationId})

=== ACTIVE PLAYER NATION (${playerNationId}) SUMMARY STATE ===
Stability: ${playerNation.stabilityIndex}% | Approval: ${playerNation.approvalRating}%
Economic: ${JSON.stringify(playerNation.economic)}
Survival: ${JSON.stringify(playerNation.survival)}
Military: Active ${playerNation.military?.activePersonnel}, Projection ${playerNation.military?.powerProjection}/100
Ministries: ${JSON.stringify(Object.values(playerNation.ministries || {}).slice(0, 10))}
Active Projects: ${JSON.stringify(playerNation.activeProjects || [])}

=== ENACTED CAUSAL POLICY LEDGER ===
  • ${activePoliciesList}

=== OTHER NATIONS SNAPSHOT ===
${buildNPCSummary(state.nations, playerNationId)}

=== ACTIVE CRISES ON THE SOVEREIGN'S DESK ===
  • ${activeCrises}

=== RECENT COMMAND HISTORY ===
${historyText || '(No prior history)'}

=== PLAYER INPUT ===
"${playerAction}"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ABSOLUTE SIMULATION RULES:
1. REALISM & INSTITUTIONAL ACCURACY: Ground all analysis in authentic modern geopolitics, real regional trade corridors, sovereign debt dynamics, and authentic institutions.
2. FINANCIAL & DATA SOVEREIGNTY: Preserve the exact scale of ${playerNation.name}'s economy (GDP ~$${playerNation.economic?.gdpNominal}B, Treasury ~$${playerNation.economic?.treasury}B). Only modify Treasury, Liquid Cash, or Debt-to-GDP as a direct, proportional consequence of an explicit financial command.
3. STRICT CAUSAL POLICY RULE ('newPolicyDirective'): ONLY populate 'newPolicyDirective' when INTENT is COMMAND and the player explicitly enacts a concrete policy, law, tax change, subsidy, budget allocation, infrastructure build, or treaty. For questions, reports, meetings, or fast-forwards, you MUST set 'newPolicyDirective' to null.
4. DATE INTEGRITY: Set 'currentDate' to "${state.currentDate}".
5. RICH BRIEFING TELEMETRY: Always provide at least 4 uppercase 'globalTicker' headlines, 3 'cabinetAdvice' items, 3 'publicPulse' items, 3 'forecasts' items, 3 'osintFeeds' items, 3 'threatMatrix' items with valid [longitude, latitude] coordinates, and a relevant 'knowledgeGraph'.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Return ONLY valid JSON matching this structure:
{
  "currentDate": "${state.currentDate}",
  "worldTension": ${state.worldTension},
  "newPolicyDirective": null,
  "temporalAnalysis": null,
  "nations": [
    {
      "id": "${playerNationId}",
      "name": "${playerNation.name}",
      "stabilityIndex": ${Math.round(playerNation.stabilityIndex)},
      "approvalRating": ${Math.round(playerNation.approvalRating)},
      "economic": {
        "gdpNominal": ${playerNation.economic.gdpNominal},
        "treasury": ${playerNation.economic.treasury},
        "liquidCash": ${playerNation.economic.liquidCash},
        "debtToGdp": ${playerNation.economic.debtToGdp},
        "inflation": ${playerNation.economic.inflation}
      }
    }
  ],
  "briefing": {
    "globalTicker": ["HEADLINE 1", "HEADLINE 2", "HEADLINE 3", "HEADLINE 4"],
    "stateOfNation": {
      "stabilityIndex": ${Math.round(playerNation.stabilityIndex)},
      "approvalRating": ${Math.round(playerNation.approvalRating)},
      "vitals": {
        "food": ${Math.round(playerNation.survival.foodSecurity)},
        "water": ${Math.round(playerNation.survival.waterAccess)},
        "housing": ${Math.round(playerNation.survival.housingAvailability)},
        "transport": ${Math.round(playerNation.survival.transportEfficiency)}
      },
      "treasury": "Treasury: $${playerNation.economic.treasury.toFixed(2)}B · Liquid: $${Math.round(playerNation.economic.liquidCash)}M · Debt/GDP: ${playerNation.economic.debtToGdp.toFixed(1)}%",
      "intelligenceBrief": "Detailed strategic intelligence assessment..."
    },
    "sovereignsDesk": ["Active issue 1", "Active issue 2", "Active issue 3"],
    "chiefOfStaffMessage": "Comprehensive multi-paragraph executive response directly addressing the player's input...",
    "incomingCall": null,
    "cabinetAdvice": [
      { "minister": "Minister Name", "ministry": "Ministry Name", "advice": "Actionable ministerial recommendation", "urgency": "high" }
    ],
    "publicPulse": [
      { "source": "Media / Civic Group", "sentiment": "positive", "text": "Public reaction..." }
    ],
    "forecasts": [
      { "metric": "Metric Name", "prediction": "Projected trajectory...", "trend": "up" }
    ],
    "osintFeeds": [
      { "source": "SIGINT", "confidence": 90, "timestamp": "${state.currentDate}T09:00:00Z", "data": "Specific intelligence intercept...", "region": "East Africa" }
    ],
    "threatMatrix": [
      { "id": "t1", "category": "SECURITY", "description": "Specific threat...", "probability": 60, "impact": 70, "timeframe": "30d", "coordinates": [36.82, -1.29] }
    ],
    "knowledgeGraph": {
      "nodes": [{ "id": "n1", "label": "Entity", "type": "ORGANIZATION" }],
      "edges": [{ "source": "n1", "target": "n2", "relation": "INFLUENCES" }]
    }
  }
}`;

      try {
        const response = await generateWithFallback(mainPrompt, 'application/json');
        const rawText = response.text?.trim() || '{}';
        const parsed = extractJSON(rawText);
        if (!parsed) {
          throw new Error('Parsed JSON was empty');
        }
        res.json({ intent, parsed, source: 'gemini' });
      } catch (aiError: any) {
        console.warn('[Server /api/simulation/turn] AI fallback activated:', aiError?.message || aiError);
        const fallbackParsed = buildDeterministicFallbackResponse(
          state,
          playerNation,
          playerNationId,
          playerAction,
          intent,
          temporalJump
        );
        res.json({ intent, parsed: fallbackParsed, source: 'deterministic-fallback' });
      }
    } catch (error: any) {
      console.error('[Server /api/simulation/turn] Error:', error);
      res.status(500).json({
        error: error?.message || 'Simulation engine request failed.',
      });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Sovereign Atlas Server running on http://localhost:${PORT}`);
  });
}

startServer();
