// src/app/core/authentication/token.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http'; // Type pour la fonction d'intercepteur HTTP
import { inject } from '@angular/core'; // Fonction pour injecter des dépendances dans des fonctions
import { AuthService } from './auth.service'; // Service d'authentification qui gère les tokens

/**
 * Intercepteur de token qui ajoute automatiquement le JWT aux en-têtes des requêtes HTTP
 * @param req La requête HTTP originale
 * @param next Le gestionnaire pour transmettre la requête dans la chaîne d'intercepteurs
 * @returns Un Observable de l'événement HTTP (réponse)
 */
export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  // Injection du service d'authentification (alternative moderne aux constructeurs)
  const authService = inject(AuthService);

  // Récupération du token JWT depuis le service d'authentification
  const token = authService.getToken();

  // Si un token existe (utilisateur connecté), on modifie la requête
  if (token) {
    // Les requêtes HTTP sont immuables, donc on crée une copie avec les modifications
    req = req.clone({
      setHeaders: {
        // Ajout de l'en-tête d'autorisation au format Bearer standard pour JWT
        Authorization: `Bearer ${token}`
      }
    });
  }

  // Transmission de la requête (modifiée ou non) au prochain intercepteur ou handler
  return next(req);
};
