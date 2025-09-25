import { isNonEmptyString, toNumberSafe } from '../utils/validators.js';

function escapeRegex(str) {
  return String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export default class Post {
  constructor(raw) {
    this._validateRaw(raw);
    this.id = toNumberSafe(raw.id);
    this.userId = toNumberSafe(raw.userId);
    this.title = String(raw.title);
    this.body = String(raw.body);
    this._raw = raw;
  }

  _validateRaw(raw) {
    if (!raw || typeof raw !== 'object') {
      throw new Error('Post: raw debe ser un objeto.');
    }
    const required = ['userId', 'id', 'title', 'body'];
    for (const k of required) {
      if (!(k in raw) || raw[k] === null || raw[k] === undefined) {
        throw new Error(`Post: falta campo requerido '${k}' en ${JSON.stringify(raw)}`);
      }
    }
    if (!isNonEmptyString(raw.title)) {
      throw new Error(`Post: el campo 'title' no puede estar vacío.`);
    }
  }

  toString() {
    return `Post(${this.id}) by ${this.userId}: ${this.title}\nBody: ${this.body}`;
  }

  // containsKeyword usando \b para coincidencia de palabra completa, case-insensitive
  containsKeyword(keyword) {
    if (!isNonEmptyString(keyword)) return false;
    const esc = escapeRegex(keyword.trim());
    const pattern = new RegExp(`\\b${esc}\\b`, 'i');
    return pattern.test(this.title) || pattern.test(this.body);
  }

  // agregamos un método por prototipo (otra demostración)
  summary() {
    const shortBody = this.body.length > 80 ? this.body.slice(0, 80) + '…' : this.body;
    return `Post(${this.id}) "${this.title}" - ${shortBody}`;
  }
}

// método adicional vía prototype (demostración explícita):
Post.prototype.short = function() {
  return `${this.id}@${this.userId}: ${this.title}`;
};
