export default class User {
  /**
   * @param {object} raw 
   */
  constructor(raw) {
    this._validateRaw(raw);
    this.id = Number(raw.id);
    this.name = String(raw.name);
    this.username = String(raw.username);
    this.email = String(raw.email);
    this._raw = raw; 
  }

  _validateRaw(raw) {
    if (!raw || typeof raw !== 'object') {
      throw new Error('User: raw debe ser un objeto.');
    }
    const required = ['id', 'name', 'username', 'email'];
    for (const k of required) {
      if (!(k in raw) || raw[k] === null || raw[k] === undefined) {
        throw new Error(`User: falta campo requerido '${k}' en ${JSON.stringify(raw)}`);
      }
    }
  }

  toString() {
    return `User(${this.id}): ${this.name} <${this.email}>`;
  }

  matchesEmail(email) {
    return this.email.toLowerCase() === String(email).toLowerCase();
  }
}
