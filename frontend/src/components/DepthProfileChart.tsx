import { useMemo, useState } from "react";
import { SampleDto } from "../api";
import {
  UnitSystem,
  depthLabel,
  depthValue,
  fmt,
  shearStrengthLabel,
  shearStrengthValue,
  unitWeightLabel,
  unitWeightValue,
  waterContentLabel,
} from "../units";

type YKey = "unitWeight" | "water" | "shear";

interface Props {
  samples: SampleDto[];
  units: UnitSystem;
  selectedId: number | null;
}

const VIEW_W = 520;
const VIEW_H = 300;
const PAD_L = 58;
const PAD_R = 20;
const PAD_T = 28;
const PAD_B = 52;
const INNER_W = VIEW_W - PAD_L - PAD_R;
const INNER_H = VIEW_H - PAD_T - PAD_B;

function padRange(minV: number, maxV: number): [number, number] {
  if (minV === maxV) {
    const d = Math.abs(minV) * 0.06 || 1;
    return [minV - d, maxV + d];
  }
  const span = maxV - minV;
  const p = span * 0.06;
  return [minV - p, maxV + p];
}

function yValue(s: SampleDto, key: YKey, units: UnitSystem): number {
  if (key === "unitWeight") {
    return unitWeightValue(s.unitWeightKnPerM3, units);
  }
  if (key === "water") {
    return s.waterContentPercent;
  }
  return shearStrengthValue(s.shearStrengthKpa, units);
}

function yAxisLabel(key: YKey, units: UnitSystem): string {
  if (key === "unitWeight") {
    return unitWeightLabel(units);
  }
  if (key === "water") {
    return waterContentLabel();
  }
  return shearStrengthLabel(units);
}

export default function DepthProfileChart({
  samples,
  units,
  selectedId,
}: Props) {
  const [yKey, setYKey] = useState<YKey>("water");

  const points = useMemo(() => {
    return samples
      .map((s) => ({
        id: s.id,
        x: depthValue(s.depthM, units),
        y: yValue(s, yKey, units),
      }))
      .sort((a, b) => a.x - b.x);
  }, [samples, units, yKey]);

  const layout = useMemo(() => {
    if (points.length === 0) {
      return null;
    }
    let minX = Math.min(...points.map((p) => p.x));
    let maxX = Math.max(...points.map((p) => p.x));
    let minY = Math.min(...points.map((p) => p.y));
    let maxY = Math.max(...points.map((p) => p.y));
    [minX, maxX] = padRange(minX, maxX);
    [minY, maxY] = padRange(minY, maxY);

    const sx = (x: number) => PAD_L + ((x - minX) / (maxX - minX || 1)) * INNER_W;
    const sy = (y: number) =>
      PAD_T + INNER_H - ((y - minY) / (maxY - minY || 1)) * INNER_H;

    const linePts = points.map((p) => `${sx(p.x)},${sy(p.y)}`).join(" ");

    const xTicks = 5;
    const yTicks = 5;
    const xt: { v: number; px: number }[] = [];
    for (let i = 0; i <= xTicks; i++) {
      const v = minX + (i / xTicks) * (maxX - minX);
      xt.push({ v, px: sx(v) });
    }
    const yt: { v: number; py: number }[] = [];
    for (let i = 0; i <= yTicks; i++) {
      const v = minY + (i / yTicks) * (maxY - minY);
      yt.push({ v, py: sy(v) });
    }

    return {
      minX,
      maxX,
      minY,
      maxY,
      sx,
      sy,
      linePts,
      xt,
      yt,
      xAxisY: PAD_T + INNER_H,
    };
  }, [points]);

  const xTitle = depthLabel(units);
  const yTitle = yAxisLabel(yKey, units);

  return (
    <section className="depth-chart" aria-label="Depth profile chart">
      <div className="depth-chart__header">
        <h2 className="depth-chart__title">Depth profile</h2>
        <label className="depth-chart__param">
          <span className="depth-chart__param-label">Y-axis</span>
          <select
            className="location-filter depth-chart__select"
            value={yKey}
            onChange={(e) => setYKey(e.target.value as YKey)}
          >
            <option value="water">{waterContentLabel()}</option>
            <option value="unitWeight">{unitWeightLabel(units)}</option>
            <option value="shear">{shearStrengthLabel(units)}</option>
          </select>
        </label>
      </div>
      <p className="depth-chart__hint">
        X: {xTitle} · Y: {yTitle}
      </p>

      {points.length === 0 ? (
        <p className="depth-chart__empty">No samples to plot.</p>
      ) : layout ? (
        <div className="depth-chart__svg-wrap">
          <svg
            className="depth-chart__svg"
            viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
            preserveAspectRatio="xMidYMid meet"
          >
            <rect
              x={PAD_L}
              y={PAD_T}
              width={INNER_W}
              height={INNER_H}
              className="depth-chart__plot-bg"
              rx={4}
            />
            {layout.yt.map((t, i) => (
              <g key={`gy-${i}`}>
                <line
                  x1={PAD_L}
                  x2={PAD_L + INNER_W}
                  y1={t.py}
                  y2={t.py}
                  className="depth-chart__grid"
                />
                <text
                  x={PAD_L - 8}
                  y={t.py}
                  dy="0.35em"
                  textAnchor="end"
                  className="depth-chart__tick"
                >
                  {fmt(t.v, 1)}
                </text>
              </g>
            ))}
            {layout.xt.map((t, i) => (
              <g key={`gx-${i}`}>
                <line
                  x1={t.px}
                  x2={t.px}
                  y1={PAD_T}
                  y2={PAD_T + INNER_H}
                  className="depth-chart__grid"
                />
                <text
                  x={t.px}
                  y={layout.xAxisY + 18}
                  textAnchor="middle"
                  className="depth-chart__tick"
                >
                  {fmt(t.v, 1)}
                </text>
              </g>
            ))}
            <line
              x1={PAD_L}
              y1={PAD_T}
              x2={PAD_L}
              y2={PAD_T + INNER_H}
              className="depth-chart__axis"
            />
            <line
              x1={PAD_L}
              y1={layout.xAxisY}
              x2={PAD_L + INNER_W}
              y2={layout.xAxisY}
              className="depth-chart__axis"
            />
            <polyline
              fill="none"
              className="depth-chart__line"
              points={layout.linePts}
            />
            {points.map((p) => {
              const cx = layout.sx(p.x);
              const cy = layout.sy(p.y);
              const sel = p.id === selectedId;
              return (
                <circle
                  key={p.id}
                  cx={cx}
                  cy={cy}
                  r={sel ? 6 : 4}
                  className={
                    sel ? "depth-chart__dot depth-chart__dot--selected" : "depth-chart__dot"
                  }
                />
              );
            })}
            <text
              x={PAD_L + INNER_W / 2}
              y={VIEW_H - 10}
              textAnchor="middle"
              className="depth-chart__axis-title"
            >
              {xTitle}
            </text>
            <text
              x={16}
              y={PAD_T + INNER_H / 2}
              textAnchor="middle"
              className="depth-chart__axis-title"
              transform={`rotate(-90, 16, ${PAD_T + INNER_H / 2})`}
            >
              {yTitle}
            </text>
          </svg>
        </div>
      ) : null}
    </section>
  );
}
