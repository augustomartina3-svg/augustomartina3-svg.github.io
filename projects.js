/* ============================================================
   TUS PROYECTOS — este es el único archivo que hace falta editar.

   Cada proyecto:
     slug   → nombre de la carpeta de imágenes (img/<slug>/01.jpg, 02.jpg…)
     title  → título que se ve en grande
     tags   → línea corta debajo del título (separada con " · ")
     cat    → carpeta a la que pertenece: 'fadu' | 'trabajo' | 'personal'
     year   → año (opcional)
     color  → color del proyecto (hex): tiñe el brillo y la barra de progreso
     cover  → portada, vertical 3:4 (por ejemplo 900×1200)
     slides → las imágenes del proyecto, en orden (la primera es la portada grande)
              también puede ir un video propio ('img/<slug>/video.mp4', se reproduce solo y en loop) un diseño embebido { embed: '<url del iframe>', ratio: '16/9' } o un reel o un post de Instagram: { reel: 'https://www.instagram.com/reel/…/' } o { ig: 'https://www.instagram.com/p/…/' }
     info   → (opcional) una lámina de texto al comienzo del proyecto:
              { text: 'Qué era, qué hiciste, cómo lo pensaste…', product: 'Qué es el producto (opcional)', image: 'img/<slug>/moodboard.jpg (opcional, va al lado del texto)', imageLabel: 'Moodboard', role: 'Diseño e ilustración', tools: 'Illustrator · Photoshop' }

   Para sumar un proyecto: copiá un bloque, cambiá los datos y guardá tus imágenes en img/<slug>/.
   Para ocultar uno: borralo o ponele  hidden: true.
   ============================================================ */
