import { SampleDto } from "../api";
import {
  UnitSystem,
  depthLabel,
  depthValue,
  unitWeightLabel,
  unitWeightValue,
  waterContentLabel,
  shearStrengthLabel,
  shearStrengthValue,
  fmt,
} from "../units";

interface Props {
  samples: SampleDto[];
  units: UnitSystem;
  selectedId: number | null;
  onSelect: (id: number | null) => void;
}

export default function SampleTable({
  samples,
  units,
  selectedId,
  onSelect,
}: Props) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Location</th>
            <th>{depthLabel(units)}</th>
            <th>Date Collected</th>
            <th>{unitWeightLabel(units)}</th>
            <th>{waterContentLabel()}</th>
            <th>{shearStrengthLabel(units)}</th>
          </tr>
        </thead>
        <tbody>
          {samples.length === 0 && (
            <tr>
              <td colSpan={7} className="empty">
                No samples found.
              </td>
            </tr>
          )}
          {samples.map((s) => (
            <tr
              key={s.id}
              className={s.id === selectedId ? "selected" : ""}
              onClick={() => onSelect(s.id === selectedId ? null : s.id)}
            >
              <td>{s.id}</td>
              <td>{s.locationName}</td>
              <td>{fmt(depthValue(s.depthM, units))}</td>
              <td>{s.collectedDate}</td>
              <td>{fmt(unitWeightValue(s.unitWeightKnPerM3, units))}</td>
              <td>{fmt(s.waterContentPercent)}</td>
              <td>{fmt(shearStrengthValue(s.shearStrengthKpa, units))}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
