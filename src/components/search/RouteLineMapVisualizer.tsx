import React, { useState } from 'react';
import {
  Route,
  MapPin,
  Clock,
  Compass,
  Layers,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { TrainSchedule } from '../../types';

interface RouteLineMapVisualizerProps {
  train: TrainSchedule;
}

export const RouteLineMapVisualizer: React.FC<RouteLineMapVisualizerProps> = ({ train }) => {
  const stops = train.stops;
  const [hoveredStop, setHoveredStop] = useState<number | null>(null);

  if (!stops || stops.length === 0) return null;

  // Calculate coordinates along a styled SVG schematic line
  const svgWidth = 560;
  const svgHeight = 110;
  const paddingX = 40;
  const availableWidth = svgWidth - paddingX * 2;
  const stepX = availableWidth / Math.max(1, stops.length - 1);
  const trackY = 55;

  return (
    <div className="bg-[#FAF7F2] rounded-xl p-3.5 border border-[#DFD5C2] space-y-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="p-1 rounded-lg bg-[#5B7B6E]/20 text-[#2B4E3C]">
            <Route className="w-4 h-4" />
          </span>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#173024]">
              Stylized Route Line Map
            </h4>
            <p className="text-[11px] text-[#6E685D]">
              Line corridor schematic highlighting active transit path & major junctions
            </p>
          </div>
        </div>

        <span className="text-[10px] font-mono bg-[#173024] text-[#86EFAC] px-2 py-0.5 rounded-full">
          {train.line}
        </span>
      </div>

      {/* Stylized SVG Railway Schematic */}
      <div className="relative w-full overflow-x-auto no-scrollbar bg-[#102018] rounded-xl p-2 border border-[#234232]">
        <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-24 sm:h-28 min-w-[500px]">
          <defs>
            <linearGradient id="routeGlow" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#D4A359" />
              <stop offset="50%" stopColor="#5CE2A0" />
              <stop offset="100%" stopColor="#D4A359" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Background ballast railbed */}
          <line
            x1={paddingX}
            y1={trackY}
            x2={svgWidth - paddingX}
            y2={trackY}
            stroke="#213E2E"
            strokeWidth="8"
            strokeLinecap="round"
          />

          {/* Active Highlighted Journey Line with Golden Emerald Gradient */}
          <line
            x1={paddingX}
            y1={trackY}
            x2={svgWidth - paddingX}
            y2={trackY}
            stroke="url(#routeGlow)"
            strokeWidth="4"
            filter="url(#glow)"
            strokeLinecap="round"
          />

          {/* Sleeper ties along the line */}
          {Array.from({ length: 30 }).map((_, i) => {
            const x = paddingX + (availableWidth / 29) * i;
            return (
              <line
                key={i}
                x1={x}
                y1={trackY - 6}
                x2={x}
                y2={trackY + 6}
                stroke="#335A44"
                strokeWidth="1.5"
                opacity="0.6"
              />
            );
          })}

          {/* Station Stop Nodes */}
          {stops.map((stop, idx) => {
            const x = paddingX + idx * stepX;
            const isOrigin = idx === 0;
            const isDestination = idx === stops.length - 1;
            const isHovered = hoveredStop === idx;

            return (
              <g
                key={stop.sequence}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredStop(idx)}
                onMouseLeave={() => setHoveredStop(null)}
              >
                {/* Station Node Halo */}
                {isOrigin || isDestination ? (
                  <circle
                    cx={x}
                    cy={trackY}
                    r={isHovered ? 8 : 6.5}
                    fill="#D4A359"
                    stroke="#FFFFFF"
                    strokeWidth="2"
                    filter="url(#glow)"
                  />
                ) : (
                  <circle
                    cx={x}
                    cy={trackY}
                    r={isHovered ? 6 : 4.5}
                    fill={isHovered ? '#86EFAC' : '#2D543F'}
                    stroke="#D4A359"
                    strokeWidth="1.5"
                  />
                )}

                {/* Station Code / Name alternately above and below */}
                <text
                  x={x}
                  y={idx % 2 === 0 ? trackY - 14 : trackY + 22}
                  fill={isOrigin || isDestination || isHovered ? '#FFFFFF' : '#B8CFC2'}
                  fontSize={isOrigin || isDestination ? '10' : '8.5'}
                  fontWeight={isOrigin || isDestination ? 'bold' : '500'}
                  textAnchor="middle"
                  fontFamily="sans-serif"
                >
                  {stop.station_name}
                </text>

                {/* Time badge */}
                <text
                  x={x}
                  y={idx % 2 === 0 ? trackY - 24 : trackY + 32}
                  fill="#D4A359"
                  fontSize="7.5"
                  textAnchor="middle"
                  fontFamily="monospace"
                >
                  {isOrigin ? stop.departure_time : stop.arrival_time}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Hovered or Selected Station Telemetry Tip */}
      <div className="flex items-center justify-between text-xs text-[#5A5751] px-1">
        <div className="flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-[#C88A35]" />
          <span>
            {hoveredStop !== null ? (
              <strong className="text-[#173024]">
                {stops[hoveredStop]?.station_name}: Arr {stops[hoveredStop]?.arrival_time} / Dep {stops[hoveredStop]?.departure_time} ({stops[hoveredStop]?.distance_km} km)
              </strong>
            ) : (
              <span>Hover station node on the map to inspect timings & distance</span>
            )}
          </span>
        </div>
        <span className="text-[11px] font-mono text-[#758A80]">
          Total {stops[stops.length - 1]?.distance_km || 0} km
        </span>
      </div>
    </div>
  );
};
