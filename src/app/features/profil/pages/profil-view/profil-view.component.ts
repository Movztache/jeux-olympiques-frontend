// src/app/features/profil/pages/profil-view/profil-view.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ProfilService } from '../../services/profil.service';

// Modules Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-profil-view',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './profil-view.component.html',
  styleUrls: ['./profil-view.component.scss']
})
export class ProfilViewComponent implements OnInit {
  profilForm: FormGroup;
  editMode = false;
  loading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private profilService: ProfilService
  ) {
    // Initialisation du formulaire avec validation
    this.profilForm = this.fb.group({
      nom: ['', Validators.required],
      prenom: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      adresse: [''],
      telephone: ['']
    });
  }

  ngOnInit(): void {
    this.loadUserProfile();
  }

  // Charger les données utilisateur depuis le backend
  loadUserProfile(): void {
    this.loading = true;
    this.profilService.getUserProfile().subscribe({
      next: (userData) => {
        // Remplir le formulaire avec les données
        this.profilForm.patchValue({
          nom: userData.nom || '',
          prenom: userData.prenom || '',
          email: userData.email || '',
          adresse: userData.adresse || '',
          telephone: userData.telephone || ''
        });
        this.profilForm.disable(); // Mode lecture par défaut
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement du profil', error);
        this.errorMessage = 'Impossible de charger les données du profil.';
        this.loading = false;
      }
    });
  }

  // Basculer entre mode lecture et mode édition
  toggleEditMode(): void {
    this.editMode = !this.editMode;
    if (this.editMode) {
      this.profilForm.enable();
    } else {
      this.profilForm.disable();
    }
  }

  // Soumettre les modifications du profil
  onSubmit(): void {
    if (this.profilForm.valid) {
      this.loading = true;
      this.profilService.updateUserProfile(this.profilForm.value).subscribe({
        next: () => {
          console.log('Profil mis à jour avec succès');
          this.toggleEditMode();
          this.loading = false;
        },
        error: (error) => {
          console.error('Erreur lors de la mise à jour du profil', error);
          this.errorMessage = 'Impossible de mettre à jour le profil.';
          this.loading = false;
        }
      });
    }
  }
}
