"use client";

import { useCallback } from "react";
import { Toaster, toast } from "sonner";

export function ToastProvider({ children }) {
  return (
    <>
      {children}
      <Toaster position="bottom-right" richColors closeButton duration={3500} />
    </>
  );
}

export function useToast() {
  return useCallback((message, type = "success") => {
    if (type === "error") {
      toast.error(message);
      return;
    }
    toast.success(message);
  }, []);
}
