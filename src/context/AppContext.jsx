import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
} from "react";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [registeredChild, setRegisteredChild] = useState(() => {
    try {
      const saved = localStorage.getItem("levelUpRegisteredChild");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const setRegisteredChildAndPersist = (child) => {
    setRegisteredChild(child);
    if (child) {
      localStorage.setItem("levelUpRegisteredChild", JSON.stringify(child));
    } else {
      localStorage.removeItem("levelUpRegisteredChild");
    }
  };

  const [calmMomentActive, setCalmMomentActive] = useState(false);
  const isLoggedIn = !!registeredChild;

  // Session-level attention + calm metrics (for analytics backend)
  const [sessionStats, setSessionStats] = useState({
    activeModule: null,
    startedAt: null,
    calmModeActivatedCount: 0,
    calmModeResumedCount: 0,
    inattentiveCount: 0,
  });
  const sessionStatsRef = useRef(sessionStats);
  useEffect(() => {
    sessionStatsRef.current = sessionStats;
  }, [sessionStats]);

  const startSession = useCallback((moduleName) => {
    setSessionStats({
      activeModule: moduleName,
      startedAt: Date.now(),
      calmModeActivatedCount: 0,
      calmModeResumedCount: 0,
      inattentiveCount: 0,
    });
  }, []);

  const incrementInattentive = () => {
    setSessionStats((s) => ({
      ...s,
      inattentiveCount: (s.inattentiveCount || 0) + 1,
    }));
  };

  const incrementCalmActivated = () => {
    setSessionStats((s) => ({
      ...s,
      calmModeActivatedCount: (s.calmModeActivatedCount || 0) + 1,
    }));
  };

  const incrementCalmResumed = () => {
    setSessionStats((s) => ({
      ...s,
      calmModeResumedCount: (s.calmModeResumedCount || 0) + 1,
    }));
  };

  const MAX_CALM_ACTIVATIONS = 3;

  const activateCalmMoment = () => {
    if (sessionStats.calmModeActivatedCount >= MAX_CALM_ACTIVATIONS) {
      return false; // limit reached — let the caller show a message if needed
    }
    setCalmMomentActive(true);
    incrementCalmActivated();
    return true;
  };

  const endSession = useCallback(() => {
    const snapshot = { ...sessionStatsRef.current };
    setSessionStats({
      activeModule: null,
      startedAt: null,
      calmModeActivatedCount: 0,
      calmModeResumedCount: 0,
      inattentiveCount: 0,
    });
    return snapshot;
  }, []);

  return (
    <AppContext.Provider
      value={{
        registeredChild,
        setRegisteredChild: setRegisteredChildAndPersist,
        isLoggedIn,
        calmMomentActive,
        setCalmMomentActive,
        activateCalmMoment,
        // session metrics
        sessionStats,
        startSession,
        endSession,
        incrementInattentive,
        incrementCalmActivated,
        incrementCalmResumed,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
