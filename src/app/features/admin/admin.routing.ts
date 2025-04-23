// src/app/features/admin/admin.routes.ts
import { Routes } from '@angular/router';
import { DashboardPageComponent } from './pages/dashboard-page/dashboard-page.component';

export const ADMIN_ROUTES: Routes = [
  { path: '', component: DashboardPageComponent },
  // Ajoutez d'autres routes admin ici au besoin
  // { path: 'users', component: UsersManagementComponent },
  // { path: 'settings', component: AdminSettingsComponent },
];
