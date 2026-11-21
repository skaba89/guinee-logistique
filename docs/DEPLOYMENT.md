# Déploiement Docker — DEV, REC, PROD

Pour le VPS Ubuntu partagé, utiliser d'abord la [procédure REC](VPS_RECETTE.md).

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

Voir [la procédure de supervision et de pilote](PILOT_OPERATIONS.md) pour
les sondes de disponibilité, les journaux structurés et les critères de passage en production.

```bash
docker compose --env-file .env.rec logs --tail=100 app
docker compose --env-file .env.rec stop app
docker compose --env-file .env.rec up -d --wait app
```

Ne pas exécuter `down -v` sur un environnement contenant des données. La CI utilise exclusivement une recette éphémère. Le script de déploiement sauvegarde automatiquement une base déjà migrée avant de lancer les nouvelles migrations ; en PROD il teste aussi la restauration en conteneur isolé avant de poursuivre. Une fenêtre de maintenance reste obligatoire avant chaque mise à jour réelle.

`/api/health` teste le processus ; `/api/ready` vérifie les deux connexions restreintes, leurs rôles et la présence du schéma métier. Il renvoie 503 sans exposer les erreurs ou les secrets. L'indicateur ne certifie ni la conformité fiscale ni la disponibilité des opérateurs Mobile Money.

Aucun compte par défaut n'est créé. Après déploiement, provisionner une nouvelle organisation et son premier administrateur depuis le serveur :

```bash
bash scripts/bootstrap-admin.sh rec "Ma société" ma-societe "Administrateur" admin@votre-domaine.com
```

Le mot de passe est demandé sans écho, haché par le même mécanisme que l'application et transmis via stdin. L'opération est atomique et refuse un slug ou email existant ; elle ne modifie aucun compte. Conserver l'identifiant d'organisation affiché pour la connexion.

## Sauvegardes et restauration de vérification

```bash
backup=$(bash scripts/backup.sh rec)
bash scripts/verify-restore.sh "$backup"
```

Le dump PostgreSQL custom et son empreinte SHA-256 sont stockés sous `backups/rec/` (ignoré par Git, accès restreint). Le test vérifie l'empreinte et restaure intégralement dans un conteneur PostgreSQL neuf sans réseau ni montage hôte, puis contrôle le schéma et les volumes d'organisations/administrateurs. Le conteneur de test est supprimé après vérification. Le dump inclut des informations privées et des sessions : le chiffrer avant copie hors site et appliquer une politique de conservation. Lors d'une récupération réelle, prévoir la réinitialisation des sessions et la reprovision des logins runtime à partir des secrets de l'environnement. Le script de vérification ne restaure jamais sur la base active.

Ne pas ouvrir PROD au trafic réel avant la recette métier, une restauration testée, l'organisation des sauvegardes hors site et la validation du proxy HTTPS.
