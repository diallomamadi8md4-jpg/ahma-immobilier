# Déploiement public de Ahma Immobilier

## Déploiement effectif

- **URL publique** : https://ahma-immobilier.onrender.com
- **Code source** : https://github.com/diallomamadi8md4-jpg/ahma-immobilier
- **Hébergement** : Render (web service Docker, plan gratuit, région Virginia).
- **Base de données** : Neon PostgreSQL (plan gratuit, région US East).
- **Health check** : `/healthcheck` (endpoint statique sans base de données).
- **Redéploiement manuel** : `render deploys create srv-dc1t5edg1s2s73eb2ji0` (CLI Render).
- **Mot de passe admin** : à régénérer avec `npm run admin:password` ; ne jamais le committer.

## Pourquoi pas l’hébergement InfinityFree fourni ?

InfinityFree (offre gratuite) exécute uniquement du PHP : ni Node.js, ni `npm run build`, ni processus serveur persistant. L’application utilise Next.js côté serveur, Prisma, l’authentification JWT, la messagerie, les alertes et les quittances PDF : elle ne peut donc pas fonctionner là-bas. De plus, un sous-domaine gratuit `*.freedev.app` ne peut pas être redirigé vers un autre hébergeur.

## Ce qui a été préparé dans le projet

- `Dockerfile` : image de production Next.js en mode `standalone`.
- `render.yaml` : blueprint Render (web service gratuit).
- `prisma/schema.cloud.prisma` : schéma PostgreSQL (le schéma SQLite local reste inchangé).
- `npm run build:cloud` / `npm run db:cloud:init` : commandes de build et d’initialisation cloud.
- Photos d’administration stockées en base (`PhotoUpload`) et servies via `/api/photos/[id]` : elles survivent aux redémarrages.
- `sitemap.xml` généré à la demande (aucun accès base au build).
- `npm run admin:password` : changement du mot de passe admin avant mise en ligne.

## Déploiement recommandé : Render + Neon (gratuit)

### 1. Base de données Neon (permanente, sans carte bancaire)

1. Créer un compte sur <https://neon.com> → **New project**.
2. Copier la **pooled connection string** (`postgresql://...@....-pooler....`).
3. La conserver précieusement : elle sert à la fois à l’initialisation et à l’application.

### 2. Application sur Render

1. Créer un compte sur <https://render.com>.
2. **New → Blueprint** et sélectionner le dépôt contenant ce projet (le fichier `render.yaml` est détecté automatiquement).
   - Alternatif : **New → Web Service → Docker Image** en utilisant une image construite depuis le `Dockerfile`.
3. Renseigner les variables d’environnement :
   - `DATABASE_URL` = la chaîne Neon ;
   - `NEXT_PUBLIC_APP_URL` = l’URL publique finale (ex. `https://ahma-immobilier.onrender.com`) ;
   - `JWT_SECRET` est généré automatiquement par le blueprint ;
   - `RESEND_API_KEY` et `MAIL_FROM` sont facultatifs.
4. Déployer. L’URL `https://<nom-du-service>.onrender.com` devient accessible.

### 3. Initialiser la base (une seule fois)

Depuis ce dossier, avec la chaîne Neon :

```bash
DATABASE_URL="postgresql://..." npm run db:cloud:init
```

Cela crée les tables puis insère les biens, locataires, propriétaires, contrats et paiements de démonstration.

### 4. Sécurité avant ouverture au public

```bash
DATABASE_URL="postgresql://..." ADMIN_EMAIL="admin@ahma-immobilier.ci" ADMIN_PASSWORD="NouveauMotDePasseSolide" npm run admin:password
```

Changer également le mot de passe FTP InfinityFree qui a été communiqué dans la conversation.

### 5. Nom de domaine

- L’URL Render fonctionne immédiatement avec HTTPS.
- Pour utiliser un vrai domaine (ex. `ahma-immobilier.ci`), l’acheter chez un registrar puis l’ajouter dans **Render → Settings → Custom Domains** et suivre les instructions DNS.
- Le sous-domaine gratuit `immobilier.freedev.app` ne peut pas être utilisé : InfinityFree impose ses DNS et n’autorise pas le déploiement d’une appli Node.

## Vérifications après déploiement

- `/`, `/biens`, `/biens/1`, `/alertes`, `/contact` → 200
- `/connexion-locataire`, `/connexion-proprietaire`, `/admin/login` → 200
- `/admin`, `/espace-locataire`, `/espace-proprietaire` → 307 sans session
- Ajouter une photo dans l’admin : elle doit rester visible après redémarrage du service.
