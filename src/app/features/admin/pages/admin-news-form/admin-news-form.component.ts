import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { TextFieldModule } from '@angular/cdk/text-field';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { News, NewsCreateRequest } from '../../../../core/models/news.model';
import { NewsService } from '../../../../core/services/news.service';
import { AuthService } from '../../../../core/authentication/auth.service';

/**
 * Composant formulaire pour créer/modifier une actualité
 */
@Component({
  selector: 'app-admin-news-form',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule,
    TextFieldModule
  ],
  templateUrl: './admin-news-form.component.html',
  styleUrls: ['./admin-news-form.component.scss']
})
export class AdminNewsFormComponent implements OnInit, OnDestroy {
  newsForm!: FormGroup;
  loading = false;
  saving = false;
  error: string | null = null;
  
  isEditMode = false;
  newsId: number | null = null;
  currentNews: News | null = null;
  
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private newsService: NewsService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    this.route.params.pipe(
      takeUntil(this.destroy$)
    ).subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.newsId = +params['id'];
        this.loadNews();
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Initialise le formulaire
   */
  private initForm(): void {
    this.newsForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(200)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      imageUrl: ['', [this.urlValidator]],
      published: [true]
    });
  }

  /**
   * Validateur d'URL personnalisé
   */
  private urlValidator(control: any) {
    if (!control.value) return null;
    
    const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
    if (!urlPattern.test(control.value)) {
      return { invalidUrl: true };
    }
    return null;
  }

  /**
   * Charge les données de l'actualité à modifier
   */
  private loadNews(): void {
    if (!this.newsId) return;
    
    this.loading = true;
    this.error = null;

    this.newsService.getNewsById(this.newsId).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (news: News) => {
        this.currentNews = news;
        this.populateForm(news);
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement de l\'actualité:', error);
        if (error.status === 404) {
          this.error = 'Cette actualité n\'existe pas.';
        } else {
          this.error = 'Erreur lors du chargement de l\'actualité.';
        }
        this.loading = false;
      }
    });
  }

  /**
   * Remplit le formulaire avec les données existantes
   */
  private populateForm(news: News): void {
    this.newsForm.patchValue({
      title: news.title,
      description: news.description,
      imageUrl: news.imageUrl || '',
      published: news.published
    });
  }

  /**
   * Sauvegarde l'actualité
   */
  onSave(publishImmediately: boolean = false): void {
    if (this.newsForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.saving = true;
    this.error = null;

    const formValue = this.newsForm.value;
    const newsData: NewsCreateRequest = {
      title: formValue.title.trim(),
      description: formValue.description.trim(),
      imageUrl: formValue.imageUrl?.trim() || undefined,
      published: publishImmediately || formValue.published
    };

    const operation = this.isEditMode 
      ? this.newsService.updateNews(this.newsId!, newsData)
      : this.newsService.createNews(newsData, this.getCurrentUserId());

    operation.pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (news: News) => {
        const action = this.isEditMode ? 'modifiée' : 'créée';
        const status = news.published ? 'et publiée' : 'en brouillon';
        this.showSuccess(`Actualité ${action} ${status} avec succès`);
        this.router.navigate(['/admin/news']);
      },
      error: (error) => {
        console.error('Erreur lors de la sauvegarde:', error);
        this.handleSaveError(error);
        this.saving = false;
      }
    });
  }

  /**
   * Sauvegarde et publie immédiatement
   */
  onSaveAndPublish(): void {
    this.onSave(true);
  }

  /**
   * Annule et retourne à la liste
   */
  onCancel(): void {
    if (this.newsForm.dirty) {
      if (confirm('Vous avez des modifications non sauvegardées. Êtes-vous sûr de vouloir quitter ?')) {
        this.router.navigate(['/admin/news']);
      }
    } else {
      this.router.navigate(['/admin/news']);
    }
  }

  /**
   * Prévisualise l'actualité
   */
  onPreview(): void {
    if (this.newsForm.invalid) {
      this.markFormGroupTouched();
      this.showError('Veuillez corriger les erreurs avant de prévisualiser.');
      return;
    }

    // Créer un objet News temporaire pour la prévisualisation
    const formValue = this.newsForm.value;
    const previewNews: News = {
      id: this.newsId || 0,
      title: formValue.title,
      description: formValue.description,
      imageUrl: formValue.imageUrl,
      published: formValue.published,
      createdDate: this.currentNews?.createdDate || new Date().toISOString(),
      updatedDate: this.isEditMode ? new Date().toISOString() : undefined,
      author: this.currentNews?.author || {
        id: this.getCurrentUserId(),
        firstName: 'Prénom',
        lastName: 'Nom',
        email: 'email@example.com'
      }
    };

    // Ouvrir dans un nouvel onglet avec les données de prévisualisation
    // Pour l'instant, on affiche juste un message
    this.showSuccess('Fonctionnalité de prévisualisation à implémenter');
  }

  /**
   * Marque tous les champs du formulaire comme touchés
   */
  private markFormGroupTouched(): void {
    Object.keys(this.newsForm.controls).forEach(key => {
      this.newsForm.get(key)?.markAsTouched();
    });
  }

  /**
   * Récupère l'ID de l'utilisateur connecté
   */
  private getCurrentUserId(): number {
    const user = this.authService.currentUserValue;
    return user?.userId || 1; // Fallback pour les tests
  }

  /**
   * Gère les erreurs de sauvegarde
   */
  private handleSaveError(error: any): void {
    if (error.status === 400) {
      this.error = 'Données invalides. Veuillez vérifier les champs.';
    } else if (error.status === 403) {
      this.error = 'Vous n\'avez pas les permissions pour cette action.';
    } else if (error.status === 404) {
      this.error = 'L\'actualité à modifier n\'existe pas.';
    } else {
      this.error = 'Erreur lors de la sauvegarde. Veuillez réessayer.';
    }
  }

  /**
   * Affiche un message de succès
   */
  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Fermer', {
      duration: 3000,
      verticalPosition: 'top',
      panelClass: ['success-snackbar']
    });
  }

  /**
   * Affiche un message d'erreur
   */
  private showError(message: string): void {
    this.snackBar.open(message, 'Fermer', {
      duration: 5000,
      verticalPosition: 'top',
      panelClass: ['error-snackbar']
    });
  }

  /**
   * Vérifie si un champ a une erreur
   */
  hasError(fieldName: string, errorType: string): boolean {
    const field = this.newsForm.get(fieldName);
    return !!(field && field.hasError(errorType) && field.touched);
  }

  /**
   * Récupère le message d'erreur pour un champ
   */
  getErrorMessage(fieldName: string): string {
    const field = this.newsForm.get(fieldName);
    if (!field || !field.errors || !field.touched) return '';

    if (field.hasError('required')) {
      return `${this.getFieldLabel(fieldName)} est obligatoire`;
    }
    if (field.hasError('maxlength')) {
      const maxLength = field.errors['maxlength'].requiredLength;
      return `${this.getFieldLabel(fieldName)} ne doit pas dépasser ${maxLength} caractères`;
    }
    if (field.hasError('minlength')) {
      const minLength = field.errors['minlength'].requiredLength;
      return `${this.getFieldLabel(fieldName)} doit contenir au moins ${minLength} caractères`;
    }
    if (field.hasError('invalidUrl')) {
      return 'L\'URL n\'est pas valide';
    }

    return 'Champ invalide';
  }

  /**
   * Récupère le label d'un champ
   */
  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      title: 'Le titre',
      description: 'La description',
      imageUrl: 'L\'URL de l\'image'
    };
    return labels[fieldName] || 'Ce champ';
  }

  /**
   * Récupère le titre de la page
   */
  getPageTitle(): string {
    return this.isEditMode ? 'Modifier l\'actualité' : 'Nouvelle actualité';
  }

  /**
   * Récupère le sous-titre de la page
   */
  getPageSubtitle(): string {
    return this.isEditMode
      ? 'Modifiez les informations de cette actualité'
      : 'Créez une nouvelle actualité pour Vibe-ticket';
  }

  /**
   * Formate une date pour l'affichage
   */
  formatDate(dateString: string): string {
    return this.newsService.formatDate(dateString);
  }

  /**
   * Récupère le nom de l'auteur
   */
  getAuthorName(news: News): string {
    return this.newsService.getAuthorName(news);
  }

  /**
   * Gère les erreurs de chargement d'image
   */
  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    if (target) {
      target.style.display = 'none';
    }
  }
}
