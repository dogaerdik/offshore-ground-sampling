const BASE =
    import.meta.env.VITE_API_BASE || "http://localhost:8080/api";

const TOKEN_STORAGE_KEY = "ogs.jwt";

export interface LocationDto {
  id: number;
  name: string;
}

export interface SampleDto {
  id: number;
  locationId: number;
  locationName: string;
  depthM: number;
  collectedDate: string;
  unitWeightKnPerM3: number;
  waterContentPercent: number;
  shearStrengthKpa: number;
}

export interface SampleWriteDto {
  locationId: number;
  depthM: number;
  collectedDate: string;
  unitWeightKnPerM3: number;
  waterContentPercent: number;
  shearStrengthKpa: number;
}

export interface StatisticsDto {
  averageWaterContentPercent: number | null;
  samplesSurpassingThresholdCount: number;
}

export function getStoredAccessToken(): string | null {
  try {
    return sessionStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

function setStoredAccessToken(token: string | null): void {
  try {
    if (token) sessionStorage.setItem(TOKEN_STORAGE_KEY, token);
    else sessionStorage.removeItem(TOKEN_STORAGE_KEY);
  } catch {
    /* sessionStorage unavailable */
  }
}

export async function login(username: string, password: string): Promise<void> {
  const res = await fetch(`${BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) {
    const body = await res.text();
    if (res.status === 401) {
      throw new Error("Invalid username or password.");
    }
    if (res.status === 400 && body) {
      try {
        const parsed = JSON.parse(body) as {
          details?: string;
          message?: string;
        };
        const msg = parsed.details ?? parsed.message;
        if (msg) {
          throw new Error(msg);
        }
      } catch (err) {
        if (!(err instanceof SyntaxError)) throw err;
      }
    }
    throw new Error(body || res.statusText);
  }
  const data = (await res.json()) as { accessToken: string };
  setStoredAccessToken(data.accessToken);
}

export function logout(): void {
  setStoredAccessToken(null);
}

function jsonHeadersWithAuth(): HeadersInit {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const token = getStoredAccessToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

async function json<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.text();
    throw new Error(body || res.statusText);
  }
  return res.json();
}

export function fetchLocations(): Promise<LocationDto[]> {
  return fetch(`${BASE}/locations`).then((r) => json<LocationDto[]>(r));
}

export function fetchSamples(locationId?: number): Promise<SampleDto[]> {
  const q = locationId != null ? `?locationId=${locationId}` : "";
  return fetch(`${BASE}/samples${q}`).then((r) => json<SampleDto[]>(r));
}

export function createSample(dto: SampleWriteDto): Promise<SampleDto> {
  return fetch(`${BASE}/samples`, {
    method: "POST",
    headers: jsonHeadersWithAuth(),
    body: JSON.stringify(dto),
  }).then((r) => json<SampleDto>(r));
}

export function updateSample(
  id: number,
  dto: SampleWriteDto,
): Promise<SampleDto> {
  return fetch(`${BASE}/samples/${id}`, {
    method: "PUT",
    headers: jsonHeadersWithAuth(),
    body: JSON.stringify(dto),
  }).then((r) => json<SampleDto>(r));
}

export function deleteSample(id: number): Promise<void> {
  return fetch(`${BASE}/samples/${id}`, {
    method: "DELETE",
    headers: jsonHeadersWithAuth(),
  }).then((r) => {
    if (!r.ok) throw new Error(r.statusText);
  });
}

export function fetchStatistics(locationId?: number): Promise<StatisticsDto> {
  const q = locationId != null ? `?locationId=${locationId}` : "";
  return fetch(`${BASE}/statistics${q}`).then((r) => json<StatisticsDto>(r));
}
