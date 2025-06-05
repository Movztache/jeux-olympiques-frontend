# 🎫 Vibe-Ticket Frontend

[![Angular](https://img.shields.io/badge/Angular-19.2.5-red.svg)](https://angular.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7.2-blue.svg)](https://www.typescriptlang.org/)
[![Material Design](https://img.shields.io/badge/Material%20Design-19.2.8-blue.svg)](https://material.angular.io/)
[![AWS](https://img.shields.io/badge/AWS-S3%20%2B%20CloudFront-orange.svg)](https://aws.amazon.com/)

## 📋 Description du Projet

**Vibe-Ticket** est une plateforme de billetterie moderne pour les Jeux Olympiques de France 2025, développée avec Angular 19. L'application permet aux utilisateurs de consulter, réserver et acheter des billets pour différents événements sportifs et culturels.

### 🎯 Fonctionnalités Principales

- **🏠 Page d'accueil** : Présentation des événements disponibles
- **🎫 Gestion des offres** : Consultation et achat de billets (SOLO, DUO, TRIO, CUSTOM)
- **🛒 Panier d'achat** : Gestion des articles sélectionnés
- **💳 Paiement sécurisé** : Simulation de paiement avec génération de QR codes
- **👤 Authentification** : Système complet d'inscription/connexion
- **📱 Profil utilisateur** : Gestion des informations personnelles
- **📊 Administration** : Interface d'administration pour la gestion des offres et utilisateurs
- **📈 Statistiques** : Tableaux de bord avec graphiques de ventes

## 🏗️ Architecture

### Structure du Projet

```
src/
├── app/
│   ├── core/                    # Services singleton et fonctionnalités essentielles
│   │   ├── authentication/      # Services d'authentification
│   │   ├── guards/              # Guards de navigation
│   │   ├── interceptors/        # Intercepteurs HTTP
│   │   ├── models/              # Modèles de données
│   │   └── services/            # Services métier
│   ├── features/                # Modules fonctionnels
│   │   ├── admin/               # Module d'administration
│   │   ├── auth/                # Module d'authentification
│   │   ├── home/                # Module page d'accueil
│   │   ├── offer/               # Module gestion des offres
│   │   ├── panier/              # Module panier
│   │   ├── payment/             # Module paiement
│   │   ├── profil/              # Module profil utilisateur
│   │   └── reservation/         # Module réservations
│   ├── shared/                  # Composants et services partagés
│   │   ├── components/          # Composants réutilisables
│   │   ├── directives/          # Directives personnalisées
│   │   ├── models/              # Modèles partagés
│   │   └── pipes/               # Pipes personnalisés
│   └── layout/                  # Composants de mise en page
├── assets/                      # Ressources statiques
├── environments/                # Configuration d'environnement
└── styles.scss                  # Styles globaux
```

### Technologies Utilisées

- **Frontend** : Angular 19.2.5, TypeScript 5.7.2
- **UI/UX** : Angular Material 19.2.8, SCSS
- **State Management** : NgRx 19.1.0
- **Charts** : Chart.js 4.4.9, ngx-charts 22.0.0
- **QR Code** : angularx-qrcode 19.0.0
- **Authentication** : JWT avec jwt-decode 4.0.0
- **Linting** : ESLint, TypeScript ESLint
- **Build** : Angular CLI 19.2.5

## 🚀 Installation et Configuration

### Prérequis

- **Node.js** : Version 18.x ou supérieure
- **npm** : Version 9.x ou supérieure
- **Angular CLI** : Version 19.x

### Installation

1. **Cloner le repository**
   ```bash
   git clone <repository-url>
   cd vibe-ticket-frontend
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Configuration des environnements**
   
   **Développement** (`src/environments/environment.ts`) :
   ```typescript
   export const environment = {
     production: false,
     apiUrl: 'http://localhost:8080/api'
   };
   ```
   
   **Production** (`src/environments/environment.prod.ts`) :
   ```typescript
   export const environment = {
     production: true,
     apiUrl: 'http://13.36.187.182:8080/api'
   };
   ```

## 🛠️ Développement

### Serveur de développement

```bash
npm start
# ou
ng serve
```

L'application sera accessible sur `http://localhost:4200/`

### Génération de code

```bash
# Générer un composant
ng generate component features/nom-module/components/nom-composant

# Générer un service
ng generate service core/services/nom-service

# Générer un module
ng generate module features/nom-module
```

### Linting

```bash
# Vérification du code
ng lint

# Correction automatique
ng lint --fix
```

## 🏗️ Build et Déploiement

### Build de production

```bash
npm run build
# ou
ng build --configuration=production
```

Les fichiers de build seront générés dans le dossier `dist/vibe-ticket-frontend/`

### Déploiement AWS

Le projet inclut une configuration Terraform pour le déploiement sur AWS (S3 + CloudFront).

```bash
cd terraform/frontend
./deploy.sh
```

**URLs de déploiement** :
- **CloudFront** : http://dkf07zr8j0p2h.cloudfront.net
- **S3** : http://vibe-ticket-frontend-prod-6ju5v907.s3-website.eu-west-3.amazonaws.com

## 🔐 Authentification et Autorisation

### Rôles utilisateur

- **User** (roleId: 2) : Accès aux fonctionnalités de base
- **Admin** (roleId: 1) : Accès complet à l'administration

### Guards de navigation

- **authGuard** : Vérifie l'authentification
- **roleGuard** : Vérifie les autorisations par rôle

### Endpoints d'authentification

- `POST /api/auth/login` : Connexion
- `POST /api/auth/register` : Inscription
- `POST /api/auth/forgot-password` : Mot de passe oublié
- `POST /api/auth/reset-password` : Réinitialisation du mot de passe

## 📊 API Backend

### URL de base
- **Développement** : `http://localhost:8080/api`
- **Production** : `http://13.36.187.182:8080/api`

### Endpoints principaux

| Module | Endpoint | Méthodes | Description |
|--------|----------|----------|-------------|
| Offres | `/api/offers` | GET, POST, PUT, DELETE | Gestion des offres |
| Utilisateurs | `/api/utilisateurs` | GET, PUT | Gestion des utilisateurs |
| Panier | `/api/cart` | GET, POST, PUT, DELETE | Gestion du panier |
| Réservations | `/api/reservations` | GET, POST | Gestion des réservations |
| Statistiques | `/api/statistics` | GET | Données pour les graphiques |

## 🔧 Configuration

### Angular Material

Le projet utilise le thème `azure-blue` d'Angular Material configuré dans `angular.json`.

### NgRx Store

Configuration basique du store NgRx pour la gestion d'état future.

### Intercepteurs HTTP

- **tokenInterceptor** : Ajout automatique du token JWT
- **loggingInterceptor** : Journalisation des requêtes HTTP (désactivé en production)

## 📱 Responsive Design

L'application est entièrement responsive avec :
- **Mobile First** : Design optimisé pour mobile
- **Breakpoints** : Adaptation tablette et desktop
- **Navigation** : Menu hamburger sur mobile

## 🐛 Debugging et Logs

### Environnement de développement
- Router tracing activé
- Source maps disponibles
- DevTools NgRx disponibles

### Production
- Tous les console.log supprimés
- Optimisations activées
- Source maps désactivées
