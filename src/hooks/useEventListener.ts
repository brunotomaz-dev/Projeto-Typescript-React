import { useEffect, useRef } from 'react';

function useEventListener(
  eventType: string,
  callback: EventListenerOrEventListenerObject,
  element: HTMLElement | Window = window
) {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    const handler = (e: Event) => {
      if (typeof callbackRef.current === 'function') {
        callbackRef.current(e);
      }
    };
    element.addEventListener(eventType, handler);
    return () => element.removeEventListener(eventType, handler);
  }, [eventType, element]);
}

export default useEventListener;
