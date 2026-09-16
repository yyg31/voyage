# Déploiement sur le VPS OVH

Ce runbook suppose (comme sur ton VPS) que **Docker** et **Caddy** sont déjà
installés côté hôte, et que le DNS de `asia26.ygouf.com` pointe déjà vers
l'IP du VPS. Toutes les commandes ci-dessous s'exécutent **sur le VPS**, en
SSH, pas depuis Claude Code.

## 0. Pré-requis

```bash
ssh ubuntu@<IP_DU_VPS>
docker --version          # Docker + le plugin "compose" (docker compose version)
caddy version
```

Si `docker compose version` échoue, installe le plugin :
```bash
sudo apt-get update && sudo apt-get install -y docker-compose-plugin
```

## 1. Récupérer le code

```bash
sudo mkdir -p /opt/asia26 && sudo chown $USER:$USER /opt/asia26
git clone https://github.com/yyg31/voyage.git /opt/asia26
cd /opt/asia26
```

(Pour une mise à jour ultérieure : `cd /opt/asia26 && git pull`.)

## 2. Configurer les secrets

```bash
./deploy/generate-env.sh
```

Ça crée `.env` à la racine avec un `POSTGRES_PASSWORD` et un `JWT_SECRET`
générés aléatoirement (`openssl rand`). Vérifie ensuite que
`CORS_ORIGIN=https://asia26.ygouf.com` dans `.env`.

`.env` n'est **jamais** commité (voir `.gitignore`) — il reste uniquement
sur le VPS.

## 3. Lancer le stack

```bash
./deploy/deploy.sh --seed
```

`--seed` charge les données de démo (2 familles, 9 membres, 5 escales,
vols/activités/liens/forum) — **à ne faire qu'une seule fois**, au premier
déploiement (le script de seed vide et recrée ces tables ; ne le relance
pas si des membres ont déjà commencé à modifier leurs données en prod, ou
adapte `backend/prisma/seed.js` à ce moment-là).

Pour les déploiements suivants (mise à jour du code), sans `--seed` :

```bash
git pull
./deploy/deploy.sh
```

Ça reconstruit les images et redémarre les containers ; Prisma applique
automatiquement les migrations en attente au démarrage du backend
(`prisma migrate deploy`, voir `backend/Dockerfile`).

## 4. Brancher Caddy (une fois)

Le `Caddyfile` du repo (`/opt/asia26/Caddyfile`) définit le bloc du site
`asia26.ygouf.com`. **S'il y a déjà d'autres sites sur ce VPS** (Caddy gère
plusieurs domaines dans un seul `Caddyfile`), ne l'écrase pas : importe-le.

**Option A — ton Caddyfile principal utilise déjà `import
sites-enabled/*`** (pratique courante) :
```bash
sudo mkdir -p /etc/caddy/sites-enabled
sudo ln -sf /opt/asia26/Caddyfile /etc/caddy/sites-enabled/asia26.ygouf.com
```

**Option B — pas de `sites-enabled`** : ajoute une ligne dans
`/etc/caddy/Caddyfile` existant :
```
import /opt/asia26/Caddyfile
```

**Option C — c'est le seul site du VPS** :
```bash
sudo cp /opt/asia26/Caddyfile /etc/caddy/Caddyfile
```

Puis dans tous les cas :
```bash
sudo caddy validate --config /etc/caddy/Caddyfile
sudo systemctl reload caddy
```

Caddy obtient et renouvelle automatiquement le certificat Let's Encrypt
pour `asia26.ygouf.com` (DNS déjà en place → ça devrait passer directement).

## 5. Vérifier

```bash
curl -I https://asia26.ygouf.com/health
```

Doit renvoyer `200` avec `{"status":"ok"}`. Puis ouvrir
`https://asia26.ygouf.com` dans un navigateur et se connecter avec un des
comptes créés par le seed (voir `README.md`).

## Opérations courantes

| Action | Commande (sur le VPS, dans `/opt/asia26`) |
|---|---|
| Voir les logs | `docker compose logs -f backend` (ou `frontend`, `db`) |
| Redémarrer un service | `docker compose restart backend` |
| Statut des containers | `docker compose ps` |
| Sauvegarder la base | `docker compose exec db pg_dump -U asia26 asia26 > backup.sql` |
| Créer un compte admin supplémentaire | via l'UI (`/admin`, connecté en admin) ou `docker compose exec backend node -e "..."` |
| Changer un mot de passe oublié côté serveur | consulter les logs backend (`[password reset] ...`) après une demande via `/login` → "Mot de passe oublié" |

## Sécurité

- `db`, `backend` et `frontend` n'écoutent que sur `127.0.0.1` (voir
  `docker-compose.yml`) — seul Caddy, sur l'hôte, est exposé publiquement.
- `.env` contient des secrets : permissions restrictives recommandées
  (`chmod 600 .env`), jamais commité.
- Pense à limiter l'accès SSH au VPS (clé uniquement, pas de mot de passe)
  et à changer tout mot de passe qui aurait pu être partagé ailleurs.
