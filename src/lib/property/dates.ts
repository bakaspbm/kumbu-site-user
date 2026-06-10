export function nightsBetween(checkIn: string, checkOut: string): number {
  const a = new Date(`${checkIn}T12:00:00`);
  const b = new Date(`${checkOut}T12:00:00`);
  const diff = Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(0, diff);
}

export function datesOverlap(
  aIn: string,
  aOut: string,
  bIn: string,
  bOut: string,
): boolean {
  return aIn < bOut && aOut > bIn;
}

export function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export function addDays(iso: string, days: number): string {
  const d = new Date(`${iso}T12:00:00`);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function eachNightDate(checkIn: string, checkOut: string): string[] {
  const nights = nightsBetween(checkIn, checkOut);
  const out: string[] = [];
  for (let i = 0; i < nights; i++) {
    out.push(addDays(checkIn, i));
  }
  return out;
}
