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
     info   → (opcional) una lámina de texto al comienzo del proyecto:
              { text: 'Qué era, qué hiciste, cómo lo pensaste…', role: 'Diseño e ilustración', tools: 'Illustrator · Photoshop' }

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
      slides: ['img/nativo/01.jpg', 'img/nativo/02.jpg', 'img/nativo/03.jpg', 'img/nativo/04.jpg', 'img/nativo/05.jpg'], info: null },

    { slug: 'guess', title: 'Guess', tags: 'Motion · Placas', cat: 'fadu', year: '', color: '#376e66', cover: 'img/guess.jpg',
      slides: ['img/guess/01.jpg', 'img/guess/02.jpg'], info: null },

    { slug: 'remera', title: 'Remera', tags: 'Ilustración · Estampado', cat: 'trabajo', year: '', color: '#ff7300', cover: 'img/remera.jpg',
      slides: ['img/remera/01.jpg'], info: null },

    { slug: 'seryva', title: 'Seryva', tags: 'Fotografía · Producto', cat: 'trabajo', year: '', color: '#dd7f09', cover: 'img/seryva.jpg',
      slides: ['img/seryva/01.jpg', 'img/seryva/02.jpg', 'img/seryva/03.jpg', 'img/seryva/04.jpg', 'img/seryva/05.jpg', 'img/seryva/06.jpg', 'img/seryva/07.jpg', 'img/seryva/08.jpg', 'img/seryva/09.jpg', 'img/seryva/10.jpg'], info: null },

    { slug: 'peak', title: 'Estoy en mi peak', tags: 'Ilustración · Stickers', cat: 'fadu', year: '', color: '#ff48be', cover: 'img/peak.jpg',
      slides: ['img/peak/01.jpg', 'img/peak/02.jpg', 'img/peak/03.jpg', 'img/peak/04.jpg', 'img/peak/05.jpg', 'img/peak/06.jpg', 'img/peak/07.jpg', 'img/peak/08.jpg', 'img/peak/09.jpg'], info: null },

    { slug: 'tag', title: 'Tag', tags: 'Identidad · Festival', cat: 'fadu', year: '', color: '#dbae03', cover: 'img/tag.jpg',
      slides: ['img/tag/01.jpg', 'img/tag/02.jpg', 'img/tag/03.jpg', 'img/tag/04.jpg', 'img/tag/05.jpg', 'img/tag/06.jpg', 'img/tag/07.jpg', 'img/tag/08.jpg', 'img/tag/09.jpg'], info: null },

    { slug: 'postales', title: 'Postales tipográficas', tags: 'Tipografía · Editorial', cat: 'fadu', year: '', color: '#376e66', cover: 'img/postales.jpg',
      slides: ['img/postales/01.jpg', 'img/postales/02.jpg', 'img/postales/03.jpg', 'img/postales/04.jpg', 'img/postales/05.jpg', 'img/postales/06.jpg', 'img/postales/07.jpg', 'img/postales/08.jpg', 'img/postales/09.jpg', 'img/postales/10.jpg', 'img/postales/11.jpg', 'img/postales/12.jpg', 'img/postales/13.jpg', 'img/postales/14.jpg'], info: null },

    { slug: 'infografia', title: 'Infografía Longinotti', tags: 'Infografía · Datos', cat: 'fadu', year: '', color: '#5a2581', cover: 'img/infografia.jpg',
      slides: ['img/infografia/01.jpg', 'img/infografia/02.jpg'], info: null },

    { slug: 'luzbrambilla', title: 'Luz Brambilla', tags: 'Dirección de fotografía · Social media', cat: 'trabajo', year: '', color: '#ff2e8a', cover: 'img/luzbrambilla.jpg',
      slides: ['img/luzbrambilla/01.jpg', 'img/luzbrambilla/02.jpg', 'img/luzbrambilla/03.jpg', 'img/luzbrambilla/04.png', 'img/luzbrambilla/05.jpg', 'img/luzbrambilla/06.jpg', 'img/luzbrambilla/07.jpg', 'img/luzbrambilla/08.jpg', 'img/luzbrambilla/09.jpg', 'img/luzbrambilla/10.jpg', 'img/luzbrambilla/11.jpg', 'img/luzbrambilla/12.jpg', 'img/luzbrambilla/13.jpg', 'img/luzbrambilla/14.jpg', 'img/luzbrambilla/15.jpg', 'img/luzbrambilla/16.jpg', 'img/luzbrambilla/17.jpg', 'img/luzbrambilla/18.jpg', 'img/luzbrambilla/19.jpg', 'img/luzbrambilla/20.jpg'], info: null },

    { slug: 'nuveo', title: 'Nuveo', tags: 'Fotografía · Producto', cat: 'trabajo', year: '', color: '#4a7a96', cover: 'img/nuveo.jpg',
      slides: ['img/nuveo/01.jpg', 'img/nuveo/02.jpg', 'img/nuveo/03.jpg', 'img/nuveo/04.jpg', 'img/nuveo/05.jpg', 'img/nuveo/gif-abdomen.gif', 'img/nuveo/06.jpg', 'img/nuveo/07.jpg', 'img/nuveo/08.jpg', 'img/nuveo/09.jpg', 'img/nuveo/10.jpg', 'img/nuveo/11.jpg', 'img/nuveo/12.jpg', 'img/nuveo/13.jpg', 'img/nuveo/14.jpg', 'img/nuveo/15.jpg', 'img/nuveo/16.jpg', 'img/nuveo/17.jpg', 'img/nuveo/18.jpg', 'img/nuveo/19.jpg', 'img/nuveo/20.jpg', 'img/nuveo/21.jpg', 'img/nuveo/22.jpg', 'img/nuveo/23.jpg', 'img/nuveo/24.jpg', 'img/nuveo/gif-abdomengluteos.gif', 'img/nuveo/25.jpg', 'img/nuveo/26.jpg', 'img/nuveo/27.jpg', 'img/nuveo/28.jpg', 'img/nuveo/29.jpg', 'img/nuveo/30.jpg', 'img/nuveo/31.jpg', 'img/nuveo/32.jpg', 'img/nuveo/33.jpg', 'img/nuveo/34.jpg'], info: null },

  ],
};
