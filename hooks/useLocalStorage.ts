import { useCallback, useEffect, useState } from "react";

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  useEffect(() => {
    const hydrationTimer = window.setTimeout(() => {
      try {
        const item = window.localStorage.getItem(key);
        setStoredValue(item ? (JSON.parse(item) as T) : initialValue);
      } catch (error) {
        console.warn(`Error reading localStorage key "${key}":`, error);
      }
    }, 0);

    return () => window.clearTimeout(hydrationTimer);
  }, [initialValue, key]);

  const setValue = useCallback(
    (value: T | ((currentValue: T) => T)) => {
      setStoredValue((currentValue) => {
        const valueToStore =
          typeof value === "function"
            ? (value as (currentValue: T) => T)(currentValue)
            : value;

        try {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        } catch (error) {
          console.warn(`Error setting localStorage key "${key}":`, error);
        }

        return valueToStore;
      });
    },
    [key]
  );

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== key) return;

      try {
        setStoredValue(
          event.newValue
            ? (JSON.parse(event.newValue) as T)
            : initialValue
        );
      } catch (error) {
        console.warn(`Error syncing localStorage key "${key}":`, error);
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [initialValue, key]);

  return [storedValue, setValue] as const;
}
