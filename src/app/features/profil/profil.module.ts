// src/app/features/profil/profil.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

// Import du module de routing
import { ProfilRoutingModule } from './profil-routing.module';

// Importation des composants standalone
import { ProfilViewComponent } from './pages/profil-view/profil-view.component';

@NgModule({
  declarations: [], // Aucune déclaration car le composant est standalone
  imports: [
    CommonModule,
    ProfilRoutingModule,
    ProfilViewComponent // Import du composant standalone
  ]
})
export class ProfilModule { }
