import { useCallback, useEffect, useMemo, useRef } from 'react';

/**
 * Debounce de una función: `run` solo ejecuta `fn` cuando pasan `delay` ms sin otra llamada.
 * Se usa para no hacer una request por cada tecla.
 */
export function useDebouncedCallback<A extends unknown[]>(fn: (...args: A) => void, delay = 400) {
  const fnRef = useRef(fn);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    fnRef.current = fn;
  }, [fn]);

  // Al desmontar, no dejar un timeout pendiente.
  useEffect(() => () => clearTimeout(timer.current), []);

  const run = useCallback(
    (...args: A) => {
      clearTimeout(timer.current);
      timer.current = setTimeout(() => fnRef.current(...args), delay);
    },
    [delay],
  );

  const cancel = useCallback(() => clearTimeout(timer.current), []);

  return useMemo(() => ({ run, cancel }), [run, cancel]);
}
