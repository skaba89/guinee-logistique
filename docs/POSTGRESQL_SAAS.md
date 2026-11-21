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
