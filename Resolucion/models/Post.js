function escapeRegex(str) {
  return String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export default class Post {
  constructor(raw) {
    this._validateRaw(raw);
    this.id = Number(raw.id);
    this.userId = Number(raw.userId);
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
    if (String(raw.title).trim().length === 0) {
      throw new Error(`Post: el campo 'title' no puede estar vacío en ${JSON.stringify(raw)}`);
    }
  }

  toString() {
    return `Post(${this.id}) by ${this.userId}: ${this.title}\nBody: ${this.body}`;
  }

  containsKeyword(keyword) {
    if (!keyword) return false;
    const k = String(keyword).trim();
    if (k.length === 0) return false;
    const esc = escapeRegex(k);
    const pattern = new RegExp(`(^|[^a-zA-Z])${esc}([^a-zA-Z]|$)`, 'i');
    return pattern.test(this.title) || pattern.test(this.body);
  }
}
