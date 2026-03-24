import { useEffect, useRef, useState, type FormEvent } from "react";

interface Props {
  exiting: boolean;
  onEnter: () => void;
  authToken: string | null;
  loginUser: string;
  loginPass: string;
  loginBusy: boolean;
  onLoginSubmit: (e: FormEvent) => void;
  onLoginUserChange: (value: string) => void;
  onLoginPassChange: (value: string) => void;
  revealSignInNonce?: number;
}

export default function LandingPage({
  exiting,
  onEnter,
  authToken,
  loginUser,
  loginPass,
  loginBusy,
  onLoginSubmit,
  onLoginUserChange,
  onLoginPassChange,
  revealSignInNonce = 0,
}: Props) {
  const [showSignIn, setShowSignIn] = useState(false);
  const lastRevealNonce = useRef(0);

  useEffect(() => {
    if (
      authToken ||
      revealSignInNonce <= 0 ||
      revealSignInNonce === lastRevealNonce.current
    ) {
      return;
    }
    setShowSignIn(true);
    lastRevealNonce.current = revealSignInNonce;
  }, [revealSignInNonce, authToken]);

  return (
    <div className={`landing${exiting ? " landing--exiting" : ""}`}>
      <div className="landing-overlay">
        <div className="landing-hero">
          <img src="/fugro-logo.svg" alt="Fugro" className="landing-logo" />
          <h1 className="landing-title">Offshore Ground Sampling</h1>
        </div>

        <div className="landing-card">
          <p className="landing-auth-hint">
            Browse without signing in. Sign in when you need to add or edit
            samples.
          </p>

          <button
            type="button"
            className="landing-btn landing-btn--primary"
            onClick={onEnter}
            disabled={exiting}
          >
            Open application
          </button>

          {authToken ? (
            <p className="landing-signed-in" role="status">
              You&apos;re signed in.
            </p>
          ) : (
            <>
              <button
                type="button"
                className="landing-signin-toggle"
                onClick={() => setShowSignIn((open) => !open)}
                disabled={exiting}
                aria-expanded={showSignIn}
                aria-controls="landing-signin-panel"
              >
                {showSignIn ? "Close sign-in" : "Sign in to edit"}
              </button>
              <div
                id="landing-signin-panel"
                className="landing-auth-panel"
                hidden={!showSignIn}
              >
                <form className="landing-auth-form" onSubmit={onLoginSubmit}>
                  <input
                    type="text"
                    name="username"
                    autoComplete="username"
                    placeholder="Username"
                    value={loginUser}
                    onChange={(e) => onLoginUserChange(e.target.value)}
                    aria-label="Username"
                    disabled={exiting}
                  />
                  <input
                    type="password"
                    name="password"
                    autoComplete="current-password"
                    placeholder="Password"
                    value={loginPass}
                    onChange={(e) => onLoginPassChange(e.target.value)}
                    aria-label="Password"
                    disabled={exiting}
                  />
                  <button
                    type="submit"
                    className="landing-auth-submit"
                    disabled={loginBusy || exiting}
                  >
                    {loginBusy ? "Signing in…" : "Sign in"}
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
