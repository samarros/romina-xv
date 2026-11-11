export function getCountdown(target: string, now = Date.now()) {
  const targetTime = Date.parse(target);
  if (!Number.isFinite(targetTime) || !Number.isFinite(now)) throw new Error('Fecha inválida para la cuenta regresiva');
  const secondsLeft = Math.max(0, Math.ceil((targetTime - now) / 1000));
  return {
    days: Math.floor(secondsLeft / 86400),
    hours: Math.floor(secondsLeft / 3600) % 24,
    minutes: Math.floor(secondsLeft / 60) % 60,
    seconds: secondsLeft % 60,
    complete: now >= targetTime,
  };
}
