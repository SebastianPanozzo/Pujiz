// fetchers.js
import { Usuario, Comentario, Album } from './models.js';

const API = {
  USERS: 'https://jsonplaceholder.typicode.com/users',
  COMMENTS: 'https://jsonplaceholder.typicode.com/comments',
  ALBUMS: 'https://jsonplaceholder.typicode.com/albums'
};

export async function fetchWithRetry(url, opts = {}, retries = 2, delayMs = 500) {
  try {
    const resp = await fetch(url, opts);
    if (!resp.ok) throw new Error(`HTTP ${resp.status} ${resp.statusText}`);
    return await resp.json();
  } catch (err) {
    if (retries > 0) {
      await new Promise(res => setTimeout(res, delayMs));
      return fetchWithRetry(url, opts, retries - 1, delayMs * 1.5);
    }
    throw err;
  }
}

export async function loadAllData() {
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
