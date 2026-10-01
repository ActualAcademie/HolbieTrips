/** Formats integer cents as a French euro amount. */
export function formatMoney(cents: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(cents / 100);
}

/** Formats ISO date values consistently across travel views. */
export function formatDate(value: string): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(new Date(value));
}

/** Returns the number of calendar days displayed for a trip. */
export function tripDuration(departure: string, arrival: string): number {
  const milliseconds = new Date(arrival).getTime() - new Date(departure).getTime();
  return Math.round(milliseconds / 86_400_000);
}
