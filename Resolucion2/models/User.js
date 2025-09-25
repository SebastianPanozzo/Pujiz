import { isNonEmptyString, isPlainObject, toNumberSafe } from '../utils/validators.js';

export default class User {
  constructor(raw) {
    this._validateRaw(raw);
    this.id = toNumberSafe(raw.id);
    this.name = String(raw.name);
    this.username = String(raw.username);
    this.email = String(raw.email);
    // address puede faltar: validamos parcialmente
    this.address = isPlainObject(raw.address) ? raw.address : { city: 'Unknown' };
    this._raw = raw;
  }

  _validateRaw(raw) {
    if (!isPlainObject(raw)) {
      throw new Error('User: raw debe ser un objeto');
    }
    const required = ['id', 'name', 'username', 'email'];
    for (const k of required) {
      if (!(k in raw) || raw[k] === null || raw[k] === undefined || (typeof raw[k] === 'string' && raw[k].trim().length === 0)) {
        throw new Error(`User: falta o es inválido el campo requerido '${k}' en ${JSON.stringify(raw)}`);
      }
    }
  }

  toString() {
    const city = (this.address && this.address.city) ? this.address.city : 'N/A';
    return `User(${this.id}): ${this.name} (${this.username}) <${this.email}> - ${city}`;
  }

  matchesEmail(email) {
    // coerción a string y comparación case-insensitive
    return String(this.email).toLowerCase() === String(email).toLowerCase();
  }

  matchesCity(city) {
    if (!city) return false;
    return String((this.address && this.address.city) || '').toLowerCase() === String(city).toLowerCase();
  }
}

// Ejemplo adicional de uso de prototipo: agregamos un método en el prototype
// (muestra explícita del uso de prototipos fuera de la clase)
User.prototype.short = function() {
  return `${this.username}#${this.id}`;
};
