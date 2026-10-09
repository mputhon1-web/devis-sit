-- Згенеровано з catalogue.js. Виконати після schema.sql
insert into settings (key, value) values ('rate', '35') on conflict (key) do update set value = excluded.value;

insert into categories (id, title, note, position) values ('structure', '1. Pages et structure', null, 0)
  on conflict (id) do update set title = excluded.title, note = excluded.note, position = excluded.position;
insert into categories (id, title, note, position) values ('design', '2. Design et contenu', null, 1)
  on conflict (id) do update set title = excluded.title, note = excluded.note, position = excluded.position;
insert into categories (id, title, note, position) values ('fonctions', '3. Fonctionnalités', null, 2)
  on conflict (id) do update set title = excluded.title, note = excluded.note, position = excluded.position;
insert into categories (id, title, note, position) values ('admin', '4. Espace administrateur', null, 3)
  on conflict (id) do update set title = excluded.title, note = excluded.note, position = excluded.position;
insert into categories (id, title, note, position) values ('commande', '5. Commande en ligne (restauration)', 'Le paiement se fait à la réception ou sur place ; le paiement en ligne n''est pas proposé.', 4)
  on conflict (id) do update set title = excluded.title, note = excluded.note, position = excluded.position;
insert into categories (id, title, note, position) values ('visibilite', '6. Visibilité et conformité', null, 5)
  on conflict (id) do update set title = excluded.title, note = excluded.note, position = excluded.position;
insert into categories (id, title, note, position) values ('mise_en_ligne', '7. Mise en ligne et suivi', 'Le nom de domaine (environ 10 à 15 € par an) et l''hébergement (environ 50 à 200 € par an) sont des frais facturés à part, au prix réel.', 6)
  on conflict (id) do update set title = excluded.title, note = excluded.note, position = excluded.position;

insert into services (id, category_id, label, hours, qty_allowed, monthly, position) values ('home', 'structure', 'Page d''accueil (présentation, coordonnées, photos principales)', 6, false, false, 0)
  on conflict (id) do update set label = excluded.label, hours = excluded.hours, qty_allowed = excluded.qty_allowed, monthly = excluded.monthly, position = excluded.position;
insert into services (id, category_id, label, hours, qty_allowed, monthly, position) values ('page_extra', 'structure', 'Page supplémentaire (À propos, Services ou Menu, Réalisations, Contact), prix par page', 3, true, false, 1)
  on conflict (id) do update set label = excluded.label, hours = excluded.hours, qty_allowed = excluded.qty_allowed, monthly = excluded.monthly, position = excluded.position;
insert into services (id, category_id, label, hours, qty_allowed, monthly, position) values ('responsive', 'structure', 'Affichage adapté au téléphone, à la tablette et à l''ordinateur', 4, false, false, 2)
  on conflict (id) do update set label = excluded.label, hours = excluded.hours, qty_allowed = excluded.qty_allowed, monthly = excluded.monthly, position = excluded.position;
insert into services (id, category_id, label, hours, qty_allowed, monthly, position) values ('nav', 'structure', 'Menu de navigation et pied de page', 2, false, false, 3)
  on conflict (id) do update set label = excluded.label, hours = excluded.hours, qty_allowed = excluded.qty_allowed, monthly = excluded.monthly, position = excluded.position;
insert into services (id, category_id, label, hours, qty_allowed, monthly, position) values ('images_opt', 'structure', 'Optimisation de la vitesse et du poids des images', 2, false, false, 4)
  on conflict (id) do update set label = excluded.label, hours = excluded.hours, qty_allowed = excluded.qty_allowed, monthly = excluded.monthly, position = excluded.position;
insert into services (id, category_id, label, hours, qty_allowed, monthly, position) values ('design', 'design', 'Design personnalisé selon vos couleurs et votre style', 8, false, false, 0)
  on conflict (id) do update set label = excluded.label, hours = excluded.hours, qty_allowed = excluded.qty_allowed, monthly = excluded.monthly, position = excluded.position;
insert into services (id, category_id, label, hours, qty_allowed, monthly, position) values ('logo', 'design', 'Intégration de votre logo et de votre charte graphique', 2, false, false, 1)
  on conflict (id) do update set label = excluded.label, hours = excluded.hours, qty_allowed = excluded.qty_allowed, monthly = excluded.monthly, position = excluded.position;
insert into services (id, category_id, label, hours, qty_allowed, monthly, position) values ('textes', 'design', 'Mise en forme et rédaction des textes à partir de vos informations (forfait)', 4, false, false, 2)
  on conflict (id) do update set label = excluded.label, hours = excluded.hours, qty_allowed = excluded.qty_allowed, monthly = excluded.monthly, position = excluded.position;
insert into services (id, category_id, label, hours, qty_allowed, monthly, position) values ('galerie', 'fonctions', 'Galerie photos / portfolio de réalisations', 5, false, false, 0)
  on conflict (id) do update set label = excluded.label, hours = excluded.hours, qty_allowed = excluded.qty_allowed, monthly = excluded.monthly, position = excluded.position;
