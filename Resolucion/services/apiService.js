const BASE = 'https://jsonplaceholder.typicode.com';

export async function fetchResource(path) {
  const url = `${BASE}${path}`;
  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Error en fetch ${url}: status ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    throw new Error(`fetchResource fallo: ${err.message}`);
  }
}

export async function fetchUsers() {
  return fetchResource('/users');
}

export async function fetchPosts() {
  return fetchResource('/posts');
}
