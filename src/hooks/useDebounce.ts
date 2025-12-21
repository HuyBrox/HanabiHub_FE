import { useEffect, useState } from "react";

/**
 * Custom hook ─æß╗â debounce mß╗Öt gi├í trß╗ï
 * @param value - Gi├í trß╗ï cß║ºn debounce
 * @param delay - Thß╗¥i gian delay (ms), mß║╖c ─æß╗ïnh 500ms
 * @returns Gi├í trß╗ï ─æ├ú ─æ╞░ß╗úc debounce
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Set timeout ─æß╗â update gi├í trß╗ï sau delay
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup function - clear timeout nß║┐u value thay ─æß╗òi tr╞░ß╗¢c khi delay kß║┐t th├║c
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
