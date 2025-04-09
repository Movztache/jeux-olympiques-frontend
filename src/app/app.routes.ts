import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/pages/login/login.component';
import { HomePageComponent } from './features/home/pages/home-page/home-page.component';
import { authGuard } from './core/guards/auth.guard';
import { MainLayoutComponent } from './shared/components/layout/main-layout/main-layout.component'; // Ajoutez cet import

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent, // Utilisez le layout comme composant parent
    children: [
      // Page d'accueil - accessible sans connexion
      { path: 'home', component: HomePageComponent },

      // Redirection de la racine vers home
      { path: '', redirectTo: 'home', pathMatch: 'full' },

      // Pages protégées
      {
        path: 'profil',
        loadChildren: () => import('./features/profil/profil.module').then(m => m.ProfilModule),
        canActivate: [authGuard]
      },

      // Redirection de toute route inconnue vers home
      { path: '**', redirectTo: 'home' }
    ]
  },

  // Page de login (en dehors du layout principal si vous préférez)
  { path: 'login', component: LoginComponent },
];
