import { Routes } from '@angular/router';

export const PANIER_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/cart-page/cart-page.component').then(m => m.CartPageComponent)
  }
];
