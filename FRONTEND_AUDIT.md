# Audit d’intégration du frontend TaskFlow

## Problèmes constatés dans l’interface initiale

- Le chargement de l’espace ne s’exécutait qu’au montage : une connexion faite ensuite ne rechargeait pas les données du compte.
- La sélection utilisait systématiquement la première équipe et le premier projet ; l’interface ne permettait pas de gérer plusieurs espaces.
- Un chargement créait automatiquement une équipe et un projet. Une simple lecture pouvait donc écrire en base et échouer pour un membre sans droits de création de projet.
- Certaines listes étaient tronquées à 100 tickets, puis filtrées et comptées dans le navigateur.
- Le nom de feature servait d’identifiant ; les features avaient toutes un statut « En cours » inventé côté client.
- Le profil utilisateur provenait du stockage local ; l’édition de profil, la photo et la sécurité du compte n’étaient pas intégrées au parcours principal.
- Les écrans secondaires et les anciens fichiers contenaient des membres, projets et tickets fictifs ainsi que des boutons sans fonction.
- La gestion des erreurs de session, des chargements concurrents et des droits n’était pas uniforme.

## Fonctions à couvrir avec les contrats réels du backend

| Parcours | API | Comportement attendu |
| --- | --- | --- |
| Inscription | `POST /auth/register`, `POST /auth/verify-email-code` | Envoyer le code, puis seulement créer et enregistrer la session après validation. |
| Renvoi du code | `POST /auth/send-verification-code` | Respecter le délai de renvoi et afficher les erreurs d’expiration ou de tentatives. |
| Session | `POST /auth/login`, `GET /users/me` | Recharger l’utilisateur depuis le serveur et fermer la session locale si son authentification privée expire. |
| Profil | `PATCH /users/me` | Modifier prénom, nom et photo ; le backend ne permet pas de modifier l’e-mail du compte. |
| Mot de passe | `PATCH /users/me/password` | Fournir ancien mot de passe, nouveau mot de passe et confirmation. |
| Équipes | `GET/POST /teams`, `PATCH/DELETE /teams/:id` | Créer explicitement un espace, afficher le rôle réel et réserver modification/suppression aux administrateurs. |
| Membres | `GET/POST /teams/:id/members`, `PATCH/DELETE /teams/:id/members/:userId` | Ajouter un utilisateur existant par e-mail, gérer les rôles et protéger le dernier administrateur. |
| Annuaire | `GET /users?search=` | Recherche par nom ou e-mail réservée aux administrateurs, pour sélectionner un compte existant avant ajout à l’équipe. |
| Activité | `GET /teams/:id/activity` | Afficher les modifications de tickets enregistrées en base, sans inventer de notifications. |
| Projets | `GET/POST /projects`, `PATCH/DELETE /projects/:id` | Choisir un projet et une équipe ; création/modification/suppression réservées aux administrateurs et chefs de projet. |
| Features | `GET /projects/:id/features`, `POST /features`, `PATCH/DELETE /features/:id` | Utiliser les ID, afficher la progression calculée par le serveur et filtrer les tickets par ID de feature. |
| Tickets | `GET /projects/:id/tickets`, `POST /tickets`, `PATCH/DELETE /tickets/:id` | Pagination et filtres serveur ; types, priorités, assignation, échéance, description et feature persistés. |
| Kanban | `GET /projects/:id/kanban`, `PATCH /tickets/:id/status` | Charger les colonnes du serveur et ne proposer que les transitions compatibles avec le rôle. |
| Discussions | `GET/POST /tickets/:id/comments`, `PATCH/DELETE /comments/:id` | Édition par l’auteur ; suppression par l’auteur ou un responsable. |
| Audit ticket | `GET /tickets/:id/history` | Afficher auteur, résumé et date des événements enregistrés. |
| Dashboard | `GET /dashboard` | Utiliser les statistiques calculées par le serveur, indépendantes de la page de tickets affichée. |
| Tâches privées | `GET/POST /tasks`, `PATCH/DELETE /tasks/:id` | Gestion individuelle indépendante des équipes et des tickets. |

## Contraintes de production à conserver visibles

- Les administrateurs gèrent les membres ; le rôle de chef de projet ne donne pas ce droit. Le serveur reste l’autorité finale même si les boutons sont masqués côté interface.
- Supprimer une équipe ou un projet supprime aussi leurs tickets et commentaires. Supprimer une feature conserve ses tickets et retire leur association. Les confirmations doivent décrire ces effets.
- L’ajout d’un membre n’envoie pas d’invitation : l’adresse doit correspondre à un compte existant. Le backend actuel n’expose pas d’invitations.
- Le backend accepte une photo dans `avatarUrl`, en URL HTTP(S) ou en image raster encodée. La limite est de 150 000 caractères pour l’image encodée ; une photo locale doit être réduite avant envoi.
- Le backend n’expose pas de routes pour l’archivage de projet, les notifications, la récupération de mot de passe, la suppression de compte ou la modification d’e-mail. Ne pas afficher de faux parcours pour ces fonctions.
- Les codes e-mail et les compteurs de limitation sont stockés en mémoire du processus backend. Un redémarrage invalide les codes et un déploiement multi-instance nécessite un stockage partagé côté serveur.
- Les JWT actuels n’ont ni renouvellement ni révocation de session côté serveur. Une déconnexion efface la session dans le navigateur ; un changement de mot de passe ne révoque pas automatiquement les jetons déjà émis.
- `VITE_API_URL`, l’origine CORS du domaine Vercel, la connexion MongoDB, la clé Resend et l’expéditeur autorisé doivent correspondre aux valeurs des déploiements. Aucune clé privée ne doit être placée dans une variable `VITE_*`.

## Vérification

Contrôles après intégration : build de production réussi, lint sans erreur ni avertissement et 17 tests hors ligne réussis (sessions, réseau, codes HTTP, permissions et payloads des tickets). Les fichiers de démonstration ont été supprimés. La vérification visuelle locale reste à faire : le navigateur local est désactivé dans les réglages de cet environnement. Les modifications sont locales et ne constituent pas une validation du déploiement de production.

Le build et les contrôles statiques permettent de détecter les problèmes de compilation et certaines erreurs de code. Ils ne prouvent pas l’envoi d’e-mails, le bon paramétrage de Railway/Vercel, ni un parcours connecté réel avec plusieurs rôles. Ces parcours nécessitent des services configurés et des comptes de vérification dédiés, sans mutation involontaire des données de production.
