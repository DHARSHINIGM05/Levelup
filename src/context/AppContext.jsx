import React, { createContext, useContext, useState } from 'react';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [registeredChild, setRegisteredChild] = useState(() => {
    try {
      const saved = localStorage.getItem('levelUpRegisteredChild');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const setRegisteredChildAndPersist = (child) => {
    setRegisteredChild(child);
    if (child) {
      localStorage.setItem('levelUpRegisteredChild', JSON.stringify(child));
    } else {
      localStorage.removeItem('levelUpRegisteredChild');
    }
  };

  const [calmMomentActive, setCalmMomentActive] = useState(false);
  const isLoggedIn = !!registeredChild;

  return (
    <AppContext.Provider
      value={{
        registeredChild,
        setRegisteredChild: setRegisteredChildAndPersist,
        isLoggedIn,
        calmMomentActive,
        setCalmMomentActive,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
