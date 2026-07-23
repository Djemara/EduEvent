/* ============================================================
   evenements.js — EduEvent · Filtres, recherche & affichage
   ============================================================ */
 
(function () {
 
  /* ---- État global ---- */
  let tousLesEvenements = [];   
  let evenementsFiltres  = [];  
  let filtreCategorie    = 'tous';
  let filtreDate         = 'tous';
  let recherche          = '';
  let vueActuelle        = 'grille'; 
  const PAR_PAGE         = 6;
  let nbAffiches         = PAR_PAGE;
 
  /* ---- Guard : script uniquement sur evenements.html ---- */
  if (!document.getElementById("evenements-grid")) return;
 
  /* ---- Éléments DOM ---- */
  const grid          = document.getElementById('evenements-grid');
  const searchInput   = document.getElementById('search-input');
  const searchClear   = document.getElementById('search-clear');
  const countEl       = document.getElementById('resultats-count');
  const noResults     = document.getElementById('no-results');
  const loadMoreWrap  = document.getElementById('load-more-wrap');
  const loadMoreBtn   = document.getElementById('load-more');
  const vueGrilleBtn  = document.getElementById('vue-grille');
  const vueListeBtn   = document.getElementById('vue-liste');
  const resetBtn      = document.getElementById('reset-filtres');
  const noResultReset = document.getElementById('no-results-reset');
 
  /* ============================================================
     CHARGEMENT DES DONNÉES
  ============================================================ */
  fetch('data/evenements.json')
    .then(res => {
      if (!res.ok) throw new Error('Erreur réseau');
      return res.json();
    })
    .then(data => {
      tousLesEvenements = data;
      lireParamsURL();
      appliquerFiltres();
    })
    .catch(() => {
      grid.innerHTML = `
        <p style="grid-column:1/-1;text-align:center;padding:3rem;color:var(--color-text-muted)">
           Impossible de charger les événements. Assurez-vous d'utiliser un serveur local (Live Server).
        </p>`;
    });
 
  /* ============================================================
     LECTURE DES PARAMÈTRES URL (?cat=conference)
  ============================================================ */
  function lireParamsURL() {
    const params = new URLSearchParams(window.location.search);
    const cat = params.get('cat');
    if (cat) {
      filtreCategorie = cat;
      document.getElementById('filtre-categorie').value = cat;
    }
  }
 
  /* ============================================================
     APPLICATION DES FILTRES
  ============================================================ */
  function appliquerFiltres() {
    const maintenant   = new Date();
    const debutSemaine = new Date(maintenant);
    debutSemaine.setDate(maintenant.getDate() - maintenant.getDay());
    const finSemaine   = new Date(debutSemaine);
    finSemaine.setDate(debutSemaine.getDate() + 6);
 
    evenementsFiltres = tousLesEvenements.filter(evt => {
      const dateEvt = new Date(evt.date);
 
      // Filtre catégorie
      if (filtreCategorie !== 'tous' && evt.categorie !== filtreCategorie) return false;
 
      // Filtre date
      if (filtreDate === 'aujourd-hui') {
        if (dateEvt.toDateString() !== maintenant.toDateString()) return false;
      } else if (filtreDate === 'semaine') {
        if (dateEvt < debutSemaine || dateEvt > finSemaine) return false;
      } else if (filtreDate === 'mois') {
        if (
          dateEvt.getMonth()    !== maintenant.getMonth() ||
          dateEvt.getFullYear() !== maintenant.getFullYear()
        ) return false;
      }
 
      // Filtre recherche texte
      if (recherche) {
        const q = recherche.toLowerCase();
        const dans =
          evt.titre.toLowerCase()        +
          evt.description.toLowerCase()  +
          evt.lieu.toLowerCase()         +
          evt.organisateur.toLowerCase() +
          evt.tags.join(' ').toLowerCase();
        if (!dans.includes(q)) return false;
      }
 
      return true;
    });
 
    nbAffiches = PAR_PAGE;
    afficher();
  }
 
  /* ============================================================
     AFFICHAGE DES CARTES
  ============================================================ */
  function afficher() {
    const tranche = evenementsFiltres.slice(0, nbAffiches);
 
    // Mise à jour compteur
    countEl.textContent =
      evenementsFiltres.length === 0
        ? 'Aucun événement trouvé'
        : `${evenementsFiltres.length} événement${evenementsFiltres.length > 1 ? 's' : ''} trouvé${evenementsFiltres.length > 1 ? 's' : ''}`;
 
    // Aucun résultat
    if (evenementsFiltres.length === 0) {
      grid.innerHTML = '';
      noResults.classList.remove('hidden');
      loadMoreWrap.classList.add('hidden');
      return;
    }
 
    noResults.classList.add('hidden');
 
    // Construire les cartes
    grid.innerHTML = '';
    tranche.forEach((evt, i) => {
      const card = creerCarte(evt);
      card.classList.add('reveal');
      if (i < 3) card.classList.add('delay-' + ((i + 1) * 100));
      grid.appendChild(card);
    });
 
    // Appliquer la vue actuelle
    grid.classList.toggle('vue-liste', vueActuelle === 'liste');
 
    // Load more
    if (nbAffiches >= evenementsFiltres.length) {
      loadMoreWrap.classList.add('hidden');
    } else {
      loadMoreWrap.classList.remove('hidden');
      loadMoreBtn.textContent =
        `Charger plus (${evenementsFiltres.length - nbAffiches} restants)`;
    }
 
    // Animations reveal
    setTimeout(() => {
      document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
    }, 50);
  }
 
  /* ============================================================
     FABRIQUE DE CARTE
  ============================================================ */
  function creerCarte(evt) {
    const dateFormatee = new Date(evt.date).toLocaleDateString('fr-FR', {
      weekday: 'short', day: 'numeric', month: 'long', year: 'numeric'
    });
 
    const urgent = evt.places_restantes <= 10;
 
    const article = document.createElement('article');
    article.className = 'card';
    article.innerHTML = `
      <div class="card__image-wrap">
        <img
          src="${evt.image}"
          alt="${evt.titre}"
          loading="lazy"
          onerror="this.src='images/placeholder.jpg'"
        />
        <span class="card__badge badge--${evt.categorie}">${evt.categorie}</span>
      </div>
      <div class="card__body">
        <h3 class="card__title">${evt.titre}</h3>
        <div class="card__meta">
          <span> ${dateFormatee}</span>
          <span> ${evt.heure}</span>
          <span>${evt.lieu}</span>
          <span> ${evt.organisateur}</span>
        </div>
        <p class="card__places ${urgent ? 'urgent' : ''}">
          ${urgent
            ? ' Plus que ' + evt.places_restantes + ' places !'
            :  + evt.places_restantes + ' places disponibles'}
        </p>
      </div>
     <div class="card__footer">
  <a href="detail.html?id=${evt.id}" class="btn btn--primary">Voir les détails</a>
</div>

    `;
    return article;
  }
 
  /* ============================================================
     ÉVÉNEMENTS UI
  ============================================================ */
 
  /* -- Recherche en temps réel -- */
  searchInput.addEventListener('input', () => {
    recherche = searchInput.value.trim();
    searchClear.classList.toggle('visible', recherche.length > 0);
    appliquerFiltres();
  });
 
  searchClear.addEventListener('click', () => {
    searchInput.value = '';
    recherche = '';
    searchClear.classList.remove('visible');
    searchInput.focus();
    appliquerFiltres();
  });
 
  /* -- Filtre catégorie -- */
  document.getElementById('filtre-categorie').addEventListener('change', (e) => {
    filtreCategorie = e.target.value;
    appliquerFiltres();
  });
 
  /* -- Filtre date -- */
  document.getElementById('filtre-date').addEventListener('change', (e) => {
    filtreDate = e.target.value;
    appliquerFiltres();
  });
 
    /* -- Toggle vue grille / liste -- */
  const elGrille = document.getElementById('vue-grille');
  const elListe = document.getElementById('vue-liste');
  const elGrid = document.getElementById('evenements-grid');

  if (elGrille && elListe && elGrid) {
    elGrille.addEventListener('click', function() {
      vueActuelle = 'grille';
      elGrille.classList.add('vue-btn--active');
      elListe.classList.remove('vue-btn--active');
      elGrid.classList.remove('vue-liste');
      afficher(); // Sa a enpòtan pou rafrechi paj la
    });

    elListe.addEventListener('click', function() {
      vueActuelle = 'liste';
      elListe.classList.add('vue-btn--active');
      elGrille.classList.remove('vue-btn--active');
      elGrid.classList.add('vue-liste');
      afficher(); 
    });
  }


  if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', () => {
      nbAffiches += PAR_PAGE; 
      afficher();            
    });
  }

 /* ===== DARK MODE ===== */
(function initDarkMode() {
  const btn = document.getElementById('btn-darkmode');
  if (!btn) return;

  /* Restore preference */
  if (localStorage.getItem('eduevent_darkmode') === 'true') {
    document.body.classList.add('dark');
    btn.textContent = '☀️';
  }

  btn.addEventListener('click', () => {
    const isDark = document.body.classList.toggle('dark');
    btn.textContent = isDark ? '☀️' : '🌙';
    localStorage.setItem('eduevent_darkmode', isDark);
  });
})();
 
})();
