import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

interface ServiceContextValue {
  serviceActive: boolean;
  startService: () => void;
  stopService: () => void;
  toggleService: () => void;
}

const ServiceContext = createContext<ServiceContextValue | null>(null);

export function ServiceProvider({ children }: { children: ReactNode }) {
  const [serviceActive, setServiceActive] = useState(false);

  const startService = useCallback(() => setServiceActive(true), []);
  const stopService = useCallback(() => setServiceActive(false), []);
  const toggleService = useCallback(() => setServiceActive((prev) => !prev), []);

  return (
    <ServiceContext.Provider
      value={{
        serviceActive,
        startService,
        stopService,
        toggleService,
      }}
    >
      {children}
    </ServiceContext.Provider>
  );
}

export function useService(): ServiceContextValue {
  const ctx = useContext(ServiceContext);
  if (!ctx) {
    throw new Error("useService must be used within a ServiceProvider");
  }
  return ctx;
}
