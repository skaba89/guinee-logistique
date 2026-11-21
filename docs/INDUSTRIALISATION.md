# Industrialisation — socle initial

## État initial (21 novembre 2026)

Référence : `ac0ef6d`. Prototype Next.js avec données de démonstration, authentification navigateur, SQLite générique. Aucune validation de production n'est acquise.

## Lot 1 — traçabilité et qualité

- Versionner uniquement un exemple de configuration, jamais les secrets réels.
- Installer les dépendances à partir du lockfile Bun.
- Exécuter TypeScript, ESLint, build et smoke test HTTP dans la CI ; les échecs doivent être corrigés, pas masqués.
- Ne pas confondre liveness et readiness métier.

## Lots suivants, par ordre de dépendance

1. PostgreSQL, migrations versionnées, organisations et utilisateurs, authentification serveur et permissions testées côté serveur.
2. Parcours métier persistant : client, devis, expédition, ramassage, livraison, facture, paiement.
3. Fret, WMS, douanes, documents et intégrations réelles ; séparation stricte des fixtures de démonstration.
4. Offline-first, GPS, intégrations comptables et paiements, tests terrain guinéens.
5. Sauvegarde et restauration, supervision, recette pilote et audit indépendant.

## Critères de non-régression

Préserver les pages et menus existants ; n'activer les parcours réels qu'après validation des contrats API, des droits, de la persistance et des tests multi-entreprises. Aucun déploiement de production avant la validation des risques critiques.
