# Spécification de Sécurité - IvoirEduc Pro

## Invariants de Données
1. **Accès Administrateur** : Seul l'email `ahoretjeancyrille777@gmail.com` authentifié via Google peut créer, supprimer ou réinitialiser des codes d'accès.
2. **Codes d'Accès** : 
   - Un code ne peut être lié qu'à un seul `usedByDeviceId`.
   - Une fois lié, `isUsed` doit impérativement passer à `true`.
   - L'expiration est fixée à 12 mois lors de la création.
3. **Evaluations** : 
   - Les enregistrements d'historique sont en "écriture seule" pour les utilisateurs (pas de modification possible après création).
   - Ils doivent respecter le format APC prescrit.

## Scénarios d'Attaque (The Dirty Dozen)
1. **Injection de Code** : Un utilisateur tente de créer son propre code d'accès via la console navigateur. -> *Bloqué par les règles (Admin requis).*
2. **Usurpation de Périphérique** : Un utilisateur tente de changer le `usedByDeviceId` d'un code déjà utilisé. -> *Bloqué par l'immuabilité du champ après usage.*
3. **Suppression Massive** : Un script tente de supprimer tous les codes de la collection. -> *Bloqué par les règles (Admin requis).*
4. **Injection de Junk Data** : Envoi d'un texte de 1Mo dans le champ `code`. -> *Bloqué par la validation de taille (.size() <= 10).*
5. **Modification d'Auteur** : Changement de l'email du créateur dans les métadonnées. -> *Bloqué par l'immuabilité.*
6. **Lecture de la liste des codes** : Un utilisateur tente de lister tous les codes valides pour en trouver un libre. -> *Bloqué (la lecture doit être ciblée via le code exact).*
7. **Bypass d'Expiration** : Tentative d'utilisation d'un code dont `expiresAt` est passé. -> *Bloqué par la logique temporelle des règles.*
8. **Shadow Update** : Tentative d'ajouter un champ `isVerified: true` non prévu au schéma. -> *Bloqué par affectedKeys().hasOnly().*
9. **Déni de Service (Wallet)** : Création de milliers de documents `evaluations`. -> *Limité par la validation de quota au niveau applicatif et structurel.*
10. **Modification de Rôle** : Tentative de se déclarer `administrateur` dans les documents. -> *Bloqué par les règles de validation de contenu.*
11. **Accès anonyme** : Tentative d'écriture sans être authentifié. -> *Bloqué par request.auth != null.*
12. **Corruption de Timestamps** : Envoi de dates futures pour les créations. -> *Bloqué par la validation via request.time.*
