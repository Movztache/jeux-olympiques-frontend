import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { Observable, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';

import { OfferService } from '../../../../core/services/offer.service';
import { Offer } from '../../../../core/models/offer.model';

@Component({
  selector: 'app-offer-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatSlideToggleModule,
    MatSnackBarModule
  ],
  templateUrl: './offer-form.component.html',
  styleUrls: ['./offer-form.component.scss']
})
export class OfferFormComponent implements OnInit {
  offerForm!: FormGroup;
  isEditMode = false;
  offerId?: number;
  loading = false;
  error: string | null = null;
  offerTypes = ['SOLO', 'DUO', 'TRIO', 'CUSTOM'];

  constructor(
    private fb: FormBuilder,
    private offerService: OfferService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.initForm();

    // Check if we're in edit mode
    this.route.paramMap.pipe(
      switchMap(params => {
        const id = params.get('id');
        if (id) {
          this.isEditMode = true;
          this.offerId = +id;
          this.loading = true;
          return this.offerService.getOfferById(+id).pipe(
            catchError(err => {
              this.error = "Impossible de charger les détails de l'offre.";
              console.error(err);
              this.loading = false;
              return of(null);
            })
          );
        }
        return of(null);
      })
    ).subscribe(offer => {
      if (offer) {
        this.populateForm(offer);
      }
      this.loading = false;
    });
  }

