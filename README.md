# TaskFlow — Frontend

## Démarrage

1. Depuis `Backend`, copier `.env.example` vers `.env`, renseigner MongoDB, un `JWT_SECRET` de développement et les identifiants Resend (`RESEND_API_KEY` et `RESEND_FROM_EMAIL`). L’envoi de codes e-mail nécessite une clé Resend valide et une adresse expéditrice autorisée par Resend.
2. Démarrer MongoDB puis lancer l’API depuis `Backend` avec `npm install` et `npm run dev`.
3. Depuis `Frontend`, copier `.env.example` vers `.env`, lancer `npm install`, puis `npm run dev`.

`VITE_API_URL` pointe par défaut vers `http://localhost:3000/api`. Si le backend utilise un autre port, modifier cette variable et ajouter l’origine Vite à `CORS_ORIGIN` côté backend.

À la première connexion, TaskFlow crée automatiquement une équipe et un projet pour l’utilisateur s’il n’en possède pas. Les tickets, membres et fonctionnalités affichés proviennent ensuite de l’API et sont persistés dans MongoDB.
