import DataManager from './managers/DataManager.js';

async function main() {
  const dm = new DataManager();

  console.log('Cargando datos desde JSONPlaceholder...');
  try {
    // carga robusta: maneja errores de red/validación dentro de DataManager
    await dm.loadAll();
    console.log('Datos cargados correctamente.');
  } catch (err) {
    console.error('Error al cargar datos:', err.message);
    return;
  }

  console.log(`Total usuarios válidos: ${dm.users.length}`);
  console.log(`Total publicaciones válidas: ${dm.posts.length}`);

  // -------------------------
  // 1) Buscar usuario por email
  // -------------------------
  const exampleEmail = 'Sincere@april.biz';
  const found = dm.findUserByEmail(exampleEmail);
  if (found) {
    console.log(`\nUsuario encontrado por email (${exampleEmail}):`);
    console.log(found.toString());
  } else {
    console.log(`\nNo se encontró usuario con email ${exampleEmail}`);
  }

  // -------------------------
  // 2) Listar posts de un usuario dado
  // -------------------------
  if (found) {
    const postsOfUser = dm.getPostsByUserId(found.id);
    dm.consoleListSummary(postsOfUser, { label: `Posts del usuario ${found.id} (${found.username})` });
  }

  // -------------------------
  // 3) Detección de duplicados por email o username
  // -------------------------
  console.log('\nDetección de duplicados (email / username):');
  const duplicates = dm.findDuplicateUsers();
  if (duplicates.length === 0) {
    console.log('No se detectaron duplicados.');
  } else {
    console.log('Duplicados encontrados:');
    console.log(JSON.stringify(duplicates, null, 2));
  }

  // -------------------------
  // 4) Conteo de posts por usuario y top 5
  // -------------------------
  console.log('\nConteo de posts por usuario (resumen, orden descendente):');
  const counts = dm.users.map(u => ({
    id: u.id,
    username: u.username,
    posts: (dm.userIdToPosts.get(u.id) || []).length
  }));
  counts.sort((a, b) => b.posts - a.posts);
  console.log(counts);

  console.log('\nTop 5 usuarios con más publicaciones:');
  const top5 = dm.topUsersByPostCount(5);
  top5.forEach((t, idx) => {
    console.log(`${idx + 1}. ${t.user.username} (id:${t.user.id}) - ${t.count} posts`);
  });

  // -------------------------
  // 5) Buscar posts por palabra clave (palabra exacta)
  // -------------------------
  const keyword = 'qui';
  const foundPosts = dm.searchPostsByKeyword(keyword);
  console.log(`\nPosts que contienen la palabra exacta '${keyword}' (total ${foundPosts.length}):`);
  dm.consoleListSummary(foundPosts, { label: `Resultados para '${keyword}'` });

  // -------------------------
  // 6) Usuarios sin publicaciones
  // -------------------------
  console.log('\nUsuarios sin publicaciones:');
  const noPostUsers = dm.usersWithoutPosts();
  if (noPostUsers.length === 0) {
    console.log('Todos los usuarios tienen al menos una publicación.');
  } else {
    dm.consoleListSummary(noPostUsers, { label: 'Usuarios sin posts' });
  }

  // -------------------------
  // 7) Proporción de publicaciones por usuario
  // -------------------------
  console.log('\nProporción de publicaciones por usuario respecto al total:');
  const proportions = dm.postProportionPerUser();
  // mostramos top 10 por claridad
  proportions.slice(0, 10).forEach(p => {
    console.log(`${p.user.username} (id:${p.user.id}) -> ${p.count} posts -> ${p.percent.toFixed(2)}%`);
  });

  // -------------------------
  // 8) Ciudad cuyo usuarios en promedio publican más
  // -------------------------
  const cityReport = dm.cityWithHighestAveragePostsPerUser();
  if (cityReport) {
    console.log('\nCiudad con mayor promedio de publicaciones por usuario:');
    console.log(`Ciudad: ${cityReport.city} - usuarios: ${cityReport.userCount} - avg posts/user: ${cityReport.avgPosts.toFixed(2)}`);
  } else {
    console.log('No se pudo calcular la ciudad con mayor promedio.');
  }

  // Ejemplo que demuestra timers/event loop: un log diferido que confirma que el resto ya corrió.
  setTimeout(() => {
    console.log('\n[Timer] Informe finalizado — este mensaje llegó usando setTimeout (demuestra event loop).');
  }, 250);

  // Terminamos
  console.log('\nDemo finalizada (index.js).');
}

main().catch(err => {
  console.error('Error inesperado en main:', err);
});
