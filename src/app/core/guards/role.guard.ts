// src/app/core/guards/role.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../authentication/auth.service';

export const roleGuard = (allowedRoles: string[]): CanActivateFn => {
  return (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    // Vérifier d'abord si l'utilisateur est connecté
    if (!authService.isLoggedIn()) {
      return router.createUrlTree(['/auth/login'], {
        queryParams: { returnUrl: state.url }
      });
    }

    // Vérifier si l'utilisateur a le rôle requis
    if (authService.hasRole(allowedRoles)) {
      return true;
    }

    // Rediriger vers une page d'accès refusé
    return router.createUrlTree(['/access-denied']);
  };
};
