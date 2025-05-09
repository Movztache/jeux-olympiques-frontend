import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule
  ],
  templateUrl: './search-bar.component.html',
  styleUrl: './search-bar.component.scss'
})
export class SearchBarComponent {
  /**
   * Valeur actuelle de la recherche
   */
  @Input() searchTerm: string = '';

  /**
   * Événement émis lorsque la valeur de recherche change (pour la liaison bidirectionnelle)
   */
  @Output() searchTermChange = new EventEmitter<string>();

  /**
   * Placeholder à afficher dans le champ de recherche
   */
  @Input() placeholder: string = 'Rechercher...';

  /**
   * Libellé du champ de recherche
   */
  @Input() label: string = 'Rechercher';

  /**
   * Texte du tooltip pour le bouton de rafraîchissement
   */
  @Input() refreshTooltip: string = 'Rafraîchir la liste';

  /**
   * Événement émis lorsque la valeur de recherche change
   */
  @Output() searchChange = new EventEmitter<string>();

  /**
   * Événement émis lorsque l'utilisateur clique sur le bouton de rafraîchissement
   */
  @Output() refresh = new EventEmitter<void>();

  /**
   * Méthode appelée lorsque l'utilisateur tape dans le champ de recherche
   */
  onSearchChange(): void {
    this.searchChange.emit(this.searchTerm);
    this.searchTermChange.emit(this.searchTerm);
  }

  /**
   * Méthode appelée lorsque l'utilisateur clique sur le bouton d'effacement
   */
  clearSearch(): void {
    this.searchTerm = '';
    this.searchChange.emit(this.searchTerm);
    this.searchTermChange.emit(this.searchTerm);
  }

  /**
   * Méthode appelée lorsque l'utilisateur clique sur le bouton de rafraîchissement
   */
  onRefresh(): void {
    this.refresh.emit();
  }
}
