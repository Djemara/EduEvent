/* ============================================================
   profil.js — EduEvent · Gestion profil & localStorage
   ============================================================ */
 
(function () {
 
  /* ---- Guard ---- */
  if (!document.getElementById('vue-auth')) return;
 
  /* ---- Éléments DOM ---- */
  const vueAuth       = document.getElementById('vue-auth');
  const vueProfil     = document.getElementById('vue-profil');
  const cardConnexion = document.getElementById('card-connexion');
  const cardInscript  = document.getElementById('card-inscription');
 
  /* ============================================================
     VÉRIFIER SI DÉJÀ CONNECTÉ
  ============================================================ */
  const etudiantConnecte = JSON.parse(localStorage.getItem('eduevent_utilisateur') || 'null');
  if (etudiantConnecte) {
    afficherProfil(etudiantConnecte);
  }
 
  /* ============================================================
     TOGGLE CONNEXION / INSCRIPTION
  ============================================================ */
  document.getElementById('vers-inscription').addEventListener('click', () => {
    cardConnexion.classList.add('hidden');
    cardInscript.classList.remove('hidden');
  });
 
  document.getElementById('vers-connexion').addEventListener('click', () => {
    cardInscript.classList.add('hidden');
    cardConnexion.classList.remove('hidden');
  });
 
  /* ============================================================
     TOGGLE MOT DE PASSE
  ============================================================ */
    /* ============================================================
     TOGGLE MOT DE PASSE (Version corrigée sans NaN)
  ============================================================ */
  document.querySelectorAll('.toggle-password').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-password-target') || btn.dataset.target;
      const input = document.getElementById(targetId);
      
      if (input) {
        if (input.type === 'password') {
          input.type = 'text';
          btn.textContent = '🙈';
        } else {
          input.type = 'password';
          btn.textContent = '👁';
        }
      }
    });
  });

 
  /* ============================================================
     FORMULAIRE CONNEXION
  ============================================================ */
  document.getElementById('form-connexion').addEventListener('submit', (e) => {
    e.preventDefault();
 
    const email    = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    const msg      = document.getElementById('login-message');
 
    if (!email || !password) {
      afficherMsg(msg, 'Veuillez remplir tous les champs.', 'error');
      return;
    }
 
    /* Chercher l'utilisateur dans localStorage */
    const comptes = JSON.parse(localStorage.getItem('eduevent_comptes') || '[]');
    const compte  = comptes.find(c => c.email === email && c.password === password);
 
    if (!compte) {
      afficherMsg(msg, '❌ Vous n\'avez pas encore de compte, veuillez d\'abord vous inscrire .', 'error');
      return;
    }
 
    /* Connexion réussie */
    localStorage.setItem('eduevent_utilisateur', JSON.stringify(compte));
    afficherMsg(msg, '✅ Connexion réussie !', 'success');
    setTimeout(() => afficherProfil(compte), 800);
  });
 
  /* ============================================================
     FORMULAIRE INSCRIPTION
  ============================================================ */
  document.getElementById('form-inscription').addEventListener('submit', (e) => {
    e.preventDefault();
 
    const prenom    = document.getElementById('reg-prenom').value.trim();
    const nom       = document.getElementById('reg-nom').value.trim();
    const email     = document.getElementById('reg-email').value.trim();
    const faculte   = document.getElementById('reg-faculte').value;
    const programme = document.getElementById('reg-programme').value.trim();
    const niveau    = document.getElementById('reg-niveau').value;
    const password  = document.getElementById('reg-password').value;
    const msg       = document.getElementById('reg-message');
 
    /* Validation */
    if (!prenom || !nom || !email || !faculte || !programme || !niveau || !password) {
      afficherMsg(msg, 'Veuillez remplir tous les champs obligatoires.', 'error');
      return;
    }
 
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      afficherMsg(msg, 'Adresse email invalide.', 'error');
      return;
    }
 
    if (password.length < 6) {
      afficherMsg(msg, 'Le mot de passe doit contenir au moins 6 caractères.', 'error');
      return;
    }
 
    /* Vérifier si email déjà utilisé */
    const comptes = JSON.parse(localStorage.getItem('eduevent_comptes') || '[]');
    if (comptes.find(c => c.email === email)) {
      afficherMsg(msg, '⚠️ Cet email est déjà utilisé.', 'error');
      return;
    }
 
    /* Créer le compte */
    const nouveauCompte = {
      prenom, nom, email, faculte, programme, niveau, password,
      creeLe: new Date().toISOString()
    };
 
    comptes.push(nouveauCompte);
    localStorage.setItem('eduevent_comptes', JSON.stringify(comptes));
    localStorage.setItem('eduevent_utilisateur', JSON.stringify(nouveauCompte));
 
    afficherMsg(msg, '✅ Compte créé avec succès !', 'success');
    setTimeout(() => afficherProfil(nouveauCompte), 800);
  });
 
  /* ============================================================
     AFFICHER LE PROFIL
  ============================================================ */
  function afficherProfil(etudiant) {
    vueAuth.classList.add('hidden');
    vueProfil.classList.remove('hidden');
 
    /* Avatar */
    const initiale = (etudiant.prenom || etudiant.nom || 'E').charAt(0).toUpperCase();
    document.getElementById('profil-avatar').textContent = initiale;
 
  /* Infos */
const prenomFormate = (etudiant.prenom || '').charAt(0).toUpperCase() + (etudiant.prenom || '').slice(1).toLowerCase();

document.getElementById('profil-nom').textContent =
  prenomFormate + ' ' + (etudiant.nom || '').toUpperCase();
document.getElementById('profil-detail').textContent =
  `${etudiant.faculte || ''} · ${etudiant.programme || ''} · ${etudiant.niveau || ''}`;
document.getElementById('profil-email').textContent = etudiant.email || '';

const profilPass = document.getElementById('profil-password');
  if (profilPass) {
    profilPass.value = '••••••••';
  }
 
    /* Inscriptions */
    afficherInscriptions();
 
    /* Déconnexion */
    document.getElementById('btn-deconnexion').addEventListener('click', () => {
      localStorage.removeItem('eduevent_utilisateur');
      vueProfil.classList.add('hidden');
      vueAuth.classList.remove('hidden');
      cardInscript.classList.add('hidden');
      cardConnexion.classList.remove('hidden');
    });
  }
 
  /* ============================================================
     AFFICHER LES INSCRIPTIONS
  ============================================================ */
  function afficherInscriptions() {
    const container    = document.getElementById('liste-inscriptions');
    const inscriptions = JSON.parse(localStorage.getItem('eduevent_inscriptions') || '[]');
    const utilisateur  = JSON.parse(localStorage.getItem('eduevent_utilisateur') || 'null');
 
    /* Filtrer les inscriptions de l'utilisateur connecté */
    const mesInscrip = utilisateur
      ? inscriptions.filter(i => i.email === utilisateur.email)
      : inscriptions;
 
    if (mesInscrip.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <span class="empty-state__icon">📭</span>
          <h4>Aucune inscription pour le moment</h4>
          <p>Parcourez les événements et inscrivez-vous !</p>
          <a href="evenements.html" class="btn btn--primary">Voir les événements</a>
        </div>`;
      return;
    }
 
    container.innerHTML = mesInscrip.map((ins, index) => {
      const dateFormatee = new Date(ins.date).toLocaleDateString('fr-FR', {
        day: 'numeric', month: 'long', year: 'numeric'
      });
      return `
        <div class="inscription-card" id="ins-${index}">
          <div class="inscription-card__info">
            <h4 class="inscription-card__titre">${ins.titre}</h4>
            <div class="inscription-card__meta">
              <span>📅 ${dateFormatee}</span>
              <span>📍 ${ins.lieu}</span>
            </div>
          </div>
          <button
            class="btn btn--outline btn--sm btn--danger"
            onclick="annulerInscription(${index})"
          >
            Annuler
          </button>
        </div>`;
    }).join('');
  }
 
  /* ============================================================
     ANNULER UNE INSCRIPTION (accessible globalement)
  ============================================================ */
  window.annulerInscription = function (index) {
    const inscriptions = JSON.parse(localStorage.getItem('eduevent_inscriptions') || '[]');
    const utilisateur  = JSON.parse(localStorage.getItem('eduevent_utilisateur') || 'null');
 
    const mesInscrip = utilisateur
      ? inscriptions.filter(i => i.email === utilisateur.email)
      : inscriptions;
 
    const insASupprimer = mesInscrip[index];
    if (!insASupprimer) return;
 
    /* Supprimer de la liste complète */
    const nouvelles = inscriptions.filter(i =>
      !(i.eventId === insASupprimer.eventId && i.email === insASupprimer.email)
    );
 
    localStorage.setItem('eduevent_inscriptions', JSON.stringify(nouvelles));
    afficherInscriptions();
  };
 
  /* ============================================================
     UTILITAIRE
  ============================================================ */
  function afficherMsg(el, texte, type) {
    el.textContent = texte;
    el.className = 'form-message ' + type;
    setTimeout(() => { el.textContent = ''; el.className = 'form-message'; }, 5000);
  }
 
})();
