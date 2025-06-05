// Composant pour réinitialiser le mot de passe avec un token reçu par email
import { Component, OnInit } from '@angular/core'; // OnInit pour l'initialisation du composant
import { CommonModule } from '@angular/common'; // Pour les directives communes
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms'; // Gestion de formulaires réactifs
import { ActivatedRoute, Router, RouterLink } from '@angular/router'; // Pour accéder aux paramètres d'URL et naviguer
import { AuthService } from '../../../../core/authentication/auth.service'; // Service d'authentification

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink], // RouterLink pour liens de navigation
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {
  resetPasswordForm: FormGroup; // Formulaire de réinitialisation
  isSubmitting = false; // Indicateur d'envoi en cours
  isVerifying = true; // Indicateur de vérification du token en cours
  resetSuccess = false; // Indicateur de réinitialisation réussie
  errorMessage = ''; // Message d'erreur à afficher
  token: string | null = null; // Token de réinitialisation extrait de l'URL

  constructor(
    private fb: FormBuilder, // Service pour créer des formulaires réactifs
    private route: ActivatedRoute, // Pour accéder aux paramètres de l'URL
    private router: Router, // Pour la navigation
    private authService: AuthService // Service d'authentification
  ) {
    // Initialisation du formulaire avec validation
    this.resetPasswordForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(8)]], // Nouveau mot de passe (obligatoire, 8 caractères min)
      confirmPassword: ['', [Validators.required]] // Confirmation du mot de passe (obligatoire)
    });
  }

  // Méthode appelée à l'initialisation du composant
  ngOnInit(): void {
    // Récupération du token depuis l'URL
    this.token = this.route.snapshot.queryParamMap.get('token');

    // Vérification de la présence du token
    if (!this.token) {
      this.isVerifying = false;
      this.errorMessage = "Lien de réinitialisation incomplet. Veuillez utiliser le lien complet reçu par email.";
      return;
    }

    // Vérification du token auprès du backend
    this.authService.verifyResetToken(this.token)
      .subscribe({
        next: () => {
          // Token valide
          this.isVerifying = false;
        },
        error: (error) => {
          // Token invalide ou expiré
          this.errorMessage = error.message || "Le lien de réinitialisation est invalide ou a expiré.";
          this.isVerifying = false;
        }
      });
  }

  // Méthode appelée lors de la soumission du formulaire
  onSubmit(): void {
    // Vérification de la validité du formulaire et présence du token
    if (this.resetPasswordForm.invalid || !this.token) {
      return;
    }

    const password = this.resetPasswordForm.value.password;
    const confirmPassword = this.resetPasswordForm.value.confirmPassword;

    // Vérification de la correspondance des mots de passe
    if (password !== confirmPassword) {
      this.resetPasswordForm.get('confirmPassword')?.setErrors({ passwordMismatch: true });
      return;
    }

    this.isSubmitting = true; // Activation de l'indicateur de chargement
    this.errorMessage = ''; // Réinitialisation du message d'erreur

    // Appel au service pour réinitialiser le mot de passe
    this.authService.resetPassword(this.token, password)
      .subscribe({
        next: () => {
          this.isSubmitting = false;
          this.resetSuccess = true;
          // Redirection vers login après 3 secondes
          setTimeout(() => {
            this.router.navigate(['/authentication/login'])
              .then(navigationSuccess => {
                // Gestion du cas où la navigation échoue
                if (!navigationSuccess) {
                  this.errorMessage = "Navigation vers la page de connexion impossible. Veuillez utiliser le lien 'Retour à la connexion'.";
                }
              })
              .catch(err => {
                // Gestion des erreurs de navigation
                this.errorMessage = "Une erreur s'est produite. Veuillez utiliser le lien 'Retour à la connexion'.";
                this.resetSuccess = false;
              });
          }, 3000);
        },
        error: (error) => {
          // Gestion des erreurs de réinitialisation
          this.errorMessage = error.message || "Une erreur est survenue lors de la réinitialisation du mot de passe.";
          this.isSubmitting = false;
        }
      });
  }
}
