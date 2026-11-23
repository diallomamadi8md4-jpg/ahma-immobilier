# Ahma Immobilier

Application Next.js de gestion immobilière et catalogue public (Abidjan).

## Application en ligne

- **https://ahma-immobilier.onrender.com** (déploiement public, base PostgreSQL Neon).
- Le plan gratuit Render met le service en veille après une période d'inactivité : le premier chargement peut prendre 30 à 60 secondes.

## Accès local

- Site public : **http://localhost:3000**
- Espace administration : **http://localhost:3000/admin**
- Depuis un autre appareil du réseau : `http://10.51.24.229:3000`

### Modules publics

| Module | URL |
| --- | --- |
| Catalogue & filtres avancés | `/biens` |
| Carte interactive des biens | `/carte` |
| Comparateur (jusqu'à 4 biens) | `/comparer` |
| Simulateur de financement | `/simulateur` |
| Estimation loyer / prix | `/estimer` |
| Signalement d'incident | `/signalement` |
| Contact | `/contact` |
| Alertes & recherches enregistrées | `/alertes` |
| Espace locataire | `/connexion-locataire` |
| Espace propriétaire | `/connexion-proprietaire` |
| Messagerie interne (après connexion) | `/espace-locataire/messagerie`, `/espace-proprietaire/messagerie` |

> Portails clients : connexion par email + téléphone enregistrés auprès de l'agence, session JWT cookie `ahma_portail`, routes protégées par rôle.
> Comptes de démonstration : locataire `k.brou@gmail.com` / `+225 07 11 22 33 44`, propriétaire `y.kouassi@gmail.com` / `+225 07 08 12 34 56`.

### Connexion administrateur

- Email : `admin@ahma-immobilier.ci`
- Mot de passe de production : défini via `npm run admin:password`, **jamais versionné** (voir [DEPLOY.md](DEPLOY.md)).

> Les identifiants ne sont plus affichés sur la page de connexion. Le secret `JWT_SECRET` est fourni par l'environnement d'hébergement (32 caractères minimum).

### Gestion des comptes admin

- `/admin/comptes` : créer un administrateur avec son **poste dans l'agence**, modifier son nom/email/poste/mot de passe, supprimer un accès (sauf le sien et le dernier compte).
- `/admin/mon-compte` : modifier son propre profil (y compris le poste) et changer son mot de passe (avec vérification de l'ancien).

> Le poste est affiché dans la liste des comptes et dans l'en-tête de l'espace admin.

> L'accès à ces écrans et aux API correspondantes est réservé aux administrateurs connectés.

## Déploiement public

Pour héberger l’application complète en ligne (Next.js + base PostgreSQL + portails + administration), suivre [DEPLOY.md](DEPLOY.md). L’offre InfinityFree gratuite n’exécute que du PHP et ne peut pas faire fonctionner cette application.

## Démarrage

```bash
cd /srv/ahma-immobilier
npm run build
npm run start -- --hostname 0.0.0.0
```

Pour le développement : `npm run dev`.

Base de données : `prisma/dev.db` (SQLite). Réinitialisation : `npm run db:reset` (attention : supprime toutes les données).

## Améliorations apportées

- Photographies réelles pour les 12 biens (22 visuels WebP locaux dans `public/images/properties`).
- Refonte du hero, des cartes, du catalogue et des sections d'accueil (identité vert émeraude / or).
- Demandes de visite réellement enregistrées en base (`Visite`) + page admin `/admin/visites`.
- Galerie lightbox accessible (clavier, Échap, miniatures, compteur réel) et grille 4 visuels.
- Identifiants admin retirés de la page publique, mot de passe renforcé, secret JWT obligatoire.
- Quittances PDF uniquement pour les paiements encaissés.
- KPI publics calculés sur des données réelles et liste des quartiers dynamique (issue de la base).
- Pages Mentions légales / Confidentialité, favicon, sitemap, robots, Open Graph.
- Fichier `.env` ignoré par Git, en-têtes de sécurité HTTP, lint et build validés.
- **Enrichissement complet** : carte SVG interactive par quartier, comparateur persistant (localStorage), simulateur de prêt et de capacité d'emprunt, estimateur de loyer/prix calculé sur le catalogue.
- Formulaires réels : messages de contact et signalements persistés en base, avec référence de suivi et gestion admin (`/admin/messages`, `/admin/signalements`).
- Espaces locataire et propriétaire protégés : contrat, loyer, quittances PDF, paiements, biens et revenus, avec déconnexion.
- Administration étendue : modification des biens (`/admin/biens/[id]/modifier`), exports CSV (biens, paiements, contrats, visites, signalements, messages), nouveaux KPIs.
- Recherche avancée : budget, surface et nombre de chambres, sur l'accueil et le catalogue.
- **Design system premium** : typographie éditoriale Playfair Display pour les titres publics, palette émeraude/or affinée, cartes interactives, filtres latéraux avec puces actives, navigation avec état actif et bandeau de contact, parcours client en 3 étapes, écrans de connexion en split-screen photo, en-têtes de portails unifiés et sidebar admin structurée par sections.
- **Recherches enregistrées & alertes** : bouton « Enregistrer cette recherche » dans le catalogue, centre de notifications `/alertes` (lien privé par token), déclenchement automatique à la création d'un bien ou au passage en `disponible`, gestion et suivi dans `/admin/alertes`. Envoi d'email optionnel via Resend.
- **Messagerie interne** : conversations sécurisées entre locataires, propriétaires et agence (avec lien optionnel vers un bien concerné), fils de discussion, compteurs de messages non lus, création de threads par l'admin. Accès : `/admin/messagerie`, `/espace-locataire/messagerie`, `/espace-proprietaire/messagerie`.

### Alertes par email (optionnel)

Ajoutez ces variables dans `.env` pour activer les notifications par email via [Resend](https://resend.com) (sans clé, les alertes restent visibles dans l'application) :

```env
RESEND_API_KEY=re_...
MAIL_FROM="Ahma Immobilier <onboarding@resend.dev>"
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Crédits photos

Visuels de démonstration issus d'Unsplash (licence Unsplash) — voir la page Mentions légales.
