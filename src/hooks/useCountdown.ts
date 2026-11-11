import { useEffect, useState } from 'react';
import { getCountdown } from '../lib/countdown';

export function useCountdown(target: string) {
  const [remaining, setRemaining] = useState(() => getCountdown(target));
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    function update() {
      clearTimeout(timeout);
      const next = getCountdown(target);
      setRemaining(next);
      if (!next.complete) timeout = setTimeout(update, 1000 - Date.now() % 1000);
    }
    update();
    document.addEventListener('visibilitychange', update);
    return () => { clearTimeout(timeout); document.removeEventListener('visibilitychange', update); };
  }, [target]);
  return remaining;
}
