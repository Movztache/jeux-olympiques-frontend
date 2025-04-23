// src/app/features/profil/profil.routes.ts
import { Routes } from '@angular/router';
import { ProfilViewComponent } from './pages/profil-view/profil-view.component';
import { authGuard } from '../../core/guards/auth.guard';

export const PROFIL_ROUTES: Routes = [
  {
    path: '',
    component: ProfilViewComponent,
    canActivate: [authGuard]
  }
];