window.PORTFOLIO = {
  categories: [
    { id: 'fadu', name: 'FADU' },
    { id: 'trabajo', name: 'Trabajo' },
    { id: 'personal', name: 'Personales' },   // aparece solo cuando tenga proyectos
  ],
  projects: [
    { slug: 'nativo', title: 'Centro nativo', tags: 'Redes · Editorial', cat: 'trabajo', year: '', color: '#a2bc14', cover: 'img/nativo.jpg',
      slides: ['img/nativo/01.jpg', 'img/nativo/02.jpg', 'img/nativo/03.gif', 'img/nativo/04.gif', 'img/nativo/05.jpg', 'img/nativo/06.jpg', 'img/nativo/07.gif', 'img/nativo/temporada-de-flores.mp4', 'img/nativo/flores-nativas.mp4', { embed: 'https://drive.google.com/file/d/13rH7nV_xwkKEgMWFf4j3uP_OGEFOAUB_/preview', ratio: '9/16' }, { embed: 'https://drive.google.com/file/d/1HqHbuC8DSVQwcMijjnUYqypiePZxiJfa/preview', ratio: '9/16' }, { embed: 'https://drive.google.com/file/d/1SfHLGUQVs8Mp5ADOCWIC6V_HdySCuThC/preview', ratio: '9/16' }, { embed: 'https://drive.google.com/file/d/1KqxeVxtV2M3Mh7ge3NLdKRBBYC2PiOas/preview', ratio: '9/16' }, 'img/nativo/08.jpg', 'img/nativo/09.jpg', 'img/nativo/10.jpg', 'img/nativo/11.jpg', 'img/nativo/12.jpg', 'img/nativo/13.jpg', 'img/nativo/14.jpg', 'img/nativo/15.jpg', 'img/nativo/16.jpg', 'img/nativo/17.jpg', 'img/nativo/18.jpg', 'img/nativo/19.jpg', 'img/nativo/20.jpg', 'img/nativo/21.jpg', 'img/nativo/22.jpg'], info: null },

    { slug: 'guess', title: 'Guess', tags: 'Motion · Placas', cat: 'fadu', year: '', color: '#376e66', cover: 'img/guess.jpg',
      slides: ['img/guess/01.gif', 'img/guess/02.jpg', ['img/guess/03a.png', 'img/guess/03b.png', 'img/guess/03c.png'], 'img/guess/04.jpg'], info: null },

    { slug: 'remera', title: 'Remera', tags: 'Ilustración · Estampado', cat: 'trabajo', year: '', color: '#ff7300', cover: 'img/remera.jpg',
      slides: ['img/remera/01.jpg'], info: null },

    { slug: 'abu', title: 'abu', tags: 'Identidad · Packaging', cat: 'trabajo', year: '', color: '#4b1030', cover: 'img/abu.jpg',
      slides: ['img/abu/08.jpg', 'img/abu/02.jpg', 'img/abu/05.jpg', 'img/abu/09.jpg', 'img/abu/10.jpg'],
      info: { text: 'Crear la identidad y el packaging de abu, una marca de gomitas para el sistema linfático pensada para adultos mayores. El desafío era hablarle a ese público sin caer en lo clínico ni en lo aburrido: los abuelos siempre están buscando que alguien los ayude, y abu es la respuesta, con picardía, ternura, autonomía y honestidad. El envase está inspirado en las carameleras antiguas y, con su «Movete un poco», invita a dejar la vida sedentaria atrás.', product: 'Gomitas sin azúcar que ayudan a evitar la linfa lenta y la retención de líquidos: dos por día para un drenaje correcto.', role: 'Identidad · Packaging', image: 'img/abu/07.jpg', imageLabel: 'Moodboard' } },

    { slug: 'peak', title: 'Estoy en mi peak', tags: 'Sistema de identidad visual · Playlist', cat: 'fadu', year: '', color: '#ff48be', cover: 'img/peak.jpg',
      slides: ['img/peak/01.jpg', 'img/peak/02.jpg', 'img/peak/03.jpg', 'img/peak/04.jpg', 'img/peak/05.jpg', 'img/peak/06.jpg', 'img/peak/07.jpg', 'img/peak/08.jpg', 'img/peak/09.jpg'],
      info: { text: 'Un sistema de identidad visual construido a partir de una playlist de Bad Bunny. Cada canción se vuelve una pieza: tarjetones con su código de Spotify, stickers, afiche, tríptico y sobre, unidos por la misma paleta, el collage y la tipografía.', role: 'Identidad visual · Ilustración · Diseño editorial' } },

    { slug: 'tag', title: 'Tag', tags: 'Identidad · Festival', cat: 'fadu', year: '', color: '#dbae03', cover: 'img/tag.jpg',
      slides: ['img/tag/01.jpg', 'img/tag/02.jpg', 'img/tag/03.jpg', 'img/tag/04.jpg', 'img/tag/05.jpg', 'img/tag/06.jpg', 'img/tag/07.jpg', 'img/tag/08.jpg', 'img/tag/09.jpg'], info: null },

    { slug: 'postales', title: 'Postales tipográficas', tags: 'Tipografía · Editorial', cat: 'fadu', year: '', color: '#376e66', cover: 'img/postales.jpg',
      slides: ['img/postales/01.jpg', 'img/postales/02.jpg', 'img/postales/03.jpg', 'img/postales/04.jpg', 'img/postales/05.jpg', 'img/postales/06.jpg', 'img/postales/07.jpg', 'img/postales/08.jpg', 'img/postales/09.jpg', 'img/postales/10.jpg', 'img/postales/11.jpg', 'img/postales/12.jpg', 'img/postales/13.jpg', 'img/postales/14.jpg'], info: null },

    { slug: 'infografia', title: 'Infografía Longinotti', tags: 'Infografía · Datos', cat: 'fadu', year: '', color: '#5a2581', cover: 'img/infografia.jpg',
      slides: ['img/infografia/01.jpg', 'img/infografia/02.jpg'], info: null },

    { slug: 'luzbrambilla', title: 'Luz Brambilla', tags: 'Dirección de fotografía · Social media', cat: 'trabajo', year: '', color: '#ff2e8a', cover: 'img/luzbrambilla.jpg',
      slides: ['img/luzbrambilla/01.jpg', 'img/luzbrambilla/02.jpg', 'img/luzbrambilla/03.jpg', 'img/luzbrambilla/04.png', 'img/luzbrambilla/05.jpg', 'img/luzbrambilla/06.jpg', 'img/luzbrambilla/07.jpg', 'img/luzbrambilla/08.jpg', 'img/luzbrambilla/09.jpg', 'img/luzbrambilla/10.jpg', 'img/luzbrambilla/11.jpg', 'img/luzbrambilla/12.jpg', 'img/luzbrambilla/13.jpg', 'img/luzbrambilla/14.jpg', 'img/luzbrambilla/15.jpg', 'img/luzbrambilla/16.jpg', 'img/luzbrambilla/17.jpg', 'img/luzbrambilla/18.jpg', 'img/luzbrambilla/19.jpg', 'img/luzbrambilla/20.jpg'], info: null },

    { slug: 'nuveo', title: 'Nuveo', tags: 'Generación de imágenes con IA · Fotoproducto', cat: 'trabajo', year: '', color: '#4a7a96', cover: 'img/nuveo.jpg',
      slides: ['img/nuveo/01.jpg', 'img/nuveo/02.jpg', 'img/nuveo/03.jpg', 'img/nuveo/04.jpg', 'img/nuveo/05.jpg', 'img/nuveo/gif-abdomen.gif', 'img/nuveo/06.jpg', 'img/nuveo/07.jpg', 'img/nuveo/08.jpg', 'img/nuveo/09.jpg', 'img/nuveo/10.jpg', 'img/nuveo/11.jpg', 'img/nuveo/12.jpg', 'img/nuveo/13.jpg', 'img/nuveo/14.jpg', 'img/nuveo/15.jpg', 'img/nuveo/16.jpg', 'img/nuveo/17.jpg', 'img/nuveo/18.jpg', 'img/nuveo/19.jpg', 'img/nuveo/20.jpg', 'img/nuveo/21.jpg', 'img/nuveo/22.jpg', 'img/nuveo/23.jpg', 'img/nuveo/24.jpg', 'img/nuveo/gif-abdomengluteos.gif', 'img/nuveo/30.jpg', 'img/nuveo/31.jpg', 'img/nuveo/32.jpg', 'img/nuveo/33.jpg', 'img/nuveo/34.jpg'], info: null },

    { slug: 'chandrayoga', title: 'Chandra Yoga', tags: 'Diseño editorial · Social media', cat: 'trabajo', year: '', color: '#d6301f', cover: 'img/chandrayoga.jpg',
      slides: ['img/chandrayoga/01.gif', 'img/chandrayoga/02.jpg', 'img/chandrayoga/03.jpg', 'img/chandrayoga/04.jpg', 'img/chandrayoga/05.jpg', 'img/chandrayoga/06.jpg', 'img/chandrayoga/07.jpg'],
      info: { text: 'La identidad de Chandra Yoga era en blanco y negro: le sumé color. Con esa nueva paleta diseñé el folleto, lo preparé para impresión y después lo adapté a social media: logo animado, placas para el feed de Instagram e historias.', role: 'Color para la identidad visual · Diseño del folleto · Preparación para impresión · Adaptación a social media' } },

    { slug: 'laferrere', title: 'Deportivo Laferrere', tags: 'Fotografía deportiva · Reel', cat: 'trabajo', year: '', color: '#1f7a3e', cover: 'img/laferrere.jpg',
      slides: ['img/laferrere/01.jpg', { reel: 'https://www.instagram.com/reel/DeNuAvdxv05/' }, { embed: 'https://drive.google.com/file/d/1L6gKNnFlpz99IZA8fjE9lnugjp57Q_cd/preview', ratio: '9/16' }, { embed: 'https://drive.google.com/file/d/1r67UU9yAjXalKCF8w8jz09dhQyET8R-L/preview', ratio: '9/16' }, 'img/laferrere/02.jpg', 'img/laferrere/03.jpg', 'img/laferrere/04.jpg', 'img/laferrere/05.jpg', 'img/laferrere/06.jpg', 'img/laferrere/07.jpg', 'img/laferrere/08.jpg'],
      info: { text: 'Fotografié al equipo de vóley del Club Deportivo Laferrere durante la entrada en calor, los partidos y los festejos, y edité el reel para sus redes.', role: 'Fotografía · Edición de reel', tools: 'iPhone 15 Pro' } },

    { slug: 'lamatanza', title: 'Municipio de La Matanza', tags: 'Diseño gráfico institucional · Social media', cat: 'trabajo', year: '', color: '#293e75', cover: 'img/lamatanza.jpg',
      slides: ['img/lamatanza/01.jpg', 'img/lamatanza/02.jpg', 'img/lamatanza/03.jpg', 'img/lamatanza/04.jpg', 'img/lamatanza/05.jpg', 'img/lamatanza/06.jpg', ['img/lamatanza/07-1.jpg', 'img/lamatanza/07-2.jpg', 'img/lamatanza/07-3.jpg', 'img/lamatanza/07-4.jpg'], ['img/lamatanza/08-1.jpg', 'img/lamatanza/08-2.jpg', 'img/lamatanza/08-3.jpg'], 'img/lamatanza/viveros-carrusel.mp4', 'img/lamatanza/jornada-plantacion-las-estrellas.mp4', 'img/lamatanza/jornada-forestacion-escuela.mp4', { embed: 'https://new.express.adobe.com/embedLink/urn:aaid:sc:US:df95390a-dc4d-507e-b55b-791653a440aa?promoid=Y69SGM5H&sdid=C4SZ2FYJ&mv=other', ratio: '16/9' }, { ig: 'https://www.instagram.com/p/Ddb0ixclLJn/' }, { ig: 'https://www.instagram.com/p/DdrU-2ulD5H/' }, { ig: 'https://www.instagram.com/p/Dd1kKDJlLaK/' }],
      info: { text: 'Piezas de comunicación ambiental para las redes del Municipio de La Matanza: convocatorias a plantaciones y jornadas, coberturas de eventos y carruseles informativos, diseñadas bajo las directrices de la identidad visual institucional del municipio.', role: 'Diseño gráfico institucional bajo directrices de marca · Social media' } },
  ],
};
