import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import {
  LocationDto,
  SampleDto,
  SampleWriteDto,
  StatisticsDto,
  fetchLocations,
  fetchSamples,
  fetchStatistics,
  createSample,
  updateSample,
  deleteSample,
  getStoredAccessToken,
  login as apiLogin,
  logout as apiLogout,
} from "./api";
import { UnitSystem } from "./units";
import SampleTable from "./components/SampleTable";
import StatsBar from "./components/StatsBar";
import LocationFilter from "./components/LocationFilter";
import UnitToggle from "./components/UnitToggle";
import SampleDialog from "./components/SampleDialog";
import DeleteConfirmDialog from "./components/DeleteConfirmDialog";
import LandingPage from "./components/LandingPage";
import WaterCanvas from "./components/WaterCanvas";
import DepthProfileChart from "./components/DepthProfileChart";

type DialogMode = "closed" | "add" | "edit";
type Page = "landing" | "main";

const LANDING_EXIT_MS = 480;

const TITLE_SIGN_IN_HINT =
  "Use Sign in in the header to add or change samples.";
const TITLE_SELECT_SAMPLE = "Select a sample in the table first.";

export default function App() {
  const [page, setPage] = useState<Page>("landing");
  const [landingExiting, setLandingExiting] = useState(false);
  const landingExitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const [locations, setLocations] = useState<LocationDto[]>([]);
  const [samples, setSamples] = useState<SampleDto[]>([]);
  const [stats, setStats] = useState<StatisticsDto | null>(null);
  const [locationFilter, setLocationFilter] = useState<number | undefined>();
  const [units, setUnits] = useState<UnitSystem>("metric");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [dialog, setDialog] = useState<DialogMode>("closed");
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(() =>
    getStoredAccessToken(),
  );
  const [loginUser, setLoginUser] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [loginBusy, setLoginBusy] = useState(false);
  const [landingSignInRevealNonce, setLandingSignInRevealNonce] = useState(0);

  const reload = useCallback(() => {
    fetchSamples(locationFilter)
      .then(setSamples)
      .catch((e) => setError(e.message));
    fetchStatistics(locationFilter)
      .then(setStats)
      .catch((e) => setError(e.message));
  }, [locationFilter]);

  useEffect(() => {
    fetchLocations()
      .then(setLocations)
      .catch((e) => setError(e.message));
  }, []);

  function handleLandingEnter() {
    if (landingExiting) return;
    setError(null);
    setLandingExiting(true);
    if (landingExitTimerRef.current !== null) {
      window.clearTimeout(landingExitTimerRef.current);
    }
    landingExitTimerRef.current = window.setTimeout(() => {
      landingExitTimerRef.current = null;
      setPage("main");
      setLandingExiting(false);
    }, LANDING_EXIT_MS);
  }

  useEffect(() => {
    reload();
    setSelectedId(null);
  }, [reload]);

  async function handleLoginSubmit(e: FormEvent) {
    e.preventDefault();
    const user = loginUser.trim();
    if (!user || !loginPass) {
      setError("Please enter username and password.");
      return;
    }
    setLoginBusy(true);
    setError(null);
    try {
      await apiLogin(user, loginPass);
      setAuthToken(getStoredAccessToken());
      setLoginPass("");
      handleLandingEnter();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoginBusy(false);
    }
  }

  function handleLogout() {
    apiLogout();
    setAuthToken(null);
  }

  async function handleSave(dto: SampleWriteDto) {
    try {
      if (dialog === "edit" && selectedId != null) {
        await updateSample(selectedId, dto);
      } else {
        await createSample(dto);
      }
      setDialog("closed");
      setSelectedId(null);
      reload();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  function openDeleteConfirm() {
    if (selectedId == null) return;
    setDeleteTargetId(selectedId);
  }

  function cancelDeleteConfirm() {
    setDeleteTargetId(null);
  }

  async function confirmDelete() {
    if (deleteTargetId == null) return;
    const id = deleteTargetId;
    setDeleteTargetId(null);
    try {
      await deleteSample(id);
      setSelectedId(null);
      reload();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  const selectedSample =
    dialog === "edit" ? samples.find((s) => s.id === selectedId) ?? null : null;

  const addSampleTitle = !authToken ? TITLE_SIGN_IN_HINT : undefined;
  const editSampleTitle = !authToken
    ? TITLE_SIGN_IN_HINT
    : selectedId == null
      ? TITLE_SELECT_SAMPLE
      : undefined;
  const deleteSampleTitle = !authToken
    ? TITLE_SIGN_IN_HINT
    : selectedId == null
      ? TITLE_SELECT_SAMPLE
      : undefined;

  return (
    <>
      <div className="app-water-bg" aria-hidden>
        <WaterCanvas />
      </div>
      {error && (
        <div className="app-global-error" role="alert">
          <div className="error-banner">
            {error}
            <button type="button" onClick={() => setError(null)}>
              ✕
            </button>
          </div>
        </div>
      )}
      {page === "landing" ? (
        <LandingPage
          exiting={landingExiting}
          onEnter={handleLandingEnter}
          authToken={authToken}
          loginUser={loginUser}
          loginPass={loginPass}
          loginBusy={loginBusy}
          onLoginSubmit={handleLoginSubmit}
          onLoginUserChange={setLoginUser}
          onLoginPassChange={setLoginPass}
          revealSignInNonce={landingSignInRevealNonce}
        />
      ) : (
        <div className="app-shell">
          <div className="app">
            <header>
              <h1>Offshore Ground Sampling</h1>
              <div className="header-right">
                {authToken ? (
                  <div className="auth-bar">
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={handleLogout}
                      title="Sign out"
                    >
                      Log out
                    </button>
                  </div>
                ) : (
                  <div className="auth-bar auth-bar--guest">
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => {
                        setLandingSignInRevealNonce((n) => n + 1);
                        setPage("landing");
                      }}
                    >
                      Sign in
                    </button>
                  </div>
                )}
                <UnitToggle value={units} onChange={setUnits} />
              </div>
            </header>

            <StatsBar stats={stats} />

            <div className="toolbar">
              <LocationFilter
                locations={locations}
                value={locationFilter}
                onChange={setLocationFilter}
              />
              <div className="toolbar-actions-wrap">
                <div className="toolbar-actions">
                  <button
                    className="btn-primary"
                    disabled={!authToken}
                    title={addSampleTitle}
                    onClick={() => setDialog("add")}
                  >
                    + Add Sample
                  </button>
                  <button
                    className="btn-secondary"
                    disabled={!authToken || selectedId == null}
                    title={editSampleTitle}
                    onClick={() => setDialog("edit")}
                  >
                    Edit
                  </button>
                  <button
                    className="btn-danger"
                    disabled={!authToken || selectedId == null}
                    title={deleteSampleTitle}
                    onClick={openDeleteConfirm}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>

            <SampleTable
              samples={samples}
              units={units}
              selectedId={selectedId}
              onSelect={setSelectedId}
            />

            <DepthProfileChart
              samples={samples}
              units={units}
              selectedId={selectedId}
            />

            {dialog !== "closed" && (
              <SampleDialog
                locations={locations}
                existing={selectedSample}
                onSave={handleSave}
                onCancel={() => setDialog("closed")}
              />
            )}

            {deleteTargetId != null && (
              <DeleteConfirmDialog
                sampleId={deleteTargetId}
                onConfirm={confirmDelete}
                onCancel={cancelDeleteConfirm}
              />
            )}
          </div>
        </div>
      )}
    </>
  );
}
