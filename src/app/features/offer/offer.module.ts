import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OfferRoutingModule } from './offer-routing.module';
import { OfferPageComponent } from './pages/offer-page/offer-page.component';

@NgModule({
  imports: [
    CommonModule,
    OfferRoutingModule,
    OfferPageComponent  // Importé comme un module car c'est un composant standalone
  ]
})
export class OfferModule { }
