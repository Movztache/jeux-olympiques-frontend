import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/pages/login/login.component';
import { HomePageComponent } from './features/home/pages/home-page/home-page.component';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { MainLayoutComponent } from './shared/components/layout/main-layout/main-layout.component';
import { RegisterComponent } from './features/auth/pages/register/register.component';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      // Page d'accueil - accessible sans connexion
      { path: 'home', loadChildren: () => import('./features/home/home.routing').then(m => m.HOME_ROUTES) },

      // Redirection de la racine vers home
      { path: '', redirectTo: 'home', pathMatch: 'full' },

      { path: 'offres', loadChildren: () => import('./features/offer/offer.routing').then(m => m.OFFER_ROUTES)},

      {path: 'panier',loadChildren: () => import('./features/panier/cart.routing').then(m => m.PANIER_ROUTES) },

      {path: 'reservations',loadChildren: () => import('./features/reservation/reservation.routing').then(m => m.RESERVATIONS_ROUTES),},

      {path: 'payment', loadChildren: () => import('./features/payment/payment.routing').then(m => m.PAYMENT_ROUTES),canActivate: [authGuard]},

      //
      { path: 'profile', loadChildren: () => import('./features/profil/profil.routing').then(m => m.PROFIL_ROUTES), canActivate : [authGuard] },

      { path: 'authentication', loadChildren: () => import('./features/auth/auth.routing').then(m => m.AUTH_ROUTES) },

      { path: 'admin',loadChildren: () => import('./features/admin/admin.routing').then(m => m.ADMIN_ROUTES), canActivate: [authGuard, roleGuard(['Admin'])] },

      {
        path: 'actualites',
        children: [
          {
            path: '',
            loadComponent: () => import('./features/news/pages/news-list/news-list.component').then(m => m.NewsListComponent),
            data: { title: 'Actualités - Vibe-ticket' }
          },
          {
            path: ':id',
            loadComponent: () => import('./features/news/pages/news-detail/news-detail.component').then(m => m.NewsDetailComponent),
            data: { title: 'Article - Vibe-ticket' }
          }
        ]
      },

      // Redirection de toute route inconnue vers home
      { path: '**', redirectTo: 'home' }
    ]
  },

  // Pages d'authentification (en dehors du layout principal)
  { path: 'login', component: LoginComponent },
  { path: 'inscription', component: RegisterComponent }
];
