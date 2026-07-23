/* ============================================================
   detail.js — EduEvent · Détail événement
   ============================================================ */
 
(function () {
 
  /* ---- Guard ---- */
  if (!document.getElementById('detail-banner')) return;
 
  /* ---- Commentaires statiques par défaut ---- */
 const commentairesDefaut = [
    {
      nom: 'Marie Joseph',
      role: 'Étudiante L3 Informatique',
      texte: 'Je suis vraiment impatiente de participer à cet événement ! Le programme a l\'air très intéressant et enrichissant.',
      note: 5,
      date: '10 juillet 2026'
    },
    {
      nom: 'Pierre Louis',
      role: 'Professeur — FSG',
      texte: 'Je recommande vivement à tous mes étudiants de s\'inscrire. Ce type d\'événement est une excellente opportunité.',
      note: 5,
      date: '11 juillet 2026'
    },
    {
      nom: 'Carline Estimé',
      role: 'Étudiante L2 Sciences',
      texte: 'J\'ai déjà réservé ma place ! J\'espère que ce sera une expérience inoubliable pour toute la communauté.',
      note: 4,
      date: '12 juillet 2026'
    }
  ];
 
  /* ---- Note sélectionnée ---- */
  let noteSelectionnee = 0;
 
  /* ---- Lire l'ID dans l'URL ---- */
  const params = new URLSearchParams(window.location.search);
  
  const id = parseInt(params.get('id'), 10) || 1; 
 
  /* ---- Charger les données ---- */
  fetch('data/evenements.json')
    .then(res => {
      if (!res.ok) throw new Error('Erreur réseau');
      return res.json();
    })
    .then(data => {
      const evt = data.find(e => e.id === id);
      if (!evt) {
        document.querySelector('main').innerHTML = `
          <div style="text-align:center;padding:5rem 1rem;color:var(--color-text-muted)">
            <p style="font-size:3rem"></p>
            <h2>Événement introuvable</h2>
            <p>Cet événement n'existe pas ou a été supprimé.</p>
            <a href="evenements.html" class="btn btn--primary" style="margin-top:1.5rem;display:inline-flex">
              Voir tous les événements
            </a>
          </div>`;
        return;
      }
      afficherDetail(evt);
      initInscription(evt);
      initCommentaires();
      initPartage(evt);
      initEtoiles();
    })
    .catch(() => {
      document.querySelector('main').innerHTML = `
        <div style="text-align:center;padding:5rem 1rem;color:var(--color-text-muted)">
          <p> Impossible de charger l'événement. Utilisez Live Server.</p>
          <a href="evenements.html" class="btn btn--outline" style="margin-top:1rem;display:inline-flex">Retour</a>
        </div>`;
    });
 
  /* ============================================================
     AFFICHAGE DU DÉTAIL
  ============================================================ */
  function afficherDetail(evt) {
 
    /* Titre de la page */
    document.title = evt.titre + ' — EduEvent';
 
    /* Bannière */
       
    const bannerImg = document.getElementById('banner-img');
  
    bannerImg.innerHTML = `<img src="${evt.image}" alt="${evt.titre}" style="width:100%; height:100%; object-fit:cover; display:block;" onerror="this.style.display='none'"/>`;
    bannerImg.style.backgroundImage = '';
    
    const badgeContainer = document.getElementById('banner-badge');
    badgeContainer.style.display = "block";
    badgeContainer.style.width = "fit-content";
    badgeContainer.style.marginBottom = "15px";
    badgeContainer.innerHTML = `<span class="card__badge badge--${evt.categorie}" style="display:inline-block;">${evt.categorie}</span>`;

    document.getElementById('banner-titre').textContent = evt.titre;
 
    const dateFormatee = new Date(evt.date).toLocaleDateString('fr-FR', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });
 
    document.getElementById('banner-meta').innerHTML = `
      <span> ${dateFormatee}</span>
      <span> ${evt.heure}</span>
      <span>${evt.lieu}</span>
    `;
 
    /* Description */
    document.getElementById('detail-description').textContent = evt.description;
 
    /* Infos liste */
    document.getElementById('info-list').innerHTML = `
      <li class="info-item">
        <span class="info-item__icon"></span>
        <div>
          <span class="info-item__label">Date</span>
          <span class="info-item__value">${dateFormatee}</span>
        </div>
      </li>
      <li class="info-item">
        <span class="info-item__icon"></span>
        <div>
          <span class="info-item__label">Heure</span>
          <span class="info-item__value">${evt.heure}</span>
        </div>
      </li>
      <li class="info-item">
        <span class="info-item__icon"></span>
        <div>
          <span class="info-item__label">Lieu</span>
          <span class="info-item__value">${evt.lieu}</span>
        </div>
      </li>
      <li class="info-item">
        <span class="info-item__icon"></span>
        <div>
          <span class="info-item__label">Organisateur</span>
          <span class="info-item__value">${evt.organisateur}</span>
        </div>
      </li>
      <li class="info-item">
        <span class="info-item__icon"></span>
        <div>
          <span class="info-item__label">Catégorie</span>
          <span class="info-item__value">${evt.categorie}</span>
        </div>
      </li>
    `;
 
    /* Compteur de places */
const placesKey = 'eduevent_places_' + evt.id;
const placesActuelles = parseInt(localStorage.getItem(placesKey) || evt.places_restantes, 10);
const pct = Math.round((placesActuelles / evt.places_total) * 100);
const urgent = placesActuelles <= 10;

document.getElementById('places-fill').style.width = pct + '%';
document.getElementById('places-fill').style.background =
  urgent ? 'var(--cat-sport)' : 'var(--color-primary)';

document.getElementById('places-texte').innerHTML =
  urgent
    ? `<span style="color:var(--cat-sport);font-weight:700">⚠️ Plus que ${placesActuelles} places sur ${evt.places_total} !</span>`
    : `<span>${placesActuelles} places disponibles sur ${evt.places_total}</span>`;
  }
 
  /* ============================================================
     FORMULAIRE D'INSCRIPTION
  ============================================================ */
function initInscription(evt) {
  const form = document.getElementById('inscription-form');
  const msg  = document.getElementById('ins-message');
  const inputTelephone = document.getElementById('ins-telephone');

  /* 1. BLOKE LÈT NAN CHAN TELEFÒN NAN (An tan reyèl) */
  if (inputTelephone) {
    inputTelephone.addEventListener('input', (e) => {
      e.target.value = e.target.value.replace(/[^0-9+\s]/g, '');
    });
  }

  /* 2. JESTYON SUBMIT FÒMILÈ A */
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    /* Verifikasyon si événement pase deja */
    const dateEvt = new Date(evt.date);
    const jodi = new Date();
    jodi.setHours(0, 0, 0, 0);
    
    if (dateEvt < jodi) {
      afficherMsg(msg, ' Cet événement est déjà passé. Les inscriptions sont fermées.', 'error');
      return;
    }

    const nom      = document.getElementById('ins-nom').value.trim();
    const email    = document.getElementById('ins-email').value.trim();
    const faculte  = document.getElementById('ins-faculte').value;
    const telephone = inputTelephone ? inputTelephone.value.trim() : '';

    /* Validation */
    if (!nom || !email || !faculte) {
      afficherMsg(msg, 'Veuillez remplir tous les champs obligatoires.', 'error');
      return;
    }

    /* Sauvegarder dans localStorage */
    const inscriptions = JSON.parse(localStorage.getItem('eduevent_inscriptions') || '[]');
    const dejaInscrit  = inscriptions.find(i => i.eventId === evt.id && i.email === email);

    if (dejaInscrit) {
      afficherMsg(msg, ' Vous êtes déjà inscrit à cet événement.', 'error');
      return;
    }

    inscriptions.push({
      eventId: evt.id,
      titre:   evt.titre,
      date:    evt.date,
      lieu:    evt.lieu,
      nom, email, faculte, telephone,
      inscritLe: new Date().toISOString()
    });

    localStorage.setItem('eduevent_inscriptions', JSON.stringify(inscriptions));
    afficherMsg(msg, '✅ Inscription confirmée !', 'success');

    /* ============================================================
       3. JESTYON BOUTON PDF (KORIDJE POU L PA DOUBLE)
       ============================================================ */
    // A. Si yon ansyen bouton te la deja, nou efase l nèt pou kraze kach la
    const ansyenBtn = document.getElementById('btn-pdf-dynamique');
    if (ansyenBtn) {
      ansyenBtn.remove();
    }

    // B. Nou kreye nouvo bouton an ak yon ID fiks
    const btnPrint = document.createElement('button');
    btnPrint.id = 'btn-pdf-dynamique';
    btnPrint.className = 'btn btn--outline';
    btnPrint.style.marginTop = '1rem';
    btnPrint.style.width = '100%';
    btnPrint.style.justifyContent = 'center';
    btnPrint.textContent = '📄 Télécharger ma confirmation (PDF)';
    
   btnPrint.onclick = () => {
      const dateFormatee = new Date(evt.date).toLocaleDateString('fr-FR', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
      });


      const contenu = `
        <html>
        <head>
          <title>Confirmation — EduEvent</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: Arial, sans-serif; padding: 3rem; color: #1E293B; }
            .header { display: flex; align-items: center; gap: 1rem; margin-bottom: 2rem; border-bottom: 3px solid #1565C0; padding-bottom: 1rem; }
            .logo { font-size: 1.8rem; font-weight: bold; color: #1565C0; }
            .logo span { color: #F5C500; }
            .titre { font-size: 1.4rem; font-weight: bold; color: #1565C0; margin-bottom: 1.5rem; }
            .section { background: #F8FAFF; border-radius: 8px; padding: 1.5rem; margin-bottom: 1rem; border-left: 4px solid #1565C0; }
            .section h3 { font-size: 0.8rem; text-transform: uppercase; color: #64748B; margin-bottom: 0.8rem; letter-spacing: 0.1em; }
            .info { display: flex; gap: 1rem; margin-bottom: 0.5rem; font-size: 0.95rem; }
            .info strong { min-width: 120px; color: #1565C0; }
            .badge { display: inline-block; background: #1565C0; color: #fff; padding: 0.3rem 1rem; border-radius: 999px; font-size: 0.8rem; font-weight: bold; text-transform: uppercase; margin-bottom: 1rem; }
            .footer { margin-top: 2rem; text-align: center; font-size: 0.8rem; color: #94A3B8; border-top: 1px solid #E2E8F0; padding-top: 1rem; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">🎓 Edu<span>Event</span></div>
            <div>
              <div style="font-size:0.85rem;color:#64748B;">Campus Henry Christophe — UEH</div>
              <div style="font-size:0.85rem;color:#64748B;">Faculté des Sciences et de Génie</div>
            </div>
          </div>

          <p class="titre">✅ Confirmation d'inscription</p>
          <span class="badge">${evt.categorie}</span>

          <div class="section">
            <h3>Détails de l'événement</h3>
            <div class="info"><strong>Événement :</strong> <span>${evt.titre}</span></div>
            <div class="info"><strong>Date :</strong> <span>${dateFormatee}</span></div>
            <div class="info"><strong>Heure :</strong> <span>${evt.heure}</span></div>
            <div class="info"><strong>Lieu :</strong> <span>${evt.lieu}</span></div>
            <div class="info"><strong>Organisateur :</strong> <span>${evt.organisateur}</span></div>
          </div>

          <div class="section">
            <h3>Informations du participant</h3>
            <div class="info"><strong>Nom :</strong> <span>${nom}</span></div>
            <div class="info"><strong>Email :</strong> <span>${email}</span></div>
            <div class="info"><strong>Faculté :</strong> <span>${faculte}</span></div>
            <div class="info"><strong>Téléphone :</strong> <span>${telephone || 'Non renseigné'}</span></div>
          </div>

          <div class="footer">
            EduEvent — Campus Henry Christophe de Limonade · UEH · 2026<br/>
            Ce document confirme votre inscription à l'événement ci-dessus.
          </div>
        </body>
        </html>
      `;

      const fenetre = window.open('', '_blank');
      fenetre.document.write(contenu);
      fenetre.document.close();
      fenetre.setTimeout(() => {
        fenetre.print();
        fenetre.close();
      }, 500);
    };

    msg.parentElement.appendChild(btnPrint);
    form.reset(); // <--- MWEN REMETE LIY LI VID KÒMIFO A ISIT LA POU PA GEN CACHE !

    /* ============================================================
       4. DIMINYE PLACES RESTANTES
       ============================================================ */
    const placesKey = 'eduevent_places_' + evt.id;
    const placesActuelles = parseInt(localStorage.getItem(placesKey) || evt.places_restantes, 10);
    if (placesActuelles > 0) {
      localStorage.setItem(placesKey, placesActuelles - 1);
      const nouvellesPlaces = placesActuelles - 1;
      const urgent = nouvellesPlaces <= 10;
      document.getElementById('places-texte').innerHTML = urgent
        ? `<span style="color:var(--cat-sport);font-weight:700">⚠️ Plus que ${nouvellesPlaces} places sur ${evt.places_total} !</span>`
        : `<span>${nouvellesPlaces} places disponibles sur ${evt.places_total}</span>`;
      const pct = Math.round((nouvellesPlaces / evt.places_total) * 100);
      document.getElementById('places-fill').style.width = pct + '%';
    }
  });
}


 
  /* ============================================================
     COMMENTAIRES
  ============================================================ */
  function initCommentaires() {
    /* Charger depuis localStorage + défaut */
    const stockes = JSON.parse(localStorage.getItem('eduevent_commentaires_' + id) || '[]');
    const tous = [...commentairesDefaut, ...stockes];
    afficherCommentaires(tous);
 
    /* Formulaire commentaire */
    const form = document.getElementById('commentaire-form');
    const msg  = document.getElementById('com-message');
 
    form.addEventListener('submit', (e) => {
      e.preventDefault();
 
      const nom   = document.getElementById('com-nom').value.trim();
      const role  = document.getElementById('com-role').value.trim();
      const texte = document.getElementById('com-texte').value.trim();
      const note  = noteSelectionnee;
 
      if (!nom) {
        afficherMsg(msg, 'Veuillez entrer votre nom.', 'error');
        return;
      }
      if (!texte) {
        afficherMsg(msg, 'Veuillez écrire un commentaire.', 'error');
        return;
      }
      if (note === 0) {
        afficherMsg(msg, 'Veuillez sélectionner une note.', 'error');
        return;
      }
 
      const nouveau = {
        nom, role: role || 'Participant',
        texte, note,
        date: new Date().toLocaleDateString('fr-FR')
      };
 
      const stockes = JSON.parse(localStorage.getItem('eduevent_commentaires_' + id) || '[]');
      stockes.push(nouveau);
      localStorage.setItem('eduevent_commentaires_' + id, JSON.stringify(stockes));
 
      const tous = [...commentairesDefaut, ...stockes];
      afficherCommentaires(tous);
      afficherMsg(msg, ' Commentaire publié avec succès !', 'success');
      form.reset();
      noteSelectionnee = 0;
      document.querySelectorAll('.etoile').forEach(e => e.classList.remove('active'));
    });
  }
 
 function afficherCommentaires(liste) {
  const container = document.getElementById('commentaires-liste');
  const stockes = JSON.parse(localStorage.getItem('eduevent_commentaires_' + id) || '[]');
  
  container.innerHTML = liste.map((c, index) => {
    const estStocke = index >= commentairesDefaut.length;
    const indexStocke = index - commentairesDefaut.length;
    
    return `
      <div class="commentaire" id="com-${index}">
        <div class="commentaire__header">
          <div class="commentaire__avatar">${c.nom.charAt(0).toUpperCase()}</div>
          <div style="flex:1">
            <p class="commentaire__nom">${c.nom}</p>
            <p class="commentaire__role">${c.role || 'Participant'}</p>
          </div>
          <div class="commentaire__note">${'★'.repeat(c.note)}${'☆'.repeat(5 - c.note)}</div>
        </div>
        <p class="commentaire__texte">${c.texte}</p>
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <p class="commentaire__date">${c.date}</p>
          ${estStocke ? `
            <button onclick="supprimerCommentaire(${indexStocke})" 
              style="background:none;border:none;color:#EF4444;cursor:pointer;font-size:0.82rem;font-weight:600;">
              🗑️ Supprimer
            </button>
          ` : ''}
        </div>
      </div>
    `;
  }).join('');
}

