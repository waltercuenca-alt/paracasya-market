const INTERNAL_ACCESS_KEY = "paracasya_internal_access";
const INTERNAL_ACCESS_VALUE = "granted";
const DEFAULT_INTERNAL_PIN = "2468";
const viteEnv = import.meta.env ?? {};

export const internalPin = viteEnv.VITE_INTERNAL_PIN || DEFAULT_INTERNAL_PIN;

function getSessionStorage() {
  return typeof sessionStorage === "undefined" ? null : sessionStorage;
}

export function hasInternalAccess() {
  return getSessionStorage()?.getItem(INTERNAL_ACCESS_KEY) === INTERNAL_ACCESS_VALUE;
}

export function grantInternalAccess() {
  getSessionStorage()?.setItem(INTERNAL_ACCESS_KEY, INTERNAL_ACCESS_VALUE);
}

export function clearInternalAccess() {
  getSessionStorage()?.removeItem(INTERNAL_ACCESS_KEY);
}

export function isInternalPinValid(pin) {
  return String(pin ?? "").trim() === internalPin;
}
