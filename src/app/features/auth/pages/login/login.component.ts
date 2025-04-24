import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router'; // Ajout de ActivatedRoute
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
    private router: Router,
    private route: ActivatedRoute // Ajout de l'injection de ActivatedRoute
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
    if (this.loginForm.invalid) {
      return;
    }

    const loginRequest: LoginRequest = {
      email: this.loginForm.get('email')?.value,
      password: this.loginForm.get('password')?.value
    };

    this.authService.login(loginRequest)
      .subscribe({
        next: () => {
          // Navigation vers le tableau de bord après connexion réussie
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          // Gestion des erreurs de manière plus propre
          this.errorMessage = error?.error?.message || 'Erreur de connexion';
        }
      });
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