  initForm(): void {
    this.offerForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      description: ['', Validators.maxLength(500)],
      price: [0, [Validators.required, Validators.min(0)]],
      offerType: ['SOLO', Validators.required],
      personCount: [1, [Validators.required, Validators.min(1)]],
      available: [false] // Par défaut, l'offre est non disponible
    });

    // Désactiver initialement le champ personCount car le type par défaut est SOLO
    const personCountControl = this.offerForm.get('personCount');
    if (personCountControl) {
      personCountControl.disable();
    }

    // Ajouter un écouteur pour mettre automatiquement la première lettre du nom en majuscule
    const nameControl = this.offerForm.get('name');
    if (nameControl) {
      nameControl.valueChanges.subscribe(value => {
        if (value && typeof value === 'string' && value.length > 0) {
          const capitalizedValue = value.charAt(0).toUpperCase() + value.slice(1);
          if (capitalizedValue !== value) {
            // Mettre à jour la valeur sans déclencher un nouvel événement valueChanges
            nameControl.setValue(capitalizedValue, { emitEvent: false });
          }
        }
      });
    }

    // Mettre à jour automatiquement le nombre de personnes en fonction du type d'offre
    this.offerForm.get('offerType')?.valueChanges.subscribe(type => {
      const personCountControl = this.offerForm.get('personCount');
      if (personCountControl) {
        switch (type) {
          case 'SOLO':
            personCountControl.setValue(1);
            personCountControl.disable();
            break;
          case 'DUO':
            personCountControl.setValue(2);
            personCountControl.disable();
            break;
          case 'TRIO':
            personCountControl.setValue(3);
            personCountControl.disable();
            break;
          case 'CUSTOM':
            // Pour le type custom, on active le champ et on met une valeur minimale de 4
            if (personCountControl.value < 4) {
              personCountControl.setValue(4);
            }
            personCountControl.enable();
            // Mettre à jour les validateurs pour exiger un minimum de 4 personnes
            personCountControl.setValidators([Validators.required, Validators.min(4)]);
            personCountControl.updateValueAndValidity();
            break;
        }
      }
    });
  }

  populateForm(offer: Offer): void {
    // Déterminer le type d'offre en fonction du nombre de personnes si nécessaire
    let offerType = offer.offerType;
    if (!this.offerTypes.includes(offerType)) {
      // Si le type n'est pas dans la liste, déterminer en fonction du nombre de personnes
      switch (offer.personCount) {
        case 1:
          offerType = 'SOLO';
          break;
        case 2:
          offerType = 'DUO';
          break;
        case 3:
          offerType = 'TRIO';
          break;
        default:
          // Si plus de 3 personnes, c'est un type custom
          offerType = 'CUSTOM';
      }
    }

    // S'assurer que le nom commence par une majuscule
    let name = offer.name;
    if (name && typeof name === 'string' && name.length > 0) {
      name = name.charAt(0).toUpperCase() + name.slice(1);
    }

    // Mettre à jour le formulaire avec les valeurs de l'offre
    this.offerForm.patchValue({
      name: name,
      description: offer.description || '',
      price: offer.price,
      offerType: offerType,
      personCount: offer.personCount,
      available: offer.isAvailable !== undefined ? offer.isAvailable : (offer.available !== undefined ? offer.available : false)
    });

    // Gérer le champ personCount en fonction du type d'offre
    const personCountControl = this.offerForm.get('personCount');
    if (personCountControl) {
      if (offerType === 'CUSTOM') {
        personCountControl.enable();
        personCountControl.setValidators([Validators.required, Validators.min(4)]);
      } else {
        personCountControl.disable();
      }
      personCountControl.updateValueAndValidity();
    }
  }

  onSubmit(): void {
    // Marquer tous les champs comme touchés pour afficher les erreurs de validation
    this.markFormGroupTouched(this.offerForm);

    if (this.offerForm.invalid) {
      // Afficher un message d'erreur pour les erreurs de validation
      this.error = 'Veuillez corriger les erreurs dans le formulaire avant de soumettre.';

      // Faire défiler vers le haut pour montrer le message d'erreur
      window.scrollTo({ top: 0, behavior: 'smooth' });

      return;
    }

    // Réinitialiser le message d'erreur
    this.error = null;

    this.loading = true;

    // Récupérer les valeurs du formulaire
    const formValues = this.offerForm.getRawValue(); // getRawValue inclut les champs désactivés

    // S'assurer que le nom commence par une majuscule
    if (formValues.name && typeof formValues.name === 'string' && formValues.name.length > 0) {
      formValues.name = formValues.name.charAt(0).toUpperCase() + formValues.name.slice(1);
    }

    // Déterminer le nombre de personnes en fonction du type d'offre
    let personCount = formValues.personCount; // Valeur par défaut du formulaire

    switch (formValues.offerType) {
      case 'SOLO':
        personCount = 1;
        break;
      case 'DUO':
        personCount = 2;
        break;
      case 'TRIO':
        personCount = 3;
        break;
      case 'CUSTOM':
        // Pour le type custom, on utilise la valeur saisie par l'utilisateur
        // Vérifier que c'est bien un nombre >= 4
        personCount = Math.max(4, parseInt(formValues.personCount) || 4);
        break;
    }

    const offerData: Offer = {
      ...formValues,
      personCount: personCount, // Utiliser le nombre de personnes calculé ou saisi
      available: formValues.available, // S'assurer que la disponibilité est correctement envoyée
      isAvailable: formValues.available, // Ajouter également isAvailable pour compatibilité
      offerId: this.isEditMode ? this.offerId! : 0
    };

    // Log des données envoyées au serveur pour débogage
    // console.log('Données envoyées au serveur:', offerData);

    // Log des données envoyées au backend pour débogage
    // console.log('Données envoyées au backend:', offerData);

    // Utiliser la méthode appropriée selon le mode (création ou édition)
    const saveOperation = this.isEditMode ?
      this.offerService.updateOffer(this.offerId!, offerData) :
      this.offerService.saveOffer(offerData);

    saveOperation.subscribe({
      next: (savedOffer) => {
        this.loading = false;
        this.snackBar.open(
          `Offre ${this.isEditMode ? 'modifiée' : 'créée'} avec succès !`,
          'Fermer',
          { duration: 3000 }
        );
        this.router.navigate(['/admin/offers']);
      },
      error: (err) => {
        this.loading = false;
        // console.error('Erreur complète:', err);

        // Extraire le message d'erreur du serveur
        let errorMessage = 'Une erreur est survenue lors de la communication avec le serveur.';

        // Traiter les différents formats d'erreur possibles
        if (err.error) {
          if (typeof err.error === 'string') {
            // Si l'erreur est une chaîne de caractères
            errorMessage = err.error;
          } else if (err.error.message) {
            // Si l'erreur a un champ message
            errorMessage = err.error.message;
          } else if (typeof err.error === 'object') {
            // Si l'erreur est un objet avec des champs d'erreur spécifiques
            const fieldErrors = [];
            for (const field in err.error) {
              if (err.error.hasOwnProperty(field)) {
                fieldErrors.push(`${field}: ${err.error[field]}`);

                // Mettre en évidence le champ en erreur dans le formulaire
                const control = this.offerForm.get(field);
                if (control) {
                  control.setErrors({ serverError: err.error[field] });
                  control.markAsTouched();
                }
              }
            }
            if (fieldErrors.length > 0) {
              // Utiliser directement le message d'erreur sans préfixer avec le nom du champ
              errorMessage = fieldErrors[0].split(': ')[1];
            }
          }
        } else if (err.message) {
          errorMessage = err.message;
        }

        // Mettre à jour l'erreur pour l'affichage dans le formulaire
        this.error = errorMessage;

        // Faire défiler vers le haut pour montrer le message d'erreur
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/admin/offers']);
  }

  /**
   * Marque tous les champs d'un FormGroup comme touchés
   * Utile pour afficher les erreurs de validation
   */
  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  /**
   * Récupère toutes les erreurs de validation du formulaire
   * et les formate pour l'affichage
   */
  private getFormValidationErrors(): string {
    let errorMessages: string[] = [];

    Object.keys(this.offerForm.controls).forEach(key => {
      const control = this.offerForm.get(key);
      if (control && control.errors && Object.keys(control.errors).length > 0) {
        Object.keys(control.errors).forEach(errorKey => {
          let message = '';
          switch (errorKey) {
            case 'required':
              message = `Le champ '${key}' est obligatoire`;
              break;
            case 'min':
              message = `Le champ '${key}' doit être supérieur ou égal à ${control.errors && control.errors[errorKey] ? control.errors[errorKey].min : ''}`;
              break;
            case 'max':
              message = `Le champ '${key}' doit être inférieur ou égal à ${control.errors && control.errors[errorKey] ? control.errors[errorKey].max : ''}`;
              break;
            case 'maxlength':
              message = `Le champ '${key}' ne doit pas dépasser ${control.errors && control.errors[errorKey] ? control.errors[errorKey].requiredLength : ''} caractères`;
              break;
            default:
              message = `Le champ '${key}' a une erreur: ${errorKey}`;
          }
          errorMessages.push(message);
        });
      }
    });

    return errorMessages.join('\n');
  }
}
