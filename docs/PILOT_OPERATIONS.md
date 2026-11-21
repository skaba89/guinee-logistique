# Exploitation et pilote de Guinée Logistique

## Surveillance

Sur le VPS, depuis le dépôt, avec Node.js 22 :

```bash
node scripts/monitor.mjs rec
node scripts/monitor.mjs prod https://logistique.votre-domaine.com
```

Le premier contrôle est local, le second vérifie également le reverse proxy HTTPS.
Les deux vérifient le code 200 et le JSON attendu de /api/health et /api/ready,
sans suivre les redirections. Chaque sonde est limitée à 10 secondes.
Code de sortie 0 : succès ; 1 : service indisponible ; 2 : configuration invalide.
Les rapports JSON ne contiennent ni secrets ni corps de réponse.

Programmer une exécution toutes les deux minutes dans l'outil de supervision
existant, avec alerte après trois échecs consécutifs et notification de retour
à la normale. Utiliser un agent externe pour détecter la panne totale du VPS.
Les notifications et le canal d'astreinte doivent être configurés et testés
par l'exploitant ; aucun service d'alerte externe n'est installé par cette PR.

## Diagnostic

```bash
docker compose --env-file .env.prod ps
docker compose --env-file .env.prod logs --tail=200 app
docker compose --env-file .env.prod logs --tail=100 db
```

Les API SaaS journalisent une ligne JSON par requête : identifiant aléatoire
correspondant à X-Request-ID, date UTC, route normalisée, méthode, statut,
gravité et durée. Aucun identifiant métier, token, email, URL brute ou charge
utile n'est journalisé par ce mécanisme. Les journaux Docker app/db sont
limités à cinq fichiers de 10 Mo par conteneur ; ce n'est pas une piste
d'audit réglementaire. Restreindre leur accès aux exploitants.

En cas de 503 : vérifier localement les deux sondes, l'état des conteneurs,
la disponibilité du disque et les migrations, puis les journaux. Ne pas
exposer les secrets ou réinitialiser un volume. Un incident sur le proxy
avec sonde locale verte doit être traité séparément (TLS/DNS/proxy).

## Critères de passage au pilote

- [ ] CI entièrement verte et version approuvée.
- [ ] Recette sur le VPS avec domaine HTTPS, DNS et comptes réels autorisés.
- [ ] Validation d'une sauvegarde chiffrée hors VPS et restauration isolée.
- [ ] Supervision externe, notification d'alerte et procédure de retour à la normale testées.
- [ ] Capacité disque/CPU/RAM mesurée, test de charge adapté au volume pilote.
- [ ] Recette utilisateur avec administrateur, agent, ramasseur et client.
- [ ] Validation des documents commerciaux et des procédures Mobile Money manuelles.
- [ ] Responsable métier et exploitant identifiés ; fenêtre de retour arrière validée.

Les tests automatisés Docker ne remplacent pas la recette terrain ni les
validations légales/fiscales. Aucun déploiement PROD n'est effectué par la CI.