insert into services (id, category_id, label, hours, qty_allowed, monthly, position) values ('retouche', 'fonctions', 'Retouche simple de vos photos (recadrage, compression)', 3, false, false, 1)
  on conflict (id) do update set label = excluded.label, hours = excluded.hours, qty_allowed = excluded.qty_allowed, monthly = excluded.monthly, position = excluded.position;
insert into services (id, category_id, label, hours, qty_allowed, monthly, position) values ('avis', 'fonctions', 'Section avis de vos clients (avis réels fournis par vous)', 2, false, false, 2)
  on conflict (id) do update set label = excluded.label, hours = excluded.hours, qty_allowed = excluded.qty_allowed, monthly = excluded.monthly, position = excluded.position;
insert into services (id, category_id, label, hours, qty_allowed, monthly, position) values ('faq', 'fonctions', 'Section questions fréquentes (FAQ)', 2, false, false, 3)
  on conflict (id) do update set label = excluded.label, hours = excluded.hours, qty_allowed = excluded.qty_allowed, monthly = excluded.monthly, position = excluded.position;
insert into services (id, category_id, label, hours, qty_allowed, monthly, position) values ('contact_form', 'fonctions', 'Formulaire de contact / demande de devis (demandes reçues dans l''espace admin)', 5, false, false, 4)
  on conflict (id) do update set label = excluded.label, hours = excluded.hours, qty_allowed = excluded.qty_allowed, monthly = excluded.monthly, position = excluded.position;
insert into services (id, category_id, label, hours, qty_allowed, monthly, position) values ('maps', 'fonctions', 'Carte Google Maps avec itinéraire', 1.5, false, false, 5)
  on conflict (id) do update set label = excluded.label, hours = excluded.hours, qty_allowed = excluded.qty_allowed, monthly = excluded.monthly, position = excluded.position;
insert into services (id, category_id, label, hours, qty_allowed, monthly, position) values ('horaires', 'fonctions', 'Horaires d''ouverture et coordonnées cliquables', 1, false, false, 6)
  on conflict (id) do update set label = excluded.label, hours = excluded.hours, qty_allowed = excluded.qty_allowed, monthly = excluded.monthly, position = excluded.position;
insert into services (id, category_id, label, hours, qty_allowed, monthly, position) values ('reseaux', 'fonctions', 'Liens vers vos réseaux sociaux', 1, false, false, 7)
  on conflict (id) do update set label = excluded.label, hours = excluded.hours, qty_allowed = excluded.qty_allowed, monthly = excluded.monthly, position = excluded.position;
insert into services (id, category_id, label, hours, qty_allowed, monthly, position) values ('zone', 'fonctions', 'Présentation de votre zone d''intervention ou de vos services', 2, false, false, 8)
  on conflict (id) do update set label = excluded.label, hours = excluded.hours, qty_allowed = excluded.qty_allowed, monthly = excluded.monthly, position = excluded.position;
insert into services (id, category_id, label, hours, qty_allowed, monthly, position) values ('admin_auth', 'admin', 'Espace sécurisé (identifiant et mot de passe)', 6, false, false, 0)
  on conflict (id) do update set label = excluded.label, hours = excluded.hours, qty_allowed = excluded.qty_allowed, monthly = excluded.monthly, position = excluded.position;
insert into services (id, category_id, label, hours, qty_allowed, monthly, position) values ('admin_kanban', 'admin', 'Tableau de suivi des demandes clients (nouvelle, en cours, traitée)', 10, false, false, 1)
  on conflict (id) do update set label = excluded.label, hours = excluded.hours, qty_allowed = excluded.qty_allowed, monthly = excluded.monthly, position = excluded.position;
insert into services (id, category_id, label, hours, qty_allowed, monthly, position) values ('admin_notes', 'admin', 'Notes et historique sur chaque demande', 4, false, false, 2)
  on conflict (id) do update set label = excluded.label, hours = excluded.hours, qty_allowed = excluded.qty_allowed, monthly = excluded.monthly, position = excluded.position;
insert into services (id, category_id, label, hours, qty_allowed, monthly, position) values ('admin_texts', 'admin', 'Modification des textes, horaires et coordonnées depuis l''admin', 8, false, false, 3)
  on conflict (id) do update set label = excluded.label, hours = excluded.hours, qty_allowed = excluded.qty_allowed, monthly = excluded.monthly, position = excluded.position;
insert into services (id, category_id, label, hours, qty_allowed, monthly, position) values ('admin_gallery', 'admin', 'Gestion de la galerie (ajout et suppression de réalisations)', 6, false, false, 4)
  on conflict (id) do update set label = excluded.label, hours = excluded.hours, qty_allowed = excluded.qty_allowed, monthly = excluded.monthly, position = excluded.position;
insert into services (id, category_id, label, hours, qty_allowed, monthly, position) values ('menu_online', 'commande', 'Menu en ligne (catégories, produits, prix, photos)', 8, false, false, 0)
  on conflict (id) do update set label = excluded.label, hours = excluded.hours, qty_allowed = excluded.qty_allowed, monthly = excluded.monthly, position = excluded.position;
