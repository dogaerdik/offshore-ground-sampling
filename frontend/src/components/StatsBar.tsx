import { StatisticsDto } from "../api";

interface Props {
  stats: StatisticsDto | null;
}

export default function StatsBar({ stats }: Props) {
  if (!stats) return null;

  const avg =
    stats.averageWaterContentPercent != null
      ? stats.averageWaterContentPercent.toFixed(2) + " %"
      : "—";

  return (
    <div className="stats-bar">
      <div className="stat">
        <span className="stat-label">Avg water content</span>
        <span className="stat-value">{avg}</span>
      </div>
      <div className="stat">
        <span className="stat-label">Samples above threshold</span>
        <span className="stat-value">
          {stats.samplesSurpassingThresholdCount}
        </span>
      </div>
    </div>
  );
}
