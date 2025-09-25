// main.js
import { loadAllData } from './fetchers.js';
import { usersWithIncompleteAddresses, companyWithMostUsers, topCommenters, duplicateComments, commentsContainingKeyword, userWithMostAlbums, avgAlbumsPerUser, inactiveUsers, commentProportions, cityWithMostComments } from './analytics.js';

async function main() {
  try {
    console.log('Carga');
    const { users, invalidUsers, comments, invalidComments, albums, invalidAlbums } = await loadAllData();

    console.log('validaciones');
    console.log(`usuarios validos: ${users.length}, invalidos: ${invalidUsers.length}`);
    console.log(`comentarios validos: ${comments.length}, invalidos: ${invalidComments.length}`);
    console.log(`albums validos: ${albums.length}, invalidos: ${invalidAlbums.length}`);

    console.log('ussuarios con direcciones incompletas:', usersWithIncompleteAddresses(users));
    console.log('Compania con más usuarios:', companyWithMostUsers(users));
    console.log('top 5 comentaridstas:', topCommenters(comments, users, 5));
    console.log('comentarios duplicados:', duplicateComments(comments).length);
    console.log('comentarios que contienen "dolor":', commentsContainingKeyword(comments, 'dolor').length);
    console.log('usuario con mas aslbumes:', userWithMostAlbums(albums, users));
    console.log('promedio de albumes por usuario:', avgAlbumsPerUser(albums, users));
    console.log('susuarios inactivos:', inactiveUsers(users, albums, comments).length);
    console.log('ranking porcentual de comentarios:', commentProportions(comments, users).slice(0,5));
    console.log('ciudad con mas comentarios:', cityWithMostComments(comments, users));

  } catch (err) {
    console.error('rrror al generar reporte:', err);
  }
}

main();
