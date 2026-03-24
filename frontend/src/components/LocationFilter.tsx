import { LocationDto } from "../api";

interface Props {
  locations: LocationDto[];
  value: number | undefined;
  onChange: (locationId: number | undefined) => void;
}

export default function LocationFilter({ locations, value, onChange }: Props) {
  return (
    <select
      className="location-filter"
      value={value ?? ""}
      onChange={(e) => {
        const v = e.target.value;
        onChange(v === "" ? undefined : Number(v));
      }}
    >
      <option value="">All locations</option>
      {locations.map((loc) => (
        <option key={loc.id} value={loc.id}>
          {loc.name}
        </option>
      ))}
    </select>
  );
}
