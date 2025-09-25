

const API = {
  USERS: 'https://jsonplaceholder.typicode.com/users',
  COMMENTS: 'https://jsonplaceholder.typicode.com/comments',
  ALBUMS: 'https://jsonplaceholder.typicode.com/albums'
};

function safeLog(...args) { console.log(...args); }

async function fetchWithRetry(url, opts = {}, retries = 2, delayMs = 500) {
  try {
    const resp = await fetch(url, opts);
    if (!resp.ok) throw new Error(`HTTP ${resp.status} ${resp.statusText}`);
    const json = await resp.json();
    return json;
  } catch (err) {
    if (retries > 0) {
      // muestra uso de timers/event-loop: no bloqueante
      await new Promise(res => setTimeout(res, delayMs));
      return fetchWithRetry(url, opts, retries - 1, delayMs * 1.5);
    }
    throw err;
  }
}


function Usuario(raw) {
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

function Comentario(raw) {
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

function Album(raw) {
  this.raw = raw;
  this.id = raw && raw.id;
  this.userId = raw && raw.userId;
  this.title = raw && raw.title;
}
Album.prototype.isValid = function() {
  if (!this.id || !this.userId) return false;
  return true;
};


async function loadAllData() {
  const [usersRaw, commentsRaw, albumsRaw] = await Promise.all([
    fetchWithRetry(API.USERS),
    fetchWithRetry(API.COMMENTS),
    fetchWithRetry(API.ALBUMS)
  ]);


  const usuarios = (usersRaw || []).map(u => new Usuario(u));
  const comentarios = (commentsRaw || []).map(c => new Comentario(c));
  const albums = (albumsRaw || []).map(a => new Album(a));

  const invalidUsers = usuarios.filter(u => !u.isValid());
  const validUsers = usuarios.filter(u => u.isValid());

  const invalidComments = comentarios.filter(c => !c.isValid());
  const validComments = comentarios.filter(c => c.isValid());

  const invalidAlbums = albums.filter(a => !a.isValid());
  const validAlbums = albums.filter(a => a.isValid());

  return {
    users: validUsers,
    invalidUsers,
    comments: validComments,
    invalidComments,
    albums: validAlbums,
    invalidAlbums
  };
}



// busqueda
function filterUsers(users, criteria) {
  if (typeof criteria === 'function') return users.filter(criteria);
  return users.filter(u => {
    let ok = true;
    if (criteria.companyName) ok = ok && u.company && u.company.name && u.company.name.toLowerCase().includes(criteria.companyName.toLowerCase());
    if (criteria.city) ok = ok && u.address && u.address.city && u.address.city.toLowerCase() === criteria.city.toLowerCase();
    if (criteria.nameIncludes) ok = ok && u.name && u.name.toLowerCase().includes(criteria.nameIncludes.toLowerCase());
    return !!ok;
  });
}


function usersWithIncompleteAddresses(users) {
  return users
    .map(u => ({ user: u, missing: u.addressIncompleteFields() }))
    .filter(x => x.missing && x.missing.length > 0);
}

function companyWithMostUsers(users) {
  const counts = {};
  for (const u of users) {
    const cname = (u.company && u.company.name) ? u.company.name : 'UNKNOWN';
    counts[cname] = (counts[cname] || 0) + 1;
  }
  let best = null;
  for (const [cname, cnt] of Object.entries(counts)) {
    if (!best || cnt > best.count) best = { company: cname, count: cnt };
  }
  return best;
}


function mapCommentsToUsers(comments, users) {

  const emailToUser = {};
  for (const u of users) if (u.email) emailToUser[u.email.toLowerCase()] = u;

  return comments.map(c => {
    const user = c.email ? emailToUser[c.email.toLowerCase()] : null;
    return { comment: c, user: user || null };
  });
}

function topCommenters(comments, users, topN = 5) {
  // contar comentarios por email y también mapear a user si posible
  const map = {};
  for (const c of comments) {
    const key = (c.email || '').toLowerCase();
    map[key] = map[key] || { email: c.email, count: 0, user: null };
    map[key].count++;
  }
  // 
  const emailToUser = {};
  for (const u of users) if (u.email) emailToUser[u.email.toLowerCase()] = u;
  for (const key of Object.keys(map)) {
    map[key].user = emailToUser[key] || null;
  }
  const arr = Object.values(map).sort((a,b) => b.count - a.count);
  return arr.slice(0, topN);
}

function duplicateComments(comments) {

  const seen = new Map();
  const duplicates = [];
  for (const c of comments) {
    const key = `${(c.email||'').trim().toLowerCase()}|${(c.body||'').trim().toLowerCase()}`;
    if (seen.has(key)) {
      duplicates.push({ original: seen.get(key), duplicate: c });
    } else {
      seen.set(key, c);
    }
  }
  return duplicates;
}

function commentsContainingKeyword(comments, keyword) {
  const k = (keyword || '').toLowerCase();
  return comments.filter(c => (c.body || '').toLowerCase().includes(k));
}


function listAlbumsOfUser(albums, userId) {
  return albums.filter(a => Number(a.userId) === Number(userId));
}

function userWithMostAlbums(albums, users) {
  const counts = {};
  for (const a of albums) {
    counts[a.userId] = (counts[a.userId] || 0) + 1;
  }
  let best = null;
  for (const [uid, cnt] of Object.entries(counts)) {
    if (!best || cnt > best.count) best = { userId: Number(uid), count: cnt, user: users.find(u => u.id === Number(uid)) || null };
  }
  return best;
}

function avgAlbumsPerUser(albums, users) {
  const total = albums.length;
  const usersCount = users.length || 1;
  return total / usersCount;
}


function inactiveUsers(users, albums, comments) {
  const userIdsWithAlbums = new Set(albums.map(a => Number(a.userId)));
  const emailsWithComments = new Set(comments.map(c => (c.email||'').toLowerCase()));
  return users.filter(u => {
    const noAlbums = !userIdsWithAlbums.has(Number(u.id));
    const noComments = !(u.email && emailsWithComments.has(u.email.toLowerCase()));
    return noAlbums && noComments;
  });
}

function commentProportions(comments, users) {
  const total = comments.length || 1;
  const map = {};
  const emailToUserId = {};
  for (const u of users) if (u.email) emailToUserId[u.email.toLowerCase()] = u.id;
  for (const c of comments) {
    const uid = emailToUserId[(c.email||'').toLowerCase()] || 'external';
    map[uid] = (map[uid] || 0) + 1;
  }
  const arr = Object.entries(map).map(([uid, cnt]) => ({
    userId: uid === 'external' ? null : Number(uid),
    count: cnt,
    percent: (cnt / total) * 100
  })).sort((a,b) => b.percent - a.percent);
  return { total, breakdown: arr };
}

function cityWithMostComments(comments, users) {
  const emailToCity = {};
  for (const u of users) if (u.email && u.address && u.address.city) emailToCity[u.email.toLowerCase()] = u.address.city;
  const cityCounts = {};
  for (const c of comments) {
    const city = emailToCity[(c.email||'').toLowerCase()] || null;
    if (city) cityCounts[city] = (cityCounts[city] || 0) + 1;
  }
  let best = null;
  for (const [city, cnt] of Object.entries(cityCounts)) {
    if (!best || cnt > best.count) best = { city, count: cnt };
  }
  return best;
}


async function generateReports() {
  const { users, invalidUsers, comments, invalidComments, albums, invalidAlbums } = await loadAllData();

  safeLog('Resumen');
  safeLog(`usuarios validos: ${users.length}. usuarios invalidos: ${invalidUsers.length}`);
  safeLog(`ccomentarios validos: ${comments.length}. comentarios invalidos: ${invalidComments.length}`);
  safeLog(`aslbums validos: ${albums.length}. albums invaslidos: ${invalidAlbums.length}`);

  // ufsuarios
  const incompletos = usersWithIncompleteAddresses(users);
  safeLog('usuarios con direcciones incompletas:', incompletos.map(x => ({ id: x.user.id, missing: x.missing })));

  const topCompany = companyWithMostUsers(users);
  safeLog('compania con mas usuarios:', topCompany);

  // Comentarios
  const top5 = topCommenters(comments, users, 5);
  safeLog('top 5 comentaristas (de email):', top5);

  const dupes = duplicateComments(comments);
  safeLog('csomentarios duplicados (mismo email + contenido):', dupes.length, dupes.slice(0,10));

  const keyword = 'dolor';
  const found = commentsContainingKeyword(comments, keyword);
  safeLog(`comentarios que contienen la palabra "${keyword}":`, found.length);

  // albums
  const mostAlbums = userWithMostAlbums(albums, users);
  safeLog('usuario con mas albums:', mostAlbums);

  const avgAlbums = avgAlbumsPerUser(albums, users);
  safeLog('promedio de albumes por usuario:', avgAlbums);

  // logica
  const inactivos = inactiveUsers(users, albums, comments);
  safeLog('Usuarios inactivos (sin albums ni comentario):', inactivos.map(u => ({ id: u.id, email: u.email, name: u.name })));

  const proportions = commentProportions(comments, users);
  safeLog('oproporcion de comentarios por usuario (ranking porcentual):', proportions.breakdown.slice(0,10));

  const cityMost = cityWithMostComments(comments, users);
  safeLog('ciudad que concentra mas comentarios (considerando usuarios):', cityMost);

  
  return {
    counts: { users: users.length, comments: comments.length, albums: albums.length },
    invalids: { users: invalidUsers, comments: invalidComments, albums: invalidAlbums },
    incompletos,
    topCompany,
    top5,
    dupes,
    found,
    mostAlbums,
    avgAlbums,
    inactivos,
    proportions,
    cityMost
  };
}


// mai
async function main() {
  try {
    safeLog('API:');
    const report = await generateReports();
    safeLog('Analisis completado');
    // mostrar primeras 5 proporsiones
    safeLog('Top 5 proporciones: ', report.proportions.breakdown.slice(0,5));
  } catch (err) {
    console.error('rrror en analisis:', err.message || err);
  }
}


if (typeof window === 'undefined' || typeof document === 'undefined') {
 
  main();
} else {
 
  window.addEventListener('DOMContentLoaded', () => main());
}

export { Usuario, Comentario, Album, loadAllData, generateReports, main };
