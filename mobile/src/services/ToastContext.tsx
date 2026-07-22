import { createContext, useContext, useState, useCallback, useRef, type ReactNode } from "react";
import { Toast, type ToastVariant } from "../components/ui/Toast";

interface ToastConfig {
  message: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  showToast: (message: string, variant?: ToastVariant) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const TOAST_DURATION = 2500;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<ToastConfig | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback(
    (message: string, variant: ToastVariant = "success") => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      setConfig({ message, variant });
      timerRef.current = setTimeout(() => {
        setConfig(null);
        timerRef.current = null;
      }, TOAST_DURATION);
    },
    []
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Toast
        visible={config !== null}
        message={config?.message ?? ""}
        variant={config?.variant ?? "success"}
      />
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return ctx;
}
