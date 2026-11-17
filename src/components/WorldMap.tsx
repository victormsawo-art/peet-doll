import React, { useState, useMemo } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
  Marker,
  Line,
  Sphere,
  Graticule,
} from 'react-simple-maps';
import { scaleLinear } from 'd3-scale';
import { Nation } from '../types';
import { formatFinancial } from '../lib/format';
import { Globe, Map as MapIcon, Compass, Crosshair } from 'lucide-react';

const geoUrl = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

interface WorldMapProps {
  nations: Record<string, Nation>;
  playerNationId: string;
  worldTension: number;
  threatMatrix?: {
    id: string;
    category: string;
    description?: string;
    coordinates?: [number, number];
    probability: number;
    impact: number;
  }[];
  onCountryClick?: (id: string) => void;
}

const DEFAULT_COORDS: Record<string, [number, number]> = {
  KEN: [36.8219, -1.2921],
  UGA: [32.5825, 0.3476],
  TZA: [35.7516, -6.1630],
  ETH: [38.7578, 9.0054],
  EGY: [31.2357, 30.0444],
  NGA: [7.4951, 9.0579],
  ZAF: [28.2293, -25.7479],
  USA: [-77.0369, 38.9072],
  CHN: [116.4074, 39.9042],
  RUS: [37.6173, 55.7558],
  GBR: [-0.1276, 51.5072],
};

const NUMERIC_TO_ISO3: Record<string, string> = {
  '404': 'KEN',
  '800': 'UGA',
  '834': 'TZA',
  '231': 'ETH',
  '818': 'EGY',
  '566': 'NGA',
  '710': 'ZAF',
  '840': 'USA',
  '156': 'CHN',
  '643': 'RUS',
  '826': 'GBR',
};

