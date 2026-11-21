# PostgreSQL SaaS — lot 2A

La base SQLite historique n'est pas modifiée. La nouvelle base est une fondation indépendante, avec organisations, agences, comptes et adhésions (6 rôles). Aucun écran n'utilise encore ces tables : l'authentification et les API sécurisées constituent le lot 2B.

## Installation locale

Créer une base PostgreSQL 16 dédiée, puis définir SAAS_DATABASE_URL avec un compte de migration administrateur (ne jamais versionner les identifiants). Exécuter avec un administrateur PostgreSQL :

```sh
psql "$SAAS_DATABASE_URL" -v ON_ERROR_STOP=1 -f prisma/saas/provision-role.sql
bunx prisma validate --schema prisma/saas/schema.prisma
bunx prisma migrate deploy --schema prisma/saas/schema.prisma
psql "$SAAS_DATABASE_URL" -v ON_ERROR_STOP=1 -f prisma/saas/tests/isolation.sql
```

Le test insère des fixtures transactionnelles et termine par ROLLBACK. À exécuter uniquement sur une base de test vide/dédiée.

## Contrat de sécurité

- gl_tenant est un rôle NOLOGIN sans BYPASSRLS. Il ne possède pas les tables.
- Les politiques RLS refusent tout accès tenant lorsque le contexte manque.
- Le serveur futur devra authentifier le compte, vérifier son adhésion active puis fixer le contexte via set_config('gl.organization_id', id, true) dans une transaction et utiliser un rôle d'exécution non propriétaire. Ne jamais accepter ce contexte directement du client.
- Les droits métier par rôle (admin, manager, agent, viewer, client, ramasseur) ne sont pas encore appliqués par une API. Le registre Account et les mutations des adhésions ne sont pas accessibles au rôle tenant.
- Le compte de migration et les accès de bootstrap sont distincts de l'exécution. Ne jamais mettre un utilisateur superuser à disposition de l'application.

Le prototype reste non autorisé en production ; aucune donnée SQLite n'est migrée automatiquement.

## Lot 2B — authentification serveur (API indépendante)

Regénérer le client SaaS : `bunx prisma generate --schema prisma/saas/schema.prisma`.
Exécuter la provision des rôles avant la nouvelle migration. Créer un login PostgreSQL dédié membre de gl_auth (pas de rôle gl_tenant, pas de propriétaire, pas de superuser). Configurer SAAS_AUTH_DATABASE_URL séparément de la connexion de migration. Les comptes doivent être provisionnés par un opérateur autorisé avec email normalisé et hash issu de hashPassword ; aucune inscription publique ni mot de passe par défaut.

Activer explicitement SAAS_AUTH_ENABLED=true et SAAS_PUBLIC_ORIGIN=https://votre-domaine (sans slash final). HTTPS obligatoire pour le cookie sécurisé.
- POST /api/saas/auth/login : JSON email, password, organizationId.
- GET /api/saas/auth/me : identité et rôle de l'adhésion active.
- POST /api/saas/auth/logout : révocation serveur.

Les sessions opaques expirent après 8 heures ; seul leur hash est stocké. Origine exacte requise pour les mutations. Le quota par email limite les tentatives (5/15 minutes), mais nécessite une protection complémentaire par IP/proxy, nettoyage périodique et monitoring avant production. Le rôle gl_auth a des droits de lecture sur le registre d'identité pour l'authentification, mais n'a pas d'accès aux agences. Ne jamais l'exposer au navigateur. Les pages historiques restent en mode démonstration et ne sont pas reliées aux sessions SaaS.
