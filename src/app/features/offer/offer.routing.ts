// src/app/features/offer/offer.routes.ts
import { Routes } from '@angular/router';
import {OfferPageComponent} from './pages/offer-page/offer-page.component';
import { OfferDetailComponent } from './pages/offer-detail/offer-detail.component';

export const OFFER_ROUTES: Routes = [
  { path: '', component: OfferPageComponent },
  { path: ':id', component: OfferDetailComponent }
];
