import DataManager from './managers/DataManager.js';

async function main() {
  const dm = new DataManager();

  console.log('Cargando datos desde JSONPlaceholder...');
  try {
    await dm.loadAll();
    console.log('Datos cargados correctamente.');
  } catch (err) {
    console.error('Error al cargar datos:', err.message);
    return;
  }

  console.log(`Total usuarios: ${dm.users.length}`);
  console.log(`Total posts: ${dm.posts.length}`);

  // 1) Buscar usuario por email (ejemplo con email conocido de JSONPlaceholder)
  const exampleEmail = 'Sincere@april.biz'; // un email real del dataset de ejemplo
  const found = dm.findUserByEmail(exampleEmail);
  if (found) {
    console.log(`\nUsuario encontrado por email (${exampleEmail}):`);
    console.log(found.toString());
  } else {
    console.log(`\nNo se encontró usuario con email ${exampleEmail}`);
  }

  // 2) Listar posts de un usuario dado
  if (found) {
    const postsOfUser = dm.getPostsByUserId(found.id);
    dm.consoleListSummary(postsOfUser, { label: `Posts del usuario ${found.id} (${found.username})` });
  }

  // 3) Mapeo usuario -> posts (mostramos counts por usuario)
  console.log('\nConteo de posts por usuario (resumen):');
  const counts = dm.users.map(u => ({
    id: u.id,
    username: u.username,
    posts: (dm.userIdToPosts.get(u.id) || []).length
  }));
  counts.sort((a, b) => b.posts - a.posts);
  console.log(counts);

  // 4) Top 3 usuarios con más posts
  console.log('\nTop 3 usuarios con más publicaciones:');
  const top3 = dm.topUsersByPostCount(3);
  top3.forEach((t, idx) => {
    console.log(`${idx + 1}. ${t.user.username} (id:${t.user.id}) - ${t.count} posts`);
  });

  // 5) Buscar posts por palabra clave (ejemplo: 'qui')
  const keyword = 'qui';
  const foundPosts = dm.searchPostsByKeyword(keyword);
  console.log(`\nPosts que contienen la palabra exacta '${keyword}' (total ${foundPosts.length}):`);
  dm.consoleListSummary(foundPosts, { label: `Resultados para '${keyword}'` });

  console.log('\nDemo finalizada.');
}

main();
