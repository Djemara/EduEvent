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
  
  // Si pa gen ID nan URL la, nou fòse li pran 1 de preferans olye l bay NaN
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
            <p style="font-size:3rem">🔍</p>
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
          <p>⚠️ Impossible de charger l'événement. Utilisez Live Server.</p>
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
       /* Bannière */
    const bannerImg = document.getElementById('banner-img');
    // Nou fòse imaj la pran 100% wotè banyè a (420px) san li pa kraze anyen
    bannerImg.innerHTML = `<img src="${evt.image}" alt="${evt.titre}" style="width:100%; height:100%; object-fit:cover; display:block;" onerror="this.style.display='none'"/>`;
    bannerImg.style.backgroundImage = '';
    
    // Nou chanje outerHTML pa innerHTML pou nou pa detwi bwat HTML la
    const badge = document.getElementById('banner-badge');
badge.textContent = evt.categorie;
badge.className = `card__badge badge--${evt.categorie}`;

    document.getElementById('banner-titre').textContent = evt.titre;
 
    const dateFormatee = new Date(evt.date).toLocaleDateString('fr-FR', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });
 
    document.getElementById('banner-meta').innerHTML = `
      <span>📅 ${dateFormatee}</span>
      <span>⏰ ${evt.heure}</span>
      <span>📍 ${evt.lieu}</span>
    `;
 
    /* Description */
    document.getElementById('detail-description').textContent = evt.description;
 
    /* Infos liste */
    document.getElementById('info-list').innerHTML = `
      <li class="info-item">
        <span class="info-item__icon">📅</span>
        <div>
          <span class="info-item__label">Date</span>
          <span class="info-item__value">${dateFormatee}</span>
        </div>
      </li>
      <li class="info-item">
        <span class="info-item__icon">⏰</span>
        <div>
          <span class="info-item__label">Heure</span>
          <span class="info-item__value">${evt.heure}</span>
        </div>
      </li>
      <li class="info-item">
        <span class="info-item__icon">📍</span>
        <div>
          <span class="info-item__label">Lieu</span>
          <span class="info-item__value">${evt.lieu}</span>
        </div>
      </li>
      <li class="info-item">
        <span class="info-item__icon">👤</span>
        <div>
          <span class="info-item__label">Organisateur</span>
          <span class="info-item__value">${evt.organisateur}</span>
        </div>
      </li>
      <li class="info-item">
        <span class="info-item__icon">🏷️</span>
        <div>
          <span class="info-item__label">Catégorie</span>
          <span class="info-item__value">${evt.categorie}</span>
        </div>
      </li>
    `;
 
    /* Compteur de places */
    const pct = Math.round((evt.places_restantes / evt.places_total) * 100);
    const urgent = evt.places_restantes <= 10;
 
    document.getElementById('places-fill').style.width = pct + '%';
    document.getElementById('places-fill').style.background =
      urgent ? 'var(--cat-sport)' : 'var(--color-primary)';
 
    document.getElementById('places-texte').innerHTML =
      urgent
        ? `<span style="color:var(--cat-sport);font-weight:700">⚠️ Plus que ${evt.places_restantes} places sur ${evt.places_total} !</span>`
        : `<span>${evt.places_restantes} places disponibles sur ${evt.places_total}</span>`;
  }
 
  /* ============================================================
     FORMULAIRE D'INSCRIPTION
  ============================================================ */
  function initInscription(evt) {
    const form = document.getElementById('inscription-form');
    const msg  = document.getElementById('ins-message');
 
    form.addEventListener('submit', (e) => {
      e.preventDefault();
 
      const nom      = document.getElementById('ins-nom').value.trim();
      const email    = document.getElementById('ins-email').value.trim();
      const faculte  = document.getElementById('ins-faculte').value;
      window.supprimerCommentaire = function(index) {
  const stockes = JSON.parse(localStorage.getItem('eduevent_commentaires_' + id) || '[]');
  stockes.splice(index, 1);
  localStorage.setItem('eduevent_commentaires_' + id, JSON.stringify(stockes));
  const tous = [...commentairesDefaut, ...stockes];
  afficherCommentaires(tous);
};
 
      /* Validation */
      if (!nom) {
        afficherMsg(msg, 'Veuillez entrer votre nom complet.', 'error');
        return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        afficherMsg(msg, 'Veuillez entrer une adresse email valide.', 'error');
        return;
      }
      if (!faculte) {
        afficherMsg(msg, 'Veuillez sélectionner votre faculté.', 'error');
        return;
      }
 
      /* Sauvegarder dans localStorage */
      const inscriptions = JSON.parse(localStorage.getItem('eduevent_inscriptions') || '[]');
      const dejaInscrit  = inscriptions.find(i => i.eventId === evt.id && i.email === email);
 
      if (dejaInscrit) {
        afficherMsg(msg, '⚠️ Vous êtes déjà inscrit à cet événement.', 'error');
        return;
      }
 
      inscriptions.push({
        eventId: evt.id,
        titre:   evt.titre,
        date:    evt.date,
        lieu:    evt.lieu,
        nom, email, faculte,
        inscritLe: new Date().toISOString()
      });
 
      localStorage.setItem('eduevent_inscriptions', JSON.stringify(inscriptions));
      afficherMsg(msg, '✅ Inscription confirmée ! Vous pouvez la retrouver dans votre profil.', 'success');
      form.reset();
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
      afficherMsg(msg, '✅ Commentaire publié avec succès !', 'success');
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
      fbBtn.addEventListener('click', (e) => {
        e.preventDefault();
        window.open(`https://facebook.com{urlUrl}`, '_blank');
      });
    }
 
    if (twBtn) {
      twBtn.addEventListener('click', (e) => {
        e.preventDefault();
        window.open(`https://twitter.com{urlUrl}&text=${tèksMesaj}`, '_blank');
      });
    }
 
    if (waBtn) {
      waBtn.addEventListener('click', (e) => {
        e.preventDefault();
        window.open(`https://whatsapp.com{tèksMesaj}%20${urlUrl}`, '_blank');
      });
      
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
  
 
})();
