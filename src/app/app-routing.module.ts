import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './features/auth/pages/login/login.component';
import { HomeComponent } from './home/home.component';

// La constante routes définit toutes les routes disponibles dans l'application
const routes: Routes = [
  // Cette route associe le chemin 'login' au composant LoginComponent
  // Quand l'URL sera '/login', Angular affichera le composant LoginComponent
  { path: 'login', component: LoginComponent },

  // Cette nouvelle route associe le chemin 'home' au composant HomeComponent
  // Quand l'URL sera '/home', Angular affichera le composant HomeComponent que nous venons de créer
  { path: 'home', component: HomeComponent },

  // Cette route gère l'URL racine '' (ex: http://localhost:4200/)
  // 'redirectTo' redirige vers le chemin spécifié ('/login')
  // 'pathMatch: full' signifie que toute l'URL doit correspondre exactement au chemin vide ''
  { path: '', redirectTo: '/login', pathMatch: 'full' },

  // Cette route avec '**' est un joker qui correspond à toutes les routes non définies ci-dessus
  // Elle redirige vers '/login' pour toutes les URLs qui ne correspondent à aucune route définie
  { path: '**', redirectTo: '/login' }
];

@NgModule({
  // RouterModule.forRoot(routes) enregistre les routes au niveau racine de l'application
  // C'est nécessaire pour que le système de routing fonctionne
  imports: [RouterModule.forRoot(routes)],

  // Exporte RouterModule pour qu'il soit disponible dans tout le module AppModule
  // Cela nous permet d'utiliser des directives comme routerLink et router-outlet
  exports: [RouterModule]
})
export class AppRoutingModule { }

