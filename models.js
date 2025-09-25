// models.js


// uisuario
export function Usuario(raw) {
  this.raw = raw;
  this.id = raw && raw.id;
  this.name = raw && raw.name;
  this.username = raw && raw.username;
  this.email = raw && raw.email;
  this.address = raw && raw.address;
  this.phone = raw && raw.phone;
  this.website = raw && raw.website;
  this.company = raw && raw.company;
}

Usuario.prototype.isValid = function() {
  if (!this.id || !this.name || !this.email) return false;
  if (!this.address || !this.address.street || !this.address.city || !this.address.zipcode) return false;
  if (!this.company || !this.company.name) return false;
  return true;
};

Usuario.prototype.addressIncompleteFields = function() {
  const missing = [];
  if (!this.address) return ['address'];
  if (!this.address.street) missing.push('street');
  if (!this.address.suite) missing.push('suite');
  if (!this.address.city) missing.push('city');
  if (!this.address.zipcode) missing.push('zipcode');
  return missing;
};

// comentario
export function Comentario(raw) {
  this.raw = raw;
  this.id = raw && raw.id;
  this.postId = raw && raw.postId;
  this.name = raw && raw.name;
  this.email = raw && raw.email;
  this.body = raw && raw.body;
}

Comentario.prototype.isValid = function() {
  if (!this.id) return false;
  if (!this.email || !this.body) return false;
  return true;
};

// albumes
export function Album(raw) {
  this.raw = raw;
  this.id = raw && raw.id;
  this.userId = raw && raw.userId;
  this.title = raw && raw.title;
}

Album.prototype.isValid = function() {
  if (!this.id || !this.userId) return false;
  return true;
};
