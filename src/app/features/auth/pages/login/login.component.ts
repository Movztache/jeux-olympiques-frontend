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
    if (this.loginForm.valid) {
      this.loading = true;
      this.errorMessage = '';

      const loginRequest: LoginRequest = this.loginForm.value;

      this.authService.login(loginRequest).subscribe({
        next: (response: any) => {
          console.log('Connexion réussie:', response);
          this.loading = false;

          // Récupérer l'URL de retour depuis les paramètres de l'URL ou utiliser le dashboard par défaut
          const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';

          // Navigation avec gestion de promesse simplifiée mais efficace
          this.router.navigateByUrl(returnUrl)
            .then(() => console.log(`Navigation vers ${returnUrl} réussie`))
            .catch(error => {
              console.error('Erreur de navigation', error);
              // En cas d'échec, rediriger vers le dashboard comme solution de repli
              if (returnUrl !== '/dashboard') {
                this.router.navigateByUrl('/dashboard').catch(err =>
                  console.error('Navigation de repli échouée', err)
                );
              }
            });
        },
        error: (error: any) => {
          this.loading = false;
          this.errorMessage = error.message || 'Erreur de connexion. Veuillez réessayer.';
          console.error('Erreur de connexion', error);
        }
      });
    } else {
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
