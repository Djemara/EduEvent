EduEvent,Plateforme des Événements du Campus Henry Christophe
Université d'État d'Haïti (UEH) — FSG — Campus Henry Christophe de Limonade

 Description

EduEvent est une plateforme web statique de gestion d'événements universitaires développée pour le Campus Henry Christophe de Limonade (CHCL) de l'Université d'État d'Haïti (UEH). Elle permet à la communauté universitaire de consulter, rechercher et s'inscrire aux événements organisés sur le campus.

 Éco-conception

Ce projet a été développé en suivant les principes de l'éco-conception web :
●	Aucun framework CSS ni JavaScript — HTML5, CSS3 et JavaScript pur uniquement
●	Pas de dépendances externes — aucune bibliothèque importée (pas de jQuery, Bootstrap, React, etc.)
●	Images optimisées — toutes les images sont compressées avant déploiement
●	LocalStorage — les données  sont stockées localement dans le navigateur
●	Lazy loading — les images se chargent uniquement quand elles sont visibles
●	Données JSON locales — le fichier evenements.json est chargé une seule fois
●	CSS organisé — séparation stricte entre style.css, responsive.css et animations.css
●	Pas de serveur backend — site entièrement statique, hébergé sur GitHub Pages gratuitement
●	Animations légères — utilisation de CSS keyframes et transitions
●	Pas de publicité ni de tracking — aucun script tiers qui alourdit les pages
●	Mode sombre (Dark Mode) — réduit la consommation d'énergie sur les écrans OLED


 Impact environnemental

Critère	Valeur
Poids total du site	< 5 MB (sans images)
Nombre de requêtes HTTP	Minimal
Hébergement	GitHub Pages (énergie renouvelable)
Backend	Aucun
Base de données	Aucune (JSON statique)
Mode sombre	Disponible (économie d'énergie)

 Fonctionnalités

●	Recherche en temps réel des événements
●	Filtres par catégorie (Conférences, Ateliers, Sports, Culture, Soutenances) et par période
●	Vue grille / liste interchangeable
●	Inscription aux événements avec validation complète
●	Téléchargement d'une fiche de confirmation d'inscription (PDF)
●	Espace étudiant avec connexion, inscription et profil
●	Système de commentaires avec notes en étoiles et suppression
●	Compteur de places restantes mis à jour en temps réel
●	Vérification automatique ,inscription bloquée si l'événement est passé
●	Design responsive mobile, tablette, desktop
●	Mode sombre (Dark Mode) avec sauvegarde de préférence
●	Carte interactive du campus (Campus Henry Christophe, Limonade)
●	FAQ avec accordéon JavaScript
●	Partage sur Facebook, Twitter et WhatsApp
●	Annulation d'inscription depuis l'espace étudiant


Structure du projet

Fichier	             Rôle

index.html	        Page d'accueil — Hero, événements vedette, statistiques, newsletter
evenements.html    	Liste des événements — Recherche, filtres, vue grille/liste
detail.html   	    Détail d'un événement — Inscription, commentaires, partage, PDF
profil.html	        Espace étudiant — Connexion, profil, mes inscriptions
a-propos.html	    À propos — Présentation, équipe, contact, carte, FAQ
css/style.css	     Styles globaux + Dark Mode
css/responsive.css	 Media queries (mobile, tablette, desktop)
css/animations.css	 Transitions & keyframes
js/main.js	         Script global — Header, dark mode, compteurs, newsletter
js/evenements.js	 Filtres, recherche & affichage des événements
js/detail.js	     Inscription, commentaires, PDF, partage
js/profil.js	     Gestion profil & localStorage
data/evenements.json Données des 16  événements

 Technologies utilisées

●	HTML5 — Structure sémantique
●	CSS3 — Flexbox, Grid, Variables CSS, Animations, Dark Mode
●	JavaScript ES6 — Fetch API, LocalStorage, DOM manipulation, Print API
●	GitHub Pages — Hébergement gratuit et écologique(djemara.github.io/EduEvent)

 Identité visuelle

Couleur	           Hex	Usage
Bleu profond	   #1565C0	Couleur primaire (logo CHCL)
Bleu foncé	      #0D47A1	Hover & accents
Or/Jaune	    #F5C500	Accent (anneau logo CHCL)
Blanc       	#FFFFFF	Fond des cartes
Fond sombre    	#0F172A	Dark Mode — fond principal
Surface sombre	#1E293B	Dark Mode — fond des cartes

 Équipe de développement

Nom	                Rôle
AMICY Djemara	    Développeuse Full-Stack
PIERRE Rosener	Développeur Front-End

 Licence
 
Projet académique , Université d'État d'Haïti (UEH)
Faculté des Sciences et de Génie (FSG)
Campus Henry Christophe de Limonade