insert into services (id, category_id, label, hours, qty_allowed, monthly, position) values ('cart', 'commande', 'Panier et formulaire de commande (retrait ou livraison)', 12, false, false, 1)
  on conflict (id) do update set label = excluded.label, hours = excluded.hours, qty_allowed = excluded.qty_allowed, monthly = excluded.monthly, position = excluded.position;
insert into services (id, category_id, label, hours, qty_allowed, monthly, position) values ('pickup_time', 'commande', 'Choix de l''heure de retrait ou de livraison', 3, false, false, 2)
  on conflict (id) do update set label = excluded.label, hours = excluded.hours, qty_allowed = excluded.qty_allowed, monthly = excluded.monthly, position = excluded.position;
insert into services (id, category_id, label, hours, qty_allowed, monthly, position) values ('orders_admin', 'commande', 'Suivi des commandes dans l''admin (reçue, en préparation, prête, livrée)', 10, false, false, 3)
  on conflict (id) do update set label = excluded.label, hours = excluded.hours, qty_allowed = excluded.qty_allowed, monthly = excluded.monthly, position = excluded.position;
insert into services (id, category_id, label, hours, qty_allowed, monthly, position) values ('menu_admin', 'commande', 'Gestion du menu depuis l''admin (prix, disponibilité)', 6, false, false, 4)
  on conflict (id) do update set label = excluded.label, hours = excluded.hours, qty_allowed = excluded.qty_allowed, monthly = excluded.monthly, position = excluded.position;
insert into services (id, category_id, label, hours, qty_allowed, monthly, position) values ('seo', 'visibilite', 'Référencement de base (titres, descriptions, balises, plan du site)', 4, false, false, 0)
  on conflict (id) do update set label = excluded.label, hours = excluded.hours, qty_allowed = excluded.qty_allowed, monthly = excluded.monthly, position = excluded.position;
insert into services (id, category_id, label, hours, qty_allowed, monthly, position) values ('gbp', 'visibilite', 'Accompagnement pour votre fiche Google (Google Business Profile)', 2, false, false, 1)
  on conflict (id) do update set label = excluded.label, hours = excluded.hours, qty_allowed = excluded.qty_allowed, monthly = excluded.monthly, position = excluded.position;
insert into services (id, category_id, label, hours, qty_allowed, monthly, position) values ('mentions', 'visibilite', 'Mentions légales', 1.5, false, false, 2)
  on conflict (id) do update set label = excluded.label, hours = excluded.hours, qty_allowed = excluded.qty_allowed, monthly = excluded.monthly, position = excluded.position;
insert into services (id, category_id, label, hours, qty_allowed, monthly, position) values ('rgpd', 'visibilite', 'Politique de confidentialité (RGPD)', 1.5, false, false, 3)
  on conflict (id) do update set label = excluded.label, hours = excluded.hours, qty_allowed = excluded.qty_allowed, monthly = excluded.monthly, position = excluded.position;
insert into services (id, category_id, label, hours, qty_allowed, monthly, position) values ('cookies', 'visibilite', 'Bannière d''information sur les cookies, si nécessaire', 2, false, false, 4)
  on conflict (id) do update set label = excluded.label, hours = excluded.hours, qty_allowed = excluded.qty_allowed, monthly = excluded.monthly, position = excluded.position;
insert into services (id, category_id, label, hours, qty_allowed, monthly, position) values ('domain', 'mise_en_ligne', 'Choix et configuration du nom de domaine', 1.5, false, false, 0)
  on conflict (id) do update set label = excluded.label, hours = excluded.hours, qty_allowed = excluded.qty_allowed, monthly = excluded.monthly, position = excluded.position;
insert into services (id, category_id, label, hours, qty_allowed, monthly, position) values ('hosting', 'mise_en_ligne', 'Hébergement et mise en ligne (avec HTTPS)', 3, false, false, 1)
  on conflict (id) do update set label = excluded.label, hours = excluded.hours, qty_allowed = excluded.qty_allowed, monthly = excluded.monthly, position = excluded.position;
insert into services (id, category_id, label, hours, qty_allowed, monthly, position) values ('training', 'mise_en_ligne', 'Courte formation à l''utilisation de l''espace administrateur', 2, false, false, 2)
  on conflict (id) do update set label = excluded.label, hours = excluded.hours, qty_allowed = excluded.qty_allowed, monthly = excluded.monthly, position = excluded.position;
insert into services (id, category_id, label, hours, qty_allowed, monthly, position) values ('followup', 'mise_en_ligne', 'Corrections après la mise en ligne (30 jours de suivi)', 3, false, false, 3)
  on conflict (id) do update set label = excluded.label, hours = excluded.hours, qty_allowed = excluded.qty_allowed, monthly = excluded.monthly, position = excluded.position;
insert into services (id, category_id, label, hours, qty_allowed, monthly, position) values ('maintenance', 'mise_en_ligne', 'Maintenance mensuelle (mises à jour, sauvegardes, petites modifications)', 2, false, true, 4)
  on conflict (id) do update set label = excluded.label, hours = excluded.hours, qty_allowed = excluded.qty_allowed, monthly = excluded.monthly, position = excluded.position;
