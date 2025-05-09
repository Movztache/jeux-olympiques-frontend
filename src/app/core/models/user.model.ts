// src/app/core/models/user.model.ts

// Définition des interfaces pour Role, Cart, Log et ReservationModel
// que nous pouvons simplifier pour l'instant

export interface Role {
  id?: number;
  name?: string;
  roleName?: string;
  description?: string;
  // Ajoutez d'autres propriétés selon votre entité Role
}

export interface Cart {
  id?: number;
  // Propriétés simplifiées, à compléter selon votre modèle
}

export interface Log {
  id?: number;
  // Propriétés simplifiées, à compléter selon votre modèle
}

export interface Reservation {
  id?: number;
  // Propriétés simplifiées, à compléter selon votre modèle
}

// Interface principale pour l'utilisateur
export interface User {
  userId?: number;
  lastName: string;
  firstName: string;
  password?: string; // Optionnel car souvent non retourné par l'API
  email: string;
  userKey?: string;
  role?: Role;
  roles: (Role | string)[]; // Tableau de rôles (objets Role ou chaînes de caractères)
  roleId?: number; // ID du rôle (1 pour Admin, 2 pour User)
  roleName?: string; // Nom du rôle (Admin, User)

  // Ces relations peuvent être optionnelles car elles sont souvent
  // chargées séparément ou sur demande
  carts?: Cart[];
  logs?: Log[];
  reservations?: Reservation[];
}

// Interface pour la réponse d'authentification
export interface AuthResponse {
  accessToken: string;
  refreshToken?: string;
  user: User;
}

// Interface pour la requête de connexion
export interface LoginRequest {
  email: string;
  password: string;
}

// Interface pour la requête d'inscription
export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}
