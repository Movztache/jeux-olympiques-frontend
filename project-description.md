# Description du Projet - Simulation de Billetterie Jeux Olympiques France

## Objectif Principal
Développer une plateforme de billetterie en ligne pour les Jeux Olympiques en France permettant aux clients de consulter, réserver et acheter des billets pour les différentes épreuves.

## Fonctionnalités Principales

### 1. Présentation des Jeux Olympiques
- Page d'accueil présentant les Jeux Olympiques et quelques épreuves

### 2. Gestion des Offres
- Affichage des offres disponibles (solo, duo, familiale)
  - Solo : accès pour 1 personne
  - Duo : accès pour 2 personnes
  - Familiale : accès pour 4 personnes
- Possibilité pour les clients de sélectionner et mettre des offres dans leur panier
- Interface administrateur pour gérer les offres (visualiser/ajouter/modifier/créer)

### 3. Authentification et Sécurité
- Création de compte utilisateur avec:
  - Nom d'utilisateur (nom et prénom)
  - Adresse e-mail
  - Mot de passe (avec politique de sécurité définie par le développeur)
- Génération d'une clé invisible pour l'utilisateur mais accessible par l'organisation
- Processus de vérification de l'identité de l'utilisateur lors de la connexion

### 4. Processus d'Achat
- Authentification obligatoire pour terminer une réservation
- Simulation de paiement (mock)
- Génération d'une seconde clé lors de l'achat
- Création d'un e-billet avec QR code basé sur la concaténation des deux clés
  - La clé finale sécurise le billet et permet de vérifier son authenticité
  - Le QR code sera scanné lors de l'événement pour vérifier l'identité du titulaire

### 5. Fonctionnalités Administrateur
- Compte administrateur prédéfini (non créable via l'application)
- Visualisation des statistiques de vente par offre
- Gestion des offres (CRUD)
