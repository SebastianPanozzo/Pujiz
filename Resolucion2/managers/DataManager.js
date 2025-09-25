import User from '../models/User.js';
import Post from '../models/Post.js';
import * as api from '../services/apiService.js';
import { isPlainObject } from '../utils/validators.js';

export default class DataManager {
  constructor() {
    this.users = [];           // array de User
    this.posts = [];           // array de Post
    this.userIdToPosts = new Map(); // Map<number, Post[]>
  }

  // loadAll maneja errores de red y validación
  async loadAll({ loadUsers = true, loadPosts = true } = {}) {
    try {
      if (loadUsers) {
        const rawUsers = await api.fetchUsers();
        if (!Array.isArray(rawUsers)) throw new Error('fetchUsers: payload inválido');
        this.users = rawUsers.map(u => {
          try {
            return new User(u);
          } catch (err) {
            console.warn('Usuario inválido descartado:', err.message, u && u.id ? `id:${u.id}` : '');
            return null;
          }
        }).filter(Boolean);
      }
      if (loadPosts) {
        const rawPosts = await api.fetchPosts();
        if (!Array.isArray(rawPosts)) throw new Error('fetchPosts: payload inválido');
        this.posts = rawPosts.map(p => {
          try {
            return new Post(p);
          } catch (err) {
            console.warn('Post inválido descartado:', err.message, p && p.id ? `id:${p.id}` : '');
            return null;
          }
        }).filter(Boolean);
      }
      this._buildMapping();
    } catch (err) {
      throw new Error(`DataManager.loadAll fallo: ${err.message}`);
    }
  }

  _buildMapping() {
    this.userIdToPosts.clear();
    for (const post of this.posts) {
      const arr = this.userIdToPosts.get(post.userId) || [];
      arr.push(post);
      this.userIdToPosts.set(post.userId, arr);
    }
  }

  // Buscar por email (case-insensitive)
  findUserByEmail(email) {
    if (!email) return null;
    const e = String(email).toLowerCase();
    return this.users.find(u => String(u.email).toLowerCase() === e) || null;
  }

  // Buscar por ciudad
  findUsersByCity(city) {
    if (!city) return [];
    const c = String(city).toLowerCase();
    return this.users.filter(u => (u.address && String(u.address.city).toLowerCase() === c));
  }

  // Detección de duplicados por email/username
  findDuplicateUsers() {
    const byEmail = new Map();
    const byUsername = new Map();
    const duplicates = [];

    for (const u of this.users) {
      const emailKey = String(u.email).toLowerCase();
      const unameKey = String(u.username).toLowerCase();

      if (byEmail.has(emailKey)) {
        duplicates.push({ type: 'email', email: u.email, users: [byEmail.get(emailKey), u].map(x => ({ id: x.id, username: x.username })) });
      } else {
        byEmail.set(emailKey, u);
      }

      if (byUsername.has(unameKey)) {
        duplicates.push({ type: 'username', username: u.username, users: [byUsername.get(unameKey), u].map(x => ({ id: x.id, email: x.email })) });
      } else {
        byUsername.set(unameKey, u);
      }
    }

    return duplicates;
  }

  // Listar posts por userId
  getPostsByUserId(userId) {
    if (userId === null || userId === undefined) return [];
    return this.userIdToPosts.get(Number(userId)) || [];
  }

  // Mapa usuario -> posts (devuelve copia)
  getUserToPostsMap() {
    const out = {};
    for (const user of this.users) {
      out[user.id] = (this.userIdToPosts.get(user.id) || []).slice();
    }
    return out;
  }

  // Top N usuarios por cantidad de posts
  topUsersByPostCount(n = 3) {
    const arr = this.users.map(u => {
      const count = (this.userIdToPosts.get(u.id) || []).length;
      return { user: u, count };
    });
    arr.sort((a, b) => b.count - a.count);
    return arr.slice(0, n);
  }

  // searchPostsByKeyword usa closure: generator de matcher (demostración)
  searchPostsByKeyword(keyword) {
    if (!keyword || String(keyword).trim().length === 0) return [];
    // closure: createWordMatcher devuelve una función (closure) que mantiene la regex
    const createWordMatcher = (k) => {
      const esc = String(k).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`\\b${esc}\\b`, 'i');
      return (post) => regex.test(post.title) || regex.test(post.body);
    };
    const matcher = createWordMatcher(keyword);
    return this.posts.filter(matcher);
  }

  // Usuarios sin publicaciones
  usersWithoutPosts() {
    return this.users.filter(u => (this.userIdToPosts.get(u.id) || []).length === 0);
  }

  // Proporción de publicaciones por usuario respecto al total
  postProportionPerUser() {
    const total = this.posts.length || 1;
    const arr = this.users.map(u => {
      const count = (this.userIdToPosts.get(u.id) || []).length;
      return { user: u, count, percent: (count / total) * 100 };
    });
    arr.sort((a, b) => b.count - a.count);
    return arr;
  }

  // Ciudad con mayor promedio de posts por usuario
  cityWithHighestAveragePostsPerUser() {
    // agrupamos usuarios por ciudad
    const cityMap = new Map();
    for (const u of this.users) {
      const city = (u.address && u.address.city) ? String(u.address.city) : 'Unknown';
      const arr = cityMap.get(city) || [];
      arr.push(u);
      cityMap.set(city, arr);
    }

    let best = null;
    for (const [city, users] of cityMap.entries()) {
      const totalPosts = users.reduce((s, u) => s + ((this.userIdToPosts.get(u.id) || []).length), 0);
      const avg = users.length > 0 ? totalPosts / users.length : 0;
      if (!best || avg > best.avg) {
        best = { city, avg, userCount: users.length, totalPosts };
      }
    }

    if (!best) return null;
    return { city: best.city, avgPosts: best.avg, userCount: best.userCount, totalPosts: best.totalPosts };
  }

  // Consola: lista resumida (imprime title y body)
  consoleListSummary(items, { label = 'items' } = {}) {
    console.log(`--- ${label} (total ${items.length}) ---`);
    for (const it of items) {
      if (it && typeof it === 'object' && 'title' in it && 'body' in it) {
        console.log(`Post(${it.id}) by ${it.userId}:\nTitle: ${it.title}\nBody: ${it.body}\n`);
      } else if (it && typeof it.toString === 'function') {
        console.log(it.toString());
      } else {
        console.log(JSON.stringify(it));
      }
    }
  }

  // Generador simple de paginación (uso de generator/prototipo concept)
  *paginate(array, pageSize = 10) {
    for (let i = 0; i < array.length; i += pageSize) {
      yield array.slice(i, i + pageSize);
    }
  }
}
