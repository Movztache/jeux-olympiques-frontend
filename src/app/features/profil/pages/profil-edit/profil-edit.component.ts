// src/app/features/profil/pages/profil-edit/profil-edit.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ProfilService } from '../../../../core/services/profil.service';
import {Router, ActivatedRoute, RouterLink} from '@angular/router';

// Modules Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-profil-edit',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    RouterLink
  ],
  templateUrl: './profil-edit.component.html',
  styleUrl: './profil-edit.component.scss'
})
export class ProfilEditComponent implements OnInit {
  profilForm: FormGroup;
  editMode = true; // Toujours en mode édition par défaut
  loading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private profilService: ProfilService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    // Initialisation du formulaire avec validation
    this.profilForm = this.fb.group({
      lastName: ['', Validators.required],
      firstName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]]
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
          lastName: userData.lastName || '',
          firstName: userData.firstName || '',
          email: userData.email || ''
        });
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement du profil', error);
        this.errorMessage = 'Impossible de charger les données du profil.';
        this.loading = false;
      }
    });
  }

  // Annuler les modifications et retourner à la page de profil
  cancel(): void {
    this.router.navigate(['..'], { relativeTo: this.route });
  }

  // Soumettre les modifications du profil
  onSubmit(): void {
    if (this.profilForm.valid) {
      this.loading = true;
      this.profilService.updateUserProfile(this.profilForm.value).subscribe({
        next: () => {
          console.log('Profil mis à jour avec succès');
          this.router.navigate(['..'], { relativeTo: this.route });
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
