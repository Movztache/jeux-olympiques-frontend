// Le composant d'inscription des utilisateurs dans l'application
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; // Pour les directives communes comme *ngIf, *ngFor
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms'; // Pour la gestion des formulaires réactifs
import { Router } from '@angular/router'; // Pour la navigation après inscription
import { AuthService } from '../../../../core/authentication/auth.service'; // Service d'authentification

@Component({
  selector: 'app-register', // Sélecteur CSS pour utiliser ce composant
  standalone: true, // Composant autonome (pas besoin d'être déclaré dans un module)
  imports: [CommonModule, ReactiveFormsModule], // Modules importés par ce composant
  templateUrl: './register.component.html', // Template HTML associé
  styleUrls: ['./register.component.scss'] // Styles SCSS associés
})
export class RegisterComponent {
  registerForm: FormGroup; // Formulaire d'inscription
  isSubmitting = false; // Indicateur d'envoi en cours
  errorMessage = ''; // Message d'erreur à afficher

  constructor(
    private fb: FormBuilder, // Service pour créer des formulaires réactifs
    private authService: AuthService, // Service d'authentification pour les appels API
    private router: Router // Pour la navigation programmatique
  ) {
    // Initialisation du formulaire avec validation
    this.registerForm = this.fb.group({
      firstName: ['', [Validators.required]], // Prénom (obligatoire)
      lastName: ['', [Validators.required]], // Nom (obligatoire)
      email: ['', [Validators.required, Validators.email]], // Email (obligatoire et format email)
      password: ['', [Validators.required, Validators.minLength(8)]] // Mot de passe (obligatoire, 8 caractères min)
    });
  }

  // Méthode appelée lors de la soumission du formulaire
  onSubmit(): void {
    // Vérification de la validité du formulaire
    if (this.registerForm.invalid) {
      return;
    }

    this.isSubmitting = true; // Activation de l'indicateur de chargement
    this.errorMessage = ''; // Réinitialisation du message d'erreur

    // Appel au service d'authentification pour enregistrer l'utilisateur
    this.authService.register(this.registerForm.value)
      .subscribe({
        next: () => {
          // En cas de succès, redirection vers le tableau de bord
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          // En cas d'erreur, affichage du message et désactivation du chargement
          this.errorMessage = error.message || 'Une erreur est survenue lors de l\'inscription';
          this.isSubmitting = false;
        }
      });
  }
}
