// ЄДИНЕ ДЖЕРЕЛО ПРАЙСУ. Змінюєш години/назви тут (або в розділі «Catalogue» на сайті).
// Ціна = години × тариф (rate). Тариф змінюється в одному місці.
// qty: true  -> можна обрати кількість (наприклад, кілька сторінок)
// monthly: true -> щомісячний платіж, рахується окремо від разової суми
window.CATALOGUE = {
  rate: 35,
  categories: [
    {
      id: "structure",
      title: "1. Pages et structure",
      items: [
        { id: "home", label: "Page d'accueil (présentation, coordonnées, photos principales)", hours: 6 },
        { id: "page_extra", label: "Page supplémentaire (À propos, Services ou Menu, Réalisations, Contact), prix par page", hours: 3, qty: true },
        { id: "responsive", label: "Affichage adapté au téléphone, à la tablette et à l'ordinateur", hours: 4 },
        { id: "nav", label: "Menu de navigation et pied de page", hours: 2 },
        { id: "images_opt", label: "Optimisation de la vitesse et du poids des images", hours: 2 }
      ]
    },
    {
      id: "design",
      title: "2. Design et contenu",
      items: [
        { id: "design", label: "Design personnalisé selon vos couleurs et votre style", hours: 8 },
        { id: "logo", label: "Intégration de votre logo et de votre charte graphique", hours: 2 },
        { id: "textes", label: "Mise en forme et rédaction des textes à partir de vos informations (forfait)", hours: 4 }
      ]
    },
    {
      id: "fonctions",
      title: "3. Fonctionnalités",
      items: [
        { id: "galerie", label: "Galerie photos / portfolio de réalisations", hours: 5 },
        { id: "retouche", label: "Retouche simple de vos photos (recadrage, compression)", hours: 3 },
        { id: "avis", label: "Section avis de vos clients (avis réels fournis par vous)", hours: 2 },
        { id: "faq", label: "Section questions fréquentes (FAQ)", hours: 2 },
        { id: "contact_form", label: "Formulaire de contact / demande de devis (demandes reçues dans l'espace admin)", hours: 5 },
        { id: "maps", label: "Carte Google Maps avec itinéraire", hours: 1.5 },
        { id: "horaires", label: "Horaires d'ouverture et coordonnées cliquables", hours: 1 },
        { id: "reseaux", label: "Liens vers vos réseaux sociaux", hours: 1 },
        { id: "zone", label: "Présentation de votre zone d'intervention ou de vos services", hours: 2 }
      ]
    },
    {
      id: "admin",
      title: "4. Espace administrateur",
      items: [
        { id: "admin_auth", label: "Espace sécurisé (identifiant et mot de passe)", hours: 6 },
        { id: "admin_kanban", label: "Tableau de suivi des demandes clients (nouvelle, en cours, traitée)", hours: 10 },
        { id: "admin_notes", label: "Notes et historique sur chaque demande", hours: 4 },
        { id: "admin_texts", label: "Modification des textes, horaires et coordonnées depuis l'admin", hours: 8 },
        { id: "admin_gallery", label: "Gestion de la galerie (ajout et suppression de réalisations)", hours: 6 }
      ]
    },
    {
      id: "commande",
      title: "5. Commande en ligne (restauration)",
      note: "Le paiement se fait à la réception ou sur place ; le paiement en ligne n'est pas proposé.",
      items: [
        { id: "menu_online", label: "Menu en ligne (catégories, produits, prix, photos)", hours: 8 },
        { id: "cart", label: "Panier et formulaire de commande (retrait ou livraison)", hours: 12 },
        { id: "pickup_time", label: "Choix de l'heure de retrait ou de livraison", hours: 3 },
        { id: "orders_admin", label: "Suivi des commandes dans l'admin (reçue, en préparation, prête, livrée)", hours: 10 },
        { id: "menu_admin", label: "Gestion du menu depuis l'admin (prix, disponibilité)", hours: 6 }
      ]
    },
    {
      id: "visibilite",
      title: "6. Visibilité et conformité",
      items: [
        { id: "seo", label: "Référencement de base (titres, descriptions, balises, plan du site)", hours: 4 },
        { id: "gbp", label: "Accompagnement pour votre fiche Google (Google Business Profile)", hours: 2 },
        { id: "mentions", label: "Mentions légales", hours: 1.5 },
        { id: "rgpd", label: "Politique de confidentialité (RGPD)", hours: 1.5 },
        { id: "cookies", label: "Bannière d'information sur les cookies, si nécessaire", hours: 2 }
      ]
    },
    {
      id: "mise_en_ligne",
      title: "7. Mise en ligne et suivi",
      note: "Le nom de domaine (environ 10 à 15 € par an) et l'hébergement (environ 50 à 200 € par an) sont des frais facturés à part, au prix réel.",
      items: [
        { id: "domain", label: "Choix et configuration du nom de domaine", hours: 1.5 },
        { id: "hosting", label: "Hébergement et mise en ligne (avec HTTPS)", hours: 3 },
        { id: "training", label: "Courte formation à l'utilisation de l'espace administrateur", hours: 2 },
        { id: "followup", label: "Corrections après la mise en ligne (30 jours de suivi)", hours: 3 },
        { id: "maintenance", label: "Maintenance mensuelle (mises à jour, sauvegardes, petites modifications)", hours: 2, monthly: true }
      ]
    }
  ],
  // Готові формули: id послуги -> 
