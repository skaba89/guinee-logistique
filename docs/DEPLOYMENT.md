# Déploiement Docker — DEV, REC, PROD

La stack utilise PostgreSQL 16, un conteneur ponctuel de provision des rôles, un conteneur ponctuel de migration Prisma et un serveur Next.js standalone non-root. La base SQLite de démonstration n'est pas copiée dans l'image. Chaque environnement possède son propre projet Compose, réseau et volume PostgreSQL.

| Environnement | Fichier secret | Port local | Usage |
|---|---|---|---|
| DEV | .env.dev | 8400 | développement/test |
| REC | .env.rec | 8401 | recette métier |
| PROD | .env.prod | 8402 | production après validation |

## Démarrage sur Ubuntu (ou Git Bash + Docker Desktop)

Prérequis : Docker Engine avec Compose v2, OpenSSL, Git, espace disque suffisant. Réserver les ports et vérifier qu'ils ne sont pas utilisés. Les commandes suivantes ne déploient rien sur un serveur distant.

```bash
bash scripts/init-deploy-env.sh rec https://rec.votre-domaine.com
bash scripts/deploy.sh rec
curl -fsS http://127.0.0.1:8401/api/health
curl -fsS http://127.0.0.1:8401/api/ready
docker compose --env-file .env.rec ps
```

Les secrets hexadécimaux aléatoires sont générés sans écraser un fichier existant et ignorés par Git. Ne pas les communiquer ou afficher la configuration Compose résolue. Ne jamais réinitialiser le mot de passe PostgreSQL d'un volume existant en éditant simplement le fichier. Les deux connexions runtime utilisent des rôles distincts, sans droits de migration ni contournement RLS. Le serveur n'a pas accès au compte postgres.

Le service HTTP écoute uniquement sur 127.0.0.1 côté hôte, PostgreSQL n'est pas publié. Configurer le reverse proxy HTTPS existant du VPS vers le port local de l'environnement choisi. Le cookie de session sécurisé exige HTTPS et l'origine exacte, sans slash final.

## Exploitation

```bash
docker compose --env-file .env.rec logs --tail=100 app
docker compose --env-file .env.rec stop app
docker compose --env-file .env.rec up -d --wait app
```

Ne pas exécuter `down -v` sur un environnement contenant des données. La CI utilise exclusivement une recette éphémère. Les migrations sont additives à ce stade, mais une sauvegarde restaurable et une fenêtre de maintenance sont obligatoires avant chaque mise à jour d'une base réelle. Les procédures de sauvegarde et de restauration isolée seront livrées au lot suivant.

`/api/health` teste le processus ; `/api/ready` vérifie les deux connexions restreintes, leurs rôles et la présence du schéma métier. Il renvoie 503 sans exposer les erreurs ou les secrets. L'indicateur ne certifie ni la conformité fiscale ni la disponibilité des opérateurs Mobile Money.

Aucun compte par défaut n'est créé. Le provisionnement de la première organisation et de son administrateur demeure une opération contrôlée distincte. Ne pas ouvrir PROD au trafic réel avant cette étape, la recette métier, les sauvegardes et la validation du proxy HTTPS.
