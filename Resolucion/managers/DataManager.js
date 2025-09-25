import User from '../models/User.js';
import Post from '../models/Post.js';
import * as api from '../services/apiService.js';

export default class DataManager {
  constructor() {
    this.users = []; 
    this.posts = []; 
    this.userIdToPosts = new Map(); 
  }


  async loadAll({ loadUsers = true, loadPosts = true } = {}) {
    try {
      if (loadUsers) {
        const rawUsers = await api.fetchUsers();
        this.users = rawUsers.map(u => new User(u));
      }
      if (loadPosts) {
        const rawPosts = await api.fetchPosts();
        this.posts = rawPosts.map(p => new Post(p));
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

  findUserByEmail(email) {
    if (!email) return null;
    const e = String(email).toLowerCase();
    return this.users.find(u => u.email.toLowerCase() === e) || null;
  }

  getPostsByUserId(userId) {
    if (!userId && userId !== 0) return [];
    return this.userIdToPosts.get(Number(userId)) || [];
  }

  getUserToPostsMap() {
    const out = {};
    for (const user of this.users) {
      out[user.id] = (this.userIdToPosts.get(user.id) || []).slice();
    }
    return out;
  }

  topUsersByPostCount(n = 3) {
    const arr = this.users.map(u => {
      const count = (this.userIdToPosts.get(u.id) || []).length;
      return { user: u, count };
    });
    arr.sort((a, b) => b.count - a.count);
    return arr.slice(0, n);
  }

  searchPostsByKeyword(keyword) {
    if (!keyword) return [];
    return this.posts.filter(p => p.containsKeyword(keyword));
  }

  consoleListSummary(items, { label = 'items' } = {}) {
    console.log(`--- ${label} (total ${items.length}) ---`);
    for (const it of items) {
      if (it instanceof Object && it.title !== undefined && it.body !== undefined) {
        console.log(`Post(${it.id}) by ${it.userId}:\nTitle: ${it.title}\nBody: ${it.body}\n`);
      } else if (typeof it === 'string' || typeof it === 'number') {
        console.log(it);
      } else if (it && typeof it.toString === 'function') {
        console.log(it.toString());
      } else {
        console.log(JSON.stringify(it));
      }
    }
  }


  *paginate(array, pageSize = 10) {
    for (let i = 0; i < array.length; i += pageSize) {
      yield array.slice(i, i + pageSize);
    }
  }
}
