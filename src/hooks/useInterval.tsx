import { useEffect, useRef } from 'react';

/**
 * Hook to create an interval.
 * @param callback - The callback function to execute.
 * @param delay - The delay in milliseconds. If null, the interval is cleared.
 * @returns void
 */
function useInterval(callback: () => void, delay: number | null) {
  // Ref to store the callback
  const savedCallback = useRef(callback);

  useEffect(() => {
    // Update the ref with the new callback
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    // If the delay is null, clear the interval
    if (delay === null) return;
    // Create the interval
    const id = setInterval(() => savedCallback.current(), delay);
    // Clear the interval
    return () => clearInterval(id);
  }, [delay]);
}

export default useInterval;
