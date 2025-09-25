// analytics.js

//funcanalisis
export function usersWithIncompleteAddresses(users) {
  return users
    .map(u => ({ user: u, missing: u.addressIncompleteFields() }))
    .filter(x => x.missing && x.missing.length > 0);
}

export function companyWithMostUsers(users) {
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

export function topCommenters(comments, users, topN = 5) {
  const map = {};
  for (const c of comments) {
    const key = (c.email || '').toLowerCase();
    map[key] = map[key] || { email: c.email, count: 0, user: null };
    map[key].count++;
  }
  const emailToUser = {};
  for (const u of users) if (u.email) emailToUser[u.email.toLowerCase()] = u;
  for (const key of Object.keys(map)) {
    map[key].user = emailToUser[key] || null;
  }
  const arr = Object.values(map).sort((a,b) => b.count - a.count);
  return arr.slice(0, topN);
}

export function duplicateComments(comments) {
  const seen = new Map();
  const duplicates = [];
  for (const c of comments) {
    const key = `${(c.email||'').trim().toLowerCase()}|${(c.body||'').trim().toLowerCase()}`;
    if (seen.has(key)) duplicates.push({ original: seen.get(key), duplicate: c });
    else seen.set(key, c);
  }
  return duplicates;
}

export function commentsContainingKeyword(comments, keyword) {
  const k = (keyword || '').toLowerCase();
  return comments.filter(c => (c.body || '').toLowerCase().includes(k));
}

export function listAlbumsOfUser(albums, userId) {
  return albums.filter(a => Number(a.userId) === Number(userId));
}

export function userWithMostAlbums(albums, users) {
  const counts = {};
  for (const a of albums) counts[a.userId] = (counts[a.userId] || 0) + 1;
  let best = null;
  for (const [uid, cnt] of Object.entries(counts)) {
    if (!best || cnt > best.count) best = { userId: Number(uid), count: cnt, user: users.find(u => u.id === Number(uid)) || null };
  }
  return best;
}

export function avgAlbumsPerUser(albums, users) {
  return albums.length / (users.length || 1);
}

export function inactiveUsers(users, albums, comments) {
  const userIdsWithAlbums = new Set(albums.map(a => Number(a.userId)));
  const emailsWithComments = new Set(comments.map(c => (c.email||'').toLowerCase()));
  return users.filter(u => !userIdsWithAlbums.has(Number(u.id)) && !(u.email && emailsWithComments.has(u.email.toLowerCase())));
}

export function commentProportions(comments, users) {
  const total = comments.length || 1;
  const map = {};
  const emailToUserId = {};
  for (const u of users) if (u.email) emailToUserId[u.email.toLowerCase()] = u.id;
  for (const c of comments) {
    const uid = emailToUserId[(c.email||'').toLowerCase()] || 'external';
    map[uid] = (map[uid] || 0) + 1;
  }
  return Object.entries(map).map(([uid, cnt]) => ({
    userId: uid === 'external' ? null : Number(uid),
    count: cnt,
    percent: (cnt / total) * 100
  })).sort((a,b) => b.percent - a.percent);
}

export function cityWithMostComments(comments, users) {
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
