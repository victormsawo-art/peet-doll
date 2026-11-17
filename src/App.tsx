import React, { useState, useRef, useEffect } from 'react';
import {
  WorldState,
  Nation,
  VoterGroup,
  PolicyDirective,
  TemporalJumpReport,
  SaveCheckpoint,
} from './types';
import { initialState } from './engine/initialState';
import { processTurn } from './engine/gemini';
import { formatFinancial } from './lib/format';
import { WorldSimulationController } from './engine/WorldSimulationController';
import {
  Terminal,
  Activity,
  Globe,
  Shield,
  DollarSign,
  Users,
  AlertTriangle,
  ChevronRight,
  Loader2,
  Send,
  Briefcase,
  PhoneCall,
  TrendingUp,
  MessageSquare,
  Radio,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Target,
  Clock,
  FastForward,
  Play,
  Pause,
  Bookmark,
  RotateCcw,
  CheckCircle2,
  Sliders,
  Layers,
  X,
  Plus,
  Trash2,
} from 'lucide-react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';

const WorldMap = React.lazy(() => import('./components/WorldMap'));

function KnowledgeGraphSVG({
  nodes,
  edges,
}: {
  nodes: { id: string; label: string; type: string }[];
  edges: { source: string; target: string; relation?: string; relationship?: string }[];
}) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  if (!nodes || nodes.length === 0) return null;

  const W = 420,
    H = 220;
  const cx = W / 2,
    cy = H / 2;
  const radius = Math.min(W, H) * 0.36;

  const positions: Record<string, { x: number; y: number }> = {};
  nodes.forEach((node, i) => {
    const angle = (i / nodes.length) * 2 * Math.PI - Math.PI / 2;
    positions[node.id] = {
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
    };
  });

  const typeColor: Record<string, string> = {
    PERSON: '#38bdf8',
    ORGANIZATION: '#818cf8',
    LOCATION: '#10b981',
    EVENT: '#f59e0b',
    ASSET: '#22d3ee',
  };

  const connectedIds = hoveredId
    ? new Set(
        edges
          .filter(e => e.source === hoveredId || e.target === hoveredId)
          .flatMap(e => [e.source, e.target])
      )
    : null;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-52">
      {edges.map((edge, i) => {
        const from = positions[edge.source];
        const to = positions[edge.target];
        if (!from || !to) return null;
        const isLit = hoveredId && (edge.source === hoveredId || edge.target === hoveredId);
        return (
          <g key={i}>
            <line
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              stroke={isLit ? '#38bdf8' : 'rgba(148,163,184,0.22)'}
              strokeWidth={isLit ? 1.6 : 0.9}
            />
          </g>
        );
      })}
      {nodes.map(node => {
        const pos = positions[node.id];
        if (!pos) return null;
        const color = typeColor[node.type] || '#38bdf8';
        const dimmed = hoveredId && connectedIds && !connectedIds.has(node.id);
        const label = node.label.length > 16 ? node.label.slice(0, 15) + '…' : node.label;
        return (
          <g
            key={node.id}
            onMouseEnter={() => setHoveredId(node.id)}
            onMouseLeave={() => setHoveredId(null)}
            style={{ cursor: 'pointer', opacity: dimmed ? 0.25 : 1, transition: 'opacity 150ms' }}
          >
            <circle cx={pos.x} cy={pos.y} r={7} fill={color} />
            <circle cx={pos.x} cy={pos.y} r={11} fill="transparent" stroke={color} strokeWidth="1" opacity="0.35" />
            <text
              x={pos.x}
              y={pos.y + 20}
              textAnchor="middle"
              fill="#cbd5e1"
              fontSize="8.5"
              fontFamily="var(--font-sans)"
            >
              {label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

const SupplyChainRadar = React.memo(({ data }: { data: any }) => {
  if (!data) return null;
  const chartData = Object.entries(data).map(([key, value]) => ({
    subject: key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
    A: value,
    fullMark: 100,
  }));

  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="72%" data={chartData}>
          <PolarGrid stroke="rgba(148, 163, 184, 0.16)" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
          <Radar name="Supply Index" dataKey="A" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.25} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#0f172a',
              borderColor: 'rgba(148,163,184,0.2)',
              fontSize: '12px',
              color: '#f8fafc',
            }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
});

export default function App() {
  // 1. Load & Migrate World State
  const [state, setState] = useState<WorldState>(() => {
    const saved = localStorage.getItem('gse_state');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.version === initialState.version && parsed.nations && parsed.nations['KEN']) {
          return {
            ...initialState,
            ...parsed,
            playerNationId: parsed.playerNationId || 'KEN',
            isProcessing: false,
          };
        }
      } catch (e) {
        console.error('Failed to parse saved state:', e);
      }
    }
    return { ...initialState };
  });

  // 2. Active Workspace View (Top Bar Contract 5 links)
  const [activeWorkspace, setActiveWorkspace] = useState<
    'atlas' | 'cabinet' | 'macro' | 'military' | 'intelligence'
  >('atlas');

  // 3. Real-Time Ticker Speed (0 = Paused, 1 = 1d/8s, 5 = 1d/1.8s, 30 = 1d/0.35s)
  const [simSpeed, setSimSpeed] = useState<0 | 1 | 5 | 30>(0);

  // 4. Modals & Drawers
  const [showFastForwardModal, setShowFastForwardModal] = useState(false);
  const [customTargetDate, setCustomTargetDate] = useState('');
  const [customJumpReason, setCustomJumpReason] = useState(
    'Evaluate compounding macroeconomic, fiscal, and social outcomes of all enacted policies.'
  );
  const [showJumpReportModal, setShowJumpReportModal] = useState(false);
  const [showCheckpointsModal, setShowCheckpointsModal] = useState(false);
  const [selectedCountryId, setSelectedCountryId] = useState<string | null>(null);
  const [showDiplomacyModal, setShowDiplomacyModal] = useState(false);

  // 5. Diplomacy Form State
  const [diplomacyTarget, setDiplomacyTarget] = useState('UGA');
  const [diplomacyAction, setDiplomacyAction] = useState('Bilateral Trade & Corridor Accord');
  const [diplomacyNote, setDiplomacyNote] = useState('');

  // 6. Custom Policy Form State (in Cabinet & Policy view)
  const [newPolicyTitle, setNewPolicyTitle] = useState('');
  const [newPolicyCategory, setNewPolicyCategory] = useState<PolicyDirective['category']>('ECONOMIC');
  const [newPolicySummary, setNewPolicySummary] = useState('');

  // 7. Executive Terminal History & Input
  const [command, setCommand] = useState('');
  const [history, setHistory] = useState<{ role: 'user' | 'system'; text: string; date?: string }[]>(() => {
    const saved = localStorage.getItem('gse_history_v2');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return [
      {
        role: 'system',
        date: initialState.currentDate,
        text:
          initialState.briefing?.chiefOfStaffMessage ||
          'Sovereign Atlas Command Engine online. Awaiting executive directive or temporal jump target.',
      },
    ];
  });
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // 8. Saved Checkpoints
  const [checkpoints, setCheckpoints] = useState<SaveCheckpoint[]>(() => {
    const saved = localStorage.getItem('gse_checkpoints_v2');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [];
  });
  const [checkpointLabel, setCheckpointLabel] = useState('');

  const terminalEndRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<WorldState>(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    if (!state.isProcessing) {
      localStorage.setItem('gse_state', JSON.stringify(state));
    }
  }, [state]);

  useEffect(() => {
    localStorage.setItem('gse_history_v2', JSON.stringify(history.slice(-40)));
  }, [history]);

  useEffect(() => {
    localStorage.setItem('gse_checkpoints_v2', JSON.stringify(checkpoints));
  }, [checkpoints]);

  // Real-time simulation ticker when simSpeed > 0
  useEffect(() => {
    if (simSpeed === 0 || state.isProcessing) return;
    const intervalMs = simSpeed === 1 ? 8000 : simSpeed === 5 ? 1800 : 350;
    const timer = setInterval(async () => {
      if (stateRef.current.isProcessing) return;
      const nextState = await WorldSimulationController.advanceSimulation(stateRef.current, 1);
      setState({
        ...nextState,
        lastInteractionTime: Date.now(),
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [simSpeed, state.isProcessing]);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, state.isProcessing]);

  const playerNationId = state.playerNationId || 'KEN';
  const playerNation = state.nations[playerNationId] || state.nations['KEN'];

  // Initialize default customTargetDate to 1 year ahead of currentDate when modal opens
  useEffect(() => {
    if (showFastForwardModal && state.currentDate) {
      const [y, m, d] = state.currentDate.split('-').map(Number);
      const nextYear = `${y + 1}-${String(m || 1).padStart(2, '0')}-${String(d || 1).padStart(2, '0')}`;
      setCustomTargetDate(nextYear);
    }
  }, [showFastForwardModal, state.currentDate]);

  // Core Command & Fast-Forward Execution
  const executeCommand = async (userCmd: string, explicitJumpDays?: number) => {
    const trimmed = userCmd.trim();
    if (!trimmed || state.isProcessing) return;

    // Pause live ticker while executing a turn or jump
    setSimSpeed(0);
    setCommand('');
    setCommandHistory(prev => [trimmed, ...prev].slice(0, 50));
    setHistoryIndex(-1);

    setHistory(prev => [
      ...prev,
      { role: 'user', date: state.currentDate, text: trimmed },
    ]);

    setState(prev => ({ ...prev, isProcessing: true }));

    try {
      const updatedState = await processTurn(state, trimmed, history, explicitJumpDays);
      setState(updatedState);

      const replyMessage =
        updatedState.briefing?.chiefOfStaffMessage ||
        `Directive executed as of ${updatedState.currentDate}. State telemetry synchronized.`;

      setHistory(prev => [
        ...prev,
        {
          role: 'system',
          date: updatedState.currentDate,
          text: replyMessage,
        },
      ]);

      // If this turn executed a temporal jump, automatically open the Before/After Progression Report
      if (
        updatedState.lastJumpReport &&
        updatedState.lastJumpReport.id !== state.lastJumpReport?.id
      ) {
        setShowJumpReportModal(true);
      }
    } catch (err: any) {
      console.error('Command execution error:', err);
      setState(prev => ({ ...prev, isProcessing: false }));
      setHistory(prev => [
        ...prev,
        {
          role: 'system',
          date: state.currentDate,
          text: `Operational Notice: ${err?.message || 'Unable to reach AI synthesis server. Local deterministic engine remains active.'}`,
        },
      ]);
    }
  };

  // Trigger a Fast-Forward Jump by Days or Target Date
  const handleFastForwardJump = async (days: number, descriptionLabel: string) => {
    if (days <= 0 || state.isProcessing) return;
    setShowFastForwardModal(false);
    await executeCommand(
      `Fast-forward ${descriptionLabel} (${days} days) and provide a full progression report on all enacted policies and projects.`,
      days
    );
  };

  const handleCustomDateJump = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTargetDate) return;
    const [y1, m1, d1] = state.currentDate.split('-').map(Number);
    const [y2, m2, d2] = customTargetDate.split('-').map(Number);
    const utc1 = Date.UTC(y1, (m1 || 1) - 1, d1 || 1);
    const utc2 = Date.UTC(y2, (m2 || 1) - 1, d2 || 1);
    const deltaDays = Math.round((utc2 - utc1) / (1000 * 60 * 60 * 24));

    if (deltaDays <= 0) {
      setHistory(prev => [
        ...prev,
        {
          role: 'system',
          date: state.currentDate,
          text: `Target date (${customTargetDate}) must be later than current simulation date (${state.currentDate}).`,
        },
      ]);
      return;
    }

    setShowFastForwardModal(false);
    await executeCommand(
      `Fast-forward to ${customTargetDate}. ${customJumpReason}`,
      deltaDays
    );
  };

  // Switch Playable Nation
  const handleSwitchPlayableNation = (targetNationId: string) => {
    if (!state.nations[targetNationId]) return;
    setState(prev => {
      const updatedNations = { ...prev.nations };
      Object.keys(updatedNations).forEach(id => {
        updatedNations[id] = {
          ...updatedNations[id],
          isPlayer: id === targetNationId,
        };
      });
      const newPlayer = updatedNations[targetNationId];
      return {
        ...prev,
        playerNationId: targetNationId,
        nations: updatedNations,
        briefing: prev.briefing
          ? {
              ...prev.briefing,
              stateOfNation: {
                ...prev.briefing.stateOfNation,
                stabilityIndex: Math.round(newPlayer.stabilityIndex),
                approvalRating: Math.round(newPlayer.approvalRating),
                vitals: {
                  food: Math.round(newPlayer.survival.foodSecurity),
                  water: Math.round(newPlayer.survival.waterAccess),
                  housing: Math.round(newPlayer.survival.housingAvailability),
                  transport: Math.round(newPlayer.survival.transportEfficiency),
                },
                treasury: `Treasury: $${newPlayer.economic.treasury.toFixed(2)}B · Liquid: $${Math.round(newPlayer.economic.liquidCash)}M · Debt/GDP: ${newPlayer.economic.debtToGdp.toFixed(1)}%`,
              },
            }
          : null,
      };
    });
    setSelectedCountryId(null);
    setHistory(prev => [
      ...prev,
      {
        role: 'system',
        date: state.currentDate,
        text: `Sovereign Command transferred to ${state.nations[targetNationId].name} (${targetNationId}). All telemetry and policy ledgers synchronized.`,
      },
    ]);
  };

  // Save & Restore Checkpoints
  const handleSaveCheckpoint = (e: React.FormEvent) => {
    e.preventDefault();
    const label =
      checkpointLabel.trim() ||
      `${playerNation.name} · ${state.currentDate}`;
    const newCp: SaveCheckpoint = {
      id: `cp-${Date.now()}`,
      label,
      savedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      simDate: state.currentDate,
      playerNationId,
      gdpNominal: playerNation.economic.gdpNominal,
      treasury: playerNation.economic.treasury,
      stabilityIndex: Math.round(playerNation.stabilityIndex),
      state: JSON.parse(JSON.stringify(state)),
    };
    setCheckpoints(prev => [newCp, ...prev].slice(0, 12));
    setCheckpointLabel('');
  };

  const handleRestoreCheckpoint = (cp: SaveCheckpoint) => {
    setSimSpeed(0);
    setState({ ...cp.state, isProcessing: false, lastInteractionTime: Date.now() });
    setShowCheckpointsModal(false);
    setHistory(prev => [
      ...prev,
      {
        role: 'system',
        date: cp.simDate,
        text: `Restored timeline checkpoint "${cp.label}" (${cp.simDate}).`,
      },
    ]);
  };

  const handleResetToCleanBaseline = () => {
    setSimSpeed(0);
    localStorage.removeItem('gse_state');
    localStorage.removeItem('gse_history_v2');
    setState({ ...initialState, lastInteractionTime: Date.now() });
    setHistory([
      {
        role: 'system',
        date: initialState.currentDate,
        text: initialState.briefing?.chiefOfStaffMessage || 'Baseline 2026 simulation restored.',
      },
    ]);
    setShowCheckpointsModal(false);
  };

  // Direct Ministry Budget Slider Handler
  const handleMinistryBudgetChange = (ministryKey: string, newBudgetB: number) => {
    setState(prev => {
      const pNation = prev.nations[playerNationId];
      if (!pNation || !pNation.ministries || !pNation.ministries[ministryKey]) return prev;
      const oldBudget = pNation.ministries[ministryKey].budget;
      const delta = newBudgetB - oldBudget;
      const updatedTreasury = Number(Math.max(0.1, pNation.economic.treasury - delta * 0.25).toFixed(2));
      return {
        ...prev,
        nations: {
          ...prev.nations,
          [playerNationId]: {
            ...pNation,
            economic: {
              ...pNation.economic,
              treasury: updatedTreasury,
            },
            ministries: {
              ...pNation.ministries,
              [ministryKey]: {
                ...pNation.ministries[ministryKey],
                budget: Number(newBudgetB.toFixed(2)),
                performance: Math.min(100, Math.max(25, Math.round(pNation.ministries[ministryKey].performance + delta * 6))),
              },
            },
          },
        },
      };
    });
  };

  // Toggle or Repeal an Active Policy
  const handleTogglePolicyStatus = (policyId: string) => {
    setState(prev => {
      const pNation = prev.nations[playerNationId];
      if (!pNation || !pNation.activePolicies) return prev;
      return {
        ...prev,
        nations: {
          ...prev.nations,
          [playerNationId]: {
            ...pNation,
            activePolicies: pNation.activePolicies.map(p =>
              p.id === policyId
                ? { ...p, status: p.status === 'ACTIVE' ? 'REPEALED' : 'ACTIVE' }
                : p
            ),
          },
        },
      };
    });
  };

  // Enact a Structured Policy Directly from the Cabinet & Policy Deck
  const handleCreateStructuredPolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPolicyTitle.trim() || !newPolicySummary.trim()) return;
    const cmdText = `Enact ${newPolicyCategory} Policy Directive "${newPolicyTitle.trim()}": ${newPolicySummary.trim()}`;
    setNewPolicyTitle('');
    setNewPolicySummary('');
    await executeCommand(cmdText);
  };

  const selectedCountry = selectedCountryId ? state.nations[selectedCountryId] : null;
  const latestJumpReport: TemporalJumpReport | null = state.lastJumpReport || null;

  return (
    <div className="min-h-screen w-full bg-[#060B16] text-slate-100 flex flex-col selection:bg-sky-500 selection:text-slate-950">
      {/* ===================================================================
          TOP BAR CONTRACT: 3 ZONES (Brand | 5 Workspace Links | Primary Temporal Action)
         =================================================================== */}
      <header className="flex items-center justify-between gap-8 px-6 py-3.5 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-xl sticky top-0 z-30">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="#atlas"
          onClick={e => {
            e.preventDefault();
            setActiveWorkspace('atlas');
          }}
          className="text-lg font-bold tracking-tight text-white whitespace-nowrap shrink-0"
        >
          Sovereign Atlas
        </a>

        {/* Zone 2: 5 single-line workspace navigation links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-400">
          {[
            { id: 'atlas', label: 'Strategic Atlas' },
            { id: 'cabinet', label: 'Cabinet & Policy' },
            { id: 'macro', label: 'Macroeconomy' },
            { id: 'military', label: 'Force Posture' },
            { id: 'intelligence', label: 'Intelligence' },
          ].map(item => (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={e => {
                e.preventDefault();
                setActiveWorkspace(item.id as any);
              }}
              className={`transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
                activeWorkspace === item.id
                  ? 'text-white border-sky-400'
                  : 'text-slate-400 border-transparent hover:text-slate-200'
              }`}
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Zone 3: 1 primary action (Temporal Fast-Forward Trigger) */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setShowFastForwardModal(true)}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-950 bg-sky-400 hover:bg-sky-300 rounded-lg transition-colors whitespace-nowrap shrink-0 shadow-sm cursor-pointer"
          >
            <FastForward size={14} />
            Fast-Forward ({state.currentDate})
          </button>
        </div>
      </header>

      {/* ===================================================================
          WORKSPACE SUB-BAR: SOVEREIGN TELEMETRY, NATION SELECTOR & LIVE TICKER
         =================================================================== */}
      <div className="border-b border-slate-800/70 bg-slate-950/60 px-6 py-2.5 flex flex-wrap items-center justify-between gap-4">
        {/* Active Nation Selector & Key Vitals */}
        <div className="flex flex-wrap items-center gap-5 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Sovereign State:</span>
            <select
              value={playerNationId}
              onChange={e => handleSwitchPlayableNation(e.target.value)}
              className="bg-slate-900 border border-slate-700/80 text-white font-semibold rounded-md px-2.5 py-1 text-xs focus:outline-none focus:border-sky-400 cursor-pointer"
            >
              {Object.values(state.nations).map(n => (
                <option key={n.id} value={n.id}>
                  {n.name} ({n.id})
                </option>
              ))}
            </select>
          </div>

          <span className="text-slate-700">·</span>

          <div className="flex items-center gap-1.5 font-mono tabular-nums">
            <span className="font-sans text-slate-400">GDP:</span>
            <span className="text-white font-semibold">{formatFinancial(playerNation.economic.gdpNominal)}</span>
          </div>

          <span className="text-slate-700">·</span>

          <div className="flex items-center gap-1.5 font-mono tabular-nums">
            <span className="font-sans text-slate-400">Treasury:</span>
            <span className="text-emerald-400 font-semibold">{formatFinancial(playerNation.economic.treasury)}</span>
          </div>

          <span className="text-slate-700">·</span>

          <div className="flex items-center gap-1.5 font-mono tabular-nums">
            <span className="font-sans text-slate-400">Debt/GDP:</span>
            <span
              className={
                playerNation.economic.debtToGdp > 75
                  ? 'text-rose-400 font-semibold'
                  : 'text-slate-200 font-semibold'
              }
            >
              {playerNation.economic.debtToGdp.toFixed(1)}%
            </span>
          </div>

          <span className="text-slate-700">·</span>

          <div className="flex items-center gap-1.5 font-mono tabular-nums">
            <span className="font-sans text-slate-400">Stability:</span>
            <span className="text-sky-400 font-semibold">{Math.round(playerNation.stabilityIndex)}%</span>
          </div>

          <span className="text-slate-700">·</span>

          <div className="flex items-center gap-1.5 font-mono tabular-nums">
            <span className="font-sans text-slate-400">Approval:</span>
            <span className="text-slate-200 font-semibold">{Math.round(playerNation.approvalRating)}%</span>
          </div>
        </div>

        {/* Simulation Clock Speed & Checkpoint Controls */}
        <div className="flex items-center gap-2.5">
          {/* Speed Controls */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-xs font-mono tabular-nums">
            <button
              onClick={() => setSimSpeed(0)}
              className={`px-2.5 py-1 rounded-md transition-colors flex items-center gap-1 whitespace-nowrap shrink-0 cursor-pointer ${
                simSpeed === 0 ? 'bg-slate-800 text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
              title="Pause Real-Time Clock"
            >
              <Pause size={11} /> Pause
            </button>
            <button
              onClick={() => setSimSpeed(1)}
              className={`px-2 py-1 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                simSpeed === 1 ? 'bg-sky-500/20 text-sky-300 font-semibold' : 'text-slate-400 hover:text-white'
              }`}
              title="1 Day every 8 seconds"
            >
              1x
            </button>
            <button
              onClick={() => setSimSpeed(5)}
              className={`px-2 py-1 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                simSpeed === 5 ? 'bg-sky-500/20 text-sky-300 font-semibold' : 'text-slate-400 hover:text-white'
              }`}
              title="1 Day every 1.8 seconds"
            >
              5x
            </button>
            <button
              onClick={() => setSimSpeed(30)}
              className={`px-2 py-1 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                simSpeed === 30 ? 'bg-sky-500/20 text-sky-300 font-semibold' : 'text-slate-400 hover:text-white'
              }`}
              title="Rapid Daily Progression"
            >
              30x
            </button>
          </div>

          {/* Quick Jump Buttons */}
          <div className="hidden xl:flex items-center gap-1">
            <button
              onClick={() => handleFastForwardJump(30, '+30 Days')}
              disabled={state.isProcessing}
              className="px-2.5 py-1 text-xs font-mono bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-md text-slate-300 transition-colors whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-40"
            >
              +30D
            </button>
            <button
              onClick={() => handleFastForwardJump(365, '+1 Year')}
              disabled={state.isProcessing}
              className="px-2.5 py-1 text-xs font-mono bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-md text-slate-300 transition-colors whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-40"
            >
              +1Y
            </button>
            <button
              onClick={() => handleFastForwardJump(1825, '+5 Years')}
              disabled={state.isProcessing}
              className="px-2.5 py-1 text-xs font-mono bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-md text-slate-300 transition-colors whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-40"
            >
              +5Y
            </button>
          </div>

          {latestJumpReport && (
            <button
              onClick={() => setShowJumpReportModal(true)}
              className="px-2.5 py-1 text-xs font-medium bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Last Jump Report ({latestJumpReport.toDate})
            </button>
          )}

          <button
            onClick={() => setShowCheckpointsModal(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Bookmark size={12} /> Checkpoints
          </button>
        </div>
      </div>

      {/* ===================================================================
          MAIN WORKSPACE GRID (1440px+ Desktop Presence)
         =================================================================== */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5 p-6 max-w-[1800px] w-full mx-auto">
        {/* LEFT / CENTER STAGE (8 Columns): Dynamic Workspace Content */}
        <div className="lg:col-span-8 flex flex-col gap-5">
          {/* WORKSPACE 1: STRATEGIC ATLAS */}
          {activeWorkspace === 'atlas' && (
            <>
              <div className="h-[520px] w-full relative rounded-xl overflow-hidden shadow-2xl">
                <React.Suspense
                  fallback={
                    <div className="w-full h-full bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-center text-slate-400 text-sm">
                      Initializing Strategic Cartography...
                    </div>
                  }
                >
                  <WorldMap
                    nations={state.nations}
                    playerNationId={playerNationId}
                    worldTension={state.worldTension}
                    threatMatrix={state.briefing?.threatMatrix}
                    onCountryClick={id => setSelectedCountryId(id)}
                  />
                </React.Suspense>
              </div>

              {/* Below-Map Strategic Strip: Sovereign's Desk Crises + Active Compounding Policies */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Sovereign's Desk */}
                <div className="bg-slate-900/75 border border-slate-800/80 rounded-xl p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h2 className="text-sm font-semibold text-white">Sovereign's Desk · Priority Dockets</h2>
                      <span className="text-xs text-slate-400 font-mono tabular-nums">{state.currentDate}</span>
                    </div>
                    <div className="space-y-2.5">
                      {(state.briefing?.sovereignsDesk || []).map((item, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-lg bg-slate-950/70 border border-slate-800/70 text-xs text-slate-200 leading-relaxed flex items-start justify-between gap-3"
                        >
                          <span>{item}</span>
                          <button
                            onClick={() =>
                              setCommand(`Address priority docket: ${item}`)
                            }
                            className="text-[11px] font-medium text-sky-400 hover:text-sky-300 whitespace-nowrap shrink-0 cursor-pointer"
                          >
                            Draft Order →
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Enacted Policy Ledger Preview */}
                <div className="bg-slate-900/75 border border-slate-800/80 rounded-xl p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h2 className="text-sm font-semibold text-white">
                        Active Causal Policy Ledger ({playerNation.activePolicies?.filter(p => p.status === 'ACTIVE').length || 0})
                      </h2>
                      <button
                        onClick={() => setActiveWorkspace('cabinet')}
                        className="text-xs text-sky-400 hover:text-sky-300 font-medium cursor-pointer"
                      >
                        Manage Policies →
                      </button>
                    </div>
                    <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                      {(playerNation.activePolicies || []).length === 0 ? (
                        <p className="text-xs text-slate-400 py-4">
                          No active policies enacted yet. Issue an executive directive in the terminal to begin compounding reforms.
                        </p>
                      ) : (
                        (playerNation.activePolicies || []).slice(0, 4).map(pol => (
                          <div
                            key={pol.id}
                            className="p-3 rounded-lg bg-slate-950/70 border border-slate-800/70 text-xs"
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-semibold text-slate-100">{pol.title}</span>
                              <span className="text-[11px] text-slate-400 font-mono tabular-nums">
                                {pol.category} · {pol.enactedDate}
                              </span>
                            </div>
                            <p className="text-slate-400 text-[11px] leading-relaxed mb-1.5">{pol.summary}</p>
                            <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono tabular-nums text-emerald-400">
                              <span>
                                GDP {(pol.dailyEffects.gdpGrowthBonus * 365 * 100 >= 0 ? '+' : '')}
                                {(pol.dailyEffects.gdpGrowthBonus * 365 * 100).toFixed(2)}%/yr
                              </span>
                              <span>·</span>
                              <span className={pol.dailyEffects.treasuryDeltaB >= 0 ? 'text-emerald-400' : 'text-amber-400'}>
                                Fiscal {(pol.dailyEffects.treasuryDeltaB * 365 >= 0 ? '+' : '')}$
                                {(pol.dailyEffects.treasuryDeltaB * 365).toFixed(2)}B/yr
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* WORKSPACE 2: CABINET, POLICY LEDGER & NATIONAL PROJECTS */}
          {activeWorkspace === 'cabinet' && (
            <div className="space-y-5">
              {/* Causal Policy Creator & Active Ledger */}
              <div className="bg-slate-900/75 border border-slate-800/80 rounded-xl p-5">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                  <div>
                    <h2 className="text-base font-semibold text-white">Causal Policy & Reform Ledger</h2>
                    <p className="text-xs text-slate-400">
                      Every active directive below mathematically compounds daily and across multi-year fast-forwards.
                    </p>
                  </div>
                </div>

                {/* Enact New Policy Form */}
                <form onSubmit={handleCreateStructuredPolicy} className="grid grid-cols-1 md:grid-cols-12 gap-3 mb-5 p-3.5 rounded-lg bg-slate-950/80 border border-slate-800">
                  <div className="md:col-span-4">
                    <label className="block text-[11px] text-slate-400 mb-1">Directive Title</label>
                    <input
                      type="text"
                      value={newPolicyTitle}
                      onChange={e => setNewPolicyTitle(e.target.value)}
                      placeholder="e.g., Geothermal Industrial Tax Credit"
                      className="w-full bg-slate-900 border border-slate-700 rounded-md px-3 py-1.5 text-xs text-white focus:outline-none focus:border-sky-400"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[11px] text-slate-400 mb-1">Sector</label>
                    <select
                      value={newPolicyCategory}
                      onChange={e => setNewPolicyCategory(e.target.value as any)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-md px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-sky-400"
                    >
                      <option value="ECONOMIC">Economic</option>
                      <option value="INFRASTRUCTURE">Infrastructure</option>
                      <option value="SOCIAL">Social</option>
                      <option value="MILITARY">Defense</option>
                      <option value="DIPLOMATIC">Diplomatic</option>
                    </select>
                  </div>
                  <div className="md:col-span-4">
                    <label className="block text-[11px] text-slate-400 mb-1">Implementation Mandate</label>
                    <input
                      type="text"
                      value={newPolicySummary}
                      onChange={e => setNewPolicySummary(e.target.value)}
                      placeholder="Describe budget, target metric, and goal..."
                      className="w-full bg-slate-900 border border-slate-700 rounded-md px-3 py-1.5 text-xs text-white focus:outline-none focus:border-sky-400"
                    />
                  </div>
                  <div className="md:col-span-2 flex items-end">
                    <button
                      type="submit"
                      disabled={state.isProcessing || !newPolicyTitle.trim()}
                      className="w-full py-1.5 px-3 bg-sky-500 hover:bg-sky-400 disabled:opacity-40 text-slate-950 font-semibold text-xs rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0"
                    >
                      Enact Directive
                    </button>
                  </div>
                </form>

                {/* Active Policies List */}
                <div className="space-y-2.5">
                  {(playerNation.activePolicies || []).map(pol => (
                    <div
                      key={pol.id}
                      className={`p-3.5 rounded-lg border transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                        pol.status === 'ACTIVE'
                          ? 'bg-slate-950/75 border-slate-800'
                          : 'bg-slate-950/30 border-slate-800/40 opacity-60'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2.5 text-xs">
                          <span className="font-semibold text-white">{pol.title}</span>
                          <span className="text-slate-500">·</span>
                          <span className="text-sky-400 font-mono">{pol.category}</span>
                          <span className="text-slate-500">·</span>
                          <span className="text-slate-400 font-mono tabular-nums">Enacted {pol.enactedDate}</span>
                          <span className="text-slate-500">·</span>
                          <span className={pol.status === 'ACTIVE' ? 'text-emerald-400 font-medium' : 'text-slate-500'}>
                            {pol.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300">{pol.summary}</p>
                        <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono tabular-nums text-slate-400 pt-1">
                          <span>
                            Annual GDP Impact:{' '}
                            <strong className="text-emerald-400">
                              {pol.dailyEffects.gdpGrowthBonus >= 0 ? '+' : ''}
                              {(pol.dailyEffects.gdpGrowthBonus * 365 * 100).toFixed(2)}%/yr
                            </strong>
                          </span>
                          <span>·</span>
                          <span>
                            Fiscal Impact:{' '}
                            <strong className={pol.dailyEffects.treasuryDeltaB >= 0 ? 'text-emerald-400' : 'text-amber-400'}>
                              {pol.dailyEffects.treasuryDeltaB >= 0 ? '+' : ''}$
                              {(pol.dailyEffects.treasuryDeltaB * 365).toFixed(2)}B/yr
                            </strong>
                          </span>
                          <span>·</span>
                          <span>
                            Stability Drift:{' '}
                            <strong className="text-sky-300">
                              {pol.dailyEffects.stabilityDelta >= 0 ? '+' : ''}
                              {(pol.dailyEffects.stabilityDelta * 30).toFixed(2)} pts/mo
                            </strong>
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleTogglePolicyStatus(pol.id)}
                        className="px-3 py-1.5 text-xs font-medium rounded-md border border-slate-700 hover:bg-slate-800 text-slate-300 whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        {pol.status === 'ACTIVE' ? 'Suspend Policy' : 'Reactivate'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* National Infrastructure Projects & Ministry Budgets */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Active Infrastructure Projects */}
                <div className="bg-slate-900/75 border border-slate-800/80 rounded-xl p-5">
                  <h3 className="text-sm font-semibold text-white mb-3">
                    Flagship National Projects ({playerNation.activeProjects?.length || 0})
                  </h3>
                  <div className="space-y-3">
                    {(playerNation.activeProjects || []).map(proj => (
                      <div key={proj.id} className="p-3.5 rounded-lg bg-slate-950/75 border border-slate-800">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="font-semibold text-white">{proj.name}</span>
                          <span
                            className={`font-mono tabular-nums ${
                              proj.status === 'Completed'
                                ? 'text-emerald-400'
                                : proj.status === 'Delayed'
                                ? 'text-amber-400'
                                : 'text-sky-400'
                            }`}
                          >
                            {proj.status} · {proj.progress.toFixed(0)}%
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 mb-2">
                          {proj.ministry} · Budget: ${proj.budgetAllocated}B · Target: {proj.expectedCompletionDate}
                        </div>
                        <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 ${
                              proj.status === 'Completed' ? 'bg-emerald-500' : 'bg-sky-500'
                            }`}
                            style={{ width: `${Math.min(100, proj.progress)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Ministerial Budget Allocation Sliders */}
                <div className="bg-slate-900/75 border border-slate-800/80 rounded-xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-white">Ministerial Budget Allocations</h3>
                    <span className="text-xs font-mono text-slate-400 tabular-nums">
                      Treasury: {formatFinancial(playerNation.economic.treasury)}
                    </span>
                  </div>
                  <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                    {playerNation.ministries &&
                      Object.entries(playerNation.ministries).map(([key, min]) => (
                        <div key={key} className="p-3 rounded-lg bg-slate-950/75 border border-slate-800">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="font-medium text-slate-200">{min.name}</span>
                            <span className="font-mono text-sky-400 tabular-nums">${min.budget.toFixed(2)}B</span>
                          </div>
                          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2">
                            <span>CS: {min.cabinetSecretary}</span>
                            <span className="font-mono tabular-nums">Performance: {min.performance}%</span>
                          </div>
                          <input
                            type="range"
                            min={0.1}
                            max={8.0}
                            step={0.1}
                            value={min.budget}
                            onChange={e => handleMinistryBudgetChange(key, parseFloat(e.target.value))}
                            className="w-full accent-sky-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                          />
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* WORKSPACE 3: MACROECONOMY & HISTORICAL TELEMETRY */}
          {activeWorkspace === 'macro' && (
            <div className="space-y-5">
              {/* Multi-Year Historical Trajectory Charts */}
              <div className="bg-slate-900/75 border border-slate-800/80 rounded-xl p-5">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                  <div>
                    <h2 className="text-base font-semibold text-white">
                      Multi-Year Sovereign Trajectory ({playerNation.name})
                    </h2>
                    <p className="text-xs text-slate-400">
                      Historical & fast-forwarded quarterly checkpoints tracking Nominal GDP ($B), Treasury ($B), and Stability (%).
                    </p>
                  </div>
                  <span className="text-xs font-mono text-sky-400 tabular-nums">
                    Current Date: {state.currentDate}
                  </span>
                </div>

                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={playerNation.historicalSnapshots || []}>
                      <defs>
                        <linearGradient id="gdpGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.35} />
                          <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="treasuryGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
                      <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                      <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          borderColor: 'rgba(148,163,184,0.2)',
                          fontSize: '12px',
                          color: '#f8fafc',
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="gdpNominal"
                        name="Nominal GDP ($B)"
                        stroke="#0ea5e9"
                        fillOpacity={1}
                        fill="url(#gdpGrad)"
                      />
                      <Area
                        type="monotone"
                        dataKey="treasury"
                        name="Treasury Reserves ($B)"
                        stroke="#10b981"
                        fillOpacity={1}
                        fill="url(#treasuryGrad)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Macroeconomic Ledger & Supply Chain */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="bg-slate-900/75 border border-slate-800/80 rounded-xl p-5">
                  <h3 className="text-sm font-semibold text-white mb-3">Sovereign Balance Sheet & Fiscal Vitals</h3>
                  <div className="divide-y divide-slate-800/70 text-xs font-mono tabular-nums">
                    {[
                      { label: 'Nominal GDP', val: formatFinancial(playerNation.economic.gdpNominal) },
                      { label: 'Real GDP (Deflator Base)', val: formatFinancial(playerNation.economic.realGdp) },
                      { label: 'Purchasing Power Parity (PPP)', val: formatFinancial(playerNation.economic.gdpPpp) },
                      { label: 'Sovereign Treasury', val: formatFinancial(playerNation.economic.treasury) },
                      { label: 'Liquid Cash Reserves', val: `$${Math.round(playerNation.economic.liquidCash)}M` },
                      { label: 'Debt-to-GDP Ratio', val: `${playerNation.economic.debtToGdp.toFixed(1)}%` },
                      { label: 'Next Eurobond Maturity', val: playerNation.economic.eurobondPaymentDate },
                      { label: 'Monthly Inflation Rate', val: `${playerNation.economic.inflation.toFixed(2)}%` },
                      { label: 'Tax Collection Efficiency', val: `${playerNation.economic.taxEfficiency}%` },
                      { label: 'Electricity Grid Stability', val: `${playerNation.economic.electricityGridStability ?? 75}%` },
                    ].map((row, idx) => (
                      <div key={idx} className="py-2 flex items-center justify-between">
                        <span className="font-sans text-slate-400">{row.label}</span>
                        <span className="text-slate-100 font-semibold">{row.val}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-900/75 border border-slate-800/80 rounded-xl p-5">
                  <h3 className="text-sm font-semibold text-white mb-2">Strategic Commodity Supply Chain</h3>
                  <SupplyChainRadar data={playerNation.economic.supplyChain} />
                  <div className="mt-3 pt-3 border-t border-slate-800/80 grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <div className="text-slate-400 mb-1 font-medium">Top Exports ($B/yr)</div>
                      {Object.entries(playerNation.exports || {}).map(([k, v]) => (
                        <div key={k} className="flex justify-between font-mono text-[11px] tabular-nums text-emerald-400">
                          <span className="font-sans text-slate-300">{k}</span>
                          <span>${v}B</span>
                        </div>
                      ))}
                    </div>
                    <div>
                      <div className="text-slate-400 mb-1 font-medium">Principal Imports ($B/yr)</div>
                      {Object.entries(playerNation.imports || {}).map(([k, v]) => (
                        <div key={k} className="flex justify-between font-mono text-[11px] tabular-nums text-amber-400">
                          <span className="font-sans text-slate-300">{k}</span>
                          <span>${v}B</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* WORKSPACE 4: FORCE POSTURE & MILITARY ORDER OF BATTLE */}
          {activeWorkspace === 'military' && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Active Personnel', val: playerNation.military.activePersonnel.toLocaleString() },
                  { label: 'Reserve Forces', val: playerNation.military.reservePersonnel.toLocaleString() },
                  { label: 'Power Projection', val: `${playerNation.military.powerProjection}/100` },
                  { label: 'Logistics Readiness', val: `${playerNation.military.logisticsCapacity}/100` },
                ].map((stat, idx) => (
                  <div key={idx} className="bg-slate-900/75 border border-slate-800/80 rounded-xl p-4">
                    <div className="text-xs text-slate-400 mb-1">{stat.label}</div>
                    <div className="text-lg font-mono font-bold text-white tabular-nums">{stat.val}</div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="bg-slate-900/75 border border-slate-800/80 rounded-xl p-5">
                  <h3 className="text-sm font-semibold text-white mb-3">Ground & Mechanized Divisions</h3>
                  <div className="space-y-3">
                    {(playerNation.military.armyDivisions || []).map((div, i) => (
                      <div key={i} className="p-3.5 rounded-lg bg-slate-950/75 border border-slate-800 text-xs">
                        <div className="flex justify-between font-semibold text-white mb-1">
                          <span>{div.name}</span>
                          <span className="text-sky-400 font-mono tabular-nums">Firepower {div.firepowerScore}</span>
                        </div>
                        <div className="text-slate-400 text-[11px] font-mono tabular-nums">
                          Role: {div.role} · Personnel: {div.personnel.toLocaleString()} · Armor: {div.tanks} · Artillery: {div.artillery}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-900/75 border border-slate-800/80 rounded-xl p-5">
                  <h3 className="text-sm font-semibold text-white mb-3">Air Wings, Maritime Fleets & ISR</h3>
                  <div className="space-y-3">
                    {(playerNation.military.airWings || []).map((wing, i) => (
                      <div key={i} className="p-3.5 rounded-lg bg-slate-950/75 border border-slate-800 text-xs">
                        <div className="flex justify-between font-semibold text-white mb-1">
                          <span>{wing.name}</span>
                          <span className="text-sky-400">{wing.role}</span>
                        </div>
                        <div className="text-slate-400 text-[11px] font-mono tabular-nums">
                          Fighters: {wing.fighterJets} · Recon: {wing.reconnaissanceAircraft} · Transport: {wing.transportAircraft} · Rotary: {wing.helicopters}
                        </div>
                      </div>
                    ))}
                    {(playerNation.military.navalFleets || []).map((fleet, i) => (
                      <div key={i} className="p-3.5 rounded-lg bg-slate-950/75 border border-slate-800 text-xs">
                        <div className="flex justify-between font-semibold text-white mb-1">
                          <span>{fleet.name}</span>
                          <span className="text-emerald-400">{fleet.role}</span>
                        </div>
                        <div className="text-slate-400 text-[11px] font-mono tabular-nums">
                          Frigates: {fleet.frigates} · Submarines: {fleet.submarines} · Patrol Vessels: {fleet.patrolShips}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* WORKSPACE 5: INTELLIGENCE, OSINT & KNOWLEDGE GRAPH */}
          {activeWorkspace === 'intelligence' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* OSINT Intercepts */}
                <div className="bg-slate-900/75 border border-slate-800/80 rounded-xl p-5">
                  <h3 className="text-sm font-semibold text-white mb-3">Live Multi-Source Intelligence Feeds</h3>
                  <div className="space-y-3">
                    {(state.briefing?.osintFeeds || []).map((feed, i) => (
                      <div key={i} className="p-3.5 rounded-lg bg-slate-950/75 border border-slate-800 text-xs">
                        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1 tabular-nums">
                          <span className="text-sky-400 font-semibold">
                            {feed.source} · {feed.region}
                          </span>
                          <span>Confidence {feed.confidence}%</span>
                        </div>
                        <p className="text-slate-200 leading-relaxed">{feed.data}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Threat Matrix & Entity Graph */}
                <div className="space-y-5">
                  <div className="bg-slate-900/75 border border-slate-800/80 rounded-xl p-5">
                    <h3 className="text-sm font-semibold text-white mb-3">Strategic Threat Matrix</h3>
                    <div className="space-y-2.5">
                      {(state.briefing?.threatMatrix || []).map((threat, i) => (
                        <div key={threat.id || i} className="p-3 rounded-lg bg-slate-950/75 border border-slate-800 text-xs">
                          <div className="flex items-center justify-between mb-1 font-mono tabular-nums">
                            <span className="text-rose-400 font-semibold">{threat.category}</span>
                            <span className="text-slate-400">
                              Prob: {threat.probability}% · Impact: {threat.impact}/100 · {threat.timeframe}
                            </span>
                          </div>
                          <p className="text-slate-200">{threat.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-slate-900/75 border border-slate-800/80 rounded-xl p-5">
                    <h3 className="text-sm font-semibold text-white mb-2">Relational Actor Network</h3>
                    {state.briefing?.knowledgeGraph ? (
                      <KnowledgeGraphSVG
                        nodes={state.briefing.knowledgeGraph.nodes}
                        edges={state.briefing.knowledgeGraph.edges}
                      />
                    ) : (
                      <div className="text-xs text-slate-400 py-8 text-center">No active relational graph nodes.</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ===================================================================
            RIGHT COMMAND DOCK (4 Columns): EXECUTIVE TERMINAL & CABINET BRIEF
           =================================================================== */}
        <div className="lg:col-span-4 flex flex-col gap-5">
          {/* Executive Command Terminal & Natural Language Fast-Forward */}
          <div className="bg-slate-900/80 border border-slate-800/90 rounded-xl flex flex-col h-[520px] shadow-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <div className="flex items-center gap-2">
                <Terminal size={15} className="text-sky-400" />
                <h2 className="text-xs font-semibold tracking-wide text-white uppercase">
                  Executive Directive & Temporal Terminal
                </h2>
              </div>
              <span className="text-[11px] font-mono text-slate-400 tabular-nums">{state.currentDate}</span>
            </div>

            {/* Conversation & Briefing Stream */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
              {history.map((entry, idx) => (
                <div
                  key={idx}
                  className={`rounded-lg p-3 leading-relaxed ${
                    entry.role === 'user'
                      ? 'bg-sky-500/15 border border-sky-500/30 text-sky-100 ml-6'
                      : 'bg-slate-950/80 border border-slate-800/80 text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1 tabular-nums">
                    <span>{entry.role === 'user' ? 'EXECUTIVE ORDER' : 'OMEGA CHIEF OF STAFF'}</span>
                    {entry.date && <span>{entry.date}</span>}
                  </div>
                  <div className="whitespace-pre-wrap">{entry.text}</div>
                </div>
              ))}
              {state.isProcessing && (
                <div className="p-3 rounded-lg bg-slate-950/80 border border-sky-500/30 text-sky-300 flex items-center gap-2.5 text-xs">
                  <Loader2 size={15} className="animate-spin shrink-0" />
                  <span>Compounding policies, advancing simulation timeline, and synthesizing intelligence...</span>
                </div>
              )}
              <div ref={terminalEndRef} />
            </div>

            {/* Quick Suggestion Prompts */}
            <div className="px-3 py-2 border-t border-slate-800/70 bg-slate-950/40 flex items-center gap-1.5 overflow-x-auto">
              {[
                'Fast-forward to 2029 February 6th and show policy impact',
                'Fast-forward 6 years from now and report what progressed',
                'Allocate $1.2B to expand geothermal & rail logistics',
                'Audit sovereign debt and tax compliance efficiency',
              ].map((sample, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setCommand(sample)}
                  className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] text-slate-300 whitespace-nowrap shrink-0 cursor-pointer transition-colors"
                >
                  {sample}
                </button>
              ))}
            </div>

            {/* Command Input Form */}
            <form
              onSubmit={e => {
                e.preventDefault();
                executeCommand(command);
              }}
              className="p-3 border-t border-slate-800 bg-slate-950/90 flex items-center gap-2"
            >
              <input
                type="text"
                value={command}
                onChange={e => setCommand(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'ArrowUp' && commandHistory.length > 0) {
                    e.preventDefault();
                    const nextIdx = Math.min(historyIndex + 1, commandHistory.length - 1);
                    setHistoryIndex(nextIdx);
                    setCommand(commandHistory[nextIdx]);
                  } else if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    if (historyIndex <= 0) {
                      setHistoryIndex(-1);
                      setCommand('');
                    } else {
                      const nextIdx = historyIndex - 1;
                      setHistoryIndex(nextIdx);
                      setCommand(commandHistory[nextIdx]);
                    }
                  }
                }}
                disabled={state.isProcessing}
                placeholder="Issue order or 'Fast-forward to 2029 February 6th'..."
                className="flex-1 bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-400"
              />
              <button
                type="submit"
                disabled={state.isProcessing || !command.trim()}
                className="px-3.5 py-2 bg-sky-500 hover:bg-sky-400 disabled:opacity-40 text-slate-950 font-semibold rounded-lg text-xs flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                <Send size={13} />
                Execute
              </button>
            </form>
          </div>

          {/* National Vitals & Cabinet Advisory */}
          <div className="bg-slate-900/75 border border-slate-800/80 rounded-xl p-5 space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-white mb-2.5">National Survival Vitals</h3>
              <div className="grid grid-cols-2 gap-3 text-xs font-mono tabular-nums">
                {[
                  { label: 'Food Security', val: Math.round(playerNation.survival.foodSecurity) },
                  { label: 'Water Access', val: Math.round(playerNation.survival.waterAccess) },
                  { label: 'Housing Supply', val: Math.round(playerNation.survival.housingAvailability) },
                  { label: 'Transport Grid', val: Math.round(playerNation.survival.transportEfficiency) },
                ].map((vital, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-slate-950/75 border border-slate-800">
                    <div className="flex justify-between mb-1">
                      <span className="font-sans text-slate-400">{vital.label}</span>
                      <span className="text-white font-semibold">{vital.val}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${
                          vital.val >= 65 ? 'bg-emerald-500' : vital.val >= 45 ? 'bg-sky-500' : 'bg-rose-500'
                        }`}
                        style={{ width: `${Math.min(100, vital.val)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800/80">
              <h3 className="text-sm font-semibold text-white mb-2.5">Cabinet Ministerial Counsel</h3>
              <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                {(state.briefing?.cabinetAdvice || []).map((item, i) => (
                  <div key={i} className="p-3 rounded-lg bg-slate-950/75 border border-slate-800 text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-slate-100">{item.minister}</span>
                      <span
                        className={`text-[10px] font-mono uppercase ${
                          item.urgency === 'critical' || item.urgency === 'high'
                            ? 'text-amber-400'
                            : 'text-sky-400'
                        }`}
                      >
                        {item.ministry}
                      </span>
                    </div>
                    <p className="text-slate-300 text-[11px] leading-relaxed">{item.advice}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ===================================================================
          MODAL 1: FAST-FORWARD & TEMPORAL JUMP CONTROLLER
         =================================================================== */}
      {showFastForwardModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h2 className="text-lg font-bold text-white">Temporal Fast-Forward Engine</h2>
                <p className="text-xs text-slate-400">
                  Current Date: <span className="font-mono text-sky-400">{state.currentDate}</span> · Active Policies:{' '}
                  <span className="font-mono text-emerald-400">
                    {playerNation.activePolicies?.filter(p => p.status === 'ACTIVE').length || 0}
                  </span>
                </p>
              </div>
              <button
                onClick={() => setShowFastForwardModal(false)}
                className="text-slate-400 hover:text-white p-1 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Preset Intervals */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-2">
                Instant Compounding Interval
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { days: 30, label: '+1 Month', sub: '30 Days' },
                  { days: 180, label: '+6 Months', sub: '180 Days' },
                  { days: 365, label: '+1 Year', sub: '365 Days' },
                  { days: 1825, label: '+5 Years', sub: '1,825 Days' },
                ].map(preset => (
                  <button
                    key={preset.days}
                    type="button"
                    onClick={() => handleFastForwardJump(preset.days, preset.label)}
                    className="p-3 rounded-lg bg-slate-950 hover:bg-sky-500/15 border border-slate-800 hover:border-sky-500/40 text-left transition-colors cursor-pointer"
                  >
                    <div className="text-sm font-bold text-white font-mono tabular-nums">{preset.label}</div>
                    <div className="text-[11px] text-slate-400 font-mono tabular-nums">{preset.sub}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Target Date Picker */}
            <form onSubmit={handleCustomDateJump} className="space-y-3 pt-3 border-t border-slate-800">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Jump to Specific Future Date (e.g., 2029-02-06 or 2034-01-01)
                </label>
                <input
                  type="date"
                  min={state.currentDate}
                  max="2055-12-31"
                  value={customTargetDate}
                  onChange={e => setCustomTargetDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-sky-400"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Strategic Focus During Jump
                </label>
                <input
                  type="text"
                  value={customJumpReason}
                  onChange={e => setCustomJumpReason(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-400"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowFastForwardModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-sky-400 hover:bg-sky-300 text-slate-950 font-semibold text-xs rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <FastForward size={14} />
                  Execute Time Jump
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================
          MODAL 2: TEMPORAL PROGRESSION REPORT (BEFORE vs AFTER DIFF)
         =================================================================== */}
      {showJumpReportModal && latestJumpReport && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-3xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <div className="text-xs font-mono text-sky-400 uppercase">
                  Temporal Progression Audit · {latestJumpReport.elapsedDays.toLocaleString()} Days Compounded
                </div>
                <h2 className="text-xl font-bold text-white">
                  {latestJumpReport.nationName}: {latestJumpReport.fromDate} → {latestJumpReport.toDate}
                </h2>
              </div>
              <button
                onClick={() => setShowJumpReportModal(false)}
                className="text-slate-400 hover:text-white p-1 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/80 border border-slate-800 p-3.5 rounded-lg">
              {latestJumpReport.executiveSummary}
            </p>

            {/* Before vs After Metric Comparison Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono tabular-nums">
              {[
                {
                  label: 'Nominal GDP',
                  before: `$${latestJumpReport.metricsBefore.gdpNominal.toFixed(1)}B`,
                  after: `$${latestJumpReport.metricsAfter.gdpNominal.toFixed(1)}B`,
                  good: latestJumpReport.metricsAfter.gdpNominal >= latestJumpReport.metricsBefore.gdpNominal,
                },
                {
                  label: 'Sovereign Treasury',
                  before: `$${latestJumpReport.metricsBefore.treasury.toFixed(2)}B`,
                  after: `$${latestJumpReport.metricsAfter.treasury.toFixed(2)}B`,
                  good: latestJumpReport.metricsAfter.treasury >= latestJumpReport.metricsBefore.treasury,
                },
                {
                  label: 'Debt-to-GDP',
                  before: `${latestJumpReport.metricsBefore.debtToGdp.toFixed(1)}%`,
                  after: `${latestJumpReport.metricsAfter.debtToGdp.toFixed(1)}%`,
                  good: latestJumpReport.metricsAfter.debtToGdp <= latestJumpReport.metricsBefore.debtToGdp,
                },
                {
                  label: 'National Stability',
                  before: `${latestJumpReport.metricsBefore.stabilityIndex}%`,
                  after: `${latestJumpReport.metricsAfter.stabilityIndex}%`,
                  good: latestJumpReport.metricsAfter.stabilityIndex >= latestJumpReport.metricsBefore.stabilityIndex,
                },
                {
                  label: 'Public Approval',
                  before: `${latestJumpReport.metricsBefore.approvalRating}%`,
                  after: `${latestJumpReport.metricsAfter.approvalRating}%`,
                  good: latestJumpReport.metricsAfter.approvalRating >= latestJumpReport.metricsBefore.approvalRating,
                },
                {
                  label: 'Population',
                  before: `${latestJumpReport.metricsBefore.population.toFixed(2)}M`,
                  after: `${latestJumpReport.metricsAfter.population.toFixed(2)}M`,
                  good: true,
                },
              ].map((m, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="font-sans text-[11px] text-slate-400 mb-1">{m.label}</div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-400">{m.before}</span>
                    <span className="text-slate-600">→</span>
                    <span className={`font-bold ${m.good ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {m.after}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* What Progressed vs What Degraded */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-slate-950/90 border border-emerald-500/25">
                <h3 className="text-xs font-semibold text-emerald-400 uppercase mb-2">
                  What Progressed & Compounded
                </h3>
                <ul className="space-y-1.5 text-xs text-slate-200">
                  {latestJumpReport.progressedFactors.length === 0 ? (
                    <li className="text-slate-400">Steady baseline progression maintained.</li>
                  ) : (
                    latestJumpReport.progressedFactors.map((item, i) => (
                      <li key={i} className="leading-relaxed">
                        • {item}
                      </li>
                    ))
                  )}
                </ul>
              </div>

              <div className="p-4 rounded-lg bg-slate-950/90 border border-amber-500/25">
                <h3 className="text-xs font-semibold text-amber-400 uppercase mb-2">
                  Pressures & Structural Challenges
                </h3>
                <ul className="space-y-1.5 text-xs text-slate-200">
                  {latestJumpReport.degradedFactors.length === 0 ? (
                    <li className="text-slate-400">No major systemic degradations recorded during this interval.</li>
                  ) : (
                    latestJumpReport.degradedFactors.map((item, i) => (
                      <li key={i} className="leading-relaxed">
                        • {item}
                      </li>
                    ))
                  )}
                </ul>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setShowJumpReportModal(false)}
                className="px-5 py-2 bg-sky-400 hover:bg-sky-300 text-slate-950 font-semibold text-xs rounded-lg cursor-pointer"
              >
                Continue Governance in {latestJumpReport.toDate}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================
          MODAL 3: SOVEREIGN COUNTRY DOSSIER & DIPLOMACY / COMMAND SWITCH
         =================================================================== */}
      {selectedCountry && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-xl w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <div className="text-xs font-mono text-sky-400">
                  SOVEREIGN DOSSIER · {selectedCountry.id} · {selectedCountry.region || 'Global'}
                </div>
                <h2 className="text-xl font-bold text-white">{selectedCountry.name}</h2>
              </div>
              <button
                onClick={() => setSelectedCountryId(null)}
                className="text-slate-400 hover:text-white p-1 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 text-xs font-mono tabular-nums">
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <div className="font-sans text-slate-400 mb-1">Nominal GDP</div>
                <div className="text-sm font-bold text-white">
                  {formatFinancial(selectedCountry.economic.gdpNominal)}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <div className="font-sans text-slate-400 mb-1">Treasury</div>
                <div className="text-sm font-bold text-emerald-400">
                  {formatFinancial(selectedCountry.economic.treasury)}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <div className="font-sans text-slate-400 mb-1">Force Projection</div>
                <div className="text-sm font-bold text-sky-400">
                  {selectedCountry.military.powerProjection}/100
                </div>
              </div>
            </div>

            {selectedCountry.id !== playerNationId && (
              <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Bilateral Trust Index with {playerNation.name}</span>
                  <span className="font-mono font-bold text-sky-400 tabular-nums">
                    BTI: {playerNation.diplomatic?.bti?.[selectedCountry.id] ?? 0}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {[
                    'Propose Bilateral Trade & Infrastructure Corridor Pact',
                    'Sign Joint Intelligence & Counter-Terrorism Protocol',
                    'Negotiate Sovereign Debt & Currency Swap Facility',
                  ].map((act, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        const targetName = selectedCountry.name;
                        setSelectedCountryId(null);
                        executeCommand(`Initiate diplomatic mission to ${targetName}: ${act}`);
                      }}
                      className="px-3 py-1.5 rounded bg-slate-900 hover:bg-sky-500/20 border border-slate-700 hover:border-sky-500/40 text-xs text-slate-200 transition-colors cursor-pointer"
                    >
                      {act}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              {selectedCountry.id !== playerNationId ? (
                <button
                  onClick={() => handleSwitchPlayableNation(selectedCountry.id)}
                  className="px-4 py-2 bg-sky-400 hover:bg-sky-300 text-slate-950 font-semibold text-xs rounded-lg transition-colors cursor-pointer"
                >
                  Assume Sovereign Command of {selectedCountry.name}
                </button>
              ) : (
                <span className="text-xs text-emerald-400 font-medium">
                  Currently Active Command Seat
                </span>
              )}
              <button
                onClick={() => setSelectedCountryId(null)}
                className="px-4 py-2 text-xs text-slate-400 hover:text-white cursor-pointer"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================
          MODAL 4: TIMELINE CHECKPOINTS & STATE RESTORE
         =================================================================== */}
      {showCheckpointsModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h2 className="text-lg font-bold text-white">Timeline Checkpoints & State Control</h2>
                <p className="text-xs text-slate-400">
                  Save snapshots before major reforms or time jumps and restore anytime without losing progress.
                </p>
              </div>
              <button
                onClick={() => setShowCheckpointsModal(false)}
                className="text-slate-400 hover:text-white p-1 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveCheckpoint} className="flex gap-2">
              <input
                type="text"
                value={checkpointLabel}
                onChange={e => setCheckpointLabel(e.target.value)}
                placeholder={`Checkpoint label (e.g. Pre-2029 Jump · ${state.currentDate})`}
                className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-400"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-sky-400 hover:bg-sky-300 text-slate-950 font-semibold text-xs rounded-lg whitespace-nowrap shrink-0 cursor-pointer"
              >
                Save Snapshot
              </button>
            </form>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {checkpoints.length === 0 ? (
                <div className="text-xs text-slate-400 py-4 text-center">
                  No saved checkpoints yet.
                </div>
              ) : (
                checkpoints.map(cp => (
                  <div
                    key={cp.id}
                    className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="font-semibold text-white">{cp.label}</div>
                      <div className="text-[11px] font-mono text-slate-400 tabular-nums">
                        Date: {cp.simDate} · GDP: ${cp.gdpNominal.toFixed(1)}B · Treasury: ${cp.treasury.toFixed(2)}B
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleRestoreCheckpoint(cp)}
                        className="px-3 py-1 bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/30 rounded text-xs cursor-pointer"
                      >
                        Load
                      </button>
                      <button
                        onClick={() => setCheckpoints(prev => prev.filter(item => item.id !== cp.id))}
                        className="p-1 text-slate-500 hover:text-rose-400 cursor-pointer"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <button
                type="button"
                onClick={handleResetToCleanBaseline}
                className="px-3 py-1.5 text-xs text-rose-400 hover:bg-rose-500/10 border border-rose-500/30 rounded-lg transition-colors cursor-pointer"
              >
                Reset to 2026 Clean Baseline
              </button>
              <button
                type="button"
                onClick={() => setShowCheckpointsModal(false)}
                className="px-4 py-1.5 text-xs text-slate-400 hover:text-white cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
