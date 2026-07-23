/* ============================================================
   main.js — EduEvent · Script global
   ============================================================ */

/* ---- Utilitaires ---- */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* ============================================================
   1. HEADER — scroll shadow + hamburger menu
   ============================================================ */
(function initHeader() {
  const header = $('#header');
  const hamburger = $('#hamburger');
  const nav = $('#nav');

  // Ombre au scroll
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 20);
  });

  // Menu hamburger
  if (hamburger && nav) {
    hamburger.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('open');
      hamburger.setAttribute('aria-expanded', isOpen);
    });

    // Fermer le menu en cliquant sur un lien
    $$('.nav__link', nav).forEach(link => {
      link.addEventListener('click', () => {
        nav.classList.remove('open');
        hamburger.setAttribute('aria-expanded', false);
      });
    });

    // Fermer en cliquant à l'extérieur
    document.addEventListener('click', (e) => {
      if (!header.contains(e.target)) {
        nav.classList.remove('open');
      }
    });
  }
})();

/* ============================================================
   2. LIEN ACTIF — marquer la page courante dans la nav
   ============================================================ */
(function setActiveLink() {
  const page = location.pathname.split('/').pop() || 'index.html';
  $$('.nav__link').forEach(link => {
    const href = link.getAttribute('href');
    link.classList.toggle('active', href === page);
  });
})();
/* ============================================================
   1.5. HERO SLIDER 
   ============================================================ */
(function initHeroSlider() {
  const slides = $$('.hero-slide');
  if (!slides.length) return;

  let currentSlide = 0;
  const slideInterval = 4000; // Imaj yo ap chanje chak 4 segonn

  function nextSlide() {
    // 1. Retire klas active nan imaj ki te la a
    slides[currentSlide].classList.remove('active');
    
    // 2. Pase nan pwochen imaj la (tounen nan 0 si l rive nan fen)
    currentSlide = (currentSlide + 1) % slides.length;
    
    // 3. Ajoute klas active sou nouvo imaj la (KORIJE)
    slides[currentSlide].classList.add('active');
  }

  // Lanse revèy la pou chanje imaj yo otomatikman
  setInterval(nextSlide, slideInterval);
})();


/* ============================================================
   3. ÉVÉNEMENTS EN VEDETTE — chargement depuis evenements.json
   ============================================================ */
(function loadVedette() {
  const grid = $('#vedette-grid');
  if (!grid) return;

  fetch('data/evenements.json')
    .then(res => {
      if (!res.ok) throw new Error('Erreur chargement données');
      return res.json();
    })
    .then(data => {
      const vedette = data.filter(e => e.vedette).slice(0, 4);
      grid.innerHTML = '';

      vedette.forEach((evt, i) => {
        const card = creerCarteEvenement(evt);
        card.classList.add('reveal');
        card.classList.add('delay-' + (i * 100 + 100));
        grid.appendChild(card);
      });

      // Déclencher les animations reveal
      setTimeout(observerReveal, 100);
    })
    .catch(err => {
      console.error(err);
      grid.innerHTML = `
        <p style="grid-column:1/-1;text-align:center;color:var(--color-text-muted);">
          Impossible de charger les événements. Vérifiez que le serveur est actif.
        </p>`;
    });
})();

/* ---- Fabrique de carte ---- */
function creerCarteEvenement(evt) {
  const dateFormatee = new Date(evt.date).toLocaleDateString('fr-FR', {
    weekday: 'short', day: 'numeric', month: 'long', year: 'numeric'
  });

  const urgent = evt.places_restantes <= 10;
  const card = document.createElement('article');
  card.className = 'card';
  card.innerHTML = `
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
        <span> ${evt.lieu}</span>
      </div>
      <p class="card__places ${urgent ? 'urgent' : ''}">
        ${urgent
          ? ' Plus que ' + evt.places_restantes + ' places !'
          : ' ' + evt.places_restantes + ' places disponibles'}
      </p>
    </div>
    <div class="card__footer">
      <a href="detail.html?id=${evt.id}" class="btn btn--primary">Voir les détails</a>
    </div>
  `;
  return card;
}

/* ============================================================
   4. COMPTEURS ANIMÉS — section statistiques
   ============================================================ */
(function initCounters() {
  const counters = $$('[data-target]');
  if (!counters.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;

      const el = entry.target;
      const target = parseInt(el.dataset.target, 10);
      const duration = 1800;
      const step = Math.ceil(target / (duration / 16));
      let current = 0;

      const timer = setInterval(() => {
        current = Math.min(current + step, target);
        el.textContent = current.toLocaleString('fr-FR');
        if (current >= target) clearInterval(timer);
      }, 16);

      observer.unobserve(el);
    });
  }, { threshold: 0.5 });

  counters.forEach(el => observer.observe(el));
})();

/* ============================================================
   5. REVEAL AU SCROLL
   ============================================================ */