export default function WorldMap({
  nations,
  playerNationId,
  worldTension,
  threatMatrix = [],
  onCountryClick,
}: WorldMapProps) {
  const [selectedNationId, setSelectedNationId] = useState<string | null>(null);
  const [hoveredGeo, setHoveredGeo] = useState<{ iso3: string; name: string } | null>(null);
  const [activeLayer, setActiveLayer] = useState<'BTI' | 'STABILITY' | 'GDP' | 'MILITARY' | 'SHADOW'>('BTI');
  const [projectionMode, setProjectionMode] = useState<'GLOBE' | 'FLAT'>('GLOBE');
  const [rotation, setRotation] = useState<[number, number, number]>([-32, -2, 0]);

  const playerNation = nations[playerNationId] || nations['KEN'];

  const btiColorScale = scaleLinear<string>()
    .domain([-100, -40, 0, 50, 100])
    .range(['#dc2626', '#f87171', '#1e293b', '#0284c7', '#10b981']);

  const stabilityColorScale = scaleLinear<string>()
    .domain([20, 55, 90])
    .range(['#dc2626', '#d97706', '#0ea5e9']);

  const shadowColorScale = scaleLinear<string>()
    .domain([10, 50, 95])
    .range(['#1e293b', '#4f46e5', '#38bdf8']);

  const gdpColorScale = scaleLinear<string>()
    .domain([30, 400, 15000])
    .range(['#1e293b', '#0284c7', '#10b981']);

  const militaryColorScale = scaleLinear<string>()
    .domain([20, 60, 100])
    .range(['#1e293b', '#d97706', '#ef4444']);

  const coordinates = useMemo(() => {
    const map: Record<string, [number, number]> = { ...DEFAULT_COORDS };
    if (nations) {
      Object.values(nations).forEach(n => {
        if (n.coordinates) map[n.id] = n.coordinates;
      });
    }
    return map;
  }, [nations]);

  const tradeFlows = useMemo(() => {
    const flows: { from: string; to: string; value: number; type: 'positive' | 'negative' | 'neutral' }[] = [];
    if (!playerNation || !nations) return flows;

    Object.keys(nations).forEach(id => {
      if (id !== playerNationId && coordinates[id] && coordinates[playerNationId]) {
        const bti = playerNation.diplomatic?.bti?.[id] ?? 0;
        if (Math.abs(bti) >= 25) {
          flows.push({
            from: playerNationId,
            to: id,
            value: Math.abs(bti),
            type: bti >= 50 ? 'positive' : bti <= -40 ? 'negative' : 'neutral',
          });
        }
      }
    });
    return flows;
  }, [nations, playerNationId, playerNation, coordinates]);

  const activeEvents = useMemo(() => {
    if (Array.isArray(threatMatrix) && threatMatrix.length > 0) {
      return threatMatrix
        .filter(t => t && Array.isArray(t.coordinates) && t.coordinates.length === 2)
        .map(t => ({
          id: t.id,
          coord: t.coordinates as [number, number],
          label: t.category,
          desc: t.description || '',
          type:
            t.category === 'MILITARY' || t.category === 'TERRORISM'
              ? ('conflict' as const)
              : t.category === 'CYBER'
              ? ('signal' as const)
              : ('intel' as const),
          intensity: Math.max(0.35, ((t.probability || 50) / 100) * ((t.impact || 50) / 100)),
        }));
    }
    return [];
  }, [threatMatrix]);

  const getCountryColor = (iso3: string) => {
    if (!nations) return '#0f172a';
    const nation = nations[iso3];
    if (iso3 === playerNationId) return '#0284c7';
    if (!nation || !playerNation) return '#0f172a';

    if (activeLayer === 'BTI') {
      const bti = playerNation.diplomatic?.bti?.[iso3] ?? 0;
      return btiColorScale(bti);
    } else if (activeLayer === 'STABILITY') {
      return stabilityColorScale(nation.stabilityIndex || 50);
    } else if (activeLayer === 'SHADOW') {
      return shadowColorScale(nation.shadow?.digitalSecurity || 40);
    } else if (activeLayer === 'GDP') {
      return gdpColorScale(nation.economic?.gdpNominal || 50);
    } else if (activeLayer === 'MILITARY') {
      return militaryColorScale(nation.military?.powerProjection || 30);
    }
    return '#0f172a';
  };

  const getStrokeColor = (iso3: string) => {
    if (iso3 === playerNationId) return '#38bdf8';
    if (nations && nations[iso3]) return 'rgba(148, 163, 184, 0.45)';
    return 'rgba(51, 65, 85, 0.35)';
  };

  const focusPreset = (region: 'AFRICA' | 'EUROPE_US' | 'ASIA' | 'PLAYER') => {
    if (region === 'AFRICA') setRotation([-25, -2, 0]);
    if (region === 'EUROPE_US') setRotation([35, -35, 0]);
    if (region === 'ASIA') setRotation([-95, -25, 0]);
    if (region === 'PLAYER') {
      const c = coordinates[playerNationId] || [36.8, -1.3];
      setRotation([-c[0], -c[1], 0]);
    }
  };

  const hoveredNationData = hoveredGeo?.iso3 ? nations[hoveredGeo.iso3] : null;

  return (
    <div className="w-full h-full bg-[#060B16] rounded-xl border border-slate-800/80 overflow-hidden relative select-none">
      {/* Subtle Radial Vignette */}
      <div className="absolute inset-0 pointer-events-none z-10 bg-[radial-gradient(circle_at_center,transparent_45%,rgba(4,9,20,0.75)_100%)]" />

      {/* Top-Left Map Layer & Projection Controls */}
      <div className="absolute top-4 left-4 z-20 flex flex-col gap-2.5">
        <div className="bg-slate-950/85 backdrop-blur-xl border border-slate-800/80 rounded-lg p-1.5 flex items-center gap-1 shadow-xl">
          <button
            onClick={() => setProjectionMode('GLOBE')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
              projectionMode === 'GLOBE'
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Globe size={13} />
            3D Globe
          </button>
          <button
            onClick={() => setProjectionMode('FLAT')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
              projectionMode === 'FLAT'
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <MapIcon size={13} />
            2D Atlas
          </button>
        </div>

        {/* Overlay Layer Selector */}
        <div className="bg-slate-950/85 backdrop-blur-xl border border-slate-800/80 rounded-lg p-2.5 shadow-xl w-44">
          <div className="text-[11px] font-medium text-slate-400 mb-2">Cartographic Telemetry</div>
          <div className="flex flex-col gap-1">
            {[
              { id: 'BTI', label: 'Diplomatic Standing' },
              { id: 'STABILITY', label: 'National Stability' },
              { id: 'GDP', label: 'Nominal GDP Scale' },
              { id: 'MILITARY', label: 'Force Projection' },
              { id: 'SHADOW', label: 'Cyber & SIGINT Grid' },
            ].map(layer => (
              <button
                key={layer.id}
                onClick={() => setActiveLayer(layer.id as any)}
                className={`text-left text-xs px-2.5 py-1.5 rounded transition-colors whitespace-nowrap shrink-0 ${
                  activeLayer === layer.id
                    ? 'bg-sky-500/15 text-sky-300 font-medium border border-sky-500/30'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200 border border-transparent'
                }`}
              >
                {layer.label}
              </button>
            ))}
          </div>
        </div>

        {/* Theater Camera Presets (When in 3D Globe Mode) */}
        {projectionMode === 'GLOBE' && (
          <div className="bg-slate-950/85 backdrop-blur-xl border border-slate-800/80 rounded-lg p-2 shadow-xl w-44">
            <div className="text-[11px] font-medium text-slate-400 mb-1.5 flex items-center gap-1.5">
              <Compass size={12} className="text-sky-400" />
              Theater Focus
            </div>
            <div className="grid grid-cols-2 gap-1">
              <button
                onClick={() => focusPreset('PLAYER')}
                className="px-2 py-1 text-[11px] rounded bg-slate-900 hover:bg-slate-800 text-slate-300 transition-colors whitespace-nowrap shrink-0"
              >
                Capital
              </button>
              <button
                onClick={() => focusPreset('AFRICA')}
                className="px-2 py-1 text-[11px] rounded bg-slate-900 hover:bg-slate-800 text-slate-300 transition-colors whitespace-nowrap shrink-0"
              >
                Africa / EAC
              </button>
              <button
                onClick={() => focusPreset('EUROPE_US')}
                className="px-2 py-1 text-[11px] rounded bg-slate-900 hover:bg-slate-800 text-slate-300 transition-colors whitespace-nowrap shrink-0"
              >
                Atlantic
              </button>
              <button
                onClick={() => focusPreset('ASIA')}
                className="px-2 py-1 text-[11px] rounded bg-slate-900 hover:bg-slate-800 text-slate-300 transition-colors whitespace-nowrap shrink-0"
              >
                Indo-Pacific
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Top-Right Global Tension & Active Sovereign Indicator */}
      <div className="absolute top-4 right-4 z-20 bg-slate-950/85 backdrop-blur-xl border border-slate-800/80 rounded-lg px-3.5 py-2.5 shadow-xl flex flex-col gap-1.5 min-w-[200px]">
        <div className="flex items-center justify-between gap-4">
          <span className="text-xs text-slate-400">Command Seat</span>
          <span className="text-xs font-semibold text-sky-400">{playerNation?.name || playerNationId}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-xs text-slate-400">Global Tension</span>
          <span
            className={`font-mono text-xs font-semibold tabular-nums ${
              worldTension >= 70 ? 'text-rose-400' : worldTension >= 45 ? 'text-amber-400' : 'text-emerald-400'
            }`}
          >
            {worldTension.toFixed(0)}% · {worldTension >= 70 ? 'CRITICAL' : worldTension >= 45 ? 'ELEVATED' : 'NOMINAL'}
          </span>
        </div>
        <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              worldTension >= 70 ? 'bg-rose-500' : worldTension >= 45 ? 'bg-amber-500' : 'bg-sky-500'
            }`}
            style={{ width: `${Math.min(100, Math.max(5, worldTension))}%` }}
          />
        </div>
      </div>

      {/* Bottom-Left Scale Legend */}
      <div className="absolute bottom-4 left-4 z-20 bg-slate-950/85 backdrop-blur-xl border border-slate-800/80 rounded-lg px-3 py-2 shadow-xl pointer-events-none">
        <div className="text-[11px] text-slate-400 flex items-center gap-3">
          <span>Click any highlighted power to inspect dossier or switch command</span>
          <span>·</span>
          <span className="text-sky-400 font-medium">{Object.keys(nations || {}).length} Active Sovereign Dossiers</span>
        </div>
      </div>

      {/* Hovered Country Clean Cartographic Card (Zero External Fragile URLs) */}
      {hoveredGeo && (
        <div className="absolute bottom-4 right-4 z-20 bg-slate-950/90 backdrop-blur-xl border border-slate-800 rounded-lg p-3.5 text-xs text-slate-100 pointer-events-none shadow-2xl w-64">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
            <div>
              <div className="font-semibold text-sm text-white">
                {hoveredNationData?.name || hoveredGeo.name}
              </div>
              <div className="text-[11px] text-slate-400">
                {hoveredNationData?.capital ? `Capital: ${hoveredNationData.capital}` : `ISO: ${hoveredGeo.iso3}`}
              </div>
            </div>
            <span className="font-mono text-xs text-sky-400">{hoveredGeo.iso3}</span>
          </div>

          {hoveredNationData ? (
            <div className="space-y-1.5 font-mono text-xs tabular-nums">
              <div className="flex justify-between">
                <span className="font-sans text-slate-400">Diplomatic Standing</span>
                <span
                  className={
                    hoveredGeo.iso3 === playerNationId
                      ? 'text-sky-400'
                      : (playerNation?.diplomatic?.bti?.[hoveredGeo.iso3] ?? 0) >= 50
                      ? 'text-emerald-400'
                      : (playerNation?.diplomatic?.bti?.[hoveredGeo.iso3] ?? 0) <= -30
                      ? 'text-rose-400'
                      : 'text-slate-300'
                  }
                >
                  {hoveredGeo.iso3 === playerNationId
                    ? 'SOVEREIGN SEAT'
                    : `BTI ${playerNation?.diplomatic?.bti?.[hoveredGeo.iso3] ?? 0}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-sans text-slate-400">Nominal GDP</span>
                <span className="text-slate-100">{formatFinancial(hoveredNationData.economic?.gdpNominal || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-sans text-slate-400">Treasury Reserves</span>
                <span className="text-slate-100">{formatFinancial(hoveredNationData.economic?.treasury || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-sans text-slate-400">Stability / Approval</span>
                <span className="text-slate-100">
                  {Math.round(hoveredNationData.stabilityIndex)}% / {Math.round(hoveredNationData.approvalRating)}%
                </span>
              </div>
            </div>
          ) : (
            <div className="text-slate-400 text-[11px]">
              Regional Non-Player State · Standard Diplomatic Protocol
            </div>
          )}
        </div>
      )}

      <ComposableMap
        projection={projectionMode === 'GLOBE' ? 'geoOrthographic' : 'geoEqualEarth'}
        projectionConfig={
          projectionMode === 'GLOBE'
            ? { scale: 290, rotate: rotation }
            : { scale: 165, center: [20, 5] }
        }
        width={800}
        height={640}
        style={{ width: '100%', height: '100%' }}
      >
        <ZoomableGroup zoom={1} center={[0, 0]}>
          <Sphere stroke="rgba(56, 189, 248, 0.18)" strokeWidth={0.6} fill="#081021" id="atlas-sphere" />
          <Graticule stroke="rgba(148, 163, 184, 0.08)" strokeWidth={0.4} />
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map(geo => {
                const iso3 =
                  NUMERIC_TO_ISO3[geo.id] ||
                  geo.properties.iso_a3 ||
                  geo.properties.adm0_a3 ||
                  geo.properties.name.substring(0, 3).toUpperCase();
                const nation = nations ? nations[iso3] : null;
                const isSelected = iso3 === selectedNationId || iso3 === playerNationId;

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={getCountryColor(iso3)}
                    stroke={isSelected ? '#38bdf8' : getStrokeColor(iso3)}
                    strokeWidth={isSelected ? 1.1 : 0.45}
                    style={{
                      default: { outline: 'none', transition: 'fill 180ms ease' },
                      hover: {
                        fill: nation ? '#38bdf8' : '#1e293b',
                        outline: 'none',
                        cursor: nation ? 'pointer' : 'default',
                      },
                      pressed: { fill: '#0284c7', outline: 'none' },
                    }}
                    onMouseEnter={() => setHoveredGeo({ iso3, name: geo.properties.name })}
                    onMouseLeave={() => setHoveredGeo(null)}
                    onClick={() => {
                      if (iso3 && nation) {
                        setSelectedNationId(iso3);
                        if (onCountryClick) onCountryClick(iso3);
                      }
                    }}
                  />
                );
              })
            }
          </Geographies>

          {/* Bilateral Trade & Diplomatic Corridors */}
          {tradeFlows.map((flow, i) => {
            const fromCoord = coordinates[flow.from];
            const toCoord = coordinates[flow.to];
            if (!fromCoord || !toCoord) return null;
            const color =
              flow.type === 'positive' ? '#10b981' : flow.type === 'negative' ? '#ef4444' : '#38bdf8';
            return (
              <Line
                key={`corridor-${i}`}
                from={fromCoord}
                to={toCoord}
                stroke={color}
                strokeWidth={Math.max(0.6, flow.value / 55)}
                strokeOpacity={0.45}
                className="trade-flow-line"
              />
            );
          })}

          {/* Threat Matrix Coordinates */}
          {activeEvents.map((event, i) => {
            const color =
              event.type === 'conflict' ? '#ef4444' : event.type === 'signal' ? '#38bdf8' : '#f59e0b';
            const radius = 2.5 + event.intensity * 3;
            return (
              <Marker key={`threat-${event.id || i}`} coordinates={event.coord}>
                <circle r={radius * 1.8} fill={color} opacity={0.22} />
                <circle r={radius} fill={color} stroke="#060B16" strokeWidth={0.6} />
              </Marker>
            );
          })}

          {/* Sovereign Capital Markers */}
          {Object.entries(coordinates).map(([id, coord]) => {
            if (!nations || !nations[id]) return null;
            const isPlayer = id === playerNationId;
            return (
              <Marker
                key={`capital-${id}`}
                coordinates={coord}
                onClick={() => {
                  setSelectedNationId(id);
                  if (onCountryClick) onCountryClick(id);
                }}
              >
                <circle
                  r={isPlayer ? 4.2 : 2.6}
                  fill={isPlayer ? '#38bdf8' : '#f8fafc'}
                  stroke="#060B16"
                  strokeWidth={1}
                  style={{ cursor: 'pointer' }}
                />
                <text
                  textAnchor="middle"
                  y={-6}
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: isPlayer ? '7.5px' : '6.2px',
                    fontWeight: isPlayer ? 700 : 500,
                    fill: isPlayer ? '#38bdf8' : '#e2e8f0',
                    pointerEvents: 'none',
                  }}
                >
                  {id}
                </text>
              </Marker>
            );
          })}
        </ZoomableGroup>
      </ComposableMap>
    </div>
  );
}
