import { FormEvent, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { LocationDto, SampleDto, SampleWriteDto } from "../api";

interface Props {
  locations: LocationDto[];
  existing: SampleDto | null;
  onSave: (dto: SampleWriteDto) => void;
  onCancel: () => void;
}

const EMPTY: SampleWriteDto = {
  locationId: 0,
  depthM: 0,
  collectedDate: new Date().toISOString().slice(0, 10),
  unitWeightKnPerM3: 0,
  waterContentPercent: 0,
  shearStrengthKpa: 0,
};

interface ValidationErrors {
  [field: string]: string;
}

function validate(d: SampleWriteDto): ValidationErrors {
  const errs: ValidationErrors = {};
  if (!d.locationId) errs.locationId = "Select a location";
  if (d.depthM <= 0) errs.depthM = "Must be > 0";
  if (!d.collectedDate) errs.collectedDate = "Required";
  if (d.unitWeightKnPerM3 < 12 || d.unitWeightKnPerM3 > 26)
    errs.unitWeightKnPerM3 = "Must be 12 – 26 kN/m³";
  if (d.waterContentPercent < 5 || d.waterContentPercent > 150)
    errs.waterContentPercent = "Must be 5 – 150 %";
  if (d.shearStrengthKpa < 2 || d.shearStrengthKpa > 1000)
    errs.shearStrengthKpa = "Must be 2 – 1000 kPa";
  return errs;
}

export default function SampleDialog({
  locations,
  existing,
  onSave,
  onCancel,
}: Props) {
  const [form, setForm] = useState<SampleWriteDto>(EMPTY);
  const [errors, setErrors] = useState<ValidationErrors>({});

  useEffect(() => {
    if (existing) {
      setForm({
        locationId: existing.locationId,
        depthM: existing.depthM,
        collectedDate: existing.collectedDate,
        unitWeightKnPerM3: existing.unitWeightKnPerM3,
        waterContentPercent: existing.waterContentPercent,
        shearStrengthKpa: existing.shearStrengthKpa,
      });
    } else {
      setForm({ ...EMPTY, locationId: locations[0]?.id ?? 0 });
    }
  }, [existing, locations]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const errs = validate(form);
    setErrors(errs);
    if (Object.keys(errs).length === 0) onSave(form);
  }

  function set(field: keyof SampleWriteDto, value: string) {
    setForm((prev) => ({
      ...prev,
      [field]: field === "collectedDate" ? value : Number(value),
    }));
  }

  return createPortal(
    <div className="backdrop" onClick={onCancel}>
      <div
        className={`dialog${existing ? " dialog--edit" : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        <h2>{existing ? "Edit Sample" : "Add Sample"}</h2>
        {existing && (
          <p className="dialog-sample-id">Sample ID: {existing.id}</p>
        )}
        <form onSubmit={handleSubmit}>
          <label>
            Location
            <select
              value={form.locationId}
              onChange={(e) => set("locationId", e.target.value)}
            >
              <option value={0} disabled>
                Select…
              </option>
              {locations.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
            {errors.locationId && (
              <span className="err">{errors.locationId}</span>
            )}
          </label>

          <label>
            Depth (m)
            <input
              type="number"
              step="0.01"
              value={form.depthM || ""}
              onChange={(e) => set("depthM", e.target.value)}
            />
            {errors.depthM && <span className="err">{errors.depthM}</span>}
          </label>

          <label>
            Date Collected
            <input
              type="date"
              value={form.collectedDate}
              onChange={(e) => set("collectedDate", e.target.value)}
            />
            {errors.collectedDate && (
              <span className="err">{errors.collectedDate}</span>
            )}
          </label>

          <label>
            Unit weight (kN/m³)
            <input
              type="number"
              step="0.1"
              value={form.unitWeightKnPerM3 || ""}
              onChange={(e) => set("unitWeightKnPerM3", e.target.value)}
            />
            {errors.unitWeightKnPerM3 && (
              <span className="err">{errors.unitWeightKnPerM3}</span>
            )}
          </label>

          <label>
            Water content (%)
            <input
              type="number"
              step="0.1"
              value={form.waterContentPercent || ""}
              onChange={(e) => set("waterContentPercent", e.target.value)}
            />
            {errors.waterContentPercent && (
              <span className="err">{errors.waterContentPercent}</span>
            )}
          </label>

          <label>
            Shear strength (kPa)
            <input
              type="number"
              step="0.1"
              value={form.shearStrengthKpa || ""}
              onChange={(e) => set("shearStrengthKpa", e.target.value)}
            />
            {errors.shearStrengthKpa && (
              <span className="err">{errors.shearStrengthKpa}</span>
            )}
          </label>

          <div className="dialog-actions">
            <button type="button" className="btn-secondary" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {existing ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}
