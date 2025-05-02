// src/app/features/admin/admin.routes.ts
import { Routes } from '@angular/router';
import { DashboardComponent} from './pages/dashboard-page/dashboard-page.component';

export const ADMIN_ROUTES: Routes = [
  { path: '', component: DashboardComponent }
  // Ajoutez d'autres routes admin ici au besoin
  // { path: 'users', component: UsersManagementComponent },
  // { path: 'settings', component: AdminSettingsComponent },
];
