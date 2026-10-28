# TaskFlow — Frontend

Application React/Vite reliée à l’API Express/MongoDB. Les données affichées viennent de l’API ; aucune donnée de démonstration n’est injectée dans l’application.

## Lancer le projet

Depuis `Frontend`, installer les dépendances (`npm ci`), copier `.env.example` vers `.env` et lancer `npm run dev`. Définir `VITE_API_URL` vers l’API souhaitée, avec le suffixe `/api`. Sans variable, le client utilise l’API Railway de production. Pour développer sur une base locale, utiliser `VITE_API_URL=http://localhost:3000/api` et démarrer séparément MongoDB et le backend.

L’origine du navigateur doit être autorisée par `CORS_ORIGIN` côté serveur. Les variables MongoDB, JWT et Resend sont exclusivement côté backend ; aucune clé privée ne doit être ajoutée à une variable `VITE_*`. Sur Vercel, modifier `VITE_API_URL` nécessite un nouveau build.

## Parcours disponibles

- Inscription par code e-mail avec renvoi, connexion, restauration du compte par `/users/me`, expiration et déconnexion synchronisée entre onglets.
- Navigation avec URL (`#/dashboard`, `#/tickets`, `#/kanban`, `#/teams`, `#/projects`, `#/features`, `#/tasks`, `#/profile`) et boutons précédent/suivant du navigateur.
- Création explicite d’équipes et de projets, sélection de l’espace actif, gestion des membres existants et des rôles.
- Features et progression calculée par l’API, liste de tickets paginée, filtres serveur, Kanban complet, assignation et transitions selon le rôle.
- Détails de tickets, commentaires modifiables et historique réel.
- Profil avec photo locale redimensionnée et compressée, suppression de photo, changement de mot de passe ; tâches personnelles privées.
- Tableau de bord alimenté par les statistiques et l’activité du backend.

Un nouveau compte commence avec un espace vide. Il crée son équipe et son projet depuis les pages correspondantes ; une lecture ou un rechargement ne crée jamais de données. L’ajout d’un membre nécessite un compte déjà existant avec l’adresse renseignée.

## Vérifications

`npm run build` compile la production ; `npm run lint` analyse le code ; `npm test` exécute les tests hors ligne de session et de permissions/PATCH tickets. Ils n’envoient pas d’e-mails et ne modifient pas la base de production.

Consulter `FRONTEND_AUDIT.md` pour la couverture des API et les limites réelles du backend. L’archivage, la récupération de mot de passe, les notifications, les invitations, la modification d’e-mail et la suppression de compte ne disposent pas de routes dans ce backend.
