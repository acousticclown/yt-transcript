"use client";

import { motion, AnimatePresence } from "framer-motion";
import { createContext, useContext, useState, ReactNode, useCallback } from "react";
import { cn } from "../../lib/utils";

type ToastType = "success" | "error" | "info";

type Toast = {
  id: string;
  message: string;
  type: ToastType;
};

type ToastContextType = {
  toast: (message: string, type?: ToastType) => void;
  success: (message: string) => void;
  error: (message: string) => void;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: ToastType = "info") => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  const toast = useCallback((message: string, type?: ToastType) => addToast(message, type), [addToast]);
  const success = useCallback((message: string) => addToast(message, "success"), [addToast]);
  const error = useCallback((message: string) => addToast(message, "error"), [addToast]);

  return (
    <ToastContext.Provider value={{ toast, success, error }}>
      {children}
      <div className="fixed bottom-20 lg:bottom-4 right-4 z-[100] flex flex-col gap-2">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className={cn(
                "px-4 py-3 rounded-xl shadow-lg text-sm font-medium max-w-xs",
                t.type === "success" && "bg-green-500 text-white",
                t.type === "error" && "bg-red-500 text-white",
                t.type === "info" && "bg-[var(--color-surface)] text-[var(--color-text)] border border-[var(--color-border)]"
              )}
            >
              <span className="mr-2">
                {t.type === "success" && "✓"}
                {t.type === "error" && "✕"}
                {t.type === "info" && "ℹ"}
              </span>
              {t.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}

