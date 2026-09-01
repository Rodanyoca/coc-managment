# SaaS du Comité Olympique Congolais

Ce contexte décrit le langage métier partagé du SaaS du COC. Les choix techniques et les règles détaillées sont documentés séparément.

## Identités et accès

**Utilisateur**:
Compte nominatif autorisé à accéder à tout ou partie du SaaS. Il reste distinct d'un acteur sportif, même lorsqu'ils représentent la même personne.
_Éviter_: Acteur, profil, login

**Type d'utilisateur**:
Niveau général d'intervention d'un utilisateur : `ADMIN` ou `VIEWER`.
_Éviter_: Rôle, profil d'accès

**Super-administrateur**:
Utilisateur habilité à gérer les utilisateurs, leurs autorisations et les référentiels. Cette qualité lui donne également un accès complet aux blocs métier et à toutes les sections de navigation.
_Éviter_: Administrateur global, propriétaire

**Bloc d'autorisation**:
Périmètre fonctionnel explicite auquel un utilisateur peut accéder : administration métier, gestion sportive ou communication.
_Éviter_: Rôle, permission implicite

**Autorisation utilisateur**:
Attribution datée et révocable d'un bloc d'autorisation à un utilisateur. L'absence d'une attribution valide signifie un refus d'accès.
_Éviter_: Droit par défaut, permission héritée

## États du compte

**Compte actif**:
Compte autorisé à tenter une authentification, sous réserve de satisfaire les autres contrôles de sécurité.

**Compte inactif**:
Compte désactivé administrativement de manière durable, mais conservé avec son historique.
_Éviter_: Compte supprimé

**Compte bloqué**:
Compte frappé d'un blocage administratif permanent qui exige l'intervention d'un super-administrateur.
_Éviter_: Blocage temporaire

**Blocage temporaire**:
Refus automatique de nouvelles connexions pendant trente minutes après dix échecs de connexion. Il ne modifie pas le statut administratif du compte.
_Éviter_: Compte bloqué

**Activation du compte**:
Première connexion contrôlée au cours de laquelle l'utilisateur remplace son accès temporaire avant d'accéder au SaaS.
_Éviter_: Connexion normale

**Accès temporaire**:
Secret à usage transitoire, valable vingt-quatre heures, remis à l'utilisateur pour activer ou récupérer son compte.
_Éviter_: Mot de passe permanent

## Traçabilité

**Session**:
Accès authentifié limité dans le temps et lié à la version de session courante de l'utilisateur.

**Version de session**:
Compteur du compte dont la modification rend invalides toutes les sessions émises avec une version antérieure.

**Opération auditée**:
Action importante dont l'auteur, la cible, la date et le résultat sont conservés sans secret d'authentification.
_Éviter_: Log technique
