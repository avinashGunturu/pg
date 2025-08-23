import { useEffect, useState } from "react";

const TOAST_TIMEOUT = 5000;

// Custom hook for managing toast notifications
export function useToast() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setToasts((prevToasts) => prevToasts.slice(1));
    }, TOAST_TIMEOUT);

    return () => clearTimeout(timer);
  }, [toasts]);

  function toast({
    title,
    description,
    type = "default",
    duration = TOAST_TIMEOUT,
  }) {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prevToasts) => [
      ...prevToasts,
      { id, title, description, type, duration },
    ]);
    return id;
  }

  function dismiss(toastId) {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== toastId));
  }

  return {
    toast,
    dismiss,
    toasts,
  };
}

// Simplified toast function for direct imports
export const toast = {
  success: (message) => console.log(`SUCCESS: ${message}`),
  error: (message) => console.error(`ERROR: ${message}`),
  warning: (message) => console.warn(`WARNING: ${message}`),
  info: (message) => console.info(`INFO: ${message}`),
};