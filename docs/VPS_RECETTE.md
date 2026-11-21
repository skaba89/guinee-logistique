# Mise en recette sur Ubuntu OVHCloud

Cette procédure ne modifie aucune autre application du VPS. Les commandes
sont destinées au serveur Docker local (pas à un contexte Docker distant).
Ne pas démarrer PROD à ce stade.

## 1. Préparer

Choisir un sous-domaine dédié, créer son DNS vers le VPS et vérifier
que le proxy HTTPS existant peut le servir. Réserver le port local 8401.
Prérequis : Git, Docker Compose v2, OpenSSL, Python 3, Node.js 22.

```bash
cd /home/ubuntu
git clone https://github.com/skaba89/guinee-logistique.git
cd guinee-logistique
git switch main
git pull --ff-only origin main
```

Si le dépôt existe déjà, entrer dedans et vérifier son état avant le pull.
Remplacer l'exemple de domaine ci-dessous par le sous-domaine réellement choisi.

```bash
bash scripts/init-deploy-env.sh rec https://rec-logistique.votre-domaine.example
python3 scripts/rec-preflight.py
```

Ne pas relancer l'initialisation si .env.rec existe. Ne pas afficher ce
fichier. Le préflight refuse les secrets non privés, un projet ou port
incorrect, une base exposée, un volume inattendu, un port déjà occupé et
un espace disque insuffisant sur le système de fichiers du dépôt.
Vérifier séparément l'espace Docker, la RAM et la charge des autres services.

## 2. Déployer la recette

```bash
bash scripts/deploy.sh rec
python3 scripts/rec-preflight.py
node scripts/monitor.mjs rec
```

Ne jamais lancer les fixtures CI sur la recette persistante.
Créer un premier administrateur via la procédure interactive :

```bash
bash scripts/bootstrap-admin.sh rec "Société pilote" societe-pilote "Administrateur" admin@votre-domaine.example
```

## 3. HTTPS

Ajouter uniquement le nouveau virtual host à la configuration existante
du proxy. Le modèle `infra/Caddyfile.rec.example` est destiné à un Caddy
installé sur l'hôte ; si le proxy fonctionne dans un conteneur, adapter
le routage sans exposer PostgreSQL ni le port 8401 sur Internet.
Valider la configuration du proxy avant toute recharge.
Ne pas utiliser le Caddyfile de démonstration à la racine du dépôt.
Ne pas désactiver la vérification TLS.

## 4. Preuves de déploiement

```bash
python3 scripts/rec-evidence.py
backup=$(bash scripts/backup.sh rec)
bash scripts/verify-restore.sh "$backup"
```

Le rapport JSON contrôle la configuration, les conteneurs, les sondes
locales et HTTPS et indique le commit du checkout (pas une attestation
cryptographique de l'image déployée). Il ne contient pas de secrets.
Il échoue si le domaine HTTPS n'est pas disponible ; il n'autorise jamais
la production. Conserver les preuves et réaliser les validations restantes
dans [PILOT_OPERATIONS.md](PILOT_OPERATIONS.md).
