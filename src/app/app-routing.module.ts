import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './features/auth/pages/login/login.component';
import { authGuard } from './core/guards/auth.guard';
import { HomePageComponent } from './features/home/pages/home-page/home-page.component';

const routes: Routes = [
  // IMPORTANT: Cette redirection doit être en PREMIER
  { path: '', redirectTo: 'home', pathMatch: 'full' },

  // Page d'accueil - SANS authGuard
  { path: 'home', component: HomePageComponent },

  // Page de login
  { path: 'login', component: LoginComponent },

  // Pages protégées - avec authGuard
  {
    path: 'profil',
    loadChildren: () => import('./features/profil/profil.module').then(m => m.ProfilModule),
    canActivate: [authGuard]
  },
  // Autres routes protégées...

  // Redirection de toute route inconnue vers home
  { path: '**', redirectTo: 'home' }
];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
