/** Monetização visível ao utilizador só quando a cobrança está activa no admin. */
export function isUserMonetizationVisible(chargingEnabled: boolean | undefined | null): boolean {
  return chargingEnabled === true;
}
