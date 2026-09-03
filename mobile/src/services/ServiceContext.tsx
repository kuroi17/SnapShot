import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import {
  hasOverlayPermission,
  requestOverlayPermission,
  showFloatingBubble,
  hideFloatingBubble,
} from "./nativeFloatingService";

interface ServiceContextValue {
  serviceActive: boolean;
  startService: () => Promise<boolean>;
  stopService: () => Promise<void>;
  toggleService: () => Promise<void>;
}

const ServiceContext = createContext<ServiceContextValue | null>(null);

export function ServiceProvider({ children }: { children: ReactNode }) {
  const [serviceActive, setServiceActive] = useState(false);

  const startService = useCallback(async (): Promise<boolean> => {
    const hasPerm = await hasOverlayPermission();
    if (!hasPerm) {
      await requestOverlayPermission();
      // User will toggle setting; allow activation
    }
    await showFloatingBubble();
    setServiceActive(true);
    return true;
  }, []);

  const stopService = useCallback(async () => {
    await hideFloatingBubble();
    setServiceActive(false);
  }, []);

  const toggleService = useCallback(async () => {
    if (serviceActive) {
      await stopService();
    } else {
      await startService();
    }
  }, [serviceActive, startService, stopService]);

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
