import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomePageComponent } from '../home/pages/home-page/home-page.component';

const routes: Routes = [
  // Redirection de la route racine vers /home
  { path: '', redirectTo: 'home', pathMatch: 'full' },

  // Route de la page d'accueil
  { path: 'home', component: HomePageComponent },

  // Autres routes principales
  // { path: 'events', loadChildren: () => import('./features/events/events.module').then(m => m.EventsModule) },
  // { path: 'offers', loadChildren: () => import('./features/offers/offers.module').then(m => m.OffersModule) },

  // Module d'authentification en lazy loading
  { path: 'auth', loadChildren: () => import('./auth.module').then(m => m.AuthModule) },

  // Vous pouvez ajouter d'autres modules ou routes ici

  // Gestion des routes inexistantes (toujours en dernière position)
  { path: '**', redirectTo: 'home' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
