import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './features/auth/pages/login/login.component';
import { authGuard } from './core/guards/auth.guard';
import { HomePageComponent } from './features/home/pages/home-page/home-page.component';
import { RegisterComponent } from './features/auth/pages/register/register.component';
import { roleGuard } from './core/guards/role.guard';

const routes: Routes = [
  // IMPORTANT: Cette redirection doit être en PREMIER
  { path: '', redirectTo: 'home', pathMatch: 'full' },

  // Page d'accueil - SANS authGuard
  { path: 'home', component: HomePageComponent },

  // Pages d'authentification
  { path: 'login', component: LoginComponent },
  { path: 'inscription', component: RegisterComponent },

  // Billetterie accessible à tous
  {
    path: 'billetterie',
    loadChildren: () => import('./features/offer/offer.module').then(m => m.OfferModule)
  },

  // Panier accessible à tous
  // Note: le panier pourrait être accessible sans authentification,
  // mais certaines fonctionnalités comme la finalisation d'achat pourraient nécessiter une connexion
  {
    path: 'panier',
    loadChildren: () => import('./features/panier/panier.module').then(m => m.PanierModule)
  },

  // Pages protégées - avec authGuard
  {
    path: 'profil',
    loadChildren: () => import('./features/profil/profil.module').then(m => m.ProfilModule),
    canActivate: [authGuard]
  },
  {
    path: 'mes-billets',
    loadChildren: () => import('./features/mes-billets/mes-billets.module').then(m => m.MesBilletsModule),
    canActivate: [authGuard]
  },

  // Pages d'administration - remplacer adminGuard par roleGuard avec le rôle ADMIN
  {
    path: 'admin/dashboard',
    loadChildren: () => import('./features/admin/admin.module').then(m => m.AdminModule),
    canActivate: [authGuard, roleGuard(['ADMIN'])]
  },

  // Redirection de toute route inconnue vers home
  { path: '**', redirectTo: 'home' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
