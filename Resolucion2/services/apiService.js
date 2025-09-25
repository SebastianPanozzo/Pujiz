// Servicio mínimo para fetch desde JSONPlaceholder
const BASE = 'https://jsonplaceholder.typicode.com';

async function fetchResource(path) {
  if (typeof fetch === 'undefined') {
    throw new Error('fetch no está disponible en este entorno. Usa Node 18+ o ejecuta en un navegador.');
  }
  const url = `${BASE}${path}`;
  let res;
  try {
    res = await fetch(url);
  } catch (err) {
    throw new Error(`Network error al pedir ${url}: ${err.message}`);
  }
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} al pedir ${url}`);
  }
  try {
    return await res.json();
  } catch (err) {
    throw new Error(`Error parseando JSON de ${url}: ${err.message}`);
  }
}

export async function fetchUsers() {
  return fetchResource('/users');
}

export async function fetchPosts() {
  return fetchResource('/posts');
}
