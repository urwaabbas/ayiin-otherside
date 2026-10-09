"use client";

import { useState } from "react";

interface StatusData {
  name: string;
  value: number;
}

interface CategoryData {
  name: string;
  count: number;
}

const PIE_COLORS = ["#f59e0b", "#10b981", "#2563eb", "#6366f1", "#ef4444", "#8b5cf6"];

export function OrdersStatusDonutChart({ data }: { data: StatusData[] }) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const total = data.reduce((acc, curr) => acc + curr.value, 0);

  if (!data || data.length === 0 || total === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-xs text-gray-400">
        No orders status data available
      </div>
    );
  }

  // Calculate SVG arc paths
  const radius = 80;
  const strokeWidth = 28;
  const center = 100;
  let cumulativePercent = 0;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-6 py-4">
      {/* SVG Donut */}
      <div className="relative w-48 h-48 shrink-0">
        <svg viewBox="0 0 200 200" className="w-full h-full -rotate-90 transform">
          {data.map((item, index) => {
            const percent = item.value / total;
            const strokeDasharray = `${percent * 502.65} 502.65`;
            const strokeDashoffset = -cumulativePercent * 502.65;
            cumulativePercent += percent;

            const isHovered = hoveredIndex === index;

            return (
              <circle
                key={item.name}
                cx={center}
                cy={center}
                r={radius}
                fill="transparent"
                stroke={PIE_COLORS[index % PIE_COLORS.length]}
                strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-300 cursor-pointer"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              />
            );
          })}
        </svg>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <p className="text-2xl font-black text-gray-900 leading-none">
            {hoveredIndex !== null ? data[hoveredIndex].value : total}
          </p>
          <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mt-1">
            {hoveredIndex !== null ? data[hoveredIndex].name : "Total Orders"}
          </p>
        </div>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
        {data.map((item, index) => {
          const color = PIE_COLORS[index % PIE_COLORS.length];
          const pct = Math.round((item.value / total) * 100);
          return (
            <div
              key={item.name}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              className={`flex items-center gap-2 p-1.5 rounded-lg cursor-pointer transition ${
                hoveredIndex === index ? "bg-gray-100 font-semibold" : "text-gray-600"
              }`}
            >
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: color }}
              />
              <span className="truncate max-w-[90px]">{item.name}</span>
              <span className="text-gray-400 font-normal">({pct}%)</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function ProductsCategoryBarChart({ data }: { data: CategoryData[] }) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-xs text-gray-400">
        No category data available
      </div>
    );
  }

  const maxVal = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="w-full h-64 flex flex-col justify-end pt-4 pb-2">
      <div className="flex-1 flex items-end gap-3 px-2">
        {data.map((cat, idx) => {
          const heightPct = Math.max((cat.count / maxVal) * 100, 8);
          const isHovered = hoveredIndex === idx;

          return (
            <div
              key={cat.name}
              className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer"
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {/* Tooltip value */}
              <span
                className={`text-[10px] font-bold mb-1 transition ${
                  isHovered ? "text-blue-600 scale-110" : "text-gray-400"
                }`}
              >
                {cat.count}
              </span>

              {/* Bar */}
              <div className="w-full bg-gray-100 rounded-t-lg overflow-hidden flex items-end h-full max-h-40">
                <div
                  className={`w-full rounded-t-lg transition-all duration-300 ${
                    isHovered ? "bg-blue-600" : "bg-blue-500"
                  }`}
                  style={{ height: `${heightPct}%` }}
                />
              </div>

              {/* Category label */}
              <span className="text-[10px] text-gray-500 truncate w-full text-center mt-2 group-hover:text-gray-900 font-medium">
                {cat.name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
