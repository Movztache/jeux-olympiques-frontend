// src/app/features/admin/admin.routes.ts
import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard-page/dashboard-page.component';
import { OfferListComponent } from './pages/offer-list/offer-list.component';
import { OfferFormComponent } from './pages/offer-form/offer-form.component';
import { OfferDetailComponent } from './pages/offer-detail/offer-detail.component';

export const ADMIN_ROUTES: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'offers', component: OfferListComponent },
  { path: 'offers/create', component: OfferFormComponent },
  { path: 'offers/edit/:id', component: OfferFormComponent },
  { path: 'offers/:id', component: OfferDetailComponent }
  // Ajoutez d'autres routes admin ici au besoin
  // { path: 'users', component: UsersManagementComponent },
  // { path: 'settings', component: AdminSettingsComponent },
];