function observerReveal() {
  const items = $$('.reveal');
  if (!items.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  items.forEach(el => observer.observe(el));
}

// Lancer sur les éléments déjà présents au chargement
document.addEventListener('DOMContentLoaded', observerReveal);

/* ============================================================
   6. FORMULAIRE NEWSLETTER
   ============================================================ */
(function initNewsletter() {
  const form = $('#newsletter-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const emailInput = $('#newsletter-email');
    const msg = $('#newsletter-msg');
    const email = emailInput.value.trim();

    // Validation simple
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      msg.textContent = 'Veuillez entrer une adresse email valide.';
      msg.className = 'form-message error';
      return;
    }

    // Simulation d'envoi (pas de backend)
    msg.textContent = ' Inscription confirmée ! Vous recevrez nos prochains événements.';
    msg.className = 'form-message success';
    emailInput.value = '';

    setTimeout(() => { msg.textContent = ''; }, 5000);
  });
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
/* ============================================================
   a-propos.js — EduEvent · Contact & FAQ Accordéon
   ============================================================ */

(function () {

  /* ---- Guard ---- */
  if (!document.getElementById('contact-form')) return;

  /* ============================================================
     FORMULAIRE DE CONTACT
  ============================================================ */
  const form     = document.getElementById('contact-form');
  const feedback = document.getElementById('contact-feedback');

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const nom     = document.getElementById('contact-nom').value.trim();
    const email   = document.getElementById('contact-email').value.trim();
    const sujet   = document.getElementById('contact-sujet').value;
    const message = document.getElementById('contact-message').value.trim();

    /* Validation */
    if (!nom) {
      afficherFeedback('Veuillez entrer votre nom.', 'error');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      afficherFeedback('Veuillez entrer une adresse email valide.', 'error');
      return;
    }

    if (!sujet) {
      afficherFeedback('Veuillez sélectionner un sujet.', 'error');
      return;
    }

    if (!message || message.length < 10) {
      afficherFeedback('Votre message doit contenir au moins 10 caractères.', 'error');
      return;
    }

    /* Sauvegarder dans localStorage (simulation d'envoi) */
    const messages = JSON.parse(localStorage.getItem('eduevent_messages_contact') || '[]');
    messages.push({
      nom, email, sujet, message,
      envoyeLe: new Date().toISOString()
    });
    localStorage.setItem('eduevent_messages_contact', JSON.stringify(messages));

    afficherFeedback(' Message envoyé avec succès ! Nous vous répondrons rapidement.', 'success');
    form.reset();
  });

  function afficherFeedback(texte, type) {
    feedback.textContent = texte;
    feedback.className = 'form-message ' + type;
    setTimeout(() => {
      feedback.textContent = '';
      feedback.className = 'form-message';
    }, 5000);
  }

  /* ============================================================
     FAQ ACCORDÉON
  ============================================================ */
  const accordionItems = document.querySelectorAll('.accordion-item');

  accordionItems.forEach(item => {
    const header  = item.querySelector('.accordion-header');
    const content = item.querySelector('.accordion-content');
    const icon    = item.querySelector('.accordion-icon');

    header.addEventListener('click', () => {
      const estOuvert = item.classList.contains('open');

      /* Fermer tous les autres items (accordéon exclusif) */
      accordionItems.forEach(autre => {
        autre.classList.remove('open');
        autre.querySelector('.accordion-content').style.maxHeight = null;
        autre.querySelector('.accordion-icon').textContent = '+';
      });

      /* Ouvrir l'item cliqué (sauf s'il était déjà ouvert) */
      if (!estOuvert) {
        item.classList.add('open');
        content.style.maxHeight = content.scrollHeight + 'px';
        icon.textContent = '−';
      }
    });
  });
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
/* ============================================================
   ACCESSIBILITÉ : GESTION DE LA TAILLE DES POLICES (SÉCURISÉ)
   ============================================================ */
function initAccessibilitySize() {
  const sizeButtons = document.querySelectorAll(".btn-size");
  const htmlElement = document.documentElement;

  // Sécurité : si les boutons du footer ne sont pas sur cette page, on s'arrête
  if (sizeButtons.length === 0) return;

  function appliquerTaille(size) {
    htmlElement.classList.remove("size-small", "size-large");
    if (size === "small") htmlElement.classList.add("size-small");
    if (size === "large") htmlElement.classList.add("size-large");

    sizeButtons.forEach(btn => {
      if (btn.getAttribute("data-size") === size) {
        btn.classList.add("active");
        btn.style.background = "var(--color-primary)";
        btn.style.color = "#fff";
        btn.style.borderColor = "var(--color-primary)";
      } else {
        btn.classList.remove("active");
        btn.style.background = "#fff";
        btn.style.color = "inherit";
        btn.style.borderColor = "var(--color-border)";
      }
    });
  }

  // 1. Lecture immédiate du localStorage
  const savedSize = localStorage.getItem("eduevent_font_size") || "medium";
  appliquerTaille(savedSize);

  // 2. Écoute des clics sur les boutons du footer
  sizeButtons.forEach(button => {
    button.addEventListener("click", (e) => {
      const size = e.currentTarget.getAttribute("data-size");
      localStorage.setItem("eduevent_font_size", size);
      appliquerTaille(size);
    });
  });
}

/* 🧠 L'ASTUCE ANTI-BUG : On vérifie si le DOM est déjà chargé */
if (document.readyState !== "loading") {
  // Le DOM est déjà prêt, on lance la fonction tout de suite !
  initAccessibilitySize();
} else {
  // Le DOM charge encore, on attend l'événement normalement
  document.addEventListener("DOMContentLoaded", initAccessibilitySize);
}
  /* ============================================================
     FONCTIONNALITÉ : RETOUR EN HAUT DE PAGE (SCROLL TO TOP)
     ============================================================ */
  const scrollTopBtn = document.getElementById("scroll-top-btn");

  if (scrollTopBtn) {
    // 1. Écouter le défilement de la page pour afficher/cacher le bouton
    window.addEventListener("scroll", () => {
      // Le bouton apparaît si l'utilisateur descend de plus de 300 pixels
      if (window.scrollY > 300) {
        scrollTopBtn.classList.add("visible");
      } else {
        scrollTopBtn.classList.remove("visible");
      }
    });

    // 2. Remonter en haut de page en douceur lors du clic
    scrollTopBtn.addEventListener("click", () => {
      window.scrollTo({
        top: 0,
        behavior: "smooth" // Fait remonter la page de manière fluide et douce
      });
    });
  }
