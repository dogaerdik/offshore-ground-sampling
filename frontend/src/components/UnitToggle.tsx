import { UnitSystem } from "../units";

interface Props {
  value: UnitSystem;
  onChange: (u: UnitSystem) => void;
}

export default function UnitToggle({ value, onChange }: Props) {
  return (
    <div className="unit-toggle">
      <button
        className={value === "metric" ? "active" : ""}
        onClick={() => onChange("metric")}
      >
        Metric
      </button>
      <button
        className={value === "us" ? "active" : ""}
        onClick={() => onChange("us")}
      >
        US
      </button>
    </div>
  );
}
