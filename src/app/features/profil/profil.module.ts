// src/app/features/profil/profil.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { ProfilRoutingModule } from './profil-routing.module';
import { ProfilViewComponent } from './pages/profil-view/profil-view.component';

@NgModule({
  declarations: [
    // Le composant est standalone, il ne devrait pas être ici
  ],
  imports: [
    CommonModule,
    ProfilRoutingModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    ProfilViewComponent // Ajouté ici à la place
  ]
})
export class ProfilModule { }
