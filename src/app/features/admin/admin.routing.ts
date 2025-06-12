// src/app/features/admin/admin.routes.ts
import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard-page/dashboard-page.component';
import { OfferListComponent } from './pages/offer-list/offer-list.component';
import { OfferFormComponent } from './pages/offer-form/offer-form.component';
import { OfferDetailComponent } from './pages/offer-detail/offer-detail.component';
import { UserListComponent } from './pages/user-list/user-list.component';

export const ADMIN_ROUTES: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'offers', component: OfferListComponent },
  { path: 'offers/create', component: OfferFormComponent },
  { path: 'offers/edit/:id', component: OfferFormComponent },
  { path: 'offers/:id', component: OfferDetailComponent },
  { path: 'users', component: UserListComponent },
  {
    path: 'news',
    loadComponent: () => import('./pages/admin-news-list/admin-news-list.component').then(m => m.AdminNewsListComponent),
    data: { title: 'Gestion des Actualités - Admin' }
  },
  {
    path: 'news/create',
    loadComponent: () => import('./pages/admin-news-form/admin-news-form.component').then(m => m.AdminNewsFormComponent),
    data: { title: 'Nouvelle Actualité - Admin' }
  },
  {
    path: 'news/edit/:id',
    loadComponent: () => import('./pages/admin-news-form/admin-news-form.component').then(m => m.AdminNewsFormComponent),
    data: { title: 'Modifier Actualité - Admin' }
  }
  // Ajoutez d'autres routes admin ici au besoin
  // { path: 'settings', component: AdminSettingsComponent },
];
