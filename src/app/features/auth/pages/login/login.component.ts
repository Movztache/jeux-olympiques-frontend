import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/authentication/auth.service';
import {LoginRequest} from '../../../../core/models/user.model';

@Component({
  selector: 'app-login',
  standalone: true,
  // Imports nécessaires pour ce composant
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  // Formulaire de connexion
  loginForm!: FormGroup;

  // Message d'erreur à afficher
  errorMessage = '';

  // Indicateur de chargement pendant la connexion
  loading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Initialisation du formulaire avec validation
    this.loginForm = this.fb.group({
      // Champ email avec validation requise et format email
      email: ['', [Validators.required, Validators.email]],

      // Champ password avec validation requise
      password: ['', Validators.required]
    });
  }

  /**
   * Gère la soumission du formulaire de connexion
   */
  onSubmit(): void {
    // Vérifie si le formulaire est valide
    if (this.loginForm.valid) {
      this.loading = true;
      this.errorMessage = '';

      const loginRequest: LoginRequest = this.loginForm.value;

      // Appel au service d'authentification
      this.authService.login(loginRequest).subscribe({
        next: (response: any) => {
          // Connexion réussie
          console.log('Connexion réussie:', response);
          this.loading = false;
          // Redirection vers la page d'accueil ou une autre page
          // this.router.navigate(['/home']);
        },
        error: (error: any) => {
          // Gestion des erreurs
          this.loading = false;
          this.errorMessage = error.message || 'Erreur de connexion. Veuillez réessayer.';
          console.error('Erreur de connexion', error);
        }
      });
    } else {
      // Marque tous les champs comme touchés pour afficher les erreurs
      this.markFormGroupTouched(this.loginForm);
    }
  }

  /**
   * Utilitaire pour marquer tous les champs comme touchés
   * et déclencher l'affichage des erreurs de validation
   */
  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();

      if ((control as any).controls) {
        this.markFormGroupTouched(control as FormGroup);
      }
    });
  }
}
