// src/app/features/profil/profil.routes.ts
import { Routes } from '@angular/router';
import { ProfilEditComponent } from './pages/profil-edit/profil-edit.component';
import { ProfilDashboardComponent } from './pages/profil-dashboard/profil-dashboard.component';
import { PurchaseHistoryComponent } from './pages/purchase-history/purchase-history.component';
import { MyTicketsComponent } from './pages/my-tickets/my-tickets.component';
import { authGuard } from '../../core/guards/auth.guard';

export const PROFIL_ROUTES: Routes = [
  { path: '', component: ProfilDashboardComponent, canActivate: [authGuard] },
  { path: 'edit', component: ProfilEditComponent, canActivate: [authGuard] },
  { path: 'purchases', component: PurchaseHistoryComponent, canActivate: [authGuard] },
  { path: 'tickets', component: MyTicketsComponent, canActivate: [authGuard] }
];
