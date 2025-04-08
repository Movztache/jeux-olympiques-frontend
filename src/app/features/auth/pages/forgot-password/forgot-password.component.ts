// Composant pour demander une réinitialisation de mot de passe
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; // Pour les directives communes
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms'; // Gestion de formulaires réactifs
import { Router, RouterLink } from '@angular/router'; // Pour navigation et liens
import { AuthService } from '../../../../core/authentication/auth.service'; // Service d'authentification

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink], // RouterLink pour liens de navigation
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent {
  forgotPasswordForm: FormGroup; // Formulaire de demande de réinitialisation
  isSubmitting = false; // Indicateur d'envoi en cours
  submitSuccess = false; // Indicateur de demande réussie
  errorMessage = ''; // Message d'erreur à afficher

  constructor(
    private fb: FormBuilder, // Service pour créer des formulaires réactifs
    private authService: AuthService, // Service d'authentification
    private router: Router // Pour la navigation
  ) {
    // Initialisation du formulaire avec validation
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]] // Email (obligatoire et format email)
    });
  }

  // Méthode appelée lors de la soumission du formulaire
  onSubmit(): void {
    // Vérification de la validité du formulaire
    if (this.forgotPasswordForm.invalid) {
      return;
    }

    this.isSubmitting = true; // Activation de l'indicateur de chargement
    this.errorMessage = ''; // Réinitialisation du message d'erreur

    const email = this.forgotPasswordForm.value.email;

    // Appel au service pour demander une réinitialisation de mot de passe
    this.authService.forgotPassword(email)
      .subscribe({
        next: () => {
          // Demande réussie
          this.isSubmitting = false;
          this.submitSuccess = true;
          // Pas de redirection automatique - l'utilisateur voit un message de succès
        },
        error: (error) => {
          // Gestion des erreurs
          this.errorMessage = error.message || 'Une erreur est survenue lors de l\'envoi de la demande';
          this.isSubmitting = false;
        }
      });
  }
}
