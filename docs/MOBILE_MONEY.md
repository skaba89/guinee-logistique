# Mobile Money — socle interne

Le mode opérationnel actuel est manuel : une demande n'entraîne aucun transfert et ne réserve pas le solde. Une réception réellement vérifiée est enregistrée comme règlement, rapprochée par justificatif unique, puis associée à une seule demande compatible (facture, montant GNF, opérateur). Une clôture n'ajoute aucune écriture financière.

## Contrat à valider avant intégration opérateur

- Obtenir les contrats marchands et documentations officielles spécifiques à la Guinée, accès de recette, identifiants marchands et procédures de certification.
- Créer un adaptateur par opérateur, côté serveur, avec initiation idempotente et lecture de statut. Ne pas inventer d'URL ou de protocole d'authentification.
- Vérifier l'authenticité des notifications selon le contrat officiel, les montants, devise, compte marchand et référence ; confirmer le statut auprès de l'opérateur avant toute comptabilisation.
- Dédupliquer les événements, verrouiller facture et transaction lors de l'enregistrement, gérer les retards, états ambigus, expirations et reprises. Ne jamais considérer une réponse d'initiation comme un encaissement.
- Prévoir des secrets distincts par environnement et entreprise, sans exposition au navigateur, journaliser les changements sans secrets ni données personnelles superflues.
- Tester en recette avec les opérateurs : succès, échec, doublons, rejeu, timeout, montant incohérent, rapprochement et refus inter-tenant. Aucun flux réel avant cette validation.
