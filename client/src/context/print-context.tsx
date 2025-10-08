import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

type PrintContextValue = {
  handler: (() => void) | null;
  setPrintHandler: (handler: (() => void) | null) => void;
};

const PrintContext = createContext<PrintContextValue | undefined>(undefined);

export function PrintProvider({ children }: { children: ReactNode }) {
  const [handler, setHandler] = useState<(() => void) | null>(null);

  const setPrintHandler = useCallback((nextHandler: (() => void) | null) => {
    setHandler(() => nextHandler);
  }, []);

  const value = useMemo<PrintContextValue>(
    () => ({
      handler,
      setPrintHandler,
    }),
    [handler, setPrintHandler]
  );

  return <PrintContext.Provider value={value}>{children}</PrintContext.Provider>;
}

export function usePrintContext(): PrintContextValue {
  const ctx = useContext(PrintContext);
  if (!ctx) {
    throw new Error("usePrintContext must be used within a PrintProvider");
  }
  return ctx;
}