window.supprimerCommentaire = function(indexStocke) {
  const stockes = JSON.parse(localStorage.getItem('eduevent_commentaires_' + id) || '[]');
  if (indexStocke < 0 || indexStocke >= stockes.length) return;
  stockes.splice(indexStocke, 1);
  localStorage.setItem('eduevent_commentaires_' + id, JSON.stringify(stockes));
  const nouveauStockes = JSON.parse(localStorage.getItem('eduevent_commentaires_' + id) || '[]');
  const tous = [...commentairesDefaut, ...nouveauStockes];
  afficherCommentaires(tous);
};
 
  /* ============================================================
     ÉTOILES DE NOTE
  ============================================================ */
  function initEtoiles() {
    const etoiles = document.querySelectorAll('.etoile');
    etoiles.forEach(etoile => {
      etoile.addEventListener('click', () => {
        noteSelectionnee = parseInt(etoile.dataset.val, 10);
        etoiles.forEach(e => {
          e.classList.toggle('active', parseInt(e.dataset.val, 10) <= noteSelectionnee);
        });
        document.getElementById('com-note').value = noteSelectionnee;
      });
 
      etoile.addEventListener('mouseover', () => {
        const val = parseInt(etoile.dataset.val, 10);
        etoiles.forEach(e => {
          e.classList.toggle('hover', parseInt(e.dataset.val, 10) <= val);
        });
      });
 
      etoile.addEventListener('mouseout', () => {
        etoiles.forEach(e => e.classList.remove('hover'));
      });
    });
  }
 
  /* ============================================================
     PARTAGE RÉSEAUX SOCIAUX
  ============================================================ */
 function initPartage(evt) {
  const fbBtn = document.getElementById('share-fb');
  const twBtn = document.getElementById('share-tw');
  const waBtn = document.getElementById('share-wa');

  const urlUrl = encodeURIComponent(window.location.href);
  const tèksMesaj = encodeURIComponent(`Inscris-toi à l'événement : ${evt.titre}`);

  if (fbBtn) {
    fbBtn.href = `https://www.facebook.com/sharer/sharer.php?u=${urlUrl}`;
    fbBtn.target = '_blank';
  }

  if (twBtn) {
    twBtn.href = `https://twitter.com/intent/tweet?text=${tèksMesaj}&url=${urlUrl}`;
    twBtn.target = '_blank';
  }

  if (waBtn) {
    waBtn.href = `https://wa.me/?text=${tèksMesaj}%20${urlUrl}`;
    waBtn.target = '_blank';
  }
}

 
  /* ============================================================
     UTILITAIRE
  ============================================================ */
  function afficherMsg(el, texte, type) {
    el.textContent = texte;
    el.className = 'form-message ' + type;
    setTimeout(() => { el.textContent = ''; el.className = 'form-message'; }, 5000);
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
