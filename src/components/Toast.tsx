"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

export type ToastItem = {
  id: string;
  message: string;
};

type ToastContextValue = {
  push: (message: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const push = useCallback((message: string) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const item = { id, message };
    setItems((prev) => [...prev, item]);
    setTimeout(() => {
      setItems((prev) => prev.filter((toast) => toast.id !== id));
    }, 2200);
  }, []);

  const value = useMemo(() => ({ push }), [push]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-root" aria-live="polite" aria-atomic="true">
        {items.map((item) => (
          <div key={item.id} className="toast-item">
            {item.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("ToastProvider is missing in the tree.");
  }
  return ctx;
}
