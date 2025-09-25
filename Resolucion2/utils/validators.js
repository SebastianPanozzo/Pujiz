// Validadores simples reutilizables
export function isNonEmptyString(v) {
  return typeof v === 'string' && v.trim().length > 0;
}

export function isPlainObject(v) {
  return v !== null && typeof v === 'object' && !Array.isArray(v);
}

export function toNumberSafe(v) {
  // coerción deliberada controlada (ejemplo de coerción)
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}
